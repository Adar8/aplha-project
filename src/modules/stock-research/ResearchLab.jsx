import { useState } from 'react'
import { COMPANY } from './company.js'
import { pct, times, usdM } from './format.js'
import { valuation, yearMetrics, yearOverYear } from './research.js'
import { FINDING_KINDS, ROWS, STEPS } from './steps.js'

const years = COMPANY.years
const growth = yearOverYear(years.map((y) => y.revenue))
const METRICS = years.map((y, i) => ({ ...yearMetrics(y), revenueGrowth: growth[i] }))
const VALUATION = valuation(COMPANY.price, years.at(-1))

function FinTable({ rows }) {
  return (
    <div className="fin-wrap">
      <table className="fin">
        <thead>
          <tr>
            <td />
            {METRICS.map((m) => (
              <th key={m.year} scope="col" className="mono">
                {m.year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((key) => {
            const row = ROWS[key]
            return (
              <tr key={key}>
                <th scope="row">{row.label}</th>
                {METRICS.map((m) => {
                  const v = row.get(m)
                  return (
                    <td key={m.year} className={`mono${v < 0 ? ' is-down' : ''}`}>
                      <bdi>{v == null ? '—' : row.format(v)}</bdi>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Excerpt({ title, paragraphs }) {
  return (
    <div className="excerpt">
      <p className="excerpt__title">{title}</p>
      {paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  )
}

function PriceFacts() {
  const facts = [
    ['מחיר', `$${COMPANY.price}`],
    ['שווי שוק', usdM(VALUATION.marketCap)],
    ['מכפיל רווח', times(VALUATION.pe)],
    ['מכפיל מכירות', times(VALUATION.ps)],
    ['EV/EBITDA', times(VALUATION.evToEbitda)],
    ['תשואת תזרים חופשי', pct(VALUATION.fcfYield)],
  ]
  return (
    <dl className="lab__facts">
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd className="mono">
            <bdi>{value}</bdi>
          </dd>
        </div>
      ))}
    </dl>
  )
}

function ResearchSheet({ answers, onReset }) {
  const findings = STEPS.flatMap((s) => s.findings)
  const correct = STEPS.filter((s) => answers[s.id] === s.answer).length
  return (
    <div className="sheet">
      <p className="sheet__eyebrow" dir="ltr">
        RESEARCH NOTE · {COMPANY.ticker}
      </p>
      <h4 className="sheet__title">דף המחקר: {COMPANY.name}</h4>
      <div className="sheet__cols">
        {Object.entries(FINDING_KINDS).map(([kind, meta]) => (
          <div key={kind} className={`sheet__col sheet__col--${kind}`}>
            <p className="sheet__col-title">
              <span aria-hidden="true">{meta.icon}</span> {meta.label}
            </p>
            <ul>
              {findings
                .filter((f) => f.kind === kind)
                .map((f) => (
                  <li key={f.text}>{f.text}</li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="sheet__note">
        שימו לב מה אין כאן: המלצה. מחקר טוב לא נגמר ב״לקנות״ או ״לא לקנות״. הוא נגמר בתמונה ברורה של העסק, ברשימה
        של דברים לעקוב אחריהם בדוח הבא, ובהבנה מה המחיר של היום כבר מניח.
      </p>
      <div className="sheet__footer">
        <p>
          ענו נכון על <span className="mono">{correct}</span> מתוך <span className="mono">{STEPS.length}</span> שלבים.
        </p>
        <button type="button" className="btn btn--ghost btn--small" onClick={onReset}>
          ↺ לחקור מההתחלה
        </button>
      </div>
    </div>
  )
}

export default function ResearchLab() {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const done = index === STEPS.length
  const step = STEPS[index]
  const answer = step && answers[step.id]

  return (
    <div className="widget lab">
      <span className="widget__tag" dir="ltr">
        RESEARCH LAB
      </span>
      <h3 className="widget__title">
        חוקרים את {COMPANY.name} <bdi className="mono lab__ticker">({COMPANY.ticker})</bdi>
      </h3>

      <ol className="lab__steps" aria-label="שלבי החקירה">
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={`lab__step${i === index ? ' is-current' : ''}${answers[s.id] ? ' is-done' : ''}`}
              aria-current={i === index ? 'step' : undefined}
              disabled={i > 0 && !answers[STEPS[i - 1].id]}
              onClick={() => setIndex(i)}
            >
              <span className="mono">{i + 1}</span> {s.title}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            className={`lab__step${done ? ' is-current' : ''}`}
            disabled={!STEPS.every((s) => answers[s.id])}
            onClick={() => setIndex(STEPS.length)}
          >
            <span className="mono">✓</span> דף המחקר
          </button>
        </li>
      </ol>

      {done ? (
        <ResearchSheet
          answers={answers}
          onReset={() => {
            setAnswers({})
            setIndex(0)
          }}
        />
      ) : (
        <div className="lab__stage" key={step.id}>
          <p className="lab__source">
            <span className="is-muted">איפה מוצאים: </span>
            {step.source}
          </p>

          {step.id === 'business' && (
            <div className="lab__excerpts">
              <Excerpt title="מתוך פרק Business" paragraphs={COMPANY.about} />
              <Excerpt title="מתוך פרק Risk Factors" paragraphs={COMPANY.risks} />
            </div>
          )}
          {step.id === 'price' && <PriceFacts />}
          {step.rows.length > 0 && <FinTable rows={step.rows} />}

          <p className="lab__question">{step.question}</p>
          <div className="lab__options">
            {step.options.map((o) => {
              let state = ''
              if (answer) {
                if (o.id === step.answer) state = ' is-correct'
                else if (o.id === answer) state = ' is-wrong'
              }
              return (
                <button
                  key={o.id}
                  type="button"
                  className={`chip lab__opt${state}`}
                  disabled={Boolean(answer)}
                  onClick={() => setAnswers((prev) => ({ ...prev, [step.id]: o.id }))}
                >
                  {o.label}
                </button>
              )
            })}
          </div>

          {answer && (
            <div className="lab__feedback" aria-live="polite">
              <p className={answer === step.answer ? 'is-lime' : 'is-down'}>
                <strong>{answer === step.answer ? '✓ נכון.' : '✗ לא בדיוק.'}</strong>{' '}
                <span className="lab__explain">{step.explain}</span>
              </p>
              <ul className="lab__findings">
                {step.findings.map((f) => (
                  <li key={f.text} className={`lab__finding lab__finding--${f.kind}`}>
                    <span className="lab__finding-kind">{FINDING_KINDS[f.kind].one}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <button type="button" className="btn btn--primary btn--small" onClick={() => setIndex(index + 1)}>
                {index === STEPS.length - 1 ? 'לדף המחקר ←' : 'לשלב הבא ←'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
