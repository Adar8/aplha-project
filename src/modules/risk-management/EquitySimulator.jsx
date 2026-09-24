import { useMemo, useState } from 'react'
import { useCompact } from '../../hooks/useCompact.js'
import { seededRandom } from '../../lib/seededRandom.js'
import EquityChart from './EquityChart.jsx'
import { breakEvenWinRate, expectancy, median, runTrades } from './riskMath.js'

const START = 100000
const PATHS = 20
const TRADES = 100

const PRESETS = [
  { label: 'זהיר', risk: 1 },
  { label: 'אגרסיבי', risk: 5 },
  { label: 'הימורי', risk: 20 },
]

const shekel = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 })

function Slider({ id, label, value, min, max, step, suffix, onChange, tone }) {
  return (
    <div className={`eq-slider eq-slider--${tone}`}>
      <label htmlFor={id}>
        {label} <output className="mono">{value}{suffix}</output>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}

export default function EquitySimulator() {
  const compact = useCompact()
  const [risk, setRisk] = useState(1)
  const [winRate, setWinRate] = useState(45)
  const [rr, setRr] = useState(2)
  const [seed, setSeed] = useState(7)

  // המספרים האקראיים נקבעים לפי ה-seed בלבד. שינוי אחוז הסיכון משאיר את אותו "מזל" —
  // אותו רצף של הצלחות וכישלונות — כך שרואים בדיוק מה הסיכון עושה.
  const uniforms = useMemo(() => {
    const rand = seededRandom(seed)
    return Array.from({ length: PATHS }, () => Array.from({ length: TRADES }, rand))
  }, [seed])

  const results = useMemo(
    () =>
      uniforms.map((u) =>
        runTrades({ capital: START, riskPct: risk / 100, rr, outcomes: u.map((x) => x < winRate / 100) }),
      ),
    [uniforms, risk, rr, winRate],
  )

  const finals = results.map((r) => r.finalEquity)
  const medianFinal = median(finals)
  const medianIndex = finals.indexOf([...finals].sort((a, b) => a - b)[Math.floor(PATHS / 2)])
  const worst = Math.min(...finals)
  const deepDrawdown = results.filter((r) => r.maxDrawdown > 0.5).length
  const losing = finals.filter((f) => f < START).length
  const longestStreak = Math.max(...results.map((r) => r.longestLosingStreak))
  const exp = expectancy(winRate / 100, rr)
  const breakEven = breakEvenWinRate(rr)

  return (
    <div className="widget equity">
      <span className="widget__tag" dir="ltr">
        SIMULATOR
      </span>
      <h3 className="widget__title">100 עסקאות, 20 עתידים אפשריים</h3>

      <div className="equity__controls">
        <Slider id="eq-risk" label="סיכון לעסקה" value={risk} min={0.5} max={40} step={0.5} suffix="%" onChange={setRisk} tone="down" />
        <Slider id="eq-win" label="אחוז הצלחה" value={winRate} min={20} max={80} step={5} suffix="%" onChange={setWinRate} tone="up" />
        <Slider id="eq-rr" label="רווח בהצלחה (ב-R)" value={rr} min={0.5} max={4} step={0.5} suffix="R" onChange={setRr} tone="purple" />
      </div>

      <div className="equity__presets" role="group" aria-label="רמות סיכון מוכנות">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" className="chip" aria-pressed={risk === p.risk} onClick={() => setRisk(p.risk)}>
            {p.label} <span className="mono">{p.risk}%</span>
          </button>
        ))}
        <button type="button" className="btn btn--ghost btn--small" onClick={() => setSeed((s) => s + 1)}>
          🎲 מזל אחר
        </button>
      </div>

      <p className={`equity__edge ${exp > 0 ? 'is-positive' : 'is-negative'}`} aria-live="polite">
        {exp > 0 ? (
          <>
            לשיטה יש יתרון: בממוצע <span className="mono">+{exp.toFixed(2)}R</span> לעסקה. אחוז ההצלחה המינימלי כדי לא
            להפסיד ביחס הזה: <span className="mono">{Math.round(breakEven * 100)}%</span>.
          </>
        ) : (
          <>
            לשיטה <strong>אין</strong> יתרון: בממוצע <span className="mono">{exp.toFixed(2)}R</span> לעסקה. צריך לפחות{' '}
            <span className="mono">{Math.round(breakEven * 100)}%</span> הצלחה ביחס הזה. שום ניהול סיכונים לא יציל שיטה כזו,
            הוא רק קובע כמה מהר תפסידו.
          </>
        )}
      </p>

      <EquityChart paths={results.map((r) => r.equity)} highlight={medianIndex} start={START} compact={compact} />
      <p className="equity__legend">
        כל קו הוא עתיד אפשרי אחד. <span className="equity__swatch equity__swatch--median" /> הקו המודגש הוא המסלול
        החציוני. <span className="equity__swatch equity__swatch--up" /> סיים ברווח,{' '}
        <span className="equity__swatch equity__swatch--down" /> סיים בהפסד.
      </p>

      <dl className="equity__stats">
        <div>
          <dt>תוצאה חציונית</dt>
          <dd className={`mono ${medianFinal >= START ? 'is-up' : 'is-down'}`}>{shekel.format(medianFinal)}</dd>
        </div>
        <div>
          <dt>המסלול הגרוע</dt>
          <dd className={`mono ${worst >= START ? 'is-up' : 'is-down'}`}>{shekel.format(worst)}</dd>
        </div>
        <div>
          <dt>ירדו ביותר מ-50% בדרך</dt>
          <dd className={`mono ${deepDrawdown ? 'is-down' : ''}`}>
            <bdi>
              {deepDrawdown}/{PATHS}
            </bdi>
          </dd>
        </div>
        <div>
          <dt>סיימו בהפסד</dt>
          <dd className={`mono ${losing ? 'is-down' : ''}`}>
            <bdi>
              {losing}/{PATHS}
            </bdi>
          </dd>
        </div>
        <div>
          <dt>רצף הפסדים הכי ארוך</dt>
          <dd className="mono">{longestStreak}</dd>
        </div>
      </dl>
    </div>
  )
}
