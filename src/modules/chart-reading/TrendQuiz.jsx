import { useState } from 'react'
import PriceChart from './PriceChart.jsx'
import { TREND_LABELS, TREND_QUIZ } from './chartData.js'

const OPTIONS = ['up', 'down', 'sideways']

export default function TrendQuiz() {
  const [answers, setAnswers] = useState({})
  const answered = Object.keys(answers).length
  const correct = TREND_QUIZ.filter((q) => answers[q.id] === q.answer).length

  return (
    <div className="widget quiz">
      <span className="widget__tag" dir="ltr">
        EXERCISE
      </span>
      <h3 className="widget__title">זהו את המגמה</h3>

      <ol className="quiz__list">
        {TREND_QUIZ.map((q, n) => {
          const picked = answers[q.id]
          const isRight = picked === q.answer
          return (
            <li key={q.id} className="quiz__item">
              <p className="quiz__num mono">גרף {n + 1}</p>
              <PriceChart candles={q.candles} size="mini" showVolume={false} label={`גרף ${n + 1} לזיהוי מגמה`} />
              <div className="quiz__options" role="group" aria-label={`מה המגמה בגרף ${n + 1}?`}>
                {OPTIONS.map((opt) => {
                  let state = ''
                  if (picked) {
                    if (opt === q.answer) state = ' is-correct'
                    else if (opt === picked) state = ' is-wrong'
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`chip quiz__opt${state}`}
                      disabled={Boolean(picked)}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    >
                      {TREND_LABELS[opt]}
                    </button>
                  )
                })}
              </div>
              {picked && (
                <p className={`quiz__feedback ${isRight ? 'is-lime' : 'is-down'}`} aria-live="polite">
                  <strong>{isRight ? 'נכון.' : `לא בדיוק: זו ${TREND_LABELS[q.answer]}.`}</strong> {q.explain}
                </p>
              )}
            </li>
          )
        })}
      </ol>

      {answered === TREND_QUIZ.length && (
        <div className="quiz__summary">
          <p>
            זיהיתם נכון <span className="mono">{correct}</span> מתוך{' '}
            <span className="mono">{TREND_QUIZ.length}</span>.
          </p>
          <button type="button" className="btn btn--ghost btn--small" onClick={() => setAnswers({})}>
            עוד פעם
          </button>
        </div>
      )}
    </div>
  )
}
