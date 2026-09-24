import { useProgress } from '../progress/ProgressContext.js'
import { formatDate } from '../progress/formatDate.js'

export default function CompleteButton({ moduleId }) {
  const { progress, markComplete, markIncomplete } = useProgress()
  const completion = progress[moduleId]

  if (completion) {
    return (
      <div className="complete complete--done" role="status">
        <p className="complete__message">
          <span className="complete__check" aria-hidden="true">✓</span>
          המודול הושלם ב-<span className="mono">{formatDate(completion.completedAt)}</span>
        </p>
        <button type="button" className="btn btn--ghost" onClick={() => markIncomplete(moduleId)}>
          בטל סימון
        </button>
      </div>
    )
  }

  return (
    <div className="complete">
      <p className="complete__message">סיימתם לקרוא ושיחקתם עם הסימולטור?</p>
      <button type="button" className="btn btn--primary" onClick={() => markComplete(moduleId)}>
        סמן כהושלם
      </button>
    </div>
  )
}
