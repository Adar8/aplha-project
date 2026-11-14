// טעינת שיעורים מ-learning-content/index.json. מערכים חיים: מתמלאים ב-loadLessons().
import { adaptLesson } from '../../core/adapter.js';

export const LESSONS = [];
export const LESSON_BY_ID = {};
export const LOAD_ERRORS = [];
export const TOOL_LESSONS = [];       // שיעורי יסוד בארגז הכלים (לא חלק מתוכנית הבגרות)
export const TOOLBOX = { tools: [], lessonPrereqs: {}, plannedLessons: {}, aids: [], baseCheck: { probes: [], maxQuestions: 12 } };

export async function loadToolbox(fetchJson = defaultFetch, base = 'learning-content/') {
  const tb = await fetchJson(base + 'toolbox.json');
  Object.assign(TOOLBOX, tb);
  TOOL_LESSONS.length = 0;
  const results = await Promise.allSettled(tb.lessons.map(f => fetchJson(base + f)));
  results.forEach((r, i) => {
    if (r.status !== 'fulfilled') { LOAD_ERRORS.push({ file: tb.lessons[i], error: String(r.reason) }); return; }
    try { const L = adaptLesson(r.value); TOOL_LESSONS.push(L); LESSON_BY_ID[L.id] = L; }
    catch (e) { LOAD_ERRORS.push({ file: tb.lessons[i], error: e.message }); }
  });
  return TOOLBOX;
}

// fetchJson מוזרק כדי שאפשר יהיה לטעון גם מ-Node בבדיקות.
export async function loadLessons(fetchJson = defaultFetch, base = 'learning-content/') {
  LESSONS.length = 0; LOAD_ERRORS.length = 0;
  for (const k of Object.keys(LESSON_BY_ID)) delete LESSON_BY_ID[k];
  const manifest = await fetchJson(base + 'index.json');
  const results = await Promise.allSettled(manifest.lessons.map(f => fetchJson(base + f)));
  results.forEach((r, i) => {
    if (r.status !== 'fulfilled') { LOAD_ERRORS.push({ file: manifest.lessons[i], error: String(r.reason) }); return; }
    try { const L = adaptLesson(r.value); LESSONS.push(L); LESSON_BY_ID[L.id] = L; }
    catch (e) { LOAD_ERRORS.push({ file: manifest.lessons[i], error: e.message }); }
  });
  return LESSONS;
}

async function defaultFetch(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}
