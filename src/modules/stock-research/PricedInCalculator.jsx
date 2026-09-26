import { useState } from 'react'
import { COMPANY } from './company.js'
import { pct, usdM } from './format.js'
import { cagr, dcfValue, impliedGrowth, yearMetrics } from './research.js'

const YEARS = 10
const TERMINAL = 0.025
const last = yearMetrics(COMPANY.years.at(-1))
const first = COMPANY.years[0]
const REVENUE_CAGR = cagr(first.revenue, last.revenue, COMPANY.years.length - 1)
const LAST_GROWTH = last.revenue / COMPANY.years.at(-2).revenue - 1
const SCALE_MAX = 0.35 // סוף הציר: 35% צמיחה בשנה

const GROWTHS = [0.05, 0.1, 0.15, 0.2]
const DISCOUNTS = [0.08, 0.09, 0.1]

/** שווי למניה: שווי הפירמה מה-DCF, פחות החוב נטו, חלקי מספר המניות */
function valuePerShare(fcf, growth, discount) {
  return (dcfValue({ fcf, growth, discount, years: YEARS, terminalGrowth: TERMINAL }) - last.netDebt) / last.shares
}

function Marker({ value, label, kind }) {
  const at = Math.min(Math.max(value, 0), SCALE_MAX) / SCALE_MAX
  // בחצי הימני התווית נפתחת שמאלה, כדי שלא תצא מהקופסה
  return (
    <span
      className={`scale__mark scale__mark--${kind}${at > 0.5 ? ' scale__mark--flip' : ''}`}
      style={{ insetInlineStart: `${at * 100}%` }}
    >
      <span className="scale__label">
        {label} <bdi className="mono">{pct(value)}</bdi>
      </span>
    </span>
  )
}

export default function PricedInCalculator() {
  const [price, setPrice] = useState(COMPANY.price)
  const [discount, setDiscount] = useState(0.09)
  const [sbcAsCost, setSbcAsCost] = useState(false)
  const [myGrowth, setMyGrowth] = useState(0.1)

  const fcf = sbcAsCost ? last.fcfAfterSbc : last.fcf
  const ev = price * last.shares + last.netDebt
  const implied = impliedGrowth({ value: ev, fcf, discount, years: YEARS, terminalGrowth: TERMINAL })
  const myValue = valuePerShare(fcf, myGrowth, discount)

  return (
    <div className="widget priced">
      <span className="widget__tag">
        מחשבון
      </span>
      <h3 className="widget__title">מה המחיר מניח?</h3>
      <p className="priced__intro">
        במקום לנחש כמה {COMPANY.name} ״שווה״, הופכים את השאלה: באיזה קצב התזרים החופשי שלה צריך לצמוח ב-{YEARS} השנים
        הבאות כדי שהמחיר של היום יהיה הגיוני? אחרי זה מניחים צמיחה של{' '}
        <bdi className="mono">{pct(TERMINAL)}</bdi> בשנה לתמיד.
      </p>

      <div className="priced__controls">
        <label className="priced__slider">
          <span className="priced__slider-head">
            מחיר המניה <output className="mono">${price}</output>
          </span>
          <input type="range" min="20" max="120" step="1" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </label>
        <label className="priced__slider">
          <span className="priced__slider-head">
            שיעור היוון (התשואה שמשקיע דורש) <output className="mono">{pct(discount)}</output>
          </span>
          <input
            type="range"
            min="0.07"
            max="0.12"
            step="0.005"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
          />
        </label>
        <label className="priced__toggle">
          <input type="checkbox" checked={sbcAsCost} onChange={(e) => setSbcAsCost(e.target.checked)} />
          להתייחס לתגמול במניות כהוצאה: תזרים של <bdi className="mono">{usdM(last.fcfAfterSbc)}</bdi> במקום{' '}
          <bdi className="mono">{usdM(last.fcf)}</bdi>
        </label>
      </div>

      <div className="priced__result">
        <p className="priced__big">
          המחיר מניח צמיחה של{' '}
          <bdi className="mono is-lime">{implied == null ? 'מחוץ לטווח' : pct(implied)}</bdi> בשנה בתזרים החופשי, במשך{' '}
          {YEARS} שנים.
        </p>
        <div className="scale" dir="ltr" aria-hidden="true">
          <span className="scale__track" />
          {implied != null && <Marker value={implied} label="המחיר מניח" kind="implied" />}
          <Marker value={REVENUE_CAGR} label="צמיחת הכנסות, 4 שנים" kind="history" />
          <Marker value={LAST_GROWTH} label="שנה אחרונה" kind="recent" />
        </div>
        <p className="priced__compare">
          להשוואה: ההכנסות צמחו ב-<bdi className="mono">{pct(REVENUE_CAGR)}</bdi> בשנה בממוצע, וב-
          <bdi className="mono">{pct(LAST_GROWTH)}</bdi> בשנה האחרונה.
        </p>
      </div>

      <h4 className="priced__subtitle">ומה אם אני מניח משהו אחר?</h4>
      <label className="priced__slider">
        <span className="priced__slider-head">
          הצמיחה שאני מניח לתזרים <output className="mono">{pct(myGrowth, 0)}</output>
        </span>
        <input
          type="range"
          min="0"
          max="0.3"
          step="0.01"
          value={myGrowth}
          onChange={(e) => setMyGrowth(Number(e.target.value))}
        />
      </label>
      <p className="priced__my">
        בהנחה הזו השווי יוצא{' '}
        <bdi className="mono is-lime">${Math.max(myValue, 0).toFixed(0)}</bdi> למניה,
        לעומת מחיר של <bdi className="mono">${price}</bdi>.
      </p>

      <div className="fin-wrap" tabIndex={0} role="region" aria-label="טבלת רגישות: שווי למניה לפי צמיחה ושיעור היוון">
        <table className="fin priced__grid">
          <caption>שווי למניה לפי צמיחה ושיעור היוון: שינוי קטן בהנחה, הבדל גדול בתוצאה</caption>
          <thead>
            <tr>
              <td />
              {GROWTHS.map((g) => (
                <th key={g} scope="col" className="mono">
                  <bdi>צמיחה {pct(g, 0)}</bdi>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DISCOUNTS.map((d) => (
              <tr key={d}>
                <th scope="row" className="mono">
                  <bdi>היוון {pct(d, 0)}</bdi>
                </th>
                {GROWTHS.map((g) => (
                  <td key={g} className="mono">
                    ${Math.max(valuePerShare(fcf, g, d), 0).toFixed(0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
