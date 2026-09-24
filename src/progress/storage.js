// שמירת התקדמות ב-localStorage. כל גישה עטופה ב-try/catch —
// במצב גלישה פרטית או כשהאחסון חסום, האפליקציה ממשיכה לעבוד בלי שמירה.
const STORAGE_KEY = 'alphatrader-learn:progress:v1'

/** @returns {Record<string, { completedAt: string }>} */
export function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function saveProgress(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // אחסון לא זמין — ההתקדמות נשמרת רק בזיכרון עד רענון הדף
  }
}
