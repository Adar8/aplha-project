// שמירת התקדמות ב-localStorage, עם ייצוא/ייבוא לגיבוי בין מכשירים.
const KEY = 'math5.progress.v1';

const empty = () => ({
  version: 1,
  name: '',
  track: 'common',          // common | old | new
  lessons: {},              // lessonId -> { sections:{}, answers:{}, quiz:{best,last,history[]}, timeSec, lastVisit }
  mistakes: [],             // { lessonId, qid, tag, at }
  daily: {},                // 'YYYY-MM-DD' -> seconds
  grades: { q81: 58, q82: 43 },
  lastLesson: null,
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch (e) { /* פרטיות / אחסון חסום */ }
  return empty();
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

export const store = {
  get: () => state,
  set(fn) { fn(state); save(); },
  lesson(id) {
    if (!state.lessons[id]) {
      state.lessons[id] = { sections: {}, answers: {}, quiz: { best: null, last: null, history: [] }, timeSec: 0, lastVisit: null };
    }
    return state.lessons[id];
  },
  recordAnswer(lessonId, qid, correct, usedHints, revealed = false) {
    const L = this.lesson(lessonId);
    const a = L.answers[qid] || { tries: 0, correct: false, firstTry: null, hints: 0, revealed: false };
    if (!a.correct) {
      a.tries += 1;
      if (a.firstTry === null) a.firstTry = correct && usedHints === 0;
      if (correct) a.correct = true;
      if (revealed) a.revealed = true;
      a.hints = Math.max(a.hints, usedHints);
    }
    L.answers[qid] = a;
    save();
    return a;
  },
  recordMistake(lessonId, qid, tag) {
    state.mistakes.push({ lessonId, qid, tag: tag || 'general', at: Date.now() });
    if (state.mistakes.length > 500) state.mistakes = state.mistakes.slice(-500);
    save();
  },
  markSection(lessonId, sectionId) {
    this.lesson(lessonId).sections[sectionId] = true; save();
  },
  recordQuiz(lessonId, score, wrongTags) {
    const L = this.lesson(lessonId);
    L.quiz.last = score;
    L.quiz.best = L.quiz.best === null ? score : Math.max(L.quiz.best, score);
    L.quiz.history.push({ score, at: Date.now(), wrongTags });
    L.sections.quiz = true;
    save();
  },
  addTime(lessonId, sec) {
    const L = this.lesson(lessonId);
    L.timeSec += sec;
    L.lastVisit = Date.now();
    const d = new Date(); const k = d.toISOString().slice(0, 10);
    state.daily[k] = (state.daily[k] || 0) + sec;
    state.lastLesson = lessonId;
    save();
  },
  exportJSON: () => JSON.stringify(state, null, 2),
  importJSON(text) {
    const obj = JSON.parse(text);
    if (!obj || obj.version !== 1 || typeof obj.lessons !== 'object') throw new Error('bad file');
    state = { ...empty(), ...obj }; save();
  },
  reset() { state = empty(); save(); },
};

// רמת שליטה 0–100 בשיעור: מבחן מסכם (60%) + דיוק בניסיון ראשון בתרגול (40%), כפול כיסוי.
export function mastery(lesson) {
  const L = state.lessons[lesson.id];
  if (!L) return { score: 0, level: 0 };
  const qs = practiceQuestions(lesson);
  const answered = qs.filter(q => L.answers[q.id]);
  const firstTry = answered.filter(q => L.answers[q.id].firstTry).length;
  const coverage = qs.length ? answered.length / qs.length : 0;
  const practiceAcc = answered.length ? firstTry / answered.length : 0;
  const quiz = L.quiz.best;
  let score;
  if (quiz === null) score = Math.round(practiceAcc * coverage * 50); // בלי מבחן: עד 50
  else score = Math.round(0.6 * quiz + 0.4 * practiceAcc * 100 * coverage);
  const level = score === 0 && !answered.length && quiz === null ? 0 : score < 40 ? 1 : score < 65 ? 2 : score < 85 ? 3 : 4;
  return { score, level };
}

export const LEVELS = ['טרם התחלת', 'בתהליך', 'בסיסי', 'טוב', 'שליטה'];

export function practiceQuestions(lesson) {
  const out = [...lesson.guided, ...lesson.practice];
  lesson.bagrut.forEach(b => out.push(...b.parts));
  return out;
}
