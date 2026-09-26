import { useEffect, useMemo, useState } from 'react'
import { useCompact } from '../../hooks/useCompact.js'
import { seededRandom } from '../../lib/seededRandom.js'
import { runTrades } from './riskMath.js'

const START = 100000
const TRADES = 50
const RUNS = 1000
const HALF = START / 2
const SAFE_RISK = 1

const shekel = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 })
const pct = (v) => `${Math.round(v * 100)}%`

const motionOff = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.style === 'calm'

function outcomesFor(seed, winRate) {
  const rand = seededRandom(seed)
  return Array.from({ length: TRADES }, () => rand() < winRate)
}

/** ב-RUNS ריצות: כמה ירדו בשלב כלשהו ביותר מ-30% מהשיא, וכמה ירדו לחצי מהתיק או פחות */
function riskOfRuin(riskPct, winRate, rr) {
  const rand = seededRandom(424242)
  let deep = 0
  let half = 0
  for (let r = 0; r < RUNS; r++) {
    let equity = START
    let peak = START
    let maxDrawdown = 0
    let hitHalf = false
    for (let t = 0; t < TRADES; t++) {
      const risk = equity * riskPct
      equity = rand() < winRate ? equity + risk * rr : equity - risk
      peak = Math.max(peak, equity)
      maxDrawdown = Math.max(maxDrawdown, 1 - equity / peak)
      if (equity <= HALF) hitHalf = true
    }
    if (maxDrawdown >= 0.3) deep++
    if (hitHalf) half++
  }
  return { deep: deep / RUNS, half: half / RUNS }
}

