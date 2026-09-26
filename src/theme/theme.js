import { useEffect, useState } from 'react'
import { loadStyle, loadTheme, saveStyle, saveTheme } from '../progress/storage.js'

/** מחיל את מצב התצוגה על <html>. נקרא פעם אחת לפני הרינדור הראשון */
export function applyStoredTheme() {
  setThemeAttribute(loadTheme())
}

function setThemeAttribute(theme) {
  const root = document.documentElement
  if (theme === 'light') root.dataset.theme = 'light'
  else delete root.dataset.theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#eef2f7' : '#131b2c')
}

export function setTheme(theme) {
  saveTheme(theme)
  setThemeAttribute(theme)
}

export function useTheme() {
  // ברירת המחדל כהה; הבחירה היחידה שנשמרת היא ״בהיר״
  const [theme, setState] = useState(() => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'))
  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next === 'light' ? 'light' : null)
    setState(next)
  }
  return { theme, toggle }
}

/**
 * סגנון תצוגה: ״תוסס״ (צבעים ותנועה) או ״רגוע״ (טקסט גדול יותר, בלי תנועה).
 * בלי בחירה ידנית: רגוע לגילאי 50 ומעלה לפי השאלון, תוסס לכל השאר. תמיד אפשר להחליף.
 */
export function defaultStyle(answers) {
  return answers?.age === '50+' ? 'calm' : 'vivid'
}

export function useDisplayStyle(answers) {
  const [chosen, setChosen] = useState(loadStyle)
  const style = chosen ?? defaultStyle(answers)

  useEffect(() => {
    document.documentElement.dataset.style = style
  }, [style])

  const setStyle = (next) => {
    const value = next === defaultStyle(answers) ? null : next
    saveStyle(value)
    setChosen(value)
  }
  return { style, setStyle }
}

/** מחיקת הבחירות של התצוגה (מכפתור ״מחיקת הנתונים שלי״) */
export function resetDisplay() {
  setTheme(null)
  saveStyle(null)
  delete document.documentElement.dataset.style
}
