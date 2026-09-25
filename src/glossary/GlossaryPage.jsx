import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { CATEGORIES, TERMS } from '../data/glossary.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import GlossaryEntry from './GlossaryEntry.jsx'
import { firstLetter, searchTerms } from './search.js'
import '../components/ModuleLayout.css'
import './GlossaryPage.css'

const HEBREW_LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת'.split('')
const FLASH_MS = 1800

const sortedTerms = [...TERMS].sort((a, b) => a.he.localeCompare(b.he, 'he'))

function groupByLetter(terms) {
  const groups = new Map()
  for (const term of terms) {
    const letter = firstLetter(term)
    if (!groups.has(letter)) groups.set(letter, [])
    groups.get(letter).push(term)
  }
  return [...groups.entries()]
}

export default function GlossaryPage() {
  useDocumentTitle('מילון מונחים')
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const [flashId, setFlashId] = useState(null)

  // ערך החיפוש נשמר ב-state מקומי ומשתקף לכתובת. עדכוני כתובת ב-react-router
  // אסינכרוניים, ולכן input שנשלט ישירות מהכתובת עלול "לאבד" אותיות בהקלדה מהירה.
  const urlQuery = params.get('q') ?? ''
  const [query, setQuery] = useState(urlQuery)
  const pushed = useRef([]) // ערכים ששלחנו לכתובת ועוד לא "חזרו" ממנה
  useEffect(() => {
    const echo = pushed.current.indexOf(urlQuery)
    if (echo !== -1) {
      // הד של הקלדה שלנו — לא דורסים את מה שהמשתמש כבר המשיך להקליד
      pushed.current = pushed.current.slice(echo + 1)
      return
    }
    pushed.current = []
    setQuery(urlQuery) // שינוי חיצוני בכתובת: "ראו גם", כפתור חזרה, קישור ששותף
  }, [urlQuery])

  const activeCat = CATEGORIES.some((c) => c.id === params.get('cat')) ? params.get('cat') : null

  const matches = useMemo(() => searchTerms(sortedTerms, query), [query])
  const visible = activeCat ? matches.filter((t) => t.category === activeCat) : matches
  const counts = useMemo(() => {
    const result = {}
    for (const t of matches) result[t.category] = (result[t.category] ?? 0) + 1
    return result
  }, [matches])

  const updateParams = (patch) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next, { replace: true })
  }

  const changeQuery = (value) => {
    setQuery(value)
    pushed.current.push(value)
    updateParams({ q: value })
  }

  const clearFilters = () => {
    setQuery('')
    setParams({}, { replace: true })
    searchRef.current?.focus()
  }

  // קפיצה למונח לפי העוגן בכתובת (/glossary#bid), כולל הבהוב קצר
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    if (!id) return undefined
    const el = document.getElementById(id)
    if (!el) return undefined
    el.scrollIntoView({ block: 'start' })
    el.focus({ preventScroll: true })
    setFlashId(id)
    const timer = window.setTimeout(() => setFlashId(null), FLASH_MS)
    return () => window.clearTimeout(timer)
  }, [location.hash, location.key])

  // "/" מעביר את הפוקוס לחיפוש, כמו באתרים רבים
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // "ראו גם": מנקה סינונים (כדי שהמונח בטוח יוצג) וקופץ אליו
  const goToTerm = (e, id) => {
    e.preventDefault()
    // מנקים את החיפוש המקומי מיד, כדי שהגלילה תתבצע אחרי שהרשימה המלאה כבר מוצגת
    setQuery('')
    pushed.current = []
    navigate({ pathname: '/glossary', search: '', hash: id })
  }

  const scrollToLetter = (letter) => {
    document.getElementById(`letter-${letter}`)?.scrollIntoView({ block: 'start' })
  }

  const grouped = query ? null : groupByLetter(visible)
  const lettersPresent = new Set(grouped?.map(([letter]) => letter))

  const renderEntry = (term) => (
    <li key={term.id} className={flashId === term.id ? 'is-flash' : undefined}>
      <GlossaryEntry term={term} query={query} onRelated={goToTerm} />
    </li>
  )

  return (
    <div className="lesson lesson--amber glossary">
      <nav className="lesson__breadcrumb" aria-label="ניווט">
        <Link to="/">→ דף הבית</Link>
      </nav>

      <header className="lesson__header">
        <p className="lesson__eyebrow">
          <span dir="ltr">GLOSSARY</span> · <span className="mono">{TERMS.length}</span> מונחים
        </p>
        <h1 className="lesson__title">מילון מונחים</h1>
        <p className="lesson__intro">
          כל המושגים של שוק ההון במקום אחד, בעברית פשוטה ועם המונח באנגלית. חפשו בעברית או
          באנגלית, סננו לפי תחום, ולחצו על ״ראו גם״ כדי לעבור בין מונחים קשורים.
        </p>
      </header>

      <div className="gl-controls">
        <div className="gl-search">
          <label htmlFor="glossary-search" className="visually-hidden">
            חיפוש מונח
          </label>
          <input
            ref={searchRef}
            id="glossary-search"
            type="search"
            className="gl-search__input"
            placeholder="חפשו מונח: מכפיל רווח, Spread, אג״ח..."
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && changeQuery('')}
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className="gl-search__kbd" aria-hidden="true">
            /
          </kbd>
        </div>

        <div className="gl-cats" role="group" aria-label="סינון לפי תחום">
          <button
            type="button"
            className="gl-cat"
            aria-pressed={!activeCat}
            onClick={() => updateParams({ cat: '' })}
          >
            הכול <span className="gl-cat__count">{matches.length}</span>
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`gl-cat gl-cat--${cat.accent}`}
              aria-pressed={activeCat === cat.id}
              disabled={!counts[cat.id] && activeCat !== cat.id}
              onClick={() => updateParams({ cat: activeCat === cat.id ? '' : cat.id })}
            >
              {cat.label} <span className="gl-cat__count">{counts[cat.id] ?? 0}</span>
            </button>
          ))}
        </div>

        <p className="gl-status" aria-live="polite">
          {visible.length === TERMS.length
            ? `${TERMS.length} מונחים`
            : `מציג ${visible.length} מתוך ${TERMS.length} מונחים`}
          {(query || activeCat) && (
            <button type="button" className="gl-status__clear" onClick={clearFilters}>
              ניקוי סינון
            </button>
          )}
        </p>

        {grouped && grouped.length > 0 && (
          <nav className="gl-letters" aria-label="קפיצה לפי אות">
            {HEBREW_LETTERS.map((letter) => (
              <button
                key={letter}
                type="button"
                className="gl-letters__btn"
                disabled={!lettersPresent.has(letter)}
                onClick={() => scrollToLetter(letter)}
              >
                {letter}
              </button>
            ))}
            {lettersPresent.has('A–Z') && (
              <button type="button" className="gl-letters__btn gl-letters__btn--latin" onClick={() => scrollToLetter('A–Z')}>
                A–Z
              </button>
            )}
          </nav>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="gl-empty">
          <p className="gl-empty__title">לא מצאנו מונח כזה</p>
          <p>נסו מילה אחרת, בעברית או באנגלית, או חפשו בכל התחומים.</p>
          <button type="button" className="btn btn--ghost btn--small" onClick={clearFilters}>
            ניקוי החיפוש
          </button>
        </div>
      ) : grouped ? (
        grouped.map(([letter, terms]) => (
          <section key={letter} className="gl-group" aria-labelledby={`letter-${letter}`}>
            <h2 id={`letter-${letter}`} className="gl-group__letter" tabIndex={-1}>
              {letter}
            </h2>
            <ul className="gl-list">{terms.map(renderEntry)}</ul>
          </section>
        ))
      ) : (
        <ul className="gl-list">{visible.map(renderEntry)}</ul>
      )}
    </div>
  )
}
