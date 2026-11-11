// בדיקות יחידה ללוגיקת הליבה: בדיקת תשובות, מודל שליטה, חזרות, אבחון, תוכנית שבועית, המרת תוכן ושמירה.
// הרצה: node --test tests/unit/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { parseNumber, checkNumeric, checkChoice } from '../../js/core/answers.js';
import { computeMastery, DAY, evidenceWeight } from '../../js/core/mastery.js';
import { initialReview, afterReview, dueReviews, pickReviewQuestions, startOfDay, INTERVALS } from '../../js/core/schedule.js';
import { startDiagnostic, nextItem, recordAnswer, diagnosticResults, recommendedStart } from '../../js/core/diagnostic.js';
import { plannedByDay, weekReport, weekStart, dateKey, recommendations, requiredSecond } from '../../js/core/plan.js';
import { adaptLesson } from '../../js/core/adapter.js';
import { fmt } from '../../js/core/text.js';
import { migrate, empty } from '../../js/store.js';

const json = p => JSON.parse(readFileSync(new URL('../../learning-content/' + p, import.meta.url), 'utf8'));
const NOW = new Date('2026-11-11T10:00:00').getTime();

// ---------- בדיקת תשובות ----------
test('parseNumber: פורמטים שלומד עשוי להקליד', () => {
  assert.equal(parseNumber('42'), 42);
  assert.equal(parseNumber(' -21 '), -21);
  assert.equal(parseNumber('−21'), -21);      // מינוס טיפוגרפי
  assert.equal(parseNumber('9,8'), 9.8);           // פסיק עשרוני
  assert.equal(parseNumber('3/4'), 0.75);
  assert.equal(parseNumber('.5'), 0.5);
  assert.ok(Number.isNaN(parseNumber('')));
  assert.ok(Number.isNaN(parseNumber('abc')));
  assert.ok(Number.isNaN(parseNumber('1/0')));
  assert.ok(Number.isNaN(parseNumber('2+3')));
});

test('checkNumeric: סטייה מותרת, תשובה מדויקת וזיהוי טעות נפוצה', () => {
  const q = { answer: 9.8, tol: 0.02, wrong: [{ v: 14.7, tag: 'sine-ratio' }] };
  assert.equal(checkNumeric(q, '9.8').ok, true);
  assert.equal(checkNumeric(q, '9.79').ok, true);
  assert.equal(checkNumeric(q, '9.85').ok, false);
  assert.equal(checkNumeric(q, '14.70').tag, 'sine-ratio');
  assert.equal(checkNumeric(q, '3').tag, 'general');
  assert.equal(checkNumeric(q, 'x').valid, false);
  const exact = { answer: 7, tol: 0 };
  assert.equal(checkNumeric(exact, '7').ok, true);
  assert.equal(checkNumeric(exact, '7.01').ok, false);
  assert.equal(checkNumeric({ answer: 0.25, tol: 0.005 }, '1/4').ok, true);
});

test('checkChoice: אפשרות נכונה, שגויה עם סוג טעות, ובלי בחירה', () => {
  const q = { options: [{ ok: true }, { tag: 'max-min' }, {}, {}] };
  assert.deepEqual(checkChoice(q, '0'), { valid: true, ok: true, tag: null });
  assert.equal(checkChoice(q, 1).tag, 'max-min');
  assert.equal(checkChoice(q, 2).tag, 'general');
  assert.equal(checkChoice(q, undefined).valid, false);
  assert.equal(checkChoice(q, 7).valid, false);
});

// ---------- מודל שליטה ----------
const QIDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const att = (qid, ok, daysAgo, extra = {}) => ({ qid, ok, hints: 0, revealed: false, ctx: 'practice', ts: NOW - daysAgo * DAY, ...extra });

test('שליטה: בלי נתונים – רמה 0', () => {
  const m = computeMastery(QIDS, [], [], NOW);
  assert.equal(m.level, 0); assert.equal(m.score, 0);
});

test('שליטה: משקל ראיה – רמז מחצית, הצגת פתרון אפס', () => {
  assert.equal(evidenceWeight({ ok: true, hints: 0 }), 1);
  assert.equal(evidenceWeight({ ok: true, hints: 2 }), 0.5);
  assert.equal(evidenceWeight({ ok: true, hints: 0, revealed: true }), 0);
  assert.equal(evidenceWeight({ ok: false }), 0);
});

