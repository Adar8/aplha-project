// מחולל docs/curriculum-map.json אוטומטית מתוך js/data/curriculum.js ומתוך השיעורים בפועל.
// הרצה: node tools/gen-curriculum-map.mjs   (מתוך תיקיית math5)
// אל תערכו את docs/curriculum-map.json ידנית — הריצו מחדש את הסקריפט הזה אחרי כל שינוי בשיעורים/בתוכנית.
import { readFileSync, writeFileSync } from 'fs';
import { TOPICS, EXAMS } from '../js/data/curriculum.js';
import { loadLessons } from '../js/data/lessons/index.js';

const LESSONS = await loadLessons(async f => JSON.parse(readFileSync(new URL('../' + f, import.meta.url), 'utf8')));
const byTopic = {};
for (const L of LESSONS) (byTopic[L.topic] ||= []).push(L.id);

const topics = TOPICS.map(t => ({
  id: t.id, name: t.name, status: t.status, confidence: t.confidence,
  old: t.old, new: t.new, lessons: byTopic[t.id] || [],
}));

const out = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  generatedBy: 'tools/gen-curriculum-map.mjs (מתוך js/data/curriculum.js ומתוך learning-content/lessons בפועל)',
  note: 'נוצר אוטומטית. אל תערכו ידנית — הריצו מחדש את הסקריפט אחרי כל שינוי בשיעורים או בתוכנית הלימודים.',
  weights: { old: { '035581': EXAMS.old.papers[0].weight, '035582': EXAMS.old.papers[1].weight } },
  topics,
  coveredCount: topics.filter(t => t.lessons.length).length,
  totalCount: topics.length,
};
writeFileSync(new URL('../docs/curriculum-map.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(`curriculum-map.json: ${out.coveredCount}/${out.totalCount} נושאים עם שיעור`);
