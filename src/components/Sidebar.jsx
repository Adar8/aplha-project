import { useEffect, useId, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { modules } from '../data/modules.js'
import { useProgress } from '../progress/ProgressContext.js'
import { useProfile } from '../profile/ProfileContext.js'
import { useDisplayStyle, useTheme } from '../theme/theme.js'
import Logo from './Logo.jsx'
import './Sidebar.css'

// אייקוני קו פשוטים, רק בתפריט. 20x20, צבע הטקסט
const ICONS = {
  home: <path d="M3 9.5 10 4l7 5.5V16a1 1 0 0 1-1 1h-3.5v-4.5h-5V17H4a1 1 0 0 1-1-1z" />,
  book: (
    <>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H16v12H5.5A1.5 1.5 0 0 0 4 16.5z" />
      <path d="M4 16.5A1.5 1.5 0 0 0 5.5 18H16v-3" />
    </>
  ),
  portfolio: (
    <>
      <rect x="3" y="6" width="14" height="10.5" rx="1" />
      <path d="M7.5 6V4.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V6M3 10.5h14" />
    </>
  ),
  path: (
    <>
      <circle cx="5" cy="15" r="1.75" />
      <circle cx="15" cy="5" r="1.75" />
      <path d="M6.75 15H12a2.5 2.5 0 0 0 0-5H8a2.5 2.5 0 0 1 0-5h5.25" />
    </>
  ),
  moon: <path d="M16 12.5A6.5 6.5 0 0 1 7.5 4a6.5 6.5 0 1 0 8.5 8.5z" />,
  sun: (
    <>
      <circle cx="10" cy="10" r="3.25" />
      <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4" />
    </>
  ),
  menu: <path d="M3 5.5h14M3 10h14M3 14.5h14" />,
  close: <path d="M5 5l10 10M15 5 5 15" />,
}

function Icon({ name }) {
  return (
    <svg className="icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  )
}

const lessons = modules.filter((m) => m.kind === 'module')

const STYLES = [
  { id: 'vivid', label: 'תוסס' },
  { id: 'calm', label: 'רגוע' },
]

export default function Sidebar() {
  const { progress } = useProgress()
  const { theme, toggle } = useTheme()
  const { answers } = useProfile()
  const { style, setStyle } = useDisplayStyle(answers)
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const panelId = useId()

  // במסך צר התפריט נסגר במעבר עמוד
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const done = lessons.filter((m) => progress[m.id]).length

  return (
    <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
      <div className="sidebar__bar">
        <Link to="/" className="sidebar__logo" aria-label="AlphaTrader Learn, לוח הבקרה">
          <Logo />
        </Link>
        <button
          type="button"
          className="sidebar__toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'close' : 'menu'} />
          {open ? 'סגירה' : 'תפריט'}
        </button>
      </div>

      <div className="sidebar__panel" id={panelId}>
        <nav className="sidebar__nav" aria-label="ניווט ראשי">
          <NavLink to="/" end className="sidebar__link">
            <Icon name="home" />
            לוח הבקרה
          </NavLink>

          <p className="sidebar__heading" id="sidebar-modules">
            מודולים
            <span className="sidebar__count">
              {done} מתוך {lessons.length} הושלמו
            </span>
          </p>
          <ul className="sidebar__modules" aria-labelledby="sidebar-modules">
            {lessons.map((m) => {
              const complete = Boolean(progress[m.id])
              return (
                <li key={m.id}>
                  <NavLink to={m.path} className="sidebar__module">
                    <span
                      className={`sidebar__tile${complete ? ' sidebar__tile--done' : ''}`}
                      style={{ '--tile': `var(--tone-${((m.number - 1) % 6) + 1})` }}
                      aria-hidden="true"
                    >
                      {m.number}
                    </span>
                    <span>{m.title}</span>
                    {complete && <span className="visually-hidden"> (הושלם)</span>}
                  </NavLink>
                </li>
              )
            })}
          </ul>

          <p className="sidebar__heading">כלים</p>
          <NavLink to="/glossary" className="sidebar__link">
            <Icon name="book" />
            מילון מונחים
          </NavLink>
          <NavLink to="/portfolio" className="sidebar__link">
            <Icon name="portfolio" />
            התיק שלי
          </NavLink>
          <NavLink to="/start" className="sidebar__link">
            <Icon name="path" />
            המסלול שלי
          </NavLink>
        </nav>

        <div className="sidebar__display">
          <p className="sidebar__heading" id="sidebar-style">
            סגנון תצוגה
          </p>
          <div className="sidebar__style" role="group" aria-labelledby="sidebar-style">
            {STYLES.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={style === option.id}
                onClick={() => setStyle(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button type="button" className="sidebar__theme" aria-pressed={theme === 'dark'} onClick={toggle}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            מצב כהה
          </button>
        </div>
      </div>
    </aside>
  )
}
