// בדיקת תקינות לקובצי התוכן ב-learning-content.
// הרצה: node tests/validate-content.mjs [קובץ.json ...]   (בלי ארגומנטים: כל הקבצים שב-index.json)
// בודק מבנה, מזהים, הפניות לטעויות נפוצות, סיווג מקור, ארבע אפשרויות עם תשובה נכונה אחת,
// חישוב בלתי תלוי של כל תשובה מספרית (שדה check), ותקינות LaTeX (רינדור אמיתי ב-KaTeX).
import { readFileSync, existsSync } from 'fs';
import { dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = resolve(ROOT, 'learning-content');

// ---- KaTeX (מהעותק המקומי) ----
const katex = (() => {
  const sandbox = { module: { exports: {} }, exports: {} };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(readFileSync(resolve(ROOT, 'vendor/katex/katex.min.js'), 'utf8'), sandbox);
  return sandbox.module.exports.default || sandbox.module.exports;
})();

// ---- מחשבון בטוח לשדה check ----
const FN = {
  sqrt: Math.sqrt, abs: Math.abs, floor: Math.floor, ceil: Math.ceil, round: Math.round, exp: Math.exp,
  ln: Math.log, log: Math.log10, pi: Math.PI, e: Math.E,
  sin: d => Math.sin(d * Math.PI / 180), cos: d => Math.cos(d * Math.PI / 180), tan: d => Math.tan(d * Math.PI / 180),
  asin: x => Math.asin(x) * 180 / Math.PI, acos: x => Math.acos(x) * 180 / Math.PI, atan: x => Math.atan(x) * 180 / Math.PI,
};
export function evalExpr(expr) {
  if (typeof expr !== 'string' || !/^[0-9a-z+\-*/^().,\s]+$/i.test(expr)) throw new Error('תווים לא מותרים');
  for (const id of expr.match(/[a-z]+/gi) || []) if (!(id in FN)) throw new Error(`פונקציה לא מוכרת: ${id}`);
  const names = Object.keys(FN);
  const v = new Function(...names, `"use strict"; return (${expr.replace(/\^/g, '**')});`)(...names.map(n => FN[n]));
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error('התוצאה אינה מספר');
  return v;
}

// ---- עזרים ----
const PAPERS = { old: ['035581', '035582'], new: ['035571', '035572'] };
const SECTIONS = ['explanations', 'video', 'examples', 'guidedPractice', 'independentPractice', 'bagrutQuestions', 'quiz'];
const SOURCE_TYPES = ['official', 'adapted', 'original'];
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;

export function validateLesson(L, { topics = null, knownLessons = null } = {}) {
  const errors = [], warnings = [];
  const err = (path, msg) => errors.push(`${path}: ${msg}`);
  const warn = (path, msg) => warnings.push(`${path}: ${msg}`);
  const isStr = v => typeof v === 'string' && v.trim().length > 0;
  const arr = (v, path, min = 0) => { if (!Array.isArray(v)) { err(path, 'חייב להיות מערך'); return []; } if (v.length < min) err(path, `צריך לפחות ${min} פריטים`); return v; };

  // טקסט עם LaTeX: בודקים $ מאוזנים, שאין HTML, ושכל ביטוי מתרנדר
  const text = (v, path, { required = true } = {}) => {
    if (v === undefined && !required) return;
    if (!isStr(v)) return err(path, 'חייב להיות טקסט לא ריק');
    if (/<\/?[a-z][^>]*>/i.test(v)) err(path, 'אין להשתמש ב-HTML. להדגשה: **טקסט**');
    const s = v.replace(/\\\$/g, '');
    const display = [...s.matchAll(/\$\$([\s\S]+?)\$\$/g)].map(m => [m[1], true]);
    const rest = s.replace(/\$\$[\s\S]+?\$\$/g, '');
    if ((rest.match(/\$/g) || []).length % 2) return err(path, 'מספר אי-זוגי של סימני $');
    const inline = [...rest.matchAll(/\$([^$]+?)\$/g)].map(m => [m[1], false]);
    for (const [tex, displayMode] of [...display, ...inline]) latex(tex, path, displayMode);
  };
  const latex = (tex, path, displayMode = true) => {
    try { katex.renderToString(tex, { throwOnError: true, displayMode, strict: 'ignore' }); }
    catch (e) { err(path, `LaTeX לא תקין: ${tex} (${String(e.message).split('\n')[0]})`); }
  };

  // ---- שדות ראשיים ----
  if (L.schemaVersion !== 1) err('schemaVersion', 'חייב להיות 1');
  if (!isStr(L.id) || !ID_RE.test(L.id)) err('id', 'מזהה באותיות קטנות באנגלית, ספרות ומקפים');
  text(L.title, 'title');
  if (!isStr(L.topic)) err('topic', 'חסר');
  else if (topics && !topics.has(L.topic)) err('topic', `הנושא "${L.topic}" לא קיים במפת הנושאים (curriculum.js)`);
  if (!L.papers || typeof L.papers !== 'object') err('papers', 'חסר');
  else {
    for (const k of ['old', 'new']) for (const p of arr(L.papers[k], `papers.${k}`)) if (!PAPERS[k].includes(p)) err(`papers.${k}`, `שאלון לא מוכר: ${p}`);
    if (!(L.papers.old || []).length && !(L.papers.new || []).length) err('papers', 'צריך לפחות שאלון אחד');
  }
  if (!['common', 'old', 'new', 'check'].includes(L.topicStatus)) err('topicStatus', 'common / old / new / check');
  if (!(Number.isInteger(L.estimatedMinutes) && L.estimatedMinutes > 0)) err('estimatedMinutes', 'מספר דקות שלם וחיובי');
  text(L.summary, 'summary');
  if (!L.review || !['draft', 'reviewed', 'approved'].includes(L.review.status)) err('review.status', 'draft / reviewed / approved');

  // ---- טעויות נפוצות (קודם, כדי לבדוק הפניות) ----
  const explIds = new Set((L.explanations || []).map(e => e.id));
  const mistakes = new Set();
  arr(L.commonMistakes, 'commonMistakes', 1).forEach((m, i) => {
    const p = `commonMistakes[${i}]`;
    if (!isStr(m.id) || !ID_RE.test(m.id)) err(`${p}.id`, 'מזהה לא תקין');
    else if (mistakes.has(m.id)) err(`${p}.id`, `מזהה כפול: ${m.id}`); else mistakes.add(m.id);
    text(m.label, `${p}.label`); text(m.advice, `${p}.advice`);
    if (!SECTIONS.includes(m.reviewSection)) err(`${p}.reviewSection`, `אחד מ: ${SECTIONS.join(', ')}`);
    if (m.reviewRef !== undefined && m.reviewSection === 'explanations' && !explIds.has(m.reviewRef)) err(`${p}.reviewRef`, `אין הסבר עם המזהה ${m.reviewRef}`);
  });
  const usedMistakes = new Set();

  // ---- הסברים ונוסחאות ----
  const formulaIds = new Set();
  arr(L.formulas, 'formulas').forEach((f, i) => {
    const p = `formulas[${i}]`;
    if (!isStr(f.id)) err(`${p}.id`, 'חסר'); else formulaIds.add(f.id);
    text(f.name, `${p}.name`);
    if (!isStr(f.latex)) err(`${p}.latex`, 'חסר'); else latex(f.latex, `${p}.latex`);
    if (!['yes', 'no', 'unknown'].includes(f.inFormulaSheet)) err(`${p}.inFormulaSheet`, 'yes / no / unknown');
  });
  const seenExpl = new Set();
  arr(L.explanations, 'explanations', 1).forEach((e, i) => {
    const p = `explanations[${i}]`;
    if (!isStr(e.id)) err(`${p}.id`, 'חסר'); else if (seenExpl.has(e.id)) err(`${p}.id`, 'מזהה כפול'); else seenExpl.add(e.id);
    text(e.title, `${p}.title`);
    arr(e.blocks, `${p}.blocks`, 1).forEach((b, j) => {
      const q = `${p}.blocks[${j}]`;
      if (b.type === 'text' || b.type === 'warning' || b.type === 'tip') text(b.text, `${q}.text`);
      else if (b.type === 'formula') {
        if (!isStr(b.latex)) err(`${q}.latex`, 'חסר'); else latex(b.latex, `${q}.latex`);
        if (b.formulaRef !== undefined && !formulaIds.has(b.formulaRef)) err(`${q}.formulaRef`, `אין נוסחה עם המזהה ${b.formulaRef}`);
      } else if (b.type === 'list') arr(b.items, `${q}.items`, 1).forEach((t, k) => text(t, `${q}.items[${k}]`));
      else err(`${q}.type`, 'text / formula / warning / tip / list');
    });
  });

  // ---- סרטון ----
  if (!L.video || !['pending', 'verified'].includes(L.video.status)) err('video.status', 'pending / verified');
  else arr(L.video.links, 'video.links').forEach((l, i) => {
    const p = `video.links[${i}]`;
    text(l.label, `${p}.label`);
    if (!/^https:\/\//.test(l.url || '')) err(`${p}.url`, 'קישור https מלא');
    if (!['video', 'course', 'search', 'article'].includes(l.kind)) err(`${p}.kind`, 'video / course / search / article');
    if (typeof l.verified !== 'boolean') err(`${p}.verified`, 'true / false');
    if (L.video.status === 'verified' && l.kind === 'video' && !l.verified) err(p, 'סרטון לא מאומת בשיעור שמסומן verified');
  });

  // ---- דוגמאות ----
  arr(L.examples, 'examples', 1).forEach((ex, i) => {
    const p = `examples[${i}]`;
    if (!isStr(ex.id)) err(`${p}.id`, 'חסר');
    text(ex.title, `${p}.title`); text(ex.problem, `${p}.problem`); text(ex.answer, `${p}.answer`);
    arr(ex.steps, `${p}.steps`, 1).forEach((s, j) => text(s, `${p}.steps[${j}]`));
    arr(ex.checks, `${p}.checks`).forEach((c, j) => {
      try { const v = evalExpr(c.expr); if (Math.abs(v - c.equals) > (c.tolerance ?? 1e-9)) err(`${p}.checks[${j}]`, `${c.expr} = ${v}, לא ${c.equals}`); }
      catch (e) { err(`${p}.checks[${j}].expr`, e.message); }
    });
    if (!(ex.checks || []).length) warn(p, 'אין checks: החישובים בדוגמה לא נבדקים אוטומטית');
  });

  // ---- שאלות ----
  const qids = new Set();
  const source = (s, p) => {
    if (!s || !SOURCE_TYPES.includes(s.type)) return err(`${p}.source.type`, 'official / adapted / original');
    if (s.type === 'official' || s.type === 'adapted') {
      const ref = s.type === 'official' ? s : s.basedOn;
      if (!ref) return err(`${p}.source.basedOn`, 'שאלה מעובדת חייבת לציין על איזו שאלה רשמית היא מבוססת');
      if (!PAPERS.old.concat(PAPERS.new).includes(ref.exam)) err(`${p}.source`, 'exam: קוד שאלון');
      if (!Number.isInteger(ref.year)) err(`${p}.source`, 'year: שנה לועזית');
      if (!isStr(ref.session)) err(`${p}.source`, 'session: למשל "קיץ מועד א"');
      if (!Number.isInteger(ref.questionNumber)) err(`${p}.source`, 'questionNumber: מספר שאלה');
      if (!/^https:\/\//.test(ref.url || '')) err(`${p}.source`, 'url: קישור לשאלון');
      if (s.type === 'adapted') text(s.changes, `${p}.source.changes`);
    }
  };
  const question = (q, p, { inQuiz = false, inherited = null } = {}) => {
    if (!isStr(q.id) || !ID_RE.test(q.id)) err(`${p}.id`, 'מזהה לא תקין');
    else if (qids.has(q.id)) err(`${p}.id`, `מזהה כפול: ${q.id}`); else qids.add(q.id);
    text(q.prompt, `${p}.prompt`);
    if (q.source || !inherited) source(q.source, p);
    if (q.difficulty !== undefined && ![1, 2, 3].includes(q.difficulty)) err(`${p}.difficulty`, '1 / 2 / 3');
    if (inQuiz && q.hints && q.hints.length) err(`${p}.hints`, 'במבחן אין רמזים');
    (q.hints || []).forEach((h, j) => text(h, `${p}.hints[${j}]`));
    if (!inQuiz && !(q.hints || []).length) warn(p, 'אין רמזים');
    if (!q.solution) err(`${p}.solution`, 'חסר פתרון מלא');
    else { arr(q.solution.steps, `${p}.solution.steps`, 1).forEach((s, j) => text(s, `${p}.solution.steps[${j}]`)); text(q.solution.final, `${p}.solution.final`); }

    if (q.type === 'numeric') {
      const a = q.answer || {};
      if (typeof a.value !== 'number' || !Number.isFinite(a.value)) return err(`${p}.answer.value`, 'חייב להיות מספר');
      const tol = a.tolerance;
      if (typeof tol !== 'number' || tol < 0) err(`${p}.answer.tolerance`, 'מספר ≥ 0 (0 = תשובה מדויקת)');
      if (tol > 0 && !isStr(a.rounding)) err(`${p}.answer.rounding`, 'כשיש סטייה מותרת, צריך לכתוב לכמה לעגל');
      if (!isStr(q.check)) err(`${p}.check`, 'חסר חישוב בלתי תלוי');
      else {
        try { const v = evalExpr(q.check); if (Math.abs(v - a.value) > (tol || 0) + 1e-9) err(`${p}.check`, `החישוב ${q.check} נותן ${+v.toFixed(6)}, אבל התשובה היא ${a.value}`); }
        catch (e) { err(`${p}.check`, e.message); }
      }
      (q.commonWrongAnswers || []).forEach((w, j) => {
        if (typeof w.value !== 'number') err(`${p}.commonWrongAnswers[${j}].value`, 'מספר');
        else if (Math.abs(w.value - a.value) <= (tol || 0)) err(`${p}.commonWrongAnswers[${j}]`, 'תשובה שגויה שנחשבת נכונה');
        if (!mistakes.has(w.mistake)) err(`${p}.commonWrongAnswers[${j}].mistake`, `טעות לא מוגדרת: ${w.mistake}`); else usedMistakes.add(w.mistake);
      });
      if (q.choices) err(`${p}.choices`, 'לשאלה מספרית אין אפשרויות');
    } else if (q.type === 'multipleChoice') {
      const ch = arr(q.choices, `${p}.choices`);
      if (ch.length !== 4) err(`${p}.choices`, `צריך בדיוק 4 אפשרויות (יש ${ch.length})`);
      if (ch.filter(c => c.correct === true).length !== 1) err(`${p}.choices`, 'צריכה להיות בדיוק תשובה נכונה אחת');
      const texts = new Set();
      ch.forEach((c, j) => {
        text(c.text, `${p}.choices[${j}].text`);
        if (texts.has(c.text)) err(`${p}.choices[${j}]`, 'אפשרות כפולה'); texts.add(c.text);
        if (!c.correct && c.mistake !== undefined) { if (!mistakes.has(c.mistake)) err(`${p}.choices[${j}].mistake`, `טעות לא מוגדרת: ${c.mistake}`); else usedMistakes.add(c.mistake); }
        if (c.correct && c.mistake) err(`${p}.choices[${j}]`, 'לתשובה הנכונה אין סוג טעות');
      });
      if (q.answer) err(`${p}.answer`, 'בשאלה אמריקאית התשובה מסומנת ב-correct');
    } else err(`${p}.type`, 'numeric / multipleChoice');
  };

  arr(L.guidedPractice, 'guidedPractice', 1).forEach((q, i) => question(q, `guidedPractice[${i}]`));
  arr(L.independentPractice, 'independentPractice', 1).forEach((q, i) => question(q, `independentPractice[${i}]`));
  arr(L.bagrutQuestions, 'bagrutQuestions', 1).forEach((b, i) => {
    const p = `bagrutQuestions[${i}]`;
    if (!isStr(b.id)) err(`${p}.id`, 'חסר');
    text(b.title, `${p}.title`); text(b.context, `${p}.context`); source(b.source, p);
    const labels = new Set();
    arr(b.parts, `${p}.parts`, 1).forEach((q, j) => {
      if (!isStr(q.label)) err(`${p}.parts[${j}].label`, 'חסר (א, ב, ג…)'); else if (labels.has(q.label)) err(`${p}.parts[${j}].label`, 'כפול'); else labels.add(q.label);
      question(q, `${p}.parts[${j}]`, { inherited: b.source });
    });
  });
  const quiz = arr(L.quiz, 'quiz', 3);
  quiz.forEach((q, i) => question(q, `quiz[${i}]`, { inQuiz: true }));

  for (const m of mistakes) if (!usedMistakes.has(m)) warn('commonMistakes', `הטעות "${m}" לא מקושרת לאף תשובה שגויה`);
  if (L.next !== null && L.next !== undefined) {
    if (!isStr(L.next)) err('next', 'מזהה שיעור או null');
    else if (knownLessons && !knownLessons.has(L.next)) warn('next', `השיעור "${L.next}" עוד לא קיים`);
  }
  return { errors, warnings };
}

// ---- הרצה משורת הפקודה ----
async function main() {
  const { TOPICS } = await import(resolve(ROOT, 'js/data/curriculum.js'));
  const { LESSONS } = await import(resolve(ROOT, 'js/data/lessons/index.js'));
  const topics = new Set(TOPICS.map(t => t.id));
  let files = process.argv.slice(2).map(f => resolve(f));
  const manifestPath = resolve(CONTENT, 'index.json');
  let manifestErr = 0;
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (!files.length) {
    if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.lessons)) { console.error('✗ index.json: מבנה לא תקין'); process.exit(1); }
    files = manifest.lessons.map(f => resolve(CONTENT, f));
  }
  const lessons = [];
  for (const f of files) {
    if (!existsSync(f)) { console.error(`✗ ${relative(ROOT, f)}: הקובץ לא קיים`); manifestErr++; continue; }
    try { lessons.push([f, JSON.parse(readFileSync(f, 'utf8'))]); }
    catch (e) { console.error(`✗ ${relative(ROOT, f)}: JSON לא תקין – ${e.message}`); manifestErr++; }
  }
  const known = new Set([...LESSONS.map(l => l.id), ...lessons.map(([, l]) => l.id)]);
  const seen = new Set();
  let fail = manifestErr;
  for (const [f, L] of lessons) {
    const { errors, warnings } = validateLesson(L, { topics, knownLessons: known });
    if (seen.has(L.id)) errors.push(`id: שיעור כפול ${L.id}`); seen.add(L.id);
    const name = relative(ROOT, f);
    if (errors.length) { fail += errors.length; console.error(`✗ ${name} – ${errors.length} שגיאות`); errors.forEach(e => console.error('   • ' + e)); }
    else console.log(`✓ ${name}`);
    warnings.forEach(w => console.log('   ⚠ ' + w));
  }
  console.log(fail ? `\n${fail} שגיאות` : `\nכל ${lessons.length} קובצי התוכן תקינים`);
  process.exit(fail ? 1 : 0);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