test('שליטה: משתמשים במבחן האחרון, לא בטוב ביותר', () => {
  const atts = ['a', 'b', 'c'].map(q => att(q, true, 1));
  const m = computeMastery(QIDS, atts, [{ score: 100, at: NOW - 3 * DAY }, { score: 40, at: NOW }], NOW);
  assert.equal(m.lastQuiz, 40);
  assert.ok(m.level < 4);
  assert.ok(m.missing.some(t => t.includes('40')));
});

test('שליטה: הכול נכון ביום אחד – עדיין לא "שליטה" בלי חזרה מושהית', () => {
  const atts = ['a', 'b', 'c', 'd', 'e', 'f'].map(q => att(q, true, 0));
  const m = computeMastery(QIDS, atts, [{ score: 100, at: NOW }], NOW);
  assert.equal(m.delayed, false);
  assert.equal(m.level, 3);
  assert.ok(m.missing.some(t => t.includes('3 ימים')));
});

test('שליטה: הצלחה בחזרה אחרי 4 ימים – רמה 4', () => {
  const atts = ['a', 'b', 'c', 'd', 'e', 'f'].map(q => att(q, true, 5)).concat([att('a', true, 0, { ctx: 'review' })]);
  const m = computeMastery(QIDS, atts, [{ score: 100, at: NOW - 5 * DAY }], NOW);
  assert.equal(m.delayed, true);
  assert.equal(m.level, 4);
  assert.deepEqual(m.missing, []);
});

test('שליטה: אותה שאלה שוב ושוב לא נספרת כמגוון', () => {
  const atts = Array.from({ length: 10 }, () => att('a', true, 0));
  const m = computeMastery(QIDS, atts, [{ score: 100, at: NOW }], NOW);
  assert.equal(m.distinct, 1);
  assert.ok(m.level < 3);
});

test('שליטה: תשובות עם רמזים לא נספרות כ"בלי עזרה"', () => {
  const atts = ['a', 'b', 'c'].map(q => att(q, true, 0, { hints: 1 }));
  assert.equal(computeMastery(QIDS, atts, [], NOW).distinct, 0);
});

test('שליטה: בלי הצלחה יותר מחודש – יורדת מרמה 4 ודורשת רענון', () => {
  const atts = ['a', 'b', 'c', 'd', 'e', 'f'].map(q => att(q, true, 40)).concat([att('a', true, 35, { ctx: 'review' })]);
  const m = computeMastery(QIDS, atts, [{ score: 100, at: NOW - 40 * DAY }], NOW);
  assert.equal(m.stale, true);
  assert.ok(m.level < 4);
});

test('שליטה: ראיה ישנה שוקלת פחות מחדשה', () => {
  const oldGood = computeMastery(QIDS, [att('a', true, 60), att('b', false, 0)], [], NOW);
  const newGood = computeMastery(QIDS, [att('a', false, 60), att('b', true, 0)], [], NOW);
  assert.ok(newGood.accuracy > oldGood.accuracy);
});

test('שליטה: מתעלמת מניסיונות של שאלות משיעור אחר', () => {
  const m = computeMastery(['a'], [att('zzz', true, 0)], [], NOW);
  assert.equal(m.attempts, 0);
});

// ---------- חזרות מרווחות ----------
test('חזרות: כניסה ללוח – למחרת', () => {
  assert.equal(initialReview(NOW).due, startOfDay(NOW) + DAY);
});

test('חזרות: הצלחה מקדמת קופסה, כישלון מחזיר להתחלה', () => {
  let r = initialReview(NOW);
  r = afterReview(r, 100, NOW);
  assert.equal(r.box, 1); assert.equal(r.due, startOfDay(NOW) + INTERVALS[1] * DAY);
  r = afterReview(r, 75, NOW);
  assert.equal(r.box, 2);
  r = afterReview(r, 50, NOW);
  assert.equal(r.box, 0); assert.equal(r.due, startOfDay(NOW) + DAY);
  assert.equal(r.history.length, 3);
  let top = { box: 4, due: 0, history: [] };
  assert.equal(afterReview(top, 100, NOW).box, 4);   // לא עובר את הקופסה האחרונה
});

