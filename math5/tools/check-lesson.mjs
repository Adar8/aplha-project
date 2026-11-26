// בדיקה מלאה לשיעור אחד לפני שהוא מחובר לאפליקציה (לשימוש בוני שיעורים במקביל).
// הרצה: node tools/check-lesson.mjs learning-content/lessons/<id>.json
// בודק: מבנה ו-LaTeX (validateLesson), התאמת check לתשובה, חישוב בלתי תלוי מ-tests/verify/<id>.mjs,
// מסיחים שלא שווים לתשובה, מזהים, ושכל covers מופיע ב-exam-skills.json או ב-newSkills של קובץ האינטגרציה.
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { validateLesson } from '../tests/validate-content.mjs';
import { adaptLesson } from '../js/core/adapter.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = process.argv[2];
if (!file) { console.error('שימוש: node tools/check-lesson.mjs <קובץ שיעור>'); process.exit(2); }
const J = JSON.parse(readFileSync(resolve(ROOT, file), 'utf8'));
let fail = 0;
const bad = m => { console.error('✗ ' + m); fail++; };

const r = validateLesson(J);
r.errors.forEach(e => bad(e));
r.warnings.forEach(w => console.log('⚠ ' + w));

// אזהרה (לא חוסמת): מקטע מתמטי שבו שני אסימונים צמודים בלי אופרטור ביניהם, למשל "$f'(0) = -9 0$" או "$x3$".
// זה סימן ההיכר של טקסט שנמחק בין "<" ל-">" (תקלת ההמרה ב-e842911, ראו
// docs/lessons-learned/2026-11-26-json-conversion-stripped-inequalities.md). פקודות LaTeX (\Rightarrow, \cdot, \le, \text{…})
// נחשבות לאופרטור כדי לא לסמן אותן, וגם הקיצור \frac k2. נבדק 26.11.2026: 3 מתוך 3 המקומות המשובשים נתפסו בגרסה הישנה
// של derivative-extrema. 0 התרעות שווא בכל השיעורים ושיעורי היסוד הנוכחיים. האזהרה לא חוסמת עד ששיעור התרעות השווא יימדד על יותר תוכן.
function adjacentMathTokens(obj) {
  const hits = [];
  const walk = (v, path) => {
    if (typeof v === 'string') {
      for (const m of v.replace(/\\\$/g, '').matchAll(/\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g)) {
        const tex = m[1] ?? m[2];
        const t = tex
          .replace(/\\text\{[^}]*\}/g, ' @ ')
          .replace(/\\[dt]?frac\s*([^{\s\\])\s*([^{\s\\])/g, ' @ ')
          .replace(/\\[,;:! ]/g, ' ')
          .replace(/\\[a-zA-Z]+/g, ' @ ');
        if (/[0-9A-Za-z)\]}]\s+[0-9]/.test(t) || /(^|[^A-Za-z@])[A-Za-z][0-9]/.test(t)) hits.push(`${path}: $${tex}$`);
      }
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k);
  };
  walk(obj, '');
  return hits;
}
adjacentMathTokens(J).forEach(h => console.log(`⚠ אסימונים צמודים בלי אופרטור (אולי טקסט שנמחק בין < ל->): ${h}`));

const L = adaptLesson(J);
const qs = [...L.guided, ...L.practice, ...L.bagrut.flatMap(b => b.parts), ...L.quiz];
const vf = resolve(ROOT, `tests/verify/${J.id}.mjs`);
if (!existsSync(vf)) bad(`חסר קובץ חישוב בלתי תלוי: tests/verify/${J.id}.mjs`);
const exp = existsSync(vf) ? ((await import(vf)).expected || {})[J.id] || {} : {};
const extra = existsSync(vf) ? (await import(vf)).extra || [] : [];
let n = 0;
for (const q of qs) {
  if (q.type === 'mc') { if (q.options.filter(o => o.ok).length !== 1) bad(`${q.id}: צריכה להיות בדיוק תשובה נכונה אחת`); continue; }
  n++;
  const tol = Math.max(q.tol ?? 0, 1e-9);
  if (exp[q.id] === undefined) bad(`${q.id}: אין חישוב בלתי תלוי`);
  else if (Math.abs(exp[q.id] - q.answer) > tol) bad(`${q.id}: בשיעור ${q.answer}, בחישוב הבלתי תלוי ${exp[q.id]}`);
  for (const w of q.wrong || []) if (Math.abs(w.v - q.answer) <= tol) bad(`${q.id}: מסיח ${w.v} שווה לתשובה הנכונה`);
}
extra.forEach(([label, ok]) => { if (!ok) bad(`בדיקה נוספת נכשלה: ${label}`); });

const vocab = JSON.parse(readFileSync(resolve(ROOT, 'learning-content/exam-skills.json'), 'utf8')).skills;
const integ = resolve(ROOT, `learning-content/integration/${J.id}.json`);
const I = existsSync(integ) ? JSON.parse(readFileSync(integ, 'utf8')) : null;
if (!I) bad(`חסר קובץ אינטגרציה: learning-content/integration/${J.id}.json`);
for (const k of J.covers || []) if (!vocab[k] && !(I?.newSkills || {})[k]) bad(`covers: מיומנות ${k} לא קיימת ב-exam-skills.json ולא ב-newSkills`);
if (!(J.covers || []).length) bad('covers ריק – השיעור חייב לסמן אילו מיומנויות בגרות הוא מלמד');

console.log(fail ? `\n${fail} בעיות ב-${J.id}` : `✓ ${J.id}: מבנה תקין, ${n} תשובות מספריות תואמות לחישוב בלתי תלוי, ${extra.length} בדיקות נוספות`);
process.exit(fail ? 1 : 0);
