// בדיקת תקינות לקובצי התוכן ב-learning-content.
// הרצה: node tests/validate-content.mjs [קובץ.json ...]   (בלי ארגומנטים: כל הקבצים שב-index.json)
// בודק מבנה, מזהים, הפניות לטעויות נפוצות, סיווג מקור, ארבע אפשרויות עם תשובה נכונה אחת,
// חישוב בלתי תלוי של כל תשובה מספרית (שדה check), ותקינות LaTeX (רינדור אמיתי ב-KaTeX).
import { readFileSync, existsSync, readdirSync } from 'fs';
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

// ---- מחשבון בטוח לשדה check (אותו מנוע כמו המחשבון באפליקציה; טריגונומטריה במעלות) ----
import { evaluate } from '../js/core/calc.js';
export function evalExpr(expr) {
  if (typeof expr !== 'string') throw new Error('תווים לא מותרים');
  try { return evaluate(expr, { deg: true }); }
  catch (e) {
    const m = String(e.message);
    throw new Error(m === 'chars' ? 'תווים לא מותרים' : m.startsWith('fn:') ? `פונקציה לא מוכרת: ${m.slice(3)}` : m === 'nan' ? 'התוצאה אינה מספר' : 'ביטוי לא תקין');
  }
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
  const tb = L.kind === 'toolbox';   // שיעור יסוד בארגז הכלים: בלי שאלוני בחינה ובלי שאלות בגרות
  if (L.kind !== undefined && !['lesson', 'toolbox'].includes(L.kind)) err('kind', 'lesson / toolbox');
  if (L.schemaVersion !== 1) err('schemaVersion', 'חייב להיות 1');
  if (!isStr(L.id) || !ID_RE.test(L.id)) err('id', 'מזהה באותיות קטנות באנגלית, ספרות ומקפים');
  text(L.title, 'title');
  if (!isStr(L.topic)) err('topic', 'חסר');
  else if (topics && !topics.has(L.topic) && !(tb && L.topic === 'foundations')) err('topic', `הנושא "${L.topic}" לא קיים במפת הנושאים (curriculum.js)`);
  if (!L.papers || typeof L.papers !== 'object') err('papers', 'חסר');
  else {
    for (const k of ['old', 'new']) for (const p of arr(L.papers[k], `papers.${k}`)) if (!PAPERS[k].includes(p)) err(`papers.${k}`, `שאלון לא מוכר: ${p}`);
    if (!tb && !(L.papers.old || []).length && !(L.papers.new || []).length) err('papers', 'צריך לפחות שאלון אחד');
  }
  if (!['common', 'old', 'new', 'check', ...(tb ? ['foundation'] : [])].includes(L.topicStatus)) err('topicStatus', 'common / old / new / check' + (tb ? ' / foundation' : ''));
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
  arr(L.independentPractice, 'independentPractice', tb ? 0 : 1).forEach((q, i) => question(q, `independentPractice[${i}]`));
  arr(L.bagrutQuestions, 'bagrutQuestions', tb ? 0 : 1).forEach((b, i) => {
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

// ---- מבחן אבחון: כל פריט נבדק בדיוק כמו שאלת מבחן בשיעור (בלי רמזים, עם check) ----
export function validateDiagnostic(D, { skills }) {
  const errors = [], warnings = [];
  if (D.schemaVersion !== 1) errors.push('schemaVersion: חייב להיות 1');
  const items = Array.isArray(D.items) ? D.items : [];
  if (!items.length) errors.push('items: אין שאלות');
  const dummyQ = { id: 'zz-dummy', type: 'numeric', source: { type: 'original' }, prompt: 'x', answer: { value: 1, tolerance: 0 }, check: '1', hints: ['x'], solution: { steps: ['x'], final: 'x' } };
  const shell = {
    schemaVersion: 1, id: 'diagnostic', title: 'אבחון', topic: 'sequences', papers: { old: ['035581'], new: [] }, topicStatus: 'common', estimatedMinutes: 45,
    summary: 'x', review: { status: 'draft' }, explanations: [{ id: 'x', title: 'x', blocks: [{ type: 'text', text: 'x' }] }], formulas: [],
    video: { status: 'pending', links: [] }, examples: [{ id: 'x', title: 'x', problem: 'x', steps: ['x'], answer: 'x', checks: [{ expr: '1', equals: 1 }] }],
    guidedPractice: [{ ...dummyQ, id: 'zz-g' }], independentPractice: [{ ...dummyQ, id: 'zz-p' }],
    bagrutQuestions: [{ id: 'x', title: 'x', source: { type: 'original' }, context: 'x', parts: [{ ...dummyQ, id: 'zz-b', label: 'א' }] }],
    quiz: items.map(({ skill, ...q }) => q).concat(items.length < 3 ? [{ ...dummyQ, id: 'zz-q1', hints: undefined }, { ...dummyQ, id: 'zz-q2', hints: undefined }] : []),
    commonMistakes: [{ id: 'zz', label: 'x', advice: 'x', reviewSection: 'quiz' }], next: null,
  };
  const r = validateLesson(shell, {});
  r.errors.filter(e => e.startsWith('quiz[')).forEach(e => errors.push(e.replace(/^quiz\[/, 'items[')));
  const covered = new Set();
  items.forEach((it, i) => {
    if (!skills.has(it.skill)) errors.push(`items[${i}].skill: מיומנות לא קיימת במפת הידע: ${it.skill}`);
    covered.add(it.skill);
  });
  (D.probes || []).forEach(p => { if (!covered.has(p)) errors.push(`probes: אין שאלה למיומנות ${p}`); });
  if (!Number.isInteger(D.maxQuestions) || D.maxQuestions < (D.probes || []).length) errors.push('maxQuestions: חייב להיות שלם ולא קטן ממספר ה-probes');
  return { errors, warnings };
}

// ---- מפת ידע: מזהים, תחומים, נושאים, שיעורים, ידע מקדים בלי מעגלים ----
export function validateKnowledgeMap(K, { topics = null, lessons = null } = {}) {
  const errors = [];
  const areas = new Set((K.areas || []).map(a => a.id));
  const ids = new Set();
  (K.skills || []).forEach((s, i) => {
    const p = `skills[${i}]`;
    if (!ID_RE.test(s.id || '')) errors.push(`${p}.id: מזהה לא תקין`);
    else if (ids.has(s.id)) errors.push(`${p}.id: כפול ${s.id}`); else ids.add(s.id);
    if (!areas.has(s.area)) errors.push(`${p}.area: תחום לא קיים ${s.area}`);
    if (s.topic !== 'foundations' && topics && !topics.has(s.topic)) errors.push(`${p}.topic: נושא לא קיים ${s.topic}`);
    (s.lessons || []).forEach(l => { if (lessons && !lessons.has(l)) errors.push(`${p}.lessons: שיעור לא קיים ${l}`); });
  });
  const byId = Object.fromEntries((K.skills || []).map(s => [s.id, s]));
  (K.skills || []).forEach(s => (s.prereqs || []).forEach(q => { if (!byId[q]) errors.push(`${s.id}: ידע מקדים לא קיים ${q}`); }));
  const state = {};
  const visit = (id, path) => {
    if (state[id] === 2 || !byId[id]) return;
    if (state[id] === 1) { errors.push(`מעגל בידע המקדים: ${[...path, id].join(' ← ')}`); return; }
    state[id] = 1; (byId[id].prereqs || []).forEach(q => visit(q, [...path, id])); state[id] = 2;
  };
  Object.keys(byId).forEach(id => visit(id, []));
  return { errors, skills: ids };
}

// ---- הרצה משורת הפקודה ----

// ---- שאלון בגרות רשמי (learning-content/exams) ----
// נוסח רשמי + פתרונות של MATH 5: כל תשובה מספרית מחושבת מחדש משדה check, כל LaTeX מתרנדר, כל איור קיים.
export function validateExam(X, { examDir = resolve(CONTENT, 'exams'), topics = null } = {}) {
  const errors = [];
  const err = (path, msg) => errors.push(`${path}: ${msg}`);
  const isStr = v => typeof v === 'string' && v.trim().length > 0;
  const text = (v, path) => {
    if (!isStr(v)) return err(path, 'חייב להיות טקסט לא ריק');
    if (/<\/?[a-z][^>]*>/i.test(v.replace(/\$[^$]*\$/g, ''))) err(path, 'אין להשתמש ב-HTML');
    const s = v.replace(/\$\$[\s\S]+?\$\$/g, m => { tex(m.slice(2, -2), path, true); return ''; });
    if ((s.match(/\$/g) || []).length % 2) return err(path, 'מספר אי-זוגי של סימני $');
    for (const m of s.matchAll(/\$([^$]+?)\$/g)) tex(m[1], path, false);
  };
  const tex = (t, path, displayMode) => {
    try { katex.renderToString(t, { throwOnError: true, displayMode, strict: 'ignore' }); }
    catch (e) { err(path, `LaTeX לא תקין: ${t} (${String(e.message).split('\n')[0]})`); }
  };
  const fig = (f, path) => {
    if (!f || !isStr(f.figure || f)) return err(path, 'איור חסר');
    const file = f.figure || f;
    if (!existsSync(resolve(examDir, file))) err(path, `קובץ איור לא קיים: ${file}`);
    if (f.figure && !isStr(f.alt)) err(path, 'חסר תיאור חלופי (alt) לאיור');
  };
  if (X.schemaVersion !== 1) err('schemaVersion', 'חייב להיות 1');
  if (X.kind !== 'exam') err('kind', 'חייב להיות exam');
  if (!isStr(X.id) || !ID_RE.test(X.id)) err('id', 'מזהה לא תקין');
  if (!['old', 'new'].includes(X.format)) err('format', 'old / new');
  if (!PAPERS[X.format]?.includes('0' + X.code)) err('code', `השאלון ${X.code} לא שייך למתכונת ${X.format}`);
  if (X.source?.label !== 'official') err('source.label', 'שאלון בגרות חייב להיות official');
  if (!/^https:\/\/meyda\.education\.gov\.il\//.test(X.source?.url || '')) err('source.url', 'קישור לקובץ הרשמי באתר משרד החינוך');
  if (!isStr(X.source?.copyright)) err('source.copyright', 'חסרה הודעת זכויות יוצרים');
  if (X.solutions?.label !== 'original' || !isStr(X.solutions?.note)) err('solutions', 'הפתרונות חייבים להיות מסומנים original עם הסבר');
  (X.instructions || []).forEach((t, i) => text(t, `instructions[${i}]`));
  const nums = new Set((X.questions || []).map(q => q.n));
  const inCh = (X.chapters || []).flatMap(c => c.questions);
  if (inCh.length !== nums.size || inCh.some(n => !nums.has(n))) err('chapters', 'כל שאלה צריכה להופיע בדיוק בפרק אחד');
  for (const q of X.questions || []) {
    const qp = `q${q.n}`;
    if (!Number.isInteger(q.page)) err(qp, 'חסר מספר עמוד בקובץ הרשמי');
    if (!Array.isArray(q.topicIds) || !q.topicIds.length) err(qp, 'חסר topicIds (נושאים מתוכנית הלימודים)');
    else if (topics) q.topicIds.forEach(t => { if (!topics.has(t)) err(qp, `נושא לא קיים במפת הנושאים: ${t}`); });
    (q.stem || []).forEach((b, i) => typeof b === 'string' ? text(b, `${qp}.stem[${i}]`) : fig(b, `${qp}.stem[${i}]`));
    const ids = new Set();
    for (const p of q.parts || []) {
      const pp = `${qp}.${p.id}`;
      if (ids.has(p.id)) err(pp, 'מזהה סעיף כפול'); ids.add(p.id);
      if (!isStr(p.label)) err(pp, 'חסרה תווית סעיף');
      text(p.text, `${pp}.text`);
      (p.intro || []).forEach((t, i) => text(t, `${pp}.intro[${i}]`));
      (p.list || []).forEach((t, i) => text(t, `${pp}.list[${i}]`));
      if (p.figure) fig(p.figure, `${pp}.figure`);
      if (p.sketch) fig(p.sketch, `${pp}.sketch`);
      if (p.ambiguity) text(p.ambiguity, `${pp}.ambiguity`);
      text(p.final, `${pp}.final`);
      if (!Array.isArray(p.solution) || !p.solution.length) err(pp, 'חסר פתרון');
      (p.solution || []).forEach((t, i) => text(t, `${pp}.solution[${i}]`));
      const a = p.answer;
      if (a === null || a === undefined) continue;
      if (a.type === 'numeric') {
        if (typeof a.value !== 'number' || !isStr(a.check)) { err(pp, 'תשובה מספרית צריכה value ו-check'); continue; }
        if (a.prompt) text(a.prompt, `${pp}.answer.prompt`);
        try {
          const v = evalExpr(a.check);
          const tol = Math.max(a.tol ?? 0, 1e-9);
          if (Math.abs(v - a.value) > tol) err(pp, `check=${a.check} נותן ${v}, אבל value=${a.value}`);
        } catch (e) { err(pp, `check: ${e.message}`); }
      } else if (a.type === 'mc') {
        if (!Array.isArray(a.options) || a.options.length < 2 || !(a.correct >= 0 && a.correct < a.options.length)) err(pp, 'שאלת בחירה: אפשרויות ותשובה נכונה');
      } else err(pp, `סוג תשובה לא מוכר: ${a.type}`);
    }
  }
  return { errors };
}

async function main() {
  const { TOPICS } = await import(resolve(ROOT, 'js/data/curriculum.js'));
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
  const known = new Set(lessons.map(([, l]) => l.id));
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
  // ארגז הכלים: נטען פה (לפני מפת הידע) כי שיעורי יסוד (tb-*) הם שיעורים לכל דבר וגם
  // skills[].lessons במפת הידע יכולים (וצריכים) להצביע עליהם, לא רק על 4 השיעורים הראשיים.
  const TB = JSON.parse(readFileSync(resolve(CONTENT, 'toolbox.json'), 'utf8'));
  const tbErr = [];
  const topicIds = new Set();
  const tbLessons = [];
  for (const f of TB.lessons || []) {
    const fp = resolve(CONTENT, f);
    if (!existsSync(fp)) { tbErr.push(`${f}: הקובץ לא קיים`); continue; }
    const TL = JSON.parse(readFileSync(fp, 'utf8'));
    if (TL.kind !== 'toolbox') tbErr.push(`${f}: kind חייב להיות toolbox`);
    const r = validateLesson(TL, { topics });
    r.errors.forEach(e => tbErr.push(`${f}: ${e}`));
    tbLessons.push(TL.id);
    if (!r.errors.length) console.log(`✓ learning-content/${f}`);
  }
  // מפת ידע ומבחן אבחון
  const K = JSON.parse(readFileSync(resolve(CONTENT, 'knowledge-map.json'), 'utf8'));
  const km = validateKnowledgeMap(K, { topics, lessons: new Set([...known, ...tbLessons]) });
  if (km.errors.length) { fail += km.errors.length; console.error(`✗ learning-content/knowledge-map.json – ${km.errors.length} שגיאות`); km.errors.forEach(e => console.error('   • ' + e)); }
  else console.log(`✓ learning-content/knowledge-map.json (${km.skills.size} מיומנויות)`);
  const D = JSON.parse(readFileSync(resolve(CONTENT, 'diagnostic.json'), 'utf8'));
  const dg = validateDiagnostic(D, { skills: km.skills });
  if (dg.errors.length) { fail += dg.errors.length; console.error(`✗ learning-content/diagnostic.json – ${dg.errors.length} שגיאות`); dg.errors.forEach(e => console.error('   • ' + e)); }
  else console.log(`✓ learning-content/diagnostic.json (${D.items.length} שאלות)`);
  for (const t of TB.tools || []) for (const tp of t.topics || []) {
    if (topicIds.has(tp.id)) tbErr.push(`toolbox: נושא כפול ${tp.id}`); topicIds.add(tp.id);
    (tp.skills || []).forEach(sk => { if (!km.skills.has(sk)) tbErr.push(`toolbox ${tp.id}: מיומנות לא קיימת ${sk}`); });
    if (tp.lesson && !tbLessons.includes(tp.lesson)) tbErr.push(`toolbox ${tp.id}: שיעור לא קיים ${tp.lesson}`);
  }
  for (const [lid, pre] of Object.entries(TB.lessonPrereqs || {})) {
    if (!known.has(lid) && !(TB.plannedLessons || {})[lid]) tbErr.push(`lessonPrereqs: שיעור לא קיים ${lid}`);
    pre.forEach(t => { if (!topicIds.has(t)) tbErr.push(`lessonPrereqs ${lid}: נושא לא קיים ${t}`); });
  }
  for (const lid of known) if (!(TB.lessonPrereqs || {})[lid]) tbErr.push(`lessonPrereqs: חסרות דרישות קדם לשיעור ${lid}`);
  (TB.baseCheck?.probes || []).forEach(p => { if (!D.items.some(i => i.skill === p)) tbErr.push(`baseCheck: אין שאלה למיומנות ${p}`); });
  if (tbErr.length) { fail += tbErr.length; console.error(`✗ learning-content/toolbox.json – ${tbErr.length} שגיאות`); tbErr.forEach(e => console.error('   • ' + e)); }
  else console.log(`✓ learning-content/toolbox.json (${topicIds.size} נושאים, ${tbLessons.length} שיעורי יסוד)`);
  // מיומנויות בגרות: כל covers (שיעורים) ו-skills (שאלות בגרות) חייבים להופיע ב-exam-skills.json
  const SK = new Set(Object.keys(JSON.parse(readFileSync(resolve(CONTENT, 'exam-skills.json'), 'utf8')).skills));
  const skErr = [];
  const lessonFiles = [...manifest.lessons, ...(TB.lessons || [])];
  for (const f of lessonFiles) {
    const L = JSON.parse(readFileSync(resolve(CONTENT, f), 'utf8'));
    if (L.covers !== undefined && !Array.isArray(L.covers)) skErr.push(`${f}: covers חייב להיות מערך`);
    (L.covers || []).forEach(k => { if (!SK.has(k)) skErr.push(`${f}: מיומנות לא מוכרת ב-covers: ${k}`); });
  }
  const EX = JSON.parse(readFileSync(resolve(CONTENT, 'exams/index.json'), 'utf8'));
  for (const id of EX.exams) {
    const X = JSON.parse(readFileSync(resolve(CONTENT, `exams/${id}.json`), 'utf8'));
    X.questions.forEach(q => { if (!Array.isArray(q.skills) || !q.skills.length) skErr.push(`exams/${id} q${q.n}: חסר skills`); (q.skills || []).forEach(k => { if (!SK.has(k)) skErr.push(`exams/${id} q${q.n}: מיומנות לא מוכרת: ${k}`); }); });
  }
  // Blueprints (exam-analyst): לא מכילים נוסח רשמי, אבל חייבים skills/topicIds תקינים כדי שכיסוי יימדד נכון.
  // נבדקים באותה דרך גם exams/blueprints (למדידה+תרגול עתידי) וגם exams/eval-reserved (שמור להערכה עצמאית – ראו docs/quality-standards.md §8).
  const topicSet = new Set(TOPICS.map(t => t.id));
  function checkBlueprintDir(dirName) {
    const dir = resolve(CONTENT, `exams/${dirName}`);
    const errs = []; let count = 0;
    if (!existsSync(dir)) return { errs, count };
    for (const f of readdirSync(dir).filter(f => f.endsWith('.json'))) {
      count++;
      const B = JSON.parse(readFileSync(resolve(dir, f), 'utf8'));
      const miss = new Set(Object.keys(B.missingSkills || {}));
      const tag = `${dirName}/${f}`;
      if (B.schemaVersion !== 1) errs.push(`${tag}: schemaVersion חייב להיות 1`);
      if (B.kind !== 'blueprint') errs.push(`${tag}: kind חייב להיות blueprint`);
      if (!PAPERS[B.format]?.includes('0' + B.code)) errs.push(`${tag}: שאלון ${B.code} לא שייך למתכונת ${B.format}`);
      for (const q of B.questions || []) {
        const qp = `${tag} q${q.n}`;
        if (typeof q.points !== 'number') errs.push(`${qp}: חסר points`);
        (q.topicIds || []).forEach(t => { if (!topicSet.has(t)) errs.push(`${qp}: נושא לא קיים: ${t}`); });
        if (!Array.isArray(q.skills) || !q.skills.length) errs.push(`${qp}: חסר skills`);
        (q.skills || []).forEach(k => { if (!SK.has(k) && !miss.has(k)) errs.push(`${qp}: מיומנות לא מוכרת ולא ב-missingSkills: ${k}`); });
        if (typeof q.summary !== 'string' || !q.summary.trim()) errs.push(`${qp}: חסר summary (תקציר, לא נוסח רשמי)`);
      }
    }
    return { errs, count };
  }
  for (const dirName of ['blueprints', 'eval-reserved']) {
    const { errs: bpErr, count: bpCount } = checkBlueprintDir(dirName);
    if (bpErr.length) { fail += bpErr.length; console.error(`✗ learning-content/exams/${dirName} – ${bpErr.length} שגיאות`); bpErr.forEach(e => console.error('   • ' + e)); }
    else if (bpCount) console.log(`✓ learning-content/exams/${dirName} (${bpCount} שאלונים ממופים${dirName === 'eval-reserved' ? ', שמור להערכה עצמאית' : ''})`);
  }
  if (skErr.length) { fail += skErr.length; console.error(`✗ מיומנויות בגרות – ${skErr.length} שגיאות`); skErr.forEach(e => console.error('   • ' + e)); }
  else console.log(`✓ learning-content/exam-skills.json (${SK.size} מיומנויות)`);
  for (const id of EX.exams) {
    const X = JSON.parse(readFileSync(resolve(CONTENT, `exams/${id}.json`), 'utf8'));
    const r = validateExam(X, { topics: new Set(TOPICS.map(t => t.id)) });
    if (X.id !== id) r.errors.push(`id: ${X.id} לא תואם לשם הקובץ`);
    if (r.errors.length) { fail += r.errors.length; console.error(`✗ learning-content/exams/${id}.json – ${r.errors.length} שגיאות`); r.errors.forEach(e => console.error('   • ' + e)); }
    else { const parts = X.questions.flatMap(q => q.parts); console.log(`✓ learning-content/exams/${id}.json (${X.questions.length} שאלות, ${parts.length} סעיפים, ${parts.filter(p => p.answer?.type === 'numeric').length} תשובות מספריות נבדקו)`); }
  }
  console.log(fail ? `\n${fail} שגיאות` : `\nכל קובצי התוכן תקינים (${lessons.length} שיעורים, ${tbLessons.length} שיעורי יסוד, ${EX.exams.length} שאלוני בגרות, מפת ידע, אבחון)`);
  process.exit(fail ? 1 : 0);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
