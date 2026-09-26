import { useLessonLevel } from './ProfileContext.js'

// שכבות תוכן לפי רמה. שתי השכבות תמיד קיימות בעמוד:
// השכבה שמתאימה לרמה שנבחרה פתוחה, והשנייה מקופלת — אפשר לפתוח אותה בלחיצה.
const COPY = {
  basic: { open: 'במילים פשוטות', closed: 'לא ברור? הסבר פשוט יותר' },
  deep: { open: 'להעמקה', closed: 'רוצים להעמיק?' },
}

function Layer({ kind, title, children }) {
  const level = useLessonLevel()
  const isOpen = level === kind
  const label = title ?? (isOpen ? COPY[kind].open : COPY[kind].closed)
  return (
    // key מאפס את מצב הפתיחה כשמחליפים רמה
    <details key={level} className={`depth depth--${kind}`} open={isOpen}>
      <summary className="depth__summary">{label}</summary>
      <div className="depth__body">{children}</div>
    </details>
  )
}

/** הסבר פשוט: פתוח ברמה בסיסית, מקופל ברמה מעמיקה */
export function Simple({ title, children }) {
  return (
    <Layer kind="basic" title={title}>
      {children}
    </Layer>
  )
}

/** העמקה: פתוחה ברמה מעמיקה, מקופלת ברמה בסיסית */
export function Deep({ title, children }) {
  return (
    <Layer kind="deep" title={title}>
      {children}
    </Layer>
  )
}
