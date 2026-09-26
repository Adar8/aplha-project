import { useId, useState } from 'react'
import { afterTax } from './taxMath.js'

const money = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 })
const fmt = (v) => `${v < 0 ? '−' : ''}₪${money.format(Math.abs(Math.round(v)))}`
const shares = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 })

const FIELDS = [
  { key: 'amount', label: 'סכום שמושקע במניות (₪)', step: '100' },
  { key: 'buyPrice', label: 'מחיר קנייה למניה', step: '0.01' },
  { key: 'sellPrice', label: 'מחיר מכירה למניה', step: '0.01' },
  { key: 'buyFee', label: 'עמלת קנייה (₪)', step: '1' },
  { key: 'sellFee', label: 'עמלת מכירה (₪)', step: '1' },
]

// ערכי דוגמה בלבד, כדי שהמחשבון יציג תוצאה מהרגע הראשון
const EXAMPLE = { amount: '10000', buyPrice: '50', sellPrice: '60', buyFee: '10', sellFee: '10' }

export default function TaxCalculator() {
  const [values, setValues] = useState(EXAMPLE)
  const id = useId()
  const r = afterTax(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v === '' ? NaN : Number(v)])))

  const segments = r.valid && r.netProfit >= 0
    ? [
        { key: 'cost', label: 'הקרן שהושקעה', value: Number(values.amount) },
        { key: 'fees', label: 'עמלות', value: r.fees },
        { key: 'tax', label: 'מס רווחי הון', value: r.tax },
        { key: 'net', label: 'רווח נקי', value: r.netProfit },
      ]
    : null
  const total = segments ? segments.reduce((s, x) => s + x.value, 0) : 0

  return (
    <div className="widget tax-calc">
      <span className="widget__tag">מחשבון</span>
      <h3 className="widget__title">מה נשאר ביד אחרי עמלות ומס</h3>
      <p className="tax-calc__hint">הערכים שמופיעים בהתחלה הם דוגמה. אפשר לשנות כל אחד מהם.</p>

      <div className="tax-calc__fields">
        {FIELDS.map((f) => (
          <div key={f.key} className="tax-calc__field">
            <label htmlFor={`${id}-${f.key}`}>{f.label}</label>
            <input
              id={`${id}-${f.key}`}
              type="number"
              inputMode="decimal"
              min="0"
              step={f.step}
              dir="ltr"
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      {!r.valid ? (
        <p className="tax-calc__error" role="alert">
          {r.error}
        </p>
      ) : (
        <div aria-live="polite">
          <dl className="tax-calc__results">
            <div>
              <dt>מספר מניות</dt>
              <dd className="mono">{shares.format(r.shares)}</dd>
            </div>
            <div>
              <dt>תמורה במכירה</dt>
              <dd className="mono"><bdi dir="ltr">{fmt(r.proceeds)}</bdi></dd>
            </div>
            <div>
              <dt>רווח לפני עמלות ומס</dt>
              <dd className={`mono ${r.grossGain >= 0 ? 'is-up' : 'is-down'}`}><bdi dir="ltr">{fmt(r.grossGain)}</bdi></dd>
            </div>
            <div>
              <dt>עמלות קנייה ומכירה</dt>
              <dd className="mono"><bdi dir="ltr">{fmt(r.fees)}</bdi></dd>
            </div>
            <div>
              <dt>{r.taxableGain >= 0 ? 'רווח חייב במס' : 'הפסד הון'}</dt>
              <dd className={`mono ${r.taxableGain >= 0 ? '' : 'is-down'}`}><bdi dir="ltr">{fmt(r.taxableGain)}</bdi></dd>
            </div>
            <div>
              <dt>מס רווחי הון (25%)</dt>
              <dd className="mono"><bdi dir="ltr">{fmt(r.tax)}</bdi></dd>
            </div>
          </dl>

          <div className="tax-calc__bottom">
            <p>
              נשאר ביד אחרי המכירה: <strong className="mono"><bdi dir="ltr">{fmt(r.netInHand)}</bdi></strong>
            </p>
            <p>
              רווח נקי על ההשקעה:{' '}
              <strong className={`mono ${r.netProfit >= 0 ? 'is-up' : 'is-down'}`}>
                <bdi dir="ltr">
                  {fmt(r.netProfit)} ({r.netReturn >= 0 ? '' : '−'}
                  {Math.abs(r.netReturn * 100).toFixed(1)}%)
                </bdi>
              </strong>
            </p>
          </div>

          {segments && total > 0 && (
            <figure className="tax-calc__split">
              <figcaption>לאן הולך הכסף מהמכירה</figcaption>
              <div className="tax-calc__bar" aria-hidden="true">
                {segments.map((s) =>
                  s.value > 0 ? (
                    <span key={s.key} className={`tax-calc__seg tax-calc__seg--${s.key}`} style={{ flexGrow: s.value }} />
                  ) : null,
                )}
              </div>
              <ul className="tax-calc__legend">
                {segments.map((s) => (
                  <li key={s.key}>
                    <span className={`tax-calc__swatch tax-calc__seg--${s.key}`} aria-hidden="true" />
                    {s.label}: <span className="mono">{fmt(s.value)}</span>
                  </li>
                ))}
              </ul>
            </figure>
          )}

          {r.taxableGain < 0 && (
            <p className="tax-calc__note">
              בעסקה בהפסד לא משלמים מס. ההפסד של <span className="mono">{fmt(-r.taxableGain)}</span> הוא הפסד הון שאפשר לקזז
              מול רווחי הון באותה שנה, או להעביר לשנים הבאות.
            </p>
          )}
        </div>
      )}
      <p className="tax-calc__caveat">
        החישוב פשוט בכוונה: שיעור של 25%, בלי הצמדה לאינפלציה, בלי השפעה של שער החליפין ובלי מס יסף. החישוב בפועל יכול
        להיות שונה.
      </p>
    </div>
  )
}
