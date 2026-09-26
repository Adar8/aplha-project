import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { BIASES, SCENARIOS } from './scenarios.js'

/** חמישה תרחישים, אחד בכל פעם. אחרי כל בחירה: משוב. בסוף: סיכום ההטיות שנחשפו */
export default function ScenarioLab() {
  const [step, setStep] = useState(0)
  const [choices, setChoices] = useState({})
  const headingRef = useRef(null)

  const finished = step >= SCENARIOS.length
  const scenario = SCENARIOS[step]
  const chosen = scenario ? choices[scenario.id] : null
  const answer = chosen != null ? scenario.answers[chosen] : null

  const go = (next) => {
    setStep(next)
    // המיקוד עובר לכותרת התרחיש הבא, כדי שקורא מסך ומקלדת ימשיכו משם
    requestAnimationFrame(() => headingRef.current?.focus())
  }

  const restart = () => {
    setChoices({})
    go(0)
  }

  return (
    <div className="widget scenarios">
      <span className="widget__tag">תרגול</span>
      <h3 className="widget__title">חמישה תרחישים: מה הייתם עושים?</h3>

      <ol className="scenarios__steps" aria-label="התקדמות בתרחישים">
        {SCENARIOS.map((s, i) => {
          const c = choices[s.id]
          const state = c == null ? '' : s.answers[c].bias ? ' is-bias' : ' is-clear'
          return (
            <li key={s.id} className={`scenarios__step${state}${i === step ? ' is-current' : ''}`}>
              <span className="visually-hidden">
                תרחיש {i + 1}
                {c == null ? '' : s.answers[c].bias ? ': נחשפה הטיה' : ': תגובה מסודרת'}
              </span>
            </li>
          )
        })}
      </ol>

      {!finished ? (
        <div className="scenario">
          <p className="scenario__count" ref={headingRef} tabIndex={-1}>
            תרחיש <span className="mono">{step + 1}</span> מתוך <span className="mono">{SCENARIOS.length}</span>:{' '}
            {scenario.title}
          </p>
          <p className="scenario__text">{scenario.text}</p>

          <div className="scenario__answers" role="group" aria-label="התשובות האפשריות">
            {scenario.answers.map((a, i) => {
              let state = ''
              if (chosen === i) state = a.bias ? ' is-bias' : ' is-clear'
              return (
                <button
                  key={i}
                  type="button"
                  className={`scenario__answer${state}`}
                  aria-pressed={chosen === i}
                  disabled={chosen != null && chosen !== i}
                  onClick={() => chosen == null && setChoices((c) => ({ ...c, [scenario.id]: i }))}
                >
                  {a.text}
                </button>
              )
            })}
          </div>

          <div aria-live="polite">
            {answer && (
              <div className={`scenario__feedback${answer.bias ? ' is-bias' : ' is-clear'}`}>
                <p className="scenario__verdict">
                  {answer.bias ? `נחשפה הטיה: ${BIASES[answer.bias].label}` : 'תגובה מסודרת, בלי הטיה בולטת'}
                </p>
                <p>{answer.feedback}</p>
              </div>
            )}
          </div>

          {answer && (
            <button type="button" className="btn btn--primary" onClick={() => go(step + 1)}>
              {step + 1 < SCENARIOS.length ? 'לתרחיש הבא' : 'לסיכום'}
            </button>
          )}
        </div>
      ) : (
        <Summary choices={choices} headingRef={headingRef} onRestart={restart} />
      )}
    </div>
  )
}

function Summary({ choices, headingRef, onRestart }) {
  const counts = {}
  let clear = 0
  for (const s of SCENARIOS) {
    const bias = s.answers[choices[s.id]].bias
    if (bias) counts[bias] = (counts[bias] ?? 0) + 1
    else clear++
  }
  const found = Object.entries(counts).sort((a, b) => b[1] - a[1])

  return (
    <div className="scenarios__summary">
      <p className="scenario__count" ref={headingRef} tabIndex={-1}>
        סיכום
      </p>
      <p className="scenarios__score">
        <span className="mono is-up">{clear}</span> מתוך <span className="mono">{SCENARIOS.length}</span> תגובות מסודרות
      </p>
      {found.length > 0 ? (
        <>
          <p>ההטיות שנחשפו בתשובות שלכם:</p>
          <ul className="scenarios__biases">
            {found.map(([id, n]) => (
              <li key={id}>
                <Link to={`/glossary#${BIASES[id].glossary}`}>{BIASES[id].label}</Link>
                <span className="scenarios__times is-down">{n === 1 ? 'פעם אחת' : `${n} פעמים`}</span>
              </li>
            ))}
          </ul>
          <p className="scenarios__note">
            זה לא ציון על האופי שלכם. אלה הטיות שכמעט כל משקיע מרגיש, והמטרה היא לזהות אותן מראש כדי לבנות כללים שיעבדו
            גם ברגע הלחוץ.
          </p>
        </>
      ) : (
        <p>בכל חמשת התרחישים בחרתם בתגובה המסודרת. בשוק אמיתי, עם כסף אמיתי ולחץ של זמן, זה קשה יותר.</p>
      )}
      <button type="button" className="btn btn--ghost btn--small" onClick={onRestart}>
        להתחיל מחדש
      </button>
    </div>
  )
}
