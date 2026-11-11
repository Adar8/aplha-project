// תוכנית שבועית ומעקב ביצוע – לוגיקה טהורה.
import { DAY } from './mastery.js';

export const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export function weekStart(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - d.getDay()); return d.getTime(); }
export const dateKey = ts => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

// דקות מתוכננות לכל יום בשבוע: מחלקים את השעות השבועיות שווה בשווה בין ימי הלימוד שנבחרו.
export function plannedByDay(profile) {
  const days = profile.sessionDays?.length ? profile.sessionDays : [0, 2, 4];
  const total = Math.round((profile.hoursPerWeek || 7) * 60);
  const per = Math.round(total / days.length);
  return Array.from({ length: 7 }, (_, i) => (days.includes(i) ? per : 0));
}

// daily: { 'YYYY-MM-DD': seconds }
export function weekReport(profile, daily, now, offsetWeeks = 0) {
  const start = weekStart(now) - offsetWeeks * 7 * DAY;
  const planned = plannedByDay(profile);
  const days = planned.map((p, i) => {
    const ts = start + i * DAY;
    return { day: i, name: DAY_NAMES[i], date: dateKey(ts), plannedMin: p, actualMin: Math.round((daily[dateKey(ts)] || 0) / 60), future: ts > now };
  });
  const plannedMin = planned.reduce((a, b) => a + b, 0);
  const actualMin = days.reduce((a, d) => a + d.actualMin, 0);
  const elapsedPlanned = days.filter(d => !d.future).reduce((a, d) => a + d.plannedMin, 0);
  return { start, days, plannedMin, actualMin, elapsedPlanned, pct: plannedMin ? Math.round(100 * actualMin / plannedMin) : 0 };
}

export function weeksUntil(examDate, now) {
  const t = new Date(examDate).getTime();
  return Number.isFinite(t) ? Math.max(0, Math.ceil((t - now) / (7 * DAY))) : null;
}

// ציון משוקלל נדרש: כמה צריך בשאלון השני אם בראשון מקבלים x
export function requiredSecond(target, first, w1 = 0.6) { return (target - w1 * first) / (1 - w1); }

/**
 * המלצות לשבוע. כל המלצה: { kind, text, href? }
 * ctx: { lastWeek, thisWeek, firstActivity, dueReviews, diagnosticDone, nextLesson, weeksLeft, lessonsAvailable, lessonsMastered }
 */
export function recommendations(ctx) {
  const out = [];
  if (!ctx.diagnosticDone) out.push({ kind: 'diagnostic', text: 'עוד לא עשית את מבחן האבחון. הוא קובע מאיפה כדאי להתחיל (כ-45 דקות).', href: '#/diagnostic' });
  if (ctx.dueReviews > 0) out.push({ kind: 'review', text: `${ctx.dueReviews === 1 ? 'יש חזרה אחת' : `יש ${ctx.dueReviews} חזרות`} שהגיע זמנן. חזרות קודמות לחומר חדש.`, href: '#/review' });
  // מעריכים את השבוע שעבר רק אם האפליקציה כבר הייתה בשימוש בתחילתו – אחרת "0%" מטעה.
  const lastWeekCounts = ctx.lastWeek && ctx.firstActivity && ctx.firstActivity <= ctx.lastWeek.start;
  if (lastWeekCounts && ctx.lastWeek.plannedMin && ctx.lastWeek.pct < 60) {
    out.push({ kind: 'reduce', text: `בשבוע שעבר למדת ${ctx.lastWeek.actualMin} דקות מתוך ${ctx.lastWeek.plannedMin} (${ctx.lastWeek.pct}%). השבוע כדאי שיעור חדש אחד בלבד, והשאר חזרות ותרגול.` });
  } else if (lastWeekCounts && ctx.lastWeek.pct >= 100) {
    out.push({ kind: 'good', text: `בשבוע שעבר עמדת ביעד (${ctx.lastWeek.pct}%). אפשר להוסיף השבוע שאלת בגרות מלאה.` });
  }
  if (ctx.nextLesson) out.push({ kind: 'lesson', text: `השיעור הבא בתור: ${ctx.nextLesson.title}.`, href: `#/lesson/${ctx.nextLesson.id}` });
  if (ctx.weeksLeft !== null && ctx.weeksLeft !== undefined && ctx.lessonsAvailable !== undefined && ctx.lessonsMastered === ctx.lessonsAvailable && ctx.lessonsAvailable > 0) {
    out.push({ kind: 'content', text: 'סיימת את כל השיעורים שקיימים כרגע. שיעורים נוספים בהכנה; בינתיים כדאי לתרגל שאלות משאלוני בגרות רשמיים.' });
  }
  return out;
}

// הרגע הראשון שבו היה שימוש באפליקציה (ניסיון ראשון או יום הלימוד הראשון)
export function firstActivity(state) {
  const ts = (state.attempts || []).map(a => a.ts);
  for (const k of Object.keys(state.daily || {})) { const [y, m, d] = k.split('-').map(Number); ts.push(new Date(y, m - 1, d).getTime()); }
  return ts.length ? Math.min(...ts) : null;
}
