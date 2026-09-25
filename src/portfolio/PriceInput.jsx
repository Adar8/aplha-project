import { useState } from 'react'
import { usePortfolio } from './PortfolioContext.js'

/** עדכון ידני של המחיר הנוכחי למניה אחת */
export default function PriceInput({ symbol, price }) {
  const { setPrice } = usePortfolio()
  const [value, setValue] = useState(price != null ? String(price) : '')
  const [error, setError] = useState('')
  const errorId = `price-error-${symbol}`

  function submit(e) {
    e.preventDefault()
    const next = Number(value)
    if (!(next > 0)) {
      setError('המחיר צריך להיות גדול מאפס.')
      return
    }
    setError('')
    setPrice(symbol, next)
  }

  return (
    <form className="price-input" onSubmit={submit} noValidate>
      <input
        type="number"
        dir="ltr"
        min="0"
        step="any"
        value={value}
        placeholder="מחיר"
        aria-label={`מחיר נוכחי של ${symbol} בדולרים`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit" className="chip">
        עדכון
      </button>
      {error && (
        <span id={errorId} className="price-input__error">
          {error}
        </span>
      )}
    </form>
  )
}
