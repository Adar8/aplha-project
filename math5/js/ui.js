// רכיבי ממשק ועזרים משותפים לכל המסכים.
import { store, mastery } from './store.js';
import { LESSONS } from './data/lessons/index.js';
import { weekStart, dateKey } from './core/plan.js';
export { esc, fmt } from './core/text.js';

export const SECTIONS = [
  { id: 'explain', label: 'הסבר' },
  { id: 'video', label: 'סרטון' },
  { id: 'examples', label: 'דוגמאות פתורות' },
  { id: 'guided', label: 'תרגול מודרך' },
  { id: 'practice', label: 'תרגול עצמאי' },
  { id: 'bagrut', label: 'ברמת בגרות' },
  { id: 'quiz', label: 'מבחן קצר' },
  { id: 'review', label: 'ניתוח והמשך' },
];

export const SOURCE_LABEL = {
  official: 'שאלה רשמית מבגרות',
  adapted: 'עובד משאלה רשמית',
  original: 'שאלה מקורית לתרגול',
};

// ---------- עזרים ----------
export function renderMath(el) {
  if (window.renderMathInElement) {
    window.renderMathInElement(el, {
      delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
      throwOnError: false,
    });
  }
}

export function fmtTime(sec) {
  if (!sec) return '0 דק׳';
  const h = Math.floor(sec / 3600), mnt = Math.round((sec % 3600) / 60);
  return h ? `${h} שע׳ ${mnt} דק׳` : `${mnt} דק׳`;
}

// שניות למידה מתחילת השבוע (יום ראשון)
export function weekSeconds(now = Date.now()) {
  const d = store.get().daily; let s = 0;
  const start = weekStart(now);
  for (let i = 0; i < 7; i++) s += d[dateKey(start + i * 864e5)] || 0;
  return s;
}
export const todaySeconds = (now = Date.now()) => store.get().daily[dateKey(now)] || 0;

export function meter(score, level) {
  return `<div class="meter lvl-${level}" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${score}" aria-label="רמת שליטה">
    <span style="inline-size:${score}%"></span></div>`;
}

export function lessonState(lesson) {
  const L = store.get().lessons[lesson.id];
  const done = L ? SECTIONS.filter(s => L.sections[s.id]).length : 0;
  return { done, total: SECTIONS.length, ...mastery(lesson) };
}

export function recommend() {
  // השיעור עם השליטה הנמוכה ביותר שכבר התחלת, ואם אין – השיעור הבא שלא התחלת.
  const rows = LESSONS.map(l => ({ l, ...lessonState(l) }));
  const started = rows.filter(r => r.done > 0 && r.score < 85).sort((a, b) => a.score - b.score);
  if (started.length) return { lesson: started[0].l, why: `רמת השליטה כאן ${started[0].score} מתוך 100. כדאי לחזק לפני שממשיכים.` };
  const fresh = rows.find(r => r.done === 0);
  if (fresh) return { lesson: fresh.l, why: 'השיעור הבא בתוכנית. נושא משותף לשתי המתכונות.' };
  return { lesson: rows.sort((a, b) => a.score - b.score)[0].l, why: 'סיימת את כל השיעורים הקיימים. כדאי לחזור על החלש מביניהם עד ששיעורים נוספים יעלו.' };
}


export function ring(pct, size = 132, label = '') {
  const r = (size - 14) / 2, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${label} ${pct}%">
    <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--teal)"/><stop offset="1" stop-color="var(--blue)"/></linearGradient></defs>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
  </svg>`;
}


export const ICON = {
  play: '<svg viewBox="0 0 24 24" class="i"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/></svg>',
  lock: '<svg viewBox="0 0 24 24" class="i"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  check: '<svg viewBox="0 0 24 24" class="i"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  resume: '<svg viewBox="0 0 24 24" class="i"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/></svg>',
  target: '<svg viewBox="0 0 24 24" class="i"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8" fill="currentColor"/></svg>',
  flag: '<svg viewBox="0 0 24 24" class="i"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  layers: '<svg viewBox="0 0 24 24" class="i"><path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/></svg>',
  user: '<svg viewBox="0 0 24 24" class="i"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  mic: '<svg viewBox="0 0 24 24" class="i"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  wave: '<svg viewBox="0 0 24 24" class="i"><path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" class="i"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  compass: '<svg viewBox="0 0 24 24" class="i"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" class="i"><path d="M4 11V9a3 3 0 0 1 3-3h12M16 3l3 3-3 3M20 13v2a3 3 0 0 1-3 3H5M8 21l-3-3 3-3"/></svg>',
  map: '<svg viewBox="0 0 24 24" class="i"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="9" cy="18" r="2.5"/><path d="M8.3 7.2l7.3 1M7 8.4l1.5 7.2M16.4 10l-5.7 6.3"/></svg>',
  settings: '<svg viewBox="0 0 24 24" class="i"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
};
