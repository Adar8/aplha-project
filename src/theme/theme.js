import { useEffect, useState } from 'react'
import { loadStyle, loadTheme, saveStyle, saveTheme } from '../progress/storage.js'

/** מחיל את מצב התצוגה על <html>. נקרא פעם אחת לפני הרינדור הראשון */
export function applyStoredTheme() {
  setThemeAttribute(loadTheme())
}

function setThemeAttribute(theme) {
  const root = document.documentElement
  if (theme === 'dark') root.dataset.theme = 'dark'
  else delete root.dataset.theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b1428' : '#0f1e3d')
}

export function setTheme(theme) {
  saveTheme(theme)
  setThemeAttribute(theme)
}

export function useTheme() {
  const [theme, setState] = useState(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'))
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next === 'dark' ? 'dark' : null)
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
