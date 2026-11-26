// מעדכן docs/exam-catalog.json: קטלוג שאלוני הבגרות הרשמיים הידועים לפרויקט, עם סטטוס כיסוי לכל שאלה.
// הרצה: node tools/gen-exam-catalog.mjs   (מתוך תיקיית math5)
// המקור היחיד לכתובות רשמיות הוא js/data/curriculum.js (SOURCES, kind: 'official'). אין כאן קישורים שהומצאו.
// שאלון עם קובץ ב-learning-content/exams/<id>.json (מתומלל ומתויג skills) מסומן transcribed.
// שאלון עם blueprint בלבד (learning-content/exams/blueprints/<id>.json, בלי להעתיק את נוסח השאלות) מסומן blueprinted.
// שאלון שרק הקישור הרשמי שלו ידוע, בלי אף אחד מהשניים, מסומן catalogued_only.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SOURCES } from '../js/data/curriculum.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const examsDir = resolve(ROOT, 'learning-content/exams');
const blueprintDir = resolve(examsDir, 'blueprints');
const evalReservedDir = resolve(examsDir, 'eval-reserved');

// שאלונים רשמיים ידועים היום (מ-SOURCES). מפתח = מזהה פנימי, value = {code, year-session, format}
const KNOWN = {
  s581: { code: '35581', session: 'קיץ תשפ"ד, 2024', format: 'old' },
  s582: { code: '35582', session: 'קיץ תשפ"ה, 2025', format: 'old' },
  s571: { code: '35571', session: 'קיץ תשפ"ה, 2025', format: 'new' },
  s572: { code: '35572', session: 'קיץ תשפ"ה, 2025', format: 'new' },
};

const exams = [];
for (const [key, meta] of Object.entries(KNOWN)) {
  const src = SOURCES[key];
  const examFile = existsSync(examsDir) ? readdirSync(examsDir).find(f => f.startsWith(meta.code) && f.endsWith('.json')) : null;
  const blueprintFile = existsSync(blueprintDir) ? readdirSync(blueprintDir).find(f => f.startsWith(meta.code) && f.endsWith('.json')) : null;
  const evalFile = existsSync(evalReservedDir) ? readdirSync(evalReservedDir).find(f => f.startsWith(meta.code) && f.endsWith('.json')) : null;
  let status = 'catalogued_only', questions = [], choose = null, reserved = false;
  if (examFile) {
    const X = JSON.parse(readFileSync(resolve(examsDir, examFile), 'utf8'));
    status = 'transcribed_and_blueprinted';
    questions = X.questions.map(q => ({ n: q.n, points: q.points, topicIds: q.topicIds, skills: q.skills }));
  } else if (evalFile) {
    const B = JSON.parse(readFileSync(resolve(evalReservedDir, evalFile), 'utf8'));
    status = 'eval_reserved';
    reserved = true;
    questions = B.questions;
    choose = B.choose;
  } else if (blueprintFile) {
    const B = JSON.parse(readFileSync(resolve(blueprintDir, blueprintFile), 'utf8'));
    status = 'blueprinted';
    questions = B.questions;
    choose = B.choose;
  }
  exams.push({ id: `${meta.code}-${meta.session.includes('תשפ"ד') ? '2024' : '2025'}-summer`, code: meta.code, session: meta.session, format: meta.format, source: src?.url, status, reserved, choose, questions });
}

const out = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  generatedBy: 'tools/gen-exam-catalog.mjs — מרכיב רק מ-js/data/curriculum.js (SOURCES הרשמיים) ומהקבצים שכבר קיימים בפרויקט',
  note: 'קטלוג זה כולל רק שאלוני מועד קיץ שכבר אומתו ישירות מול קובץ רשמי של משרד החינוך. לא נוספו שאלונים שהקישור הרשמי שלהם לא נבדק.',
  exams,
  statusLegend: {
    transcribed_and_blueprinted: 'יש קובץ שאלון מלא באפליקציה (learning-content/exams) עם נוסח, פתרונות ותיוג מיומנויות לכל שאלה.',
    blueprinted: 'אין העתקת נוסח השאלות (זכויות יוצרים), אבל יש מיפוי שאלה→ניקוד→מיומנויות (learning-content/exams/blueprints). זמין ל-lesson-builder.',
    eval_reserved: 'מופה כמו blueprint, אבל שמור ב-learning-content/exams/eval-reserved ואסור לגמרי ל-lesson-builder/student-simulator לקרוא אותו (docs/quality-standards.md §8). משמש למדידת כיסוי ול-independent-examiner בלבד.',
    catalogued_only: 'הקישור הרשמי ידוע ומאומת, אבל עוד לא נותח לשאלות ומיומנויות. ממתין להרצת exam-analyst.',
  },
  notYetCollected: {
    note: 'לא אומתו עדיין קישורים רשמיים למועדי חורף, מועד ב׳, או שנים נוספות. אין להוסיף שורה כאן בלי קישור רשמי שנבדק בפועל (לא להמציא כתובת).',
    sessionsSuspectedToExist: ['מועד חורף (ככל שקיים ל-5 יח"ל)', 'מועד ב׳', 'שנים קודמות ל-2024'],
    howToFill: 'exam-analyst מאתר קישור רשמי תקין באתר meyda.education.gov.il/sheeloney_bagrut, מוסיף אותו ל-SOURCES ב-curriculum.js (באחריות curriculum-architect), ואז מריץ בלופרינט.',
  },
};
writeFileSync(resolve(ROOT, 'docs/exam-catalog.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`exam-catalog.json: ${exams.length} שאלונים, סטטוסים: ${exams.map(e => `${e.code}=${e.status}`).join(', ')}`);
