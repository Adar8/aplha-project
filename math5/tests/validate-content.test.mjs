// מוודא שהבודק באמת תופס שגיאות: משבש את שיעור הדוגמה בכמה דרכים ובודק שכל שיבוש נתפס.
import { readFileSync } from 'fs';
import { validateLesson, evalExpr } from './validate-content.mjs';

const base = JSON.parse(readFileSync(new URL('../learning-content/lessons/arithmetic-sequence.json', import.meta.url), 'utf8'));
const clone = () => JSON.parse(JSON.stringify(base));
const cases = [
  ['תשובה שגויה (check לא מתאים)', L => { L.guidedPractice[0].answer.value = -20; }, /check/],
  ['שאלה מספרית בלי check', L => { delete L.quiz[0].check; }, /חישוב בלתי תלוי/],
  ['3 אפשרויות בלבד', L => { L.quiz[3].choices.pop(); }, /בדיוק 4/],
  ['שתי תשובות נכונות', L => { L.quiz[3].choices[1].correct = true; delete L.quiz[3].choices[1].mistake; }, /תשובה נכונה אחת/],
  ['הפניה לטעות שלא קיימת', L => { L.quiz[0].commonWrongAnswers[0].mistake = 'nope'; }, /טעות לא מוגדרת/],
  ['LaTeX שבור', L => { L.quiz[0].prompt = 'מהו $\\frac{1}{$?'; }, /LaTeX/],
  ['$ לא סגור', L => { L.summary = 'סכום $a_1'; }, /אי-זוגי/],
  ['מזהה שאלה כפול', L => { L.quiz[1].id = 'q1'; }, /כפול/],
  ['מקור לא מסווג', L => { delete L.guidedPractice[0].source; }, /source.type/],
  ['שאלה "רשמית" בלי פרטי מקור', L => { L.guidedPractice[0].source = { type: 'official' }; }, /exam/],
  ['שאלה מעובדת בלי basedOn', L => { L.guidedPractice[0].source = { type: 'adapted' }; }, /basedOn/],
  ['רמזים במבחן', L => { L.quiz[0].hints = ['רמז']; }, /אין רמזים/],
  ['בלי פתרון', L => { delete L.independentPractice[0].solution; }, /פתרון/],
  ['HTML בטקסט', L => { L.title = '<b>סדרה</b>'; }, /HTML/],
  ['שאלון לא קיים', L => { L.papers.old = ['035999']; }, /שאלון לא מוכר/],
  ['נושא לא קיים', L => { L.topic = 'no-such-topic'; }, /לא קיים במפת הנושאים/],
  ['תשובה שגויה נפוצה = הנכונה', L => { L.quiz[0].commonWrongAnswers[0].value = 47; }, /נחשבת נכונה/],
  ['סטייה בלי הוראת עיגול', L => { L.quiz[0].answer.tolerance = 0.01; }, /לעגל/],
  ['דוגמה עם חישוב שגוי', L => { L.examples[0].checks[0].equals = 63; }, /לא 63/],
];
const topics = new Set(['sequences']);
let fail = 0;
const clean = validateLesson(clone(), { topics });
if (clean.errors.length) { console.error('✗ שיעור הדוגמה עצמו לא תקין', clean.errors); fail++; }
for (const [name, mutate, re] of cases) {
  const L = clone(); mutate(L);
  const { errors } = validateLesson(L, { topics });
  if (!errors.some(e => re.test(e))) { console.error(`✗ לא נתפס: ${name}`, errors); fail++; }
}
for (const [expr, ok] of [['sqrt(16)+2^3', 12], ['cos(60)', 0.5], ['process.exit()', null], ['alert(1)', null]]) {
  let v = null; try { v = evalExpr(expr); } catch {}
  if (ok === null ? v !== null : Math.abs(v - ok) > 1e-9) { console.error(`✗ מחשבון: ${expr} → ${v}`); fail++; }
}
console.log(fail ? `${fail} כשלים` : `✓ הבודק תפס את כל ${cases.length} סוגי השגיאות`);
process.exit(fail ? 1 : 0);
