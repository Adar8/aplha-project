// מעדכן docs/coverage-matrix.json מתוך הפלט החי של tools/audit.mjs (בלי נתוני לומד – רק המוצר),
// ומוסיף שורה ל-docs/coverage-history.jsonl (לא מוחק היסטוריה — append בלבד).
// הרצה: node tools/gen-coverage-matrix.mjs   (מתוך תיקיית math5)
// חשוב: אותה שיטת מדידה בכל ריצה (ראו docs/quality-standards.md §3). הסקריפט הזה לא "משפר"
// מספרים — הוא רק מצלם את tools/audit.mjs (productAudit) ומשווה לתמונה הקודמת.
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { loadContent, productAudit } from './audit.mjs';

const ROOT = new URL('..', import.meta.url);
const HIST = new URL('../docs/coverage-history.jsonl', import.meta.url);

const content = loadContent();
const product = productAudit(content, undefined, Date.now());

const snapshot = {
  date: new Date().toISOString().slice(0, 10),
  mainLessons: product.lessons.length,
  toolboxLessons: product.toolbox.lessons,
  toolboxTopicsCovered: product.toolbox.topicsWithLesson,
  toolboxTopicsTotal: product.toolbox.topics,
  curriculumTopicsCovered: product.coverage.common.covered,
  curriculumTopicsTotal: product.coverage.common.total,
  examSkillsPct: Object.fromEntries(product.examCoverage.map(e => [e.code, e.skillsPct])),
};

// השוואה לשורה הקודמת (אם יש), בלי לשנות אף מספר — רק להציג הפרש
let prev = null;
if (existsSync(HIST)) {
  const lines = readFileSync(HIST, 'utf8').trim().split('\n').filter(Boolean);
  if (lines.length) prev = JSON.parse(lines[lines.length - 1]);
}
const diff = prev ? {
  mainLessons: snapshot.mainLessons - prev.mainLessons,
  toolboxLessons: snapshot.toolboxLessons - prev.toolboxLessons,
  curriculumTopicsCovered: snapshot.curriculumTopicsCovered - prev.curriculumTopicsCovered,
  examSkillsPct: Object.fromEntries(Object.keys(snapshot.examSkillsPct).map(k => [k, (snapshot.examSkillsPct[k] ?? 0) - (prev.examSkillsPct?.[k] ?? 0)])),
} : null;

const out = {
  schemaVersion: 1,
  generatedAt: snapshot.date,
  generatedBy: 'tools/gen-coverage-matrix.mjs → tools/audit.mjs (productAudit) — אין כאן נתוני לומד, רק כיסוי תוכן',
  note: 'כיסוי שאלון נמדד לפי מיומנויות (exam-skills.json), לא לפי נושא בלבד. לשאלון יש כיסוי כאן רק אחרי שיש לו קובץ exam/blueprint עם skills לכל שאלה.',
  diffFromPrevious: diff,
  product,
};
writeFileSync(new URL('../docs/coverage-matrix.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
appendFileSync(HIST, JSON.stringify(snapshot) + '\n');

console.log(`coverage-matrix.json עודכן: ${product.lessons.length} שיעורים ראשיים, ${product.examCoverage.length} שאלונים עם נתוני כיסוי`);
if (diff) console.log('הפרש מהריצה הקודמת:', JSON.stringify(diff));
else console.log('(אין ריצה קודמת להשוואה — זו הרשומה הראשונה ב-coverage-history.jsonl)');
