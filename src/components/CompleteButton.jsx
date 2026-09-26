import { useState } from 'react'
import { modules } from '../data/modules.js'
import { useProgress } from '../progress/ProgressContext.js'
import { formatDate } from '../progress/formatDate.js'

const lessons = modules.filter((m) => m.kind === 'module')

// חלקיקים לחגיגה הקצרה בסימון ״הושלם״: צבע וכיוון לכל אחד. קישוט בלבד
const BURST = Array.from({ length: 14 }, (_, i) => ({
  angle: (360 / 14) * i,
  tone: (i % 6) + 1,
  distance: 48 + (i % 3) * 18,
}))

export default function CompleteButton({ moduleId }) {
  const { progress, markComplete, markIncomplete } = useProgress()
  const [celebrate, setCelebrate] = useState(false)
  const completion = progress[moduleId]
  const done = lessons.filter((m) => progress[m.id]).length

  if (completion) {
    return (
      <div className={`complete complete--done${celebrate ? ' complete--celebrate' : ''}`} role="status">
        {celebrate && (
          <span className="complete__burst" aria-hidden="true">
            {BURST.map((p) => (
              <span
                key={p.angle}
                style={{
                  '--angle': `${p.angle}deg`,
                  '--distance': `${p.distance}px`,
                  '--tile': `var(--tone-${p.tone})`,
                }}
              />
            ))}
          </span>
        )}
        <p className="complete__message">
          המודול הושלם ב-<span className="mono">{formatDate(completion.completedAt)}</span>
          <span className="complete__count">
            {done} מתוך {lessons.length} מודולים הושלמו
          </span>
        </p>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            setCelebrate(false)
            markIncomplete(moduleId)
          }}
        >
          בטל סימון
        </button>
      </div>
    )
  }

  return (
    <div className="complete">
      <p className="complete__message">סיימתם לקרוא ושיחקתם עם הסימולטור?</p>
      <button
        type="button"
        className="btn btn--primary"
        onClick={() => {
          setCelebrate(true)
          markComplete(moduleId)
        }}
      >
        סמן כהושלם
      </button>
    </div>
  )
}
