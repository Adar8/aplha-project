// שמירת התקדמות ב-localStorage (גרסה 2), עם מעבר אוטומטי מגרסה 1, ייצוא וייבוא.
import { computeMastery, LEVELS as MASTERY_LEVELS } from './core/mastery.js';
import { initialReview, afterReview } from './core/schedule.js';
import { dateKey } from './core/plan.js';

export const KEY = 'math5.progress.v1';   // אותו מפתח – הנתונים עצמם נושאים מספר גרסה
export const VERSION = 2;

export const DEFAULT_PROFILE = {
  targetGrade: 80,
  hoursPerWeek: 7,
  sessionDays: [0, 2, 4],          // ראשון, שלישי, חמישי
  examDate: '2027-06-01',          // הערכה: מועד קיץ. לעדכן כשיפורסם לוח הבחינות
  format: 'undecided',             // undecided | old | new
  grades: { q1: 58, q2: 43 },      // ציוני עבר: 581, 582
};

export const empty = () => ({
  version: VERSION,
  name: '',
  track: 'common',
  profile: JSON.parse(JSON.stringify(DEFAULT_PROFILE)),
  lessons: {},      // lessonId -> { sections:{}, answers:{}, quiz:{best,last,history[]}, timeSec, lastVisit }
  attempts: [],     // { id, lessonId, qid, ok, hints, revealed, ctx: practice|quiz|review|diagnostic, ts }
  reviews: {},      // lessonId -> { box, due, history:[{ts,score}] }
  mistakes: [],     // { lessonId, qid, tag, at }
  daily: {},        // 'YYYY-MM-DD' (שעון מקומי) -> שניות
  diagnostic: null, // { state, results, finishedAt }
  lastLesson: null,
});

// מעבר מגרסה 1: ציונים לפרופיל, תשובות קיימות לרשומות ניסיון, מבחנים קודמים ללוח החזרות.
export function migrate(raw) {
  if (!raw || typeof raw !== 'object') return empty();
  if (raw.version === VERSION) return { ...empty(), ...raw, profile: { ...DEFAULT_PROFILE, ...(raw.profile || {}) } };
  const s = { ...empty(), ...raw, version: VERSION };
  s.profile = JSON.parse(JSON.stringify(DEFAULT_PROFILE));
  if (raw.grades) s.profile.grades = { q1: raw.grades.q81 ?? 58, q2: raw.grades.q82 ?? 43 };
  delete s.grades;
  s.attempts = [];
  for (const [lid, L] of Object.entries(raw.lessons || {})) {
    const ts = L.lastVisit || Date.now();
    for (const [qid, a] of Object.entries(L.answers || {})) {
      s.attempts.push({ id: `m-${lid}-${qid}`, lessonId: lid, qid, ok: !!a.correct,
        hints: a.hints || 0, revealed: !!a.revealed, ctx: 'practice', ts, migrated: true });
    }
    const h = L.quiz?.history || [];
    if (h.length) s.reviews[lid] = initialReview(h[h.length - 1].at || ts);
  }
  return s;
}

let state = load();

// אם האפליקציה פתוחה בשתי לשוניות – כשלשונית אחת שומרת, השנייה טוענת מחדש במקום לדרוס.
const listeners = new Set();
export const onExternalChange = fn => listeners.add(fn);
try {
  addEventListener('storage', e => {
    if (e.key !== KEY || !e.newValue) return;
    try { state = migrate(JSON.parse(e.newValue)); listeners.forEach(fn => fn()); } catch (err) { /* ignore */ }
  });
} catch (e) { /* לא בדפדפן */ }

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch (e) { /* אחסון חסום או פגום */ }
  return empty();
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const store = {
  get: () => state,
  set(fn) { fn(state); save(); },
  lesson(id) {
    if (!state.lessons[id]) {
      state.lessons[id] = { sections: {}, answers: {}, quiz: { best: null, last: null, history: [] }, timeSec: 0, lastVisit: null };
    }
    return state.lessons[id];
  },
  // כל ניסיון נרשם ביומן הניסיונות. answers נשאר לסימון "נפתר" בממשק.
  recordAttempt(lessonId, qid, { ok, hints = 0, revealed = false, ctx = 'practice', ts = Date.now() }) {
    state.attempts.push({ id: uid(), lessonId, qid, ok: !!ok, hints, revealed: !!revealed, ctx, ts });
    if (state.attempts.length > 5000) state.attempts = state.attempts.slice(-5000);
    if (ctx === 'practice') {
      const L = this.lesson(lessonId);
      const a = L.answers[qid] || { tries: 0, correct: false, firstTry: null, hints: 0, revealed: false };
      if (!a.correct) {
        a.tries += 1;
        if (a.firstTry === null) a.firstTry = !!ok && hints === 0 && !revealed;
        if (ok) a.correct = true;
        if (revealed) a.revealed = true;
        a.hints = Math.max(a.hints, hints);
      }
      L.answers[qid] = a;
    }
    save();
  },
  recordMistake(lessonId, qid, tag) {
    state.mistakes.push({ lessonId, qid, tag: tag || 'general', at: Date.now() });
    if (state.mistakes.length > 500) state.mistakes = state.mistakes.slice(-500);
    save();
  },
  markSection(lessonId, sectionId) { this.lesson(lessonId).sections[sectionId] = true; save(); },
  recordQuiz(lessonId, score, wrongTags, now = Date.now()) {
    const L = this.lesson(lessonId);
    L.quiz.last = score;
    L.quiz.best = L.quiz.best === null ? score : Math.max(L.quiz.best, score);
    L.quiz.history.push({ score, at: now, wrongTags });
    L.sections.quiz = true;
    if (!state.reviews[lessonId]) state.reviews[lessonId] = initialReview(now);
    save();
  },
  recordReview(lessonId, score, now = Date.now()) {
    state.reviews[lessonId] = afterReview(state.reviews[lessonId], score, now);
    save();
    return state.reviews[lessonId];
  },
  addTime(lessonId, sec, now = Date.now()) {
    const k = dateKey(now);
    state.daily[k] = (state.daily[k] || 0) + sec;
    if (lessonId) {
      const L = this.lesson(lessonId);
      L.timeSec += sec; L.lastVisit = now;
      state.lastLesson = lessonId;
    }
    save();
  },
  setDiagnostic(d) { state.diagnostic = d; save(); },
  exportJSON: () => JSON.stringify(state, null, 2),
  importJSON(text) {
    const obj = JSON.parse(text);
    if (!obj || typeof obj.lessons !== 'object' || ![1, 2].includes(obj.version)) throw new Error('bad file');
    state = migrate(obj); save();
  },
  reset() { state = empty(); save(); },
  _replace(s) { state = migrate(s); save(); },  // לבדיקות
};

export const LEVELS = MASTERY_LEVELS;

export function practiceQuestions(lesson) {
  const out = [...lesson.guided, ...lesson.practice];
  lesson.bagrut.forEach(b => out.push(...b.parts));
  return out;
}
export function allQuestions(lesson) { return [...practiceQuestions(lesson), ...lesson.quiz]; }

export function mastery(lesson, now = Date.now()) {
  const atts = state.attempts.filter(a => a.lessonId === lesson.id);
  const L = state.lessons[lesson.id];
  return computeMastery(allQuestions(lesson).map(q => q.id), atts, L ? L.quiz.history : [], now);
}