test('חזרות: מה שהגיע זמנו עד סוף היום, מהמאוחר ביותר', () => {
  const reviews = { x: { box: 0, due: startOfDay(NOW) + DAY }, y: { box: 1, due: startOfDay(NOW) - 2 * DAY }, z: { box: 0, due: startOfDay(NOW) + 3 * 3600e3 } };
  const due = dueReviews(reviews, NOW);
  assert.deepEqual(due.map(d => d.lessonId), ['y', 'z']);
  assert.equal(due[0].overdueDays, 2);
});

test('חזרות: בחירת שאלות מעדיפה שאלות שנכשלו', () => {
  const qs = ['a', 'b', 'c', 'd', 'e', 'f'].map(id => ({ id }));
  const atts = qs.map(q => ({ qid: q.id, ok: true, ts: NOW - DAY })).concat([{ qid: 'e', ok: false, ts: NOW - DAY }]);
  const picked = pickReviewQuestions(qs, atts, NOW, 4);
  assert.equal(picked.length, 4);
  assert.ok(picked.some(q => q.id === 'e'));
});

// ---------- מבחן אבחון ----------
const K = json('knowledge-map.json'), D = json('diagnostic.json');

test('אבחון: מתחיל בשאלת הבדיקה הראשונה', () => {
  const s = startDiagnostic(D);
  assert.equal(nextItem(s, D).skill, D.probes[0]);
});

test('אבחון: טעות מורידה לידע המקדים של אותה מיומנות', () => {
  const s = startDiagnostic(D);
  recordAnswer(s, D, K, 'c-extrema', false);
  const prereqs = K.skills.find(x => x.id === 'c-extrema').prereqs.filter(p => D.items.some(i => i.skill === p));
  assert.ok(prereqs.includes(nextItem(s, D).skill));
});

test('אבחון: תשובה נכונה ממשיכה לשאלת הבדיקה הבאה', () => {
  const s = startDiagnostic(D);
  recordAnswer(s, D, K, D.probes[0], true);
  assert.equal(nextItem(s, D).skill, D.probes[1]);
});

test('אבחון: "לא יודע" נחשב כפער, ולא יורדים יותר משתי רמות', () => {
  const s = startDiagnostic(D);
  recordAnswer(s, D, K, 'c-extrema', false, true);
  assert.equal(s.asked[0].skipped, true);
  // עונים "לא יודע" על הכול – אסור לרדת לעומק 3
  let guard = 0;
  for (let it = nextItem(s, D); it && guard < 100; it = nextItem(s, D), guard++) recordAnswer(s, D, K, it.skill, false, true);
  assert.ok(s.asked.every(a => a.depth <= 2));
  assert.ok(s.asked.length <= D.maxQuestions);
  assert.ok(s.finishedAt);
});

test('אבחון: תוצאות – מיומנות שלא נבדקה אבל תלויה בה הצליחה מסומנת "כנראה"', () => {
  const s = startDiagnostic(D);
  recordAnswer(s, D, K, 'c-extrema', true);
  const r = diagnosticResults(s, K);
  assert.equal(r['c-extrema'], 'mastered');
  assert.equal(r['c-derivative-rules'], 'likely');
  assert.equal(r['f-powers'], 'likely');
  assert.equal(r['z-polar'], 'unknown');
});

test('אבחון: סדר מומלץ – קודם ידע מקדים חסר, אחר כך הליבה', () => {
  const results = { 'c-extrema': 'missing', 'f-quadratic-eq': 'missing', 'c-derivative-rules': 'mastered' };
  const order = recommendedStart(results, K, D.probes);
  assert.deepEqual(order, ['f-quadratic-eq', 'c-extrema']);
});

// ---------- תוכנית שבועית ----------
test('תוכנית: חלוקת השעות בין ימי הלימוד', () => {
  assert.deepEqual(plannedByDay({ hoursPerWeek: 6, sessionDays: [0, 2, 4] }), [120, 0, 120, 0, 120, 0, 0]);
  assert.equal(plannedByDay({ hoursPerWeek: 8, sessionDays: [1, 3] }).reduce((a, b) => a + b), 480);
});

test('תוכנית: דוח שבועי מחשב מתוכנן מול בפועל לפי תאריך מקומי', () => {
  const start = weekStart(NOW);
  const daily = { [dateKey(start)]: 90 * 60, [dateKey(start + 2 * DAY)]: 30 * 60, [dateKey(start - DAY)]: 999 * 60 };
  const w = weekReport({ hoursPerWeek: 6, sessionDays: [0, 2, 4] }, daily, NOW);
  assert.equal(w.actualMin, 120); assert.equal(w.plannedMin, 360); assert.equal(w.pct, 33);
  assert.equal(new Date(w.start).getDay(), 0);
});

