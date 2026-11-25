// בדיקת "האם האפליקציה באמת עוזרת" – מדדים קשים, בלי תחושות.
// הרצה:  node tools/audit.mjs [--progress קובץ-ייצוא.json] [--json] [--now 2026-11-25]
// בלי --progress נבדק רק המוצר (כיסוי, איכות). עם קובץ ייצוא מהאפליקציה (התקדמות ← ייצוא) נבדקות גם ראיות מהלומד.
import { readFileSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { TOPICS, EXAMS } from '../js/data/curriculum.js';
import { adaptLesson } from '../js/core/adapter.js';
import { computeMastery, LEVELS } from '../js/core/mastery.js';
import { weeksUntil } from '../js/core/plan.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const C = p => JSON.parse(readFileSync(resolve(ROOT, 'learning-content', p), 'utf8'));
const DAY = 864e5;
const DEFAULTS = { targetGrade: 80, hoursPerWeek: 7, examDate: '2027-06-01', grades: { q1: 58, q2: 43 } };
const allQuestions = L => [...L.guided, ...L.practice, ...L.bagrut.flatMap(b => b.parts), ...L.quiz];
const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
// כיסוי לפי נושא (topic) מנופח: שיעור על סדרה חשבונית "מכסה" גם שאלה על סדרה הנדסית. לכן הכיסוי בבחינות נמדד לפי מיומנויות.

export function loadContent() {
  const lessons = C('index.json').lessons.map(f => C(f));
  const tb = C('toolbox.json');
  const toolLessons = (tb.lessons || []).map(f => C(f));
  const exIndex = existsSync(resolve(ROOT, 'learning-content/exams/index.json')) ? C('exams/index.json').exams : [];
  const exams = exIndex.map(id => C(`exams/${id}.json`));
  const skillNames = existsSync(resolve(ROOT, 'learning-content/exam-skills.json')) ? C('exam-skills.json').skills : {};
  return { lessons, toolLessons, toolbox: tb, exams, skillNames };
}

// ---------- 1. המוצר: כיסוי ואיכות ----------
export function productAudit({ lessons, toolLessons, toolbox, exams, skillNames = {} }, profile = DEFAULTS, now = Date.now()) {
  const byTopic = {};
  lessons.forEach(L => (byTopic[L.topic] ||= []).push(L.id));
  const examTopics = TOPICS.filter(t => t.id !== 'short-questions');
  const verified = examTopics.filter(t => ['official', 'official-varies'].includes(t.confidence));
  const track = k => verified.filter(t => (k === 'common' ? t.status === 'common' : k === 'old' ? !!t.old : !!t.new));
  const cov = list => ({ total: list.length, covered: list.filter(t => byTopic[t.id]).length, missing: list.filter(t => !byTopic[t.id]).map(t => t.name) });

  // נקודות בבחינה אמיתית, לפי מיומנויות: כל שאלה דורשת רשימת מיומנויות (skills),
  // וכל שיעור (ראשי או יסוד) מסמן אילו מיומנויות הוא מלמד (covers). כיסוי = החלק מהמיומנויות שנלמד.
  const taught = new Set([...lessons, ...toolLessons].flatMap(L => L.covers || []));
  const examCoverage = exams.map(X => {
    const qs = X.questions.map(q => {
      const need = q.skills || [];
      const have = need.filter(k => taught.has(k));
      const frac = need.length ? have.length / need.length : 0;
      return { n: q.n, points: q.points, topics: q.topicIds, skills: need, missing: need.filter(k => !taught.has(k)), frac,
        full: need.length > 0 && frac === 1, partial: frac > 0 && frac < 1 };
    });
    const tot = qs.reduce((s, q) => s + q.points, 0);
    return {
      id: X.id, code: X.code, session: X.session, format: X.format,
      skillsPct: pct(qs.reduce((s, q) => s + q.points * q.frac, 0), tot),
      fullPct: pct(qs.filter(q => q.full).reduce((s, q) => s + q.points, 0), tot),
      partialPct: pct(qs.filter(q => q.partial).reduce((s, q) => s + q.points, 0), tot),
      uncovered: qs.filter(q => q.frac === 0).map(q => q.n),
      questions: qs,
      parts: X.questions.reduce((s, q) => s + q.parts.length, 0),
      autoChecked: X.questions.flatMap(q => q.parts).filter(p => p.answer).length,
    };
  });

  const adapted = lessons.map(adaptLesson);
  const lessonInfo = lessons.map((L, i) => ({
    id: L.id, title: L.title, topic: L.topic, minutes: L.estimatedMinutes,
    questions: allQuestions(adapted[i]).length,
    officialQuestions: (L.bagrutQuestions || []).filter(b => b.source?.type === 'official').length,
    review: L.review?.status || 'unknown', humanChecked: (L.review?.mathCheckedBy || []).length > 0,
  }));
  const weeks = weeksUntil(profile.examDate, now);
  const tbTopics = toolbox.tools.flatMap(t => t.topics);
  return {
    weeksLeft: weeks,
    hoursAvailable: weeks * profile.hoursPerWeek,
    lessons: lessonInfo,
    contentHours: Math.round((lessons.reduce((s, L) => s + (L.estimatedMinutes || 0), 0) + toolLessons.reduce((s, L) => s + (L.estimatedMinutes || 0), 0)) / 6) / 10,
    coverage: { common: cov(track('common')), old: cov(track('old')), new: cov(track('new')) },
    unverifiedTopics: examTopics.filter(t => !['official', 'official-varies'].includes(t.confidence)).map(t => t.name),
    examCoverage,
    weights: { q1: EXAMS.old.papers[0].weight, q2: EXAMS.old.papers[1].weight },
    toolbox: { lessons: toolLessons.length, topics: tbTopics.length, topicsWithLesson: tbTopics.filter(t => t.lesson).length },
    humanReviewed: lessonInfo.filter(l => l.humanChecked).length,
    skillNames,
  };
}

// ---------- 2. הלומד: ראיות משימוש ----------
export function learnerAudit(S, content, now = Date.now()) {
  if (!S) return null;
  const profile = { ...DEFAULTS, ...(S.profile || {}) };
  const days = Object.entries(S.daily || {});
  const sec = (from, to) => days.filter(([k]) => { const t = new Date(k + 'T12:00').getTime(); return t >= from && t < to; }).reduce((s, [, v]) => s + v, 0);
  const weeks = [0, 1, 2, 3].map(w => Math.round(sec(now - (w + 1) * 7 * DAY, now - w * 7 * DAY) / 360) / 10);
  const atts = (S.attempts || []).filter(a => !a.migrated);
  const half = Math.floor(atts.length / 2);
  const acc = list => (list.length ? pct(list.filter(a => a.ok && !a.revealed && !(a.hints > 0)).length, list.length) : null);

  const lessons = content.lessons.map(J => {
    const L = adaptLesson(J), st = (S.lessons || {})[J.id];
    const m = computeMastery(allQuestions(L).map(q => q.id), (S.attempts || []).filter(a => a.lessonId === J.id), st?.quiz?.history || [], now);
    const h = st?.quiz?.history || [];
    return { id: J.id, title: J.title, level: m.level, levelName: LEVELS[m.level] || String(m.level), score: m.score, delayed: m.delayed,
      quizFirst: h[0]?.score ?? null, quizLast: h.at(-1)?.score ?? null, quizzes: h.length };
  });
  const reviews = Object.entries(S.reviews || {}).map(([id, r]) => ({ id, done: (r.history || []).length, last: r.history?.at(-1)?.score ?? null, overdue: r.due && r.due < now }));
  const retention = Object.values(S.reviews || {}).flatMap(r => r.history || []).map(h => h.score);
  const exams = content.exams.map(X => {
    const P = (S.exams || {})[X.id]?.parts || {};
    const v = Object.values(P);
    return { id: X.id, attempted: v.filter(p => p.status).length, correct: v.filter(p => p.status === 'ok' || p.status === 'self-ok').length,
      autoOk: v.filter(p => p.status === 'ok').length, needWork: v.filter(p => p.status === 'wrong' || p.status === 'review').length,
      total: X.questions.reduce((s, q) => s + q.parts.length, 0) };
  });

  // רמת הראיה: 0 אין נתונים · 1 יש שימוש · 2 שיפור בתוך האפליקציה · 3 הצלחה בשאלות בגרות אמיתיות
  const usedHours = Math.round(days.reduce((s, [, v]) => s + v, 0) / 360) / 10;
  const improved = lessons.some(l => l.quizzes >= 2 && l.quizLast > l.quizFirst) || retention.some(s => s >= 75) || (half >= 10 && acc(atts.slice(half)) > acc(atts.slice(0, half)));
  const examOk = exams.reduce((s, e) => s + e.autoOk, 0);
  const level = examOk >= 5 ? 3 : improved ? 2 : usedHours >= 1 || atts.length >= 10 ? 1 : 0;
  return {
    profile: { target: profile.targetGrade, hoursPerWeek: profile.hoursPerWeek, pastGrades: profile.grades, format: profile.format },
    activeDays: days.filter(([, v]) => v >= 60).length,
    activeDaysLast28: days.filter(([k, v]) => v >= 60 && new Date(k + 'T12:00').getTime() >= now - 28 * DAY).length,
    totalHours: usedHours,
    hoursLast4Weeks: weeks,
    planAdherence: pct(weeks.reduce((a, b) => a + b, 0), 4 * profile.hoursPerWeek),
    attempts: atts.length,
    accuracyFirstHalf: half >= 10 ? acc(atts.slice(0, half)) : null,
    accuracySecondHalf: half >= 10 ? acc(atts.slice(half)) : null,
    lessons, reviews, retentionAvg: retention.length ? Math.round(retention.reduce((a, b) => a + b, 0) / retention.length) : null,
    exams, diagnosticDone: !!S.diagnostic?.finishedAt, baseCheckDone: !!S.baseCheck?.finishedAt,
    mistakes: (S.mistakes || []).length,
    evidenceLevel: level,
  };
}

const LEVEL_TEXT = ['אין נתוני שימוש – אי אפשר לדעת אם האפליקציה עוזרת', 'יש שימוש, אבל עוד אין סימן לשיפור', 'יש שיפור בתוך האפליקציה (מבחנים, חזרות או דיוק)', 'יש הצלחה בשאלות בגרות רשמיות'];

export function formatReport(P, L) {
  const o = [];
  const line = s => o.push(s);
  line('# בדיקת MATH 5 – מדדים');
  line(`\n## המוצר`);
  line(`- זמן עד הבחינה: ${P.weeksLeft} שבועות ≈ ${P.hoursAvailable} שעות לימוד לפי התוכנית.`);
  line(`- תוכן קיים: ${P.lessons.length} שיעורים ראשיים + ${P.toolbox.lessons} שיעורי יסוד ≈ ${P.contentHours} שעות.`);
  for (const [k, n] of [['common', 'נושאים משותפים (מאומתים)'], ['old', 'מתכונת ישנה'], ['new', 'מתכונת חדשה']]) {
    const c = P.coverage[k];
    line(`- ${n}: ${c.covered}/${c.total} נושאים עם שיעור (${pct(c.covered, c.total)}%).`);
  }
  line(`- חסרים שיעורים (נושאים משותפים): ${P.coverage.common.missing.join(' · ') || 'אין'}.`);
  for (const e of P.examCoverage) {
    line(`- שאלון ${e.code} ${e.session}: האפליקציה מלמדת ${e.skillsPct}% מהמיומנויות שהשאלון דורש (משוקלל בנקודות). שאלות שכל המיומנויות שלהן נלמדות: ${e.fullPct}% מהנקודות. שאלות בלי אף מיומנות שנלמדת: ${e.uncovered.join(', ') || 'אין'}.`);
    e.questions.forEach(q => line(`  - שאלה ${q.n} (${q.points} נק׳): ${Math.round(q.frac * 100)}% מהמיומנויות. חסר: ${q.missing.map(k => (P.skillNames || {})[k] || k).join(' · ') || '—'}`));
  }
  line(`- בדיקת אדם (מורה/מומחה) לשיעורים: ${P.humanReviewed}/${P.lessons.length}. בדיקה ממוחשבת של תשובות: בכל קובצי התוכן (npm test).`);
  if (P.unverifiedTopics.length) line(`- נושאים שלא אומת אם הם בבחינה: ${P.unverifiedTopics.join(' · ')}.`);
  line(`\n## הלומד`);
  if (!L) { line('- לא סופק קובץ התקדמות. (באפליקציה: התקדמות ← ייצוא, ואז --progress <קובץ>)'); line(`- רמת ראיה: 0 – ${LEVEL_TEXT[0]}.`); return o.join('\n'); }
  line(`- ימים פעילים: ${L.activeDays} (ב-28 הימים האחרונים: ${L.activeDaysLast28}). סה"כ ${L.totalHours} שעות.`);
  line(`- שעות ב-4 השבועות האחרונים (מהחדש לישן): ${L.hoursLast4Weeks.join(' · ')} מתוך ${L.profile.hoursPerWeek} בשבוע → עמידה בתוכנית ${L.planAdherence}%.`);
  line(`- ניסיונות תרגול: ${L.attempts}${L.accuracyFirstHalf !== null ? `, דיוק בלי עזרה: ${L.accuracyFirstHalf}% בחצי הראשון → ${L.accuracySecondHalf}% בחצי השני` : ''}.`);
  L.lessons.forEach(l => line(`- ${l.title}: שליטה ${l.levelName} (${l.score}), מבחנים ${l.quizzes}${l.quizzes ? `, ראשון ${l.quizFirst} → אחרון ${l.quizLast}` : ''}${l.delayed ? ', הצלחה גם אחרי כמה ימים' : ''}.`));
  line(`- חזרות מרווחות: ${L.reviews.reduce((s, r) => s + r.done, 0)} בוצעו, ממוצע ${L.retentionAvg ?? '—'}, באיחור: ${L.reviews.filter(r => r.overdue).length}.`);
  L.exams.forEach(e => line(`- שאלון ${e.id}: ${e.correct}/${e.total} סעיפים נפתרו (${e.autoOk} נבדקו אוטומטית כנכונים), ${e.needWork} לחזור עליהם.`));
  line(`- אבחון: ${L.diagnosticDone ? 'בוצע' : 'לא בוצע'}. בדיקת בסיס: ${L.baseCheckDone ? 'בוצעה' : 'לא בוצעה'}. טעויות במחברת: ${L.mistakes}.`);
  line(`- רמת ראיה: ${L.evidenceLevel} – ${LEVEL_TEXT[L.evidenceLevel]}.`);
  return o.join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), get = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  const now = get('--now') ? new Date(get('--now')).getTime() : Date.now();
  const S = get('--progress') ? JSON.parse(readFileSync(resolve(get('--progress')), 'utf8')) : null;
  const content = loadContent();
  const P = productAudit(content, { ...DEFAULTS, ...(S?.profile || {}) }, now);
  const L = learnerAudit(S, content, now);
  console.log(a.includes('--json') ? JSON.stringify({ product: P, learner: L }, null, 2) : formatReport(P, L));
}
