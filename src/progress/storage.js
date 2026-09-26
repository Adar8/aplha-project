// כל הגישה ל-localStorage עוברת כאן. כל גישה עטופה ב-try/catch —
// במצב גלישה פרטית או כשהאחסון חסום, האפליקציה ממשיכה לעבוד בלי שמירה.
const PROGRESS_KEY = 'alphatrader-learn:progress:v1'
const PROFILE_KEY = 'alphatrader-learn:profile:v1'
const PORTFOLIO_KEY = 'alphatrader-learn:portfolio:v1'

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
  // בלי התקדמות לא משאירים מפתח ריק בדפדפן
  saveObject(PROGRESS_KEY, progress && Object.keys(progress).length ? progress : null)
}

/** פרופיל הלמידה (תשובות השאלון, רמה לכל מודול). null = עוד לא מילאו שאלון */
export function loadProfile() {
  return loadObject(PROFILE_KEY)
}

export function saveProfile(profile) {
  saveObject(PROFILE_KEY, profile)
}

/** ״התיק שלי״: עסקאות שהמשתמש הזין ומחירים נוכחיים שהקליד. null = תיק ריק */
export function loadPortfolio() {
  return loadObject(PORTFOLIO_KEY)
}

export function savePortfolio(portfolio) {
  const empty = !portfolio || (!portfolio.transactions?.length && !Object.keys(portfolio.prices ?? {}).length)
  saveObject(PORTFOLIO_KEY, empty ? null : portfolio)
}

const THEME_KEY = 'alphatrader-learn:theme:v1'

/** מצב התצוגה שהמשתמש בחר ('dark'). null = ברירת המחדל הבהירה */
export function loadTheme() {
  try {
    return window.localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : null
  } catch {
    return null
  }
}

export function saveTheme(theme) {
  try {
    if (theme === 'dark') window.localStorage.setItem(THEME_KEY, 'dark')
    else window.localStorage.removeItem(THEME_KEY)
  } catch {
    // אחסון לא זמין — הבחירה תקפה עד רענון הדף
  }
}

const STYLE_KEY = 'alphatrader-learn:style:v1'

/** סגנון תצוגה שנבחר ידנית: 'vivid' | 'calm', או null (לפי הגיל בשאלון) */
export function loadStyle() {
  try {
    const value = window.localStorage.getItem(STYLE_KEY)
    return value === 'vivid' || value === 'calm' ? value : null
  } catch {
    return null
  }
}

export function saveStyle(style) {
  try {
    if (style) window.localStorage.setItem(STYLE_KEY, style)
    else window.localStorage.removeItem(STYLE_KEY)
  } catch {
    // אחסון לא זמין — הבחירה תקפה עד רענון הדף
  }
}
