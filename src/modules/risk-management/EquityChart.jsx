// גרף הון של כמה מסלולים. ציר המחיר לוגריתמי: ירידה של 50% ועלייה של 100%
// נראות באותו גודל, וזה בדיוק מה שהמודול מלמד.
const W = 720
const H = 300
const PAD = { top: 12, bottom: 22, left: 8, right: 70 }
const FLOOR_RATIO = 0.01 // מתחת ל-1% מההון ההתחלתי — מצוירים על הרצפה

const shortShekel = (v) => {
  if (v >= 1e6) return `₪${(v / 1e6).toFixed(v >= 1e7 ? 0 : 1)}M`
  if (v >= 1e3) return `₪${Math.round(v / 1e3)}K`
  return `₪${Math.round(v)}`
}

export default function EquityChart({ paths, highlight, start, compact }) {
  const width = compact ? 400 : W
  const plotW = width - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const floor = start * FLOOR_RATIO

  let hi = start * 1.2
  let lo = start * 0.7
  for (const p of paths) {
    for (const v of p) {
      hi = Math.max(hi, v)
      lo = Math.min(lo, Math.max(v, floor))
    }
  }
  const logLo = Math.log(lo)
  const logHi = Math.log(hi)
  const y = (v) => PAD.top + ((logHi - Math.log(Math.max(v, floor))) / (logHi - logLo)) * plotH
  const n = paths[0].length - 1
  const x = (i) => PAD.left + (i / n) * plotW
  const toPoints = (p) => p.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')

  // קווי רשת: ההון ההתחלתי × 1 או × 1.5, כפול חזקות של 2 (75K, 100K, 150K, 200K...).
  // בטווח רחב מדללים עד 7 תוויות לכל היותר, ותמיד משאירים את קו ההתחלה.
  const candidates = []
  for (let k = -12; k <= 12; k++) {
    for (const m of [1, 1.5]) {
      const v = start * m * 2 ** k
      if (v >= lo * 0.999 && v <= hi * 1.001) candidates.push(v)
    }
  }
  candidates.sort((a, b) => a - b)
  const startIndex = candidates.indexOf(start)
  const every = Math.ceil(candidates.length / 7)
  const ticks = candidates.filter((v, i) => v === start || (i - startIndex) % every === 0)

  return (
    <svg className="equity-chart" viewBox={`0 0 ${width} ${H}`} role="img" aria-label="מסלולי ההון לאורך העסקאות" dir="ltr">
      {ticks.map((v) => (
        <g key={v} className={`equity-chart__grid${v === start ? ' is-start' : ''}`}>
          <line x1={PAD.left} x2={PAD.left + plotW} y1={y(v)} y2={y(v)} />
          <text x={width - PAD.right + 8} y={y(v)} dominantBaseline="middle">
            {shortShekel(v)}
          </text>
        </g>
      ))}
      <text className="equity-chart__axis" x={PAD.left} y={H - 6}>
        0
      </text>
      <text className="equity-chart__axis" x={PAD.left + plotW} y={H - 6} textAnchor="end">
        {n} עסקאות
      </text>

      {paths.map((p, i) =>
        i === highlight ? null : (
          <polyline
            key={i}
            className={`equity-chart__path ${p[p.length - 1] >= start ? 'is-up' : 'is-down'}`}
            points={toPoints(p)}
          />
        ),
      )}
      {highlight != null && <polyline className="equity-chart__path is-median" points={toPoints(paths[highlight])} />}
    </svg>
  )
}
