// כל הגישה ל-localStorage עוברת כאן. כל גישה עטופה ב-try/catch —
// במצב גלישה פרטית או כשהאחסון חסום, האפליקציה ממשיכה לעבוד בלי שמירה.
const PROGRESS_KEY = 'alphatrader-learn:progress:v1'
const PROFILE_KEY = 'alphatrader-learn:profile:v1'

function loadObject(key) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function saveObject(key, value) {
  try {
    if (value == null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // אחסון לא זמין — הנתונים נשמרים רק בזיכרון עד רענון הדף
  }
}

/** @returns {Record<string, { completedAt: string }>} */
export function loadProgress() {
  return loadObject(PROGRESS_KEY) ?? {}
}

export function saveProgress(progress) {
  saveObject(PROGRESS_KEY, progress)
}

/** פרופיל הלמידה (תשובות השאלון, רמה לכל מודול). null = עוד לא מילאו שאלון */
export function loadProfile() {
  return loadObject(PROFILE_KEY)
}

export function saveProfile(profile) {
  saveObject(PROFILE_KEY, profile)
}
