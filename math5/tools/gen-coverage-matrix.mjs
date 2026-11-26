// מעדכן docs/coverage-matrix.json מתוך הפלט החי של tools/audit.mjs (בלי נתוני לומד – רק המוצר),
// ומוסיף שורה ל-docs/coverage-history.jsonl (לא מוחק היסטוריה — append בלבד).
// הרצה: node tools/gen-coverage-matrix.mjs   (מתוך תיקיית math5)
// חשוב: אותה שיטת מדידה בכל ריצה (ראו docs/quality-standards.md §3). הסקריפט הזה לא "משפר"
// מספרים — הוא רק מצלם את tools/audit.mjs (productAudit) ומשווה לתמונה הקודמת.
//
// ארבעה מדדים נפרדים (אין לאחד אותם לציון אחד מטעה — ראו docs/quality-standards.md §6):
//   1. curriculumCoverage      — כיסוי תוכנית הלימודים הרשמית (נושא ברמת כותרת, מ-curriculum.js)
//   2. examSkillCoverage       — כיסוי מיומנויות בבחינות שנאספו (exam-skills.json, לפי שאלון, full/blueprint)
//   3. verifiedSolveCapability — יכולת פתרון שנבדקה בפועל בסימולציה עצמאית (independent-examiner + math-auditor)
//   4. realUserAchievement     — הישגים אמיתיים של המשתמש (מייצוא התקדמות; אין נתונים עד שיסופק)
// לכל מדד: מכנה, מספר פריטים שנבדקו, גרסת תוכן (hash קצר אם יש git), ותאריך הבדיקה.
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadContent, productAudit } from './audit.mjs';

const ROOT = new URL('../', import.meta.url);
const HIST = new URL('../docs/coverage-history.jsonl', import.meta.url);
const today = new Date().toISOString().slice(0, 10);

let contentVersion = 'unknown';
try { contentVersion = execSync('git rev-parse --short HEAD', { cwd: fileURLToPath(ROOT) }).toString().trim(); } catch { /* אין git או לא זמין – לא קריטי */ }

const content = loadContent();
const product = productAudit(content, undefined, Date.now());

// ---------- מדד 1: כיסוי תוכנית הלימודים הרשמית ----------
const curriculumCoverage = {
  metric: 'curriculumCoverage',
  description: 'אחוז נושאי תוכנית הלימודים הרשמית (ברמת כותרת נושא) שיש להם שיעור באפליקציה. לא מודד אם כל המיומנויות בתוך הנושא נלמדו.',
  checkedAt: today, contentVersion,
  byTrack: {
    common: { covered: product.coverage.common.covered, total: product.coverage.common.total },
    old: { covered: product.coverage.old.covered, total: product.coverage.old.total },
    new: { covered: product.coverage.new.covered, total: product.coverage.new.total },
  },
};

// ---------- מדד 2: כיסוי מיומנויות בבחינות שנאספו ----------
const examSkillCoverage = {
  metric: 'examSkillCoverage',
  description: 'לכל שאלון שנאסף (קובץ exam מלא או blueprint): אחוז נקודות שהמיומנויות הנדרשות להן נלמדות באפליקציה. blueprint = מופה אבל אין עדיין תרגול אינטראקטיבי על השאלון עצמו.',
  checkedAt: today, contentVersion,
  byExam: product.examCoverage.map(e => ({ code: e.code, session: e.session, kind: e.kind, questionsCount: e.questions.length, skillsPctWeighted: e.skillsPct, fullyCoveredPctOfPoints: e.fullPct })),
};

// ---------- מדד 3: יכולת פתרון שנבדקה בסימולציה עצמאית ----------
// מקור: docs/reports/examinee/grading.md (independent-examiner + math-auditor). אם לא קיים ריצה טרייה יותר
// מהתוכן הנוכחי — מסומן needsRefresh, לא מומצא מספר עדכני.
const grading = 'docs/reports/examinee/grading.md';
const gradingExists = existsSync(new URL('../' + grading, import.meta.url));
const verifiedSolveCapability = {
  metric: 'verifiedSolveCapability',
  description: 'ציון שהושג על ידי independent-examiner (למד רק מהאפליקציה) על שאלוני בגרות אמיתיים, מנוקד על ידי math-auditor. לא תחזית לציון התלמיד האמיתי.',
  lastMeasuredAt: gradingExists ? '2026-11-25' : null,
  contentVersionAtMeasurement: 'pre-geometric-sequence (ראו docs/decision-log.md 25.11.2026)',
  source: gradingExists ? grading : null,
  status: 'needsRefresh',
  note: gradingExists
    ? 'הריצה האחרונה קדמה להוספת geometric-sequence ול-blueprints של 35582/35571. המספרים (0 מחמיר, 30.25 מקל, 45.25 גבול עליון) ישנים ואינם משקפים את התוכן הנוכחי. יש להריץ /math5-exam מחדש לפני הסתמכות עליהם.'
    : 'עדיין לא בוצעה סימולציית independent-examiner.',
};

// ---------- מדד 4: הישגים אמיתיים של המשתמש ----------
const realUserAchievement = {
  metric: 'realUserAchievement',
  description: 'נתוני התקדמות אמיתיים של התלמיד (לא סימולציה). מגיעים רק מייצוא התקדמות מהאפליקציה (התקדמות ← ייצוא).',
  status: 'noData',
  note: 'אין עדיין קובץ ייצוא. node tools/audit.mjs --progress <קובץ> יפיק את המדד הזה כשיסופק.',
};

const metrics = { curriculumCoverage, examSkillCoverage, verifiedSolveCapability, realUserAchievement };

const snapshot = {
  date: today,
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
  schemaVersion: 2,
  generatedAt: today,
  generatedBy: 'tools/gen-coverage-matrix.mjs → tools/audit.mjs (productAudit) — אין כאן נתוני לומד אמיתיים, רק כיסוי תוכן + אחרון שנמדד בסימולציה',
  note: 'ארבעה מדדים נפרדים (metrics) — אין לאחד אותם לציון אחד. ראו docs/quality-standards.md §6.',
  metrics,
  diffFromPrevious: diff,
  product,
};
writeFileSync(new URL('../docs/coverage-matrix.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
appendFileSync(HIST, JSON.stringify(snapshot) + '\n');

console.log(`coverage-matrix.json עודכן (v2, 4 מדדים נפרדים): ${product.lessons.length} שיעורים ראשיים, ${product.examCoverage.length} שאלונים עם נתוני כיסוי`);
if (diff) console.log('הפרש מהריצה הקודמת:', JSON.stringify(diff));
else console.log('(אין ריצה קודמת להשוואה — זו הרשומה הראשונה ב-coverage-history.jsonl)');
