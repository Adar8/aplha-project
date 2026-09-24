import { Link } from 'react-router'
import { getModule } from '../data/modules.js'
import { getCategory, TERMS } from '../data/glossary.js'
import { matchRanges } from './search.js'

const termsById = new Map(TERMS.map((t) => [t.id, t]))

/** מחזיר טקסט עם <mark> סביב ההתאמות לשאילתה */
function Highlight({ text, query }) {
  const ranges = matchRanges(text, query)
  if (!ranges.length) return text
  const parts = []
  let pos = 0
  ranges.forEach(([start, end], i) => {
    if (start > pos) parts.push(text.slice(pos, start))
    parts.push(<mark key={i}>{text.slice(start, end)}</mark>)
    pos = end
  })
  if (pos < text.length) parts.push(text.slice(pos))
  return parts
}

export default function GlossaryEntry({ term, query, onRelated }) {
  const category = getCategory(term.category)
  const lesson = term.module ? getModule(term.module) : null

  return (
    <article id={term.id} className={`gl-entry gl-entry--${category.accent}`} tabIndex={-1}>
      <header className="gl-entry__head">
        <h3 className="gl-entry__title">
          <Highlight text={term.he} query={query} />
        </h3>
        <bdi className="gl-entry__en" dir="ltr">
          <Highlight text={term.en} query={query} />
        </bdi>
        <span className="gl-entry__cat">{category.label}</span>
      </header>

      <p className="gl-entry__def">
        <Highlight text={term.definition} query={query} />
      </p>

      {term.example && (
        <p className="gl-entry__example">
          <span className="gl-entry__example-label">לדוגמה</span>
          <Highlight text={term.example} query={query} />
        </p>
      )}

      {(term.related?.length > 0 || lesson) && (
        <footer className="gl-entry__foot">
          {term.related?.length > 0 && (
            <div className="gl-entry__related">
              <span className="gl-entry__foot-label">ראו גם:</span>
              {term.related.map((id) => (
                <a key={id} href={`#${id}`} className="gl-chip" onClick={(e) => onRelated(e, id)}>
                  {termsById.get(id).he}
                </a>
              ))}
            </div>
          )}
          {lesson?.status === 'available' && (
            <Link to={lesson.path} className="gl-entry__lesson">
              הוסבר לעומק במודול {String(lesson.number).padStart(2, '0')}: {lesson.title} ←
            </Link>
          )}
        </footer>
      )}
    </article>
  )
}
