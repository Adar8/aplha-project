import './ModuleCard.css'

const STATUS_LABELS = {
  soon: 'בקרוב',
  available: 'זמין',
}

export default function ModuleCard({ module }) {
  const { number, title, summary, accent, status } = module

  return (
    <article className={`module-card module-card--${accent}`}>
      <div className="module-card__top">
        <span className="module-card__number" dir="ltr">
          {String(number).padStart(2, '0')}
        </span>
        <span className="module-card__status">{STATUS_LABELS[status]}</span>
      </div>
      <p className="module-card__label">מודול {number}</p>
      <h3 className="module-card__title">{title}</h3>
      <p className="module-card__summary">{summary}</p>
    </article>
  )
}
