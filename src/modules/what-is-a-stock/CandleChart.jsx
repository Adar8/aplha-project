import { MAX_CANDLES, isUp } from './simulation.js'

const PAD = { top: 16, bottom: 16, left: 12, right: 64 }
const GRID_LINES = 4

// במסך צר: פחות נרות ויחס גובה-רוחב אחר, כדי שהטקסט בגרף יישאר קריא
const SIZES = {
  wide: { width: 640, height: 280, visible: MAX_CANDLES },
  compact: { width: 360, height: 260, visible: 9 },
}

function priceRange(candles) {
  let min = Infinity
  let max = -Infinity
  for (const c of candles) {
    min = Math.min(min, c.low)
    max = Math.max(max, c.high)
  }
  // טווח מינימלי של 2% כדי שתנודות זעירות לא ייראו כמו קריסה
  const mid = (min + max) / 2
  const minSpan = mid * 0.02
  if (max - min < minSpan) {
    min = mid - minSpan / 2
    max = mid + minSpan / 2
  }
  const pad = (max - min) * 0.1
  return { min: min - pad, max: max + pad }
}

// גרף נרות. בכוונה LTR — כך נראים כל גרפי המסחר, גם בממשקים בעברית.
export default function CandleChart({ candles, current, price, compact = false }) {
  const { width, height, visible } = compact ? SIZES.compact : SIZES.wide
  const plotW = width - PAD.left - PAD.right
  const plotH = height - PAD.top - PAD.bottom

  const all = [...candles, current].slice(-visible)
  const { min, max } = priceRange(all)
  const y = (p) => PAD.top + ((max - p) / (max - min)) * plotH
  const slot = plotW / visible
  const bodyW = slot * 0.6

  const gridPrices = Array.from(
    { length: GRID_LINES + 1 },
    (_, i) => min + ((max - min) * i) / GRID_LINES,
  )

  const liveUp = isUp(current)

  return (
    <svg
      className="candle-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`גרף נרות. מחיר אחרון ${price.toFixed(2)}. הנר הנוכחי ${liveUp ? 'עולה' : 'יורד'}.`}
      dir="ltr"
    >
      {gridPrices.map((p) => (
        <g key={p} className="candle-chart__grid">
          <line x1={PAD.left} x2={PAD.left + plotW} y1={y(p)} y2={y(p)} />
          <text x={width - PAD.right + 8} y={y(p)} dominantBaseline="middle">
            {p.toFixed(2)}
          </text>
        </g>
      ))}

      {all.map((c, i) => {
        const cx = PAD.left + i * slot + slot / 2
        const up = isUp(c)
        const top = y(Math.max(c.open, c.close))
        const bottom = y(Math.min(c.open, c.close))
        const isLive = i === all.length - 1
        return (
          <g
            key={i}
            className={`candle ${up ? 'candle--up' : 'candle--down'}${isLive ? ' candle--live' : ''}`}
          >
            <line className="candle__wick" x1={cx} x2={cx} y1={y(c.high)} y2={y(c.low)} />
            <rect
              className="candle__body"
              x={cx - bodyW / 2}
              y={top}
              width={bodyW}
              height={Math.max(1.5, bottom - top)}
              rx={1.5}
            />
          </g>
        )
      })}

      <g className="candle-chart__last">
        <line x1={PAD.left} x2={PAD.left + plotW} y1={y(price)} y2={y(price)} />
        <rect x={width - PAD.right + 2} y={y(price) - 10} width={PAD.right - 4} height={20} rx={4} />
        <text x={width - PAD.right / 2} y={y(price)} dominantBaseline="middle" textAnchor="middle">
          {price.toFixed(2)}
        </text>
      </g>
    </svg>
  )
}
