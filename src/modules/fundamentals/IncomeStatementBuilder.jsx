import { useState } from 'react'
import { incomeStatement, peRatio } from './fundamentals.js'

const SHARES = 10 // מיליון מניות
const TAX_RATE = 0.23 // מס חברות בישראל

const mil = (v) => `${v < 0 ? '−' : ''}₪${Math.abs(Math.round(v)).toLocaleString('he-IL')}M`
const pct = (v) => `${v < 0 ? '−' : ''}${Math.abs(v * 100).toFixed(1)}%`

const SLIDERS = [
  { key: 'revenue', label: 'הכנסות', min: 400, max: 2000, step: 50, format: mil },
  { key: 'cogsPct', label: 'עלות המכר (מההכנסות)', min: 0.3, max: 0.9, step: 0.05, format: (v) => `${Math.round(v * 100)}%` },
  { key: 'opex', label: 'הוצאות תפעול', min: 50, max: 500, step: 10, format: mil },
  { key: 'interest', label: 'הוצאות מימון (ריבית)', min: 0, max: 150, step: 5, format: mil },
  { key: 'price', label: 'מחיר המניה', min: 20, max: 300, step: 5, format: (v) => `₪${v}` },
]

/** שורה במפל: קטע על ציר שמתחיל ב-min ונגמר ב-max */
function Row({ label, from, to, kind, value, scale }) {
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  const toPct = (v) => ((v - scale.min) / (scale.max - scale.min)) * 100
  return (
    <div className={`wf-row wf-row--${kind}`}>
      <span className="wf-row__label">{label}</span>
      <span className="wf-row__track" dir="ltr">
        {scale.min < 0 && <span className="wf-row__zero" style={{ insetInlineStart: `${toPct(0)}%` }} />}
        <span
          className="wf-row__bar"
          style={{ insetInlineStart: `${toPct(lo)}%`, inlineSize: `max(2px, ${toPct(hi) - toPct(lo)}%)` }}
        />
      </span>
      <bdi className="wf-row__value mono">{value}</bdi>
    </div>
  )
}

export default function IncomeStatementBuilder() {
  const [v, setV] = useState({ revenue: 1000, cogsPct: 0.6, opex: 250, interest: 30, price: 100 })
  const is = incomeStatement({ ...v, taxRate: TAX_RATE })
  const eps = is.netIncome / SHARES
  const pe = peRatio(v.price, eps)
  const scale = { min: Math.min(0, is.netIncome, is.operatingProfit, is.preTax), max: is.revenue }
  const netKind = is.netIncome >= 0 ? 'net' : 'loss'

  return (
    <div className="widget pnl">
      <span className="widget__tag" dir="ltr">
        INTERACTIVE
      </span>
      <h3 className="widget__title">בנו דוח רווח והפסד</h3>
      <p className="pnl__intro">
        חברה דמיונית עם <span className="mono">{SHARES}</span> מיליון מניות. הזיזו את הסליידרים וראו איך כל שקל
        של הכנסות ״מתכווץ״ בדרך לשורה התחתונה, ואיך זה משנה את המכפיל.
      </p>

      <div className="pnl__layout">
        <div className="pnl__sliders">
          {SLIDERS.map((s) => (
            <label key={s.key} className="pnl__slider">
              <span className="pnl__slider-head">
                {s.label} <output className="mono">{s.format(v[s.key])}</output>
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={v[s.key]}
                onChange={(e) => setV((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))}
              />
            </label>
          ))}
        </div>

        <div className="pnl__waterfall" aria-label="מפל הרווח: מההכנסות לרווח הנקי">
          <Row label="הכנסות" from={0} to={is.revenue} kind="total" value={mil(is.revenue)} scale={scale} />
          <Row label="− עלות המכר" from={is.revenue} to={is.grossProfit} kind="cost" value={mil(-is.cogs)} scale={scale} />
          <Row label="= רווח גולמי" from={0} to={is.grossProfit} kind="sub" value={mil(is.grossProfit)} scale={scale} />
          <Row label="− הוצאות תפעול" from={is.grossProfit} to={is.operatingProfit} kind="cost" value={mil(-is.opex)} scale={scale} />
          <Row label="= רווח תפעולי" from={0} to={is.operatingProfit} kind="sub" value={mil(is.operatingProfit)} scale={scale} />
          <Row label="− מימון" from={is.operatingProfit} to={is.preTax} kind="cost" value={mil(-is.interest)} scale={scale} />
          <Row label="− מס" from={is.preTax} to={is.netIncome} kind="cost" value={mil(-is.tax)} scale={scale} />
          <Row label="= רווח נקי" from={0} to={is.netIncome} kind={netKind} value={mil(is.netIncome)} scale={scale} />
        </div>
      </div>

      <dl className="pnl__stats">
        <div>
          <dt>שולי רווח גולמי</dt>
          <dd className={`mono ${is.grossMargin < 0 ? 'is-down' : ''}`}>
            <bdi>{pct(is.grossMargin)}</bdi>
          </dd>
        </div>
        <div>
          <dt>שולי רווח תפעולי</dt>
          <dd className={`mono ${is.operatingMargin < 0 ? 'is-down' : ''}`}>
            <bdi>{pct(is.operatingMargin)}</bdi>
          </dd>
        </div>
        <div>
          <dt>שולי רווח נקי</dt>
          <dd className={`mono ${is.netMargin < 0 ? 'is-down' : ''}`}>
            <bdi>{pct(is.netMargin)}</bdi>
          </dd>
        </div>
        <div>
          <dt>
            רווח למניה <bdi className="mono">(EPS)</bdi>
          </dt>
          <dd className={`mono ${eps < 0 ? 'is-down' : ''}`}>
            <bdi>{eps < 0 ? '−' : ''}₪{Math.abs(eps).toFixed(2)}</bdi>
          </dd>
        </div>
        <div>
          <dt>
            מכפיל רווח <bdi className="mono">(P/E)</bdi>
          </dt>
          <dd className={`mono ${pe == null ? 'is-down' : 'is-lime'}`}>{pe == null ? 'אין (הפסד)' : pe.toFixed(1)}</dd>
        </div>
      </dl>
    </div>
  )
}
