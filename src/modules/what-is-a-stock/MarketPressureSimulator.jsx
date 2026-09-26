import { useEffect, useRef, useState } from 'react'
import { useCompact } from '../../hooks/useCompact.js'
import CandleChart from './CandleChart.jsx'
import {
  START_PRICE,
  TICK_MS,
  TICKS_PER_CANDLE,
  activityLevel,
  createMarket,
  imbalance,
  isUp,
  quote,
  stepMarket,
} from './simulation.js'
import './MarketPressureSimulator.css'

const PRESETS = [
  { label: 'הקונים משתלטים', buyers: 85, sellers: 20 },
  { label: 'המוכרים משתלטים', buyers: 20, sellers: 85 },
  { label: 'שוק מאוזן', buyers: 50, sellers: 50 },
  { label: 'שוק רדום', buyers: 5, sellers: 5 },
]

function describeMarket(pressure) {
  if (activityLevel(pressure) < 0.08) return { text: 'כמעט אין מסחר, המחיר קפוא', tone: 'muted' }
  const i = imbalance(pressure)
  if (i > 0.4) return { text: 'לחץ קנייה חזק, המחיר מטפס', tone: 'up' }
  if (i > 0.1) return { text: 'יותר קונים ממוכרים: נטייה לעלייה', tone: 'up' }
  if (i < -0.4) return { text: 'לחץ מכירה חזק, המחיר צונח', tone: 'down' }
  if (i < -0.1) return { text: 'יותר מוכרים מקונים: נטייה לירידה', tone: 'down' }
  return { text: 'שיווי משקל, המחיר מדשדש', tone: 'muted' }
}

function PressureSlider({ id, label, hint, value, onChange, tone }) {
  return (
    <div className={`pressure pressure--${tone}`}>
      <div className="pressure__head">
        <label htmlFor={id} className="pressure__label">
          {label}
        </label>
        <output htmlFor={id} className="pressure__value mono">
          {value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-describedby={`${id}-hint`}
      />
      <p id={`${id}-hint`} className="pressure__hint">
        {hint}
      </p>
    </div>
  )
}

export default function MarketPressureSimulator() {
  const compact = useCompact()
  const [pressure, setPressure] = useState({ buyers: 60, sellers: 40 })
  const [market, setMarket] = useState(() => createMarket())
  // מי שביקש במערכת להפחית תנועה מקבל את הסימולטור עצור, ומפעיל אותו בעצמו
  const [running, setRunning] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  // ה-interval קורא את הלחץ העדכני דרך ref, כדי לא לאתחל את הטיימר בכל הזזת סליידר
  const pressureRef = useRef(pressure)
  useEffect(() => {
    pressureRef.current = pressure
  }, [pressure])

  useEffect(() => {
    if (!running) return undefined
    const id = window.setInterval(() => {
      const noise = Math.random() * 2 - 1
      const p = pressureRef.current
      setMarket((m) => stepMarket(m, p, noise))
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [running])

  const { price, current, candles } = market
  const { bid, ask, spread } = quote(price, pressure)
  const change = ((current.close - current.open) / current.open) * 100
  const status = describeMarket(pressure)
  const candleProgress = current.ticks / TICKS_PER_CANDLE
  const liveUp = isUp(current)

  const reset = () => setMarket(createMarket(START_PRICE))

  return (
    <div className="widget simulator">
      <span className="widget__tag">
        סימולטור
      </span>
      <h3 className="widget__title">לחץ קונים מול מוכרים</h3>

      <div className="simulator__layout">
        <div className="simulator__chart">
          <div className="simulator__ticker" dir="ltr">
            <span className="simulator__symbol">ALPHA</span>
            <span className="simulator__price">{price.toFixed(2)}</span>
            <span className={`simulator__change ${liveUp ? 'is-up' : 'is-down'}`}>
              {change >= 0 ? '+' : ''}
              {change.toFixed(2)}%
            </span>
          </div>

          <CandleChart candles={candles} current={current} price={price} compact={compact} />

          <div className="simulator__candle-timer" aria-hidden="true">
            <span style={{ inlineSize: `${candleProgress * 100}%` }} />
          </div>
          <p className="simulator__caption">
            הנר הימני ביותר הוא הנר הנוכחי. הוא נבנה עכשיו ונסגר כל{' '}
            <span className="mono">{(TICKS_PER_CANDLE * TICK_MS) / 1000}</span> שניות.
          </p>
        </div>

        <div className="simulator__panel">
          <p className={`simulator__status is-${status.tone}`} aria-live="polite">
            {status.text}
          </p>

          <PressureSlider
            id="buyers"
            label="לחץ קונים"
            hint="כמה קונים רוצים להיכנס, ועד כמה הם מוכנים לשלם יותר"
            value={pressure.buyers}
            tone="up"
            onChange={(buyers) => setPressure((p) => ({ ...p, buyers }))}
          />
          <PressureSlider
            id="sellers"
            label="לחץ מוכרים"
            hint="כמה מוכרים רוצים לצאת, ועד כמה הם מוכנים לקבל פחות"
            value={pressure.sellers}
            tone="down"
            onChange={(sellers) => setPressure((p) => ({ ...p, sellers }))}
          />

          <div className="simulator__presets" role="group" aria-label="תרחישים מוכנים">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="btn btn--ghost btn--small"
                aria-pressed={
                  preset.buyers === pressure.buyers && preset.sellers === pressure.sellers
                }
                onClick={() => setPressure({ buyers: preset.buyers, sellers: preset.sellers })}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <dl className="simulator__quote">
            <div>
              <dt>
                ביקוש <bdi className="mono">(Bid)</bdi>
              </dt>
              <dd className="mono is-up">{bid.toFixed(2)}</dd>
            </div>
            <div>
              <dt>
                היצע <bdi className="mono">(Ask)</bdi>
              </dt>
              <dd className="mono is-down">{ask.toFixed(2)}</dd>
            </div>
            <div>
              <dt>
                מרווח <bdi className="mono">(Spread)</bdi>
              </dt>
              <dd className="mono">{spread.toFixed(2)}</dd>
            </div>
          </dl>

          <dl className="simulator__ohlc" dir="ltr" aria-label="נתוני הנר הנוכחי">
            <div>
              <dt>O</dt>
              <dd>{current.open.toFixed(2)}</dd>
            </div>
            <div>
              <dt>H</dt>
              <dd>{current.high.toFixed(2)}</dd>
            </div>
            <div>
              <dt>L</dt>
              <dd>{current.low.toFixed(2)}</dd>
            </div>
            <div>
              <dt>C</dt>
              <dd>{current.close.toFixed(2)}</dd>
            </div>
          </dl>

          <div className="simulator__actions">
            <button type="button" className="btn btn--ghost btn--small" onClick={() => setRunning((r) => !r)}>
              {running ? 'השהיה' : 'המשך'}
            </button>
            <button type="button" className="btn btn--ghost btn--small" onClick={reset}>
              התחלה מחדש
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
