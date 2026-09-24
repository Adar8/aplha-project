import { useRef } from 'react'
import './PriceChart.css'

const PAD = { top: 14, bottom: 10, left: 8, right: 60 }
const SIZES = {
  wide: { width: 720, price: 300, volume: 64 },
  compact: { width: 380, price: 280, volume: 56 },
  mini: { width: 320, price: 150, volume: 0 },
}

function niceRange(candles) {
  let min = Infinity
  let max = -Infinity
  for (const c of candles) {
    min = Math.min(min, c.low)
    max = Math.max(max, c.high)
  }
  const pad = (max - min) * 0.08
  return { min: min - pad, max: max + pad }
}

/**
 * גרף נרות עם נפח מסחר, קווים שהמשתמש סימן ואזורי תשובה.
 * בכוונה LTR — כך נראים גרפי מסחר גם בממשק בעברית.
 *
 * @param candles   הנרות להצגה
 * @param slots     כמה "משבצות" זמן לשמור ברוחב (לנרות עתידיים שעוד לא נחשפו)
 * @param lines     [{ price, tone: 'up'|'down'|'flip', label, active }] — קווים של המשתמש
 * @param zones     [{ price, width, tone }] — אזורי התשובה הנכונה
 * @param onPick    (price) => void — לחיצה על הגרף מחזירה את המחיר בנקודה
 * @param range     { min, max } קבוע (אחרת מחושב מהנרות)
 */
export default function PriceChart({
  candles,
  slots = candles.length,
  size = 'wide',
  showVolume = true,
  lines = [],
  zones = [],
  onPick,
  range,
  label,
}) {
  const svgRef = useRef(null)
  const dims = SIZES[size]
  const volumeH = showVolume ? dims.volume : 0
  const height = dims.price + volumeH
  const plotW = dims.width - PAD.left - PAD.right
  const plotH = dims.price - PAD.top - PAD.bottom
  const { min, max } = range ?? niceRange(candles)

  const y = (p) => PAD.top + ((max - p) / (max - min)) * plotH
  const slot = plotW / slots
  const bodyW = Math.max(1.5, slot * 0.62)
  const x = (i) => PAD.left + i * slot + slot / 2
  const maxVolume = Math.max(...candles.map((c) => c.volume), 1)
  const gridPrices = Array.from({ length: 5 }, (_, i) => min + ((max - min) * i) / 4)
  const futureX = PAD.left + candles.length * slot

  const handleClick = (e) => {
    if (!onPick) return
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const local = pt.matrixTransform(svg.getScreenCTM().inverse())
    if (local.y < PAD.top || local.y > PAD.top + plotH) return
    const price = max - ((local.y - PAD.top) / plotH) * (max - min)
    onPick(Math.round(price * 100) / 100)
  }

  return (
    <svg
      ref={svgRef}
      className={`price-chart${onPick ? ' price-chart--pickable' : ''}`}
      viewBox={`0 0 ${dims.width} ${height}`}
      role="img"
      aria-label={label}
      dir="ltr"
      onClick={handleClick}
    >
      {gridPrices.map((p) => (
        <g key={p} className="price-chart__grid">
          <line x1={PAD.left} x2={PAD.left + plotW} y1={y(p)} y2={y(p)} />
          <text x={dims.width - PAD.right + 8} y={y(p)} dominantBaseline="middle">
            {p.toFixed(2)}
          </text>
        </g>
      ))}

      {slots > candles.length && (
        <g className="price-chart__future">
          <rect x={futureX} y={PAD.top} width={PAD.left + plotW - futureX} height={plotH + volumeH} />
          <text x={futureX + (PAD.left + plotW - futureX) / 2} y={PAD.top + plotH / 2} textAnchor="middle">
            ?
          </text>
        </g>
      )}

      {zones.map((z) => (
        <rect
          key={`z${z.price}`}
          className={`price-chart__zone price-chart__zone--${z.tone}`}
          x={PAD.left}
          width={plotW}
          y={y(z.price + z.width)}
          height={Math.max(2, y(z.price - z.width) - y(z.price + z.width))}
        />
      ))}

      {showVolume &&
        candles.map((c, i) => {
          const h = (c.volume / maxVolume) * (volumeH - 8)
          return (
            <rect
              key={`v${i}`}
              className={`price-chart__vol ${c.close >= c.open ? 'is-up' : 'is-down'}`}
              x={x(i) - bodyW / 2}
              y={height - h - 2}
              width={bodyW}
              height={h}
            />
          )
        })}

      {candles.map((c, i) => {
        const up = c.close >= c.open
        const top = y(Math.max(c.open, c.close))
        const bottom = y(Math.min(c.open, c.close))
        return (
          <g key={i} className={`price-chart__candle ${up ? 'is-up' : 'is-down'}`}>
            <line x1={x(i)} x2={x(i)} y1={y(c.high)} y2={y(c.low)} />
            <rect x={x(i) - bodyW / 2} y={top} width={bodyW} height={Math.max(1.2, bottom - top)} rx={1} />
          </g>
        )
      })}

      {lines.map((l) => (
        <g
          key={l.label}
          className={`price-chart__line price-chart__line--${l.tone}${l.active ? ' is-active' : ''}`}
        >
          <line x1={PAD.left} x2={PAD.left + plotW} y1={y(l.price)} y2={y(l.price)} />
          <rect x={dims.width - PAD.right + 2} y={y(l.price) - 10} width={PAD.right - 4} height={20} rx={4} />
          <text x={dims.width - PAD.right / 2} y={y(l.price)} dominantBaseline="middle" textAnchor="middle">
            {l.price.toFixed(2)}
          </text>
        </g>
      ))}
    </svg>
  )
}
