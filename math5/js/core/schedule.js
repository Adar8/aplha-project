// חזרות מרווחות (שיטת קופסאות): יום, 3 ימים, שבוע, שבועיים, חודש.
import { DAY } from './mastery.js';

export const INTERVALS = [1, 3, 7, 14, 30];
export const PASS = 75; // ציון חזרה שמעביר לקופסה הבאה

export function startOfDay(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }

// שיעור נכנס ללוח החזרות אחרי המבחן הקצר הראשון.
export function initialReview(now) {
  return { box: 0, due: startOfDay(now) + INTERVALS[0] * DAY, history: [] };
}

export function afterReview(rev, score, now) {
  const r = rev ? { ...rev, history: [...(rev.history || [])] } : initialReview(now);
  r.history.push({ ts: now, score });
  r.box = score >= PASS ? Math.min(r.box + 1, INTERVALS.length - 1) : 0;
  r.due = startOfDay(now) + INTERVALS[r.box] * DAY;
  return r;
}

// שיעורים שהחזרה שלהם הגיעה (עד סוף היום), מהמאוחר ביותר.
export function dueReviews(reviews, now) {
  const end = startOfDay(now) + DAY;
  return Object.entries(reviews || {}).filter(([, r]) => r.due < end).sort((a, b) => a[1].due - b[1].due).map(([id, r]) => ({ lessonId: id, ...r, overdueDays: Math.max(0, Math.floor((startOfDay(now) - r.due) / DAY)) }));
}

// בחירת שאלות לחזרה: קודם שאלות שנכשלו, אחר כך שלא נראו הכי הרבה זמן. דטרמיניסטי לפי יום.
export function pickReviewQuestions(questions, attempts, now, n = 4) {
  const last = {}, failed = {};
  for (const a of attempts) {
    last[a.qid] = Math.max(last[a.qid] || 0, a.ts);
    if (!a.ok) failed[a.qid] = (failed[a.qid] || 0) + 1;
  }
  const seed = Math.floor(startOfDay(now) / DAY);
  const jitter = id => { let h = seed; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 9973; return h / 9973; };
  return [...questions]
    .map(q => ({ q, key: (failed[q.id] ? -3 : 0) + (last[q.id] ? (last[q.id] / (now || 1)) : -1) + jitter(q.id) * 0.5 }))
    .sort((a, b) => a.key - b.key).slice(0, n).map(x => x.q);
}
