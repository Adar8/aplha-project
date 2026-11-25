// מעדכן docs/coverage-matrix.json מתוך הפלט החי של tools/audit.mjs (בלי נתוני לומד – רק המוצר).
// הרצה: node tools/gen-coverage-matrix.mjs   (מתוך תיקיית math5)
import { writeFileSync } from 'fs';
import { loadContent, productAudit } from './audit.mjs';

const content = loadContent();
const product = productAudit(content, undefined, Date.now());
const out = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  generatedBy: 'tools/gen-coverage-matrix.mjs → tools/audit.mjs (productAudit) — אין כאן נתוני לומד, רק כיסוי תוכן',
  note: 'כיסוי שאלון נמדד לפי מיומנויות (exam-skills.json), לא לפי נושא בלבד. לשאלון יש כיסוי כאן רק אחרי שיש לו קובץ exam/blueprint עם skills לכל שאלה.',
  product,
};
writeFileSync(new URL('../docs/coverage-matrix.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(`coverage-matrix.json עודכן: ${product.lessons.length} שיעורים ראשיים, ${product.examCoverage.length} שאלונים עם נתוני כיסוי`);