function Slider({ id, label, value, min, max, step, format, onChange }) {
  return (
    <div className="run-slider">
      <label htmlFor={id}>
        {label} <output className="mono" htmlFor={id}>{format(value)}</output>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}

function RunChart({ main, safe, shown, compact }) {
  const W = compact ? 360 : 680
  const H = compact ? 240 : 280
  const PAD = { top: 14, right: 64, bottom: 26, left: 10 }
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const hi = Math.max(START * 1.5, ...main.slice(0, shown + 1), ...safe.slice(0, shown + 1)) * 1.05
  const x = (i) => PAD.left + (i / TRADES) * plotW
  const y = (v) => PAD.top + (1 - v / hi) * plotH
  const points = (arr) =>
    arr
      .slice(0, shown + 1)
      .map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`)
      .join(' ')
  const ticks = [0, HALF, START, START * 1.5, START * 2, START * 3, START * 4].filter((v) => v <= hi)
  const last = main[shown]

  return (
    <svg
      className="run-chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`שווי התיק אחרי ${shown} עסקאות: ${shekel.format(last)}. באותו רצף עם סיכון של 1%: ${shekel.format(safe[shown])}.`}
    >
      {ticks.map((v) => (
        <g key={v} className={`run-chart__grid${v === HALF ? ' is-half' : ''}${v === START ? ' is-start' : ''}`}>
          <line x1={PAD.left} x2={PAD.left + plotW} y1={y(v)} y2={y(v)} />
          <text x={W - PAD.right + 6} y={y(v)} dominantBaseline="middle">
            {v === 0 ? '0' : `₪${Math.round(v / 1000)}K`}
          </text>
        </g>
      ))}
      <text className="run-chart__axis" x={PAD.left} y={H - 6}>
        0
      </text>
      <text className="run-chart__axis" x={PAD.left + plotW} y={H - 6} textAnchor="end">
        {TRADES} עסקאות
      </text>
      <polyline className="run-chart__line run-chart__line--safe" points={points(safe)} />
      <polyline className={`run-chart__line ${last >= START ? 'is-up' : 'is-down'}`} points={points(main)} />
      <circle className={`run-chart__dot ${last >= START ? 'is-up' : 'is-down'}`} cx={x(shown)} cy={y(last)} r="4" />
    </svg>
  )
}

/** 50 עסקאות בתיק אחד: אחוז הסיכון שנבחר מול 1% באותו רצף בדיוק */
export default function TradeRunSimulator() {
  const compact = useCompact()
  const [risk, setRisk] = useState(10)
  const [winRate, setWinRate] = useState(55)
  const [rr, setRr] = useState(1)
  const [seed, setSeed] = useState(6)
  const [shown, setShown] = useState(TRADES)

  const outcomes = useMemo(() => outcomesFor(seed, winRate / 100), [seed, winRate])
  const main = useMemo(() => runTrades({ capital: START, riskPct: risk / 100, rr, outcomes }), [outcomes, risk, rr])
  const safe = useMemo(() => runTrades({ capital: START, riskPct: SAFE_RISK / 100, rr, outcomes }), [outcomes, rr])
  const ruin = useMemo(() => riskOfRuin(risk / 100, winRate / 100, rr), [risk, winRate, rr])
  const ruinSafe = useMemo(() => riskOfRuin(SAFE_RISK / 100, winRate / 100, rr), [winRate, rr])

  // ״הרץ״ מצייר את העסקאות אחת אחרי השנייה, בערך שנייה וחצי. בלי תנועה: מיד
  useEffect(() => {
    if (shown >= TRADES) return
    const id = setTimeout(() => setShown((s) => Math.min(TRADES, s + 1)), 28)
    return () => clearTimeout(id)
  }, [shown])

  const run = () => {
    setSeed((s) => s + 1)
    setShown(motionOff() ? TRADES : 0)
  }

  const running = shown < TRADES
  const wins = outcomes.slice(0, shown).filter(Boolean).length
  const final = main.equity[shown]
  const change = final / START - 1
  const minEquity = Math.min(...main.equity.slice(0, shown + 1))
  const wiped = minEquity <= HALF

  return (
    <div className="widget trade-run">
      <span className="widget__tag">סימולטור</span>
      <h3 className="widget__title">50 עסקאות בתיק של ₪100,000 (תיק דמיוני)</h3>

      <div className="trade-run__controls">
        <Slider id="run-risk" label="סיכון לעסקה" value={risk} min={1} max={10} step={1} format={(v) => `${v}%`} onChange={setRisk} />
        <Slider id="run-win" label="אחוז הצלחה" value={winRate} min={30} max={70} step={5} format={(v) => `${v}%`} onChange={setWinRate} />
        <Slider
          id="run-rr"
          label="יחס רווח/סיכון"
          value={rr}
          min={0.5}
          max={3}
          step={0.5}
          format={(v) => `1:${v}`}
          onChange={setRr}
        />
      </div>

      <div className="trade-run__actions">
        <button type="button" className="btn btn--primary" onClick={run} disabled={running}>
          הרץ 50 עסקאות
        </button>
        <span className="trade-run__legend">
          <span className="trade-run__key trade-run__key--main" aria-hidden="true" /> סיכון של {risk}%
          <span className="trade-run__key trade-run__key--safe" aria-hidden="true" /> אותו רצף, סיכון של 1%
          <span className="trade-run__key trade-run__key--half" aria-hidden="true" /> חצי מהתיק
        </span>
      </div>

      <div className="trade-run__chart" dir="ltr">
        <RunChart main={main.equity} safe={safe.equity} shown={shown} compact={compact} />
      </div>

      <dl className="trade-run__stats" aria-live="polite">
        <div>
          <dt>שווי אחרי {shown} עסקאות</dt>
          <dd className={`mono ${change >= 0 ? 'is-up' : 'is-down'}`}>
            <bdi dir="ltr">
              {shekel.format(final)} ({change >= 0 ? '+' : '−'}
              {pct(Math.abs(change))})
            </bdi>
          </dd>
        </div>
        <div>
          <dt>הצלחות</dt>
          <dd className="mono">
            {wins}/{shown}
          </dd>
        </div>
        <div>
          <dt>הנקודה הנמוכה בדרך</dt>
          <dd className={`mono ${minEquity < START ? 'is-down' : ''}`}>{shekel.format(minEquity)}</dd>
        </div>
        <div>
          <dt>אותו רצף עם 1%</dt>
          <dd className="mono">{shekel.format(safe.equity[shown])}</dd>
        </div>
      </dl>

      {!running && (
        <p className={`trade-run__verdict${wiped ? ' is-bad' : ''}`}>
          {wiped
            ? `בריצה הזו התיק ירד לחצי או פחות, למרות ${winRate}% הצלחה. `
            : `בריצה הזו התיק לא ירד לחצי. `}
          ב-1,000 ריצות של 50 עסקאות עם אותן הגדרות: ב-<strong className="mono">{pct(ruin.deep)}</strong> התיק ירד
          בשלב כלשהו ביותר מ-30% מהשיא, וב-<strong className="mono">{pct(ruin.half)}</strong> הוא ירד לחצי או פחות. עם
          סיכון של 1%: <strong className="mono">{pct(ruinSafe.deep)}</strong> ו-<strong className="mono">{pct(ruinSafe.half)}</strong>.
        </p>
      )}
    </div>
  )
}
