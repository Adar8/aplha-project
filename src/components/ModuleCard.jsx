import { Link } from 'react-router'
import { useProgress } from '../progress/ProgressContext.js'
import { formatDate } from '../progress/formatDate.js'
import './ModuleCard.css'

export default function ModuleCard({ module }) {
  const { progress } = useProgress()
  const { kind, number, title, summary, accent, status, path, minutes, termCount } = module
  const isGlossary = kind === 'glossary'
  const isAvailable = status === 'available'
  const completion = progress[module.id]

  let badge = <span className="module-card__status">בקרוב</span>
  if (completion) {
    badge = (
      <span className="module-card__status module-card__status--done">
        ✓ הושלם {formatDate(completion.completedAt)}
      </span>
    )
  } else if (isAvailable) {
    badge = <span className="module-card__status module-card__status--open">זמין</span>
  }

  const content = (
    <>
      <div className="module-card__top">
        <span className="module-card__number" dir="ltr" aria-hidden="true">
          {isGlossary ? 'A–Z' : String(number).padStart(2, '0')}
        </span>
        {badge}
      </div>
      <p className="module-card__label">
        {isGlossary ? 'כלי עזר' : `מודול ${number}`}
        {minutes ? <span className="mono"> · {minutes} דק׳</span> : null}
        {termCount ? <span className="mono"> · {termCount} מונחים</span> : null}
      </p>
      <h3 className="module-card__title">{title}</h3>
      <p className="module-card__summary">{summary}</p>
      {isAvailable && <span className="module-card__cta">{isGlossary ? 'לפתוח את המילון ←' : 'להתחיל ←'}</span>}
    </>
  )

  const className = `module-card module-card--${accent}${isAvailable ? ' module-card--link' : ' module-card--locked'}`

  return isAvailable ? (
    <Link to={path} className={className}>
      {content}
    </Link>
  ) : (
    <article className={className}>{content}</article>
  )
}
