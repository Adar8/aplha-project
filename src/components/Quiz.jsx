import { useId, useState } from 'react'

/**
 * בוחן קצר בסוף מודול: שאלה, כמה תשובות, ומשוב מיידי לכל תשובה.
 * questions: [{ id, prompt, options: [{ text, correct?: boolean, feedback }] }]
 * התשובות לא נשמרות. רענון או ״לנסות שוב״ מאפסים את הבוחן.
 */
export default function Quiz({ questions, title = 'בוחן קצר' }) {
  const [answers, setAnswers] = useState({})
  const baseId = useId()
  const answered = Object.keys(answers).length
  const score = questions.filter((q) => q.options[answers[q.id]]?.correct).length

  return (
    <div className="widget mod-quiz">
      <span className="widget__tag">בוחן</span>
      <h3 className="widget__title">{title}</h3>
      <ol className="mod-quiz__list">
        {questions.map((q, qi) => {
          const chosen = answers[q.id]
          const done = chosen != null
          const option = done ? q.options[chosen] : null
          return (
            <li key={q.id} className="mod-quiz__item">
              <fieldset className="mod-quiz__question">
                <legend className="mod-quiz__prompt">
                  <span className="mod-quiz__num">{qi + 1}.</span> {q.prompt}
                </legend>
                <div className="mod-quiz__options">
                  {q.options.map((o, oi) => {
                    let state = ''
                    if (done && oi === chosen) state = o.correct ? ' is-right' : ' is-wrong'
                    else if (done && o.correct) state = ' is-answer'
                    return (
                      <button
                        key={oi}
                        type="button"
                        className={`mod-quiz__option${state}`}
                        aria-pressed={oi === chosen}
                        aria-describedby={done && oi === chosen ? `${baseId}-${q.id}` : undefined}
                        disabled={done && oi !== chosen}
                        onClick={() => !done && setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      >
                        {o.text}
                        {done && oi === chosen && <span className="mod-quiz__verdict">{o.correct ? 'נכון' : 'לא נכון'}</span>}
                        {done && oi !== chosen && o.correct && <span className="mod-quiz__verdict">התשובה הנכונה</span>}
                      </button>
                    )
                  })}
                </div>
                <p
                  id={`${baseId}-${q.id}`}
                  className={`mod-quiz__feedback${done ? (option.correct ? ' is-right' : ' is-wrong') : ''}`}
                  aria-live="polite"
                >
                  {done ? option.feedback : ''}
                </p>
              </fieldset>
            </li>
          )
        })}
      </ol>
      {answered === questions.length && (
        <div className="mod-quiz__result" role="status">
          <p>
            <span className="mono">
              {score}/{questions.length}
            </span>{' '}
            תשובות נכונות
          </p>
          <button type="button" className="btn btn--ghost btn--small" onClick={() => setAnswers({})}>
            לנסות שוב
          </button>
        </div>
      )}
    </div>
  )
}
