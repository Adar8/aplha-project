import { useState } from 'react'

const TOTAL_SHARES = 1_000_000
const PROFIT_DISTRIBUTED = 2_000_000 // ₪ שהחברה מחליטה לחלק כדיבידנד
const SHARE_PRICE = 40

const number = new Intl.NumberFormat('he-IL')
const shekel = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 })

export default function OwnershipCalculator() {
  const [shares, setShares] = useState(5_000)

  const ownership = shares / TOTAL_SHARES
  const dividend = ownership * PROFIT_DISTRIBUTED
  const cost = shares * SHARE_PRICE

  return (
    <div className="widget ownership">
      <span className="widget__tag" dir="ltr">
        INTERACTIVE
      </span>
      <h3 className="widget__title">כמה מהחברה שלכם?</h3>
      <p className="ownership__setup">
        ל״פיצה אלפא בע״מ״ יש <span className="mono">{number.format(TOTAL_SHARES)}</span> מניות.
        כל מניה עולה <span className="mono">{shekel.format(SHARE_PRICE)}</span>, והשנה החברה
        מחלקת <span className="mono">{shekel.format(PROFIT_DISTRIBUTED)}</span> מהרווח שלה לבעלי
        המניות.
      </p>

      <label htmlFor="ownership-shares" className="ownership__label">
        כמה מניות קניתם? <output className="mono">{number.format(shares)}</output>
      </label>
      <input
        id="ownership-shares"
        type="range"
        min="100"
        max="250000"
        step="100"
        value={shares}
        onChange={(e) => setShares(Number(e.target.value))}
      />

      <div className="ownership__bar" aria-hidden="true">
        <span style={{ inlineSize: `max(4px, ${ownership * 100}%)` }} />
      </div>

      <dl className="ownership__results">
        <div>
          <dt>החלק שלכם בחברה</dt>
          <dd className="mono">{(ownership * 100).toLocaleString('he-IL', { maximumFractionDigits: 2 })}%</dd>
        </div>
        <div>
          <dt>עלות הקנייה</dt>
          <dd className="mono">{shekel.format(cost)}</dd>
        </div>
        <div>
          <dt>הדיבידנד שלכם השנה</dt>
          <dd className="mono is-lime">{shekel.format(dividend)}</dd>
        </div>
        <div>
          <dt>קולות באסיפה הכללית</dt>
          <dd className="mono">{number.format(shares)}</dd>
        </div>
      </dl>
    </div>
  )
}