test('תוכנית: ביצוע נמוך בשבוע שעבר מוביל להמלצה לצמצם', () => {
  const lastWeek = { start: NOW - 9 * DAY, plannedMin: 420, actualMin: 100, pct: 24 };
  const recs = recommendations({ lastWeek, firstActivity: NOW - 30 * DAY, dueReviews: 2, diagnosticDone: false, nextLesson: { id: 'x', title: 'X' } });
  const kinds = recs.map(r => r.kind);
  assert.deepEqual(kinds, ['diagnostic', 'review', 'reduce', 'lesson']);
});

test('תוכנית: משתמש חדש לא מקבל "למדת 0% בשבוע שעבר"', () => {
  const lastWeek = { start: NOW - 9 * DAY, plannedMin: 420, actualMin: 0, pct: 0 };
  const kinds = recommendations({ lastWeek, firstActivity: NOW - DAY, dueReviews: 0, diagnosticDone: true }).map(r => r.kind);
  assert.ok(!kinds.includes('reduce'));
  assert.ok(!recommendations({ lastWeek, firstActivity: null, diagnosticDone: true }).map(r => r.kind).includes('reduce'));
});

test('תוכנית: ציון נדרש בשאלון השני', () => {
  assert.equal(requiredSecond(80, 80), 80);
  assert.equal(Math.round(requiredSecond(80, 85) * 10) / 10, 72.5);
});

// ---------- המרת תוכן ----------
test('fmt: מבריח HTML, מדגיש **טקסט**, ולא נוגע ב-LaTeX', () => {
  assert.equal(fmt('<b>x</b>'), '&lt;b&gt;x&lt;/b&gt;');
  assert.equal(fmt('זה **חשוב**'), 'זה <b>חשוב</b>');
  assert.equal(fmt('$a**b$ ו-**c**'), '$a**b$ ו-<b>c</b>');
  assert.equal(fmt('$x<2$'), '$x&lt;2$');
});

test('adaptLesson: כל השיעורים ב-JSON מומרים בלי לאבד שאלות', () => {
  for (const f of json('index.json').lessons) {
    const J = json(f), L = adaptLesson(J);
    assert.equal(L.id, J.id);
    assert.equal(L.guided.length, J.guidedPractice.length);
    assert.equal(L.quiz.length, J.quiz.length);
    for (const q of [...L.guided, ...L.practice, ...L.quiz]) {
      if (q.type === 'num') assert.equal(typeof q.answer, 'number');
      else assert.equal(q.options.filter(o => o.ok).length, 1);
    }
  }
});

// ---------- שמירה ומעבר גרסאות ----------
test('migrate: נתונים מגרסה 1 עוברים לגרסה 2 בלי לאבד התקדמות', () => {
  const v1 = {
    version: 1, track: 'common', grades: { q81: 60, q82: 45 }, name: 'אדר',
    lessons: { 'arithmetic-sequence': { sections: { explain: true, quiz: true }, answers: { g1: { tries: 1, correct: true, firstTry: true, hints: 0, revealed: false } },
      quiz: { best: 80, last: 80, history: [{ score: 80, at: NOW - DAY }] }, timeSec: 600, lastVisit: NOW - DAY } },
    mistakes: [], daily: { '2026-11-10': 600 }, lastLesson: 'arithmetic-sequence',
  };
  const s = migrate(v1);
  assert.equal(s.version, 2);
  assert.deepEqual(s.profile.grades, { q1: 60, q2: 45 });
  assert.equal(s.profile.targetGrade, 80);
  assert.equal(s.attempts.length, 1);
  assert.equal(s.attempts[0].ok, true);
  assert.ok(s.reviews['arithmetic-sequence']);
  assert.equal(s.lessons['arithmetic-sequence'].timeSec, 600);
  assert.equal(s.name, 'אדר');
  assert.equal(s.grades, undefined);
});

test('migrate: נתוני גרסה 2 נשמרים כמו שהם, ופרופיל חסר מקבל ברירות מחדל', () => {
  const v2 = { ...empty(), name: 'x', profile: { hoursPerWeek: 8 } };
  const s = migrate(v2);
  assert.equal(s.profile.hoursPerWeek, 8);
  assert.equal(s.profile.targetGrade, 80);
  assert.equal(migrate(null).version, 2);
});
