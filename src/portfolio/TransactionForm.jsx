import { useRef, useState } from 'react'
import { usePortfolio } from './PortfolioContext.js'
import { normalizeSymbol, validateTransaction } from './portfolio.js'
import { shares as fmtShares, todayISO, usd } from './format.js'

const initial = () => ({ type: 'buy', symbol: '', date: todayISO(), mode: 'shares', quantity: '', price: '', fees: '' })

export default function TransactionForm() {
  const { transactions, addTransaction } = usePortfolio()
  const [f, setF] = useState(initial)
  const [errors, setErrors] = useState([])
  const [status, setStatus] = useState('')
  const symbolRef = useRef(null)
  const set = (key) => (e) => setF((prev) => ({ ...prev, [key]: e.target.value }))

  const price = Number(f.price)
  const quantity = Number(f.quantity)
  // בסכום בדולרים: מספר המניות הוא הסכום חלקי המחיר (מניות שבריות, כמו בבלינק)
  const shareCount = f.mode === 'amount' ? (price > 0 ? quantity / price : 0) : quantity
  const total = shareCount * price

  function submit(e) {
    e.preventDefault()
    const t = {
      type: f.type,
      symbol: normalizeSymbol(f.symbol),
      date: f.date,
      shares: Math.round(shareCount * 1e6) / 1e6,
      price,
      fees: f.fees === '' ? 0 : Number(f.fees),
    }
    const errs = validateTransaction(t, transactions, todayISO())
    setErrors(errs)
    if (errs.length) {
      setStatus('')
      return
    }
    addTransaction(t)
    setStatus(
      `נוספה ${t.type === 'buy' ? 'קנייה' : 'מכירה'} של ${fmtShares(t.shares)} מניות ${t.symbol} ב-${usd(t.price)} למניה.`,
    )
    setF((prev) => ({ ...initial(), type: prev.type, date: prev.date, mode: prev.mode }))
    symbolRef.current?.focus()
  }

  return (
    <form className="tx-form" onSubmit={submit} noValidate aria-labelledby="tx-form-title">
      <h2 id="tx-form-title" className="pf__h2">
        הוספת עסקה
      </h2>

      <div className="segmented tx-form__type" role="group" aria-label="סוג העסקה">
        {[
          ['buy', 'קנייה'],
          ['sell', 'מכירה'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="segmented__btn"
            aria-pressed={f.type === id}
            onClick={() => setF((prev) => ({ ...prev, type: id }))}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="tx-form__grid">
        <label className="tx-field">
          <span>סימול המניה</span>
          <input
            ref={symbolRef}
            type="text"
            dir="ltr"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            placeholder="AAPL"
            value={f.symbol}
            onChange={set('symbol')}
          />
        </label>
        <label className="tx-field">
          <span>תאריך העסקה</span>
          <input type="date" dir="ltr" max={todayISO()} value={f.date} onChange={set('date')} />
        </label>

        <fieldset className="tx-field tx-field--qty">
          <legend>כמות</legend>
          <div className="tx-form__mode" role="radiogroup" aria-label="איך להזין את הכמות">
            <label>
              <input type="radio" name="mode" checked={f.mode === 'shares'} onChange={() => setF((p) => ({ ...p, mode: 'shares' }))} />
              מספר מניות
            </label>
            <label>
              <input type="radio" name="mode" checked={f.mode === 'amount'} onChange={() => setF((p) => ({ ...p, mode: 'amount' }))} />
              סכום בדולרים
            </label>
          </div>
          <input
            type="number"
            dir="ltr"
            min="0"
            step="any"
            aria-label={f.mode === 'amount' ? 'סכום בדולרים' : 'מספר מניות'}
            value={f.quantity}
            onChange={set('quantity')}
          />
        </fieldset>

        <label className="tx-field">
          <span>מחיר למניה ($)</span>
          <input type="number" dir="ltr" min="0" step="any" value={f.price} onChange={set('price')} />
        </label>
        <label className="tx-field">
          <span>עמלה ($, לא חובה)</span>
          <input type="number" dir="ltr" min="0" step="any" placeholder="0" value={f.fees} onChange={set('fees')} />
        </label>
      </div>

      <p className="tx-form__preview" aria-live="polite">
        {price > 0 && quantity > 0 ? (
          <>
            {f.type === 'buy' ? 'קנייה' : 'מכירה'} של <bdi className="mono">{fmtShares(Math.round(shareCount * 1e6) / 1e6)}</bdi>{' '}
            מניות, בסך <bdi className="mono">{usd(total)}</bdi> לפני עמלה.
          </>
        ) : (
          'ממלאים כמות ומחיר, והסיכום יופיע כאן.'
        )}
      </p>

      {errors.length > 0 && (
        <ul className="tx-form__errors" role="alert">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      <div className="tx-form__actions">
        <button type="submit" className="btn btn--primary">
          הוספת העסקה
        </button>
        <p className="tx-form__status" role="status">
          {status}
        </p>
      </div>
    </form>
  )
}
