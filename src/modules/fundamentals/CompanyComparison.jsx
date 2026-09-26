import { useState } from 'react'
import { COMPANIES, QUESTIONS, companyMetrics } from './fundamentals.js'

const pct = (v) => `${v < 0 ? '−' : ''}${Math.abs(v * 100).toFixed(1)}%`
const mil = (v) => `${v < 0 ? '−' : ''}₪${Math.abs(v).toLocaleString('he-IL')}M`
const x = (v) => v.toFixed(1)

// כל מכפיל: איך מציגים אותו, ומה "גבוה" אומר
const METRICS = [
  { id: 'pe', label: 'מכפיל רווח', en: 'P/E', format: x, note: 'כמה שנים של רווח משלמים במחיר של היום. נמוך = זול יותר ביחס לרווח, אם הרווח אמיתי ויחזור.' },
  { id: 'pb', label: 'מכפיל הון', en: 'P/B', format: x, note: 'שווי השוק ביחס להון העצמי במאזן. מתחת ל-1: הבורסה מעריכה את החברה בפחות מ״הספרים״.' },
  { id: 'ps', label: 'מכפיל מכירות', en: 'P/S', format: x, note: 'שימושי כשאין רווח. אבל קמעונאי עם שולי רווח דקים ״צריך״ מכפיל מכירות נמוך.' },
  { id: 'roe', label: 'תשואה על ההון', en: 'ROE', format: pct, note: 'כמה רווח החברה מייצרת על כל שקל של בעלי המניות. גבוה = יעיל יותר.' },
  { id: 'netMargin', label: 'שולי רווח נקי', en: 'Net Margin', format: pct, note: 'כמה אגורות רווח נשארות מכל שקל מכירות.' },
  { id: 'debtToEquity', label: 'חוב להון', en: 'D/E', format: x, note: 'כמה חוב יש על כל שקל הון. גבוה = יותר סיכון, בעיקר כשהריבית עולה.' },
  { id: 'dividendYield', label: 'תשואת דיבידנד', en: 'Dividend Yield', format: pct, note: 'כמה מזומן המניה מחלקת בשנה, ביחס למחיר.' },
  { id: 'growth', label: 'צמיחה ברווח', en: 'Growth', format: (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v * 100).toFixed(0)}%`, note: 'השינוי ברווח לעומת השנה שעברה. מהפסד אין משמעות לאחוז.' },
]

const companyById = Object.fromEntries(COMPANIES.map((c) => [c.id, c]))

function MetricBars({ metric, metrics }) {
  const values = COMPANIES.map((c) => metrics[c.id][metric.id])
  const max = Math.max(...values.filter((v) => v != null).map(Math.abs), 1e-9)
  return (
    <ul className="cmp-bars">
      {COMPANIES.map((c, i) => {
        const v = values[i]
        return (
          <li key={c.id} className={`cmp-bars__row cmp-bars__row--${c.accent}`}>
            <span className="cmp-bars__name">{c.name}</span>
            <span className="cmp-bars__track" dir="ltr">
              {v != null && (
                <span
                  className={`cmp-bars__fill${v < 0 ? ' is-negative' : ''}`}
                  style={{ inlineSize: `max(2px, ${(Math.abs(v) / max) * 100}%)` }}
                />
              )}
            </span>
            <bdi className="cmp-bars__value mono">{v == null ? 'אין' : metric.format(v)}</bdi>
          </li>
        )
      })}
    </ul>
  )
}

function Question({ q, answer, onAnswer }) {
  const options = q.options.map((o) =>
    typeof o === 'string' ? { id: o, label: companyById[o].name } : o,
  )
  return (
    <li className="cmp-q">
      <p className="cmp-q__text">{q.text}</p>
      <div className="cmp-q__options">
        {options.map((o) => {
          let state = ''
          if (answer) {
            if (o.id === q.answer) state = ' is-correct'
            else if (o.id === answer) state = ' is-wrong'
          }
          return (
            <button
              key={o.id}
              type="button"
              className={`chip cmp-q__opt${state}`}
              disabled={Boolean(answer)}
              onClick={() => onAnswer(o.id)}
            >
              {o.label}
            </button>
          )
        })}
      </div>
      {answer && (
        <p className={`cmp-q__feedback ${answer === q.answer ? 'is-lime' : 'is-down'}`} aria-live="polite">
          <strong>{answer === q.answer ? 'נכון.' : 'לא בדיוק.'}</strong> {q.explain}
        </p>
      )}
    </li>
  )
}

export default function CompanyComparison() {
  const [adjusted, setAdjusted] = useState(false)
  const [metricId, setMetricId] = useState('pe')
  const [answers, setAnswers] = useState({})
  const metric = METRICS.find((m) => m.id === metricId)
  const metrics = Object.fromEntries(COMPANIES.map((c) => [c.id, companyMetrics(c, adjusted)]))
  const correct = QUESTIONS.filter((q) => answers[q.id] === q.answer).length

  return (
    <div className="widget cmp">
      <span className="widget__tag">
        סימולטור
      </span>
      <h3 className="widget__title">בלש המכפילים: ארבע חברות, ארבעה סיפורים</h3>

      <ul className="cmp-cards">
        {COMPANIES.map((c) => {
          const m = metrics[c.id]
          return (
            <li key={c.id} className={`cmp-card cmp-card--${c.accent}`}>
              <p className="cmp-card__sector">{c.sector}</p>
              <h4 className="cmp-card__name">{c.name}</h4>
              <p className="cmp-card__story">{c.story}</p>
              <dl className="cmp-card__facts">
                <div>
                  <dt>מחיר</dt>
                  <dd className="mono">₪{c.price}</dd>
                </div>
                <div>
                  <dt>שווי שוק</dt>
                  <dd className="mono">{mil(m.marketCap)}</dd>
                </div>
                <div>
                  <dt>רווח נקי</dt>
                  <dd className={`mono ${m.netIncome < 0 ? 'is-down' : ''}`}>
                    <bdi>{mil(m.netIncome)}</bdi>
                  </dd>
                </div>
                <div>
                  <dt>רווח ב-3 שנים</dt>
                  <dd className="mono cmp-card__history">
                    <bdi>{c.history.join(' → ')}</bdi>
                  </dd>
                </div>
              </dl>
              {c.oneOffGain && (
                <p className={`cmp-card__flag${adjusted ? ' is-adjusted' : ''}`}>
                  {adjusted
                    ? `נוטרל רווח חד-פעמי של ₪${c.oneOffGain}M`
                    : `כולל רווח חד-פעמי של ₪${c.oneOffGain}M`}
                </p>
              )}
            </li>
          )
        })}
      </ul>

      <div className="cmp-controls">
        <div className="cmp-metrics" role="group" aria-label="בחירת מכפיל להשוואה">
          {METRICS.map((m) => (
            <button
              key={m.id}
              type="button"
              className="chip"
              aria-pressed={m.id === metricId}
              onClick={() => setMetricId(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <label className="cmp-toggle">
          <input type="checkbox" checked={adjusted} onChange={(e) => setAdjusted(e.target.checked)} />
          נטרלו רווחים חד-פעמיים
        </label>
      </div>

      <div className="cmp-chart">
        <p className="cmp-chart__title">
          {metric.label} <bdi className="mono">({metric.en})</bdi>
        </p>
        <MetricBars metric={metric} metrics={metrics} />
        <p className="cmp-chart__note">{metric.note}</p>
      </div>

      <h4 className="cmp-q__heading">בדקו את עצמכם</h4>
      <ol className="cmp-q__list">
        {QUESTIONS.map((q) => (
          <Question
            key={q.id}
            q={q}
            answer={answers[q.id]}
            onAnswer={(a) => setAnswers((prev) => ({ ...prev, [q.id]: a }))}
          />
        ))}
      </ol>
      {Object.keys(answers).length === QUESTIONS.length && (
        <div className="cmp-q__summary">
          <p>
            ענו נכון על <span className="mono">{correct}</span> מתוך <span className="mono">{QUESTIONS.length}</span>.
          </p>
          <button type="button" className="btn btn--ghost btn--small" onClick={() => setAnswers({})}>
            עוד פעם
          </button>
        </div>
      )}
    </div>
  )
}
