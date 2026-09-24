import { useState } from 'react'
import { useCompact } from '../../hooks/useCompact.js'
import PriceChart from './PriceChart.jsx'
import { TIMEFRAMES } from './chartData.js'

// אותה מניה, אותו רגע — שלושה טווחי זמן, שלושה סיפורים שונים
export default function TimeframeSwitcher() {
  const compact = useCompact()
  const [id, setId] = useState(TIMEFRAMES[0].id)
  const tf = TIMEFRAMES.find((t) => t.id === id)

  return (
    <div className="widget tf">
      <span className="widget__tag" dir="ltr">
        INTERACTIVE
      </span>
      <h3 className="widget__title">אותה מניה, שלושה טווחי זמן</h3>

      <div className="segmented tf__switch" role="group" aria-label="טווח זמן של כל נר">
        {TIMEFRAMES.map((t) => (
          <button
            key={t.id}
            type="button"
            className="segmented__btn"
            aria-pressed={t.id === id}
            onClick={() => setId(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <PriceChart
        candles={tf.candles}
        size={compact ? 'compact' : 'wide'}
        label={`גרף נרות של ${tf.label}. ${tf.caption}`}
      />
      <p className="tf__caption" aria-live="polite">
        <strong>כל נר = {tf.label}.</strong> {tf.caption}
      </p>
    </div>
  )
}
