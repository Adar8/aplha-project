import { useState } from 'react'
import { useCompact } from '../../hooks/useCompact.js'
import PriceChart from './PriceChart.jsx'
import { LEVEL_META, SCENARIOS, TOLERANCE, countTouches, gradeLevel } from './chartData.js'

const GRADE_TEXT = {
  exact: { label: 'מדויק', tone: 'is-lime' },
  close: { label: '≈ קרוב', tone: 'is-amber' },
  far: { label: 'רחוק', tone: 'is-down' },
}

function TouchCount({ count }) {
  if (count === 0) return 'המחיר לא נגע בה'
  if (count === 1) return 'המחיר נגע בה פעם אחת'
  return (
    <>
      המחיר נגע בה <span className="mono">{count}</span> פעמים
    </>
  )
}

function rangeOf(candles) {
  let min = Infinity
  let max = -Infinity
  for (const c of candles) {
    min = Math.min(min, c.low)
    max = Math.max(max, c.high)
  }
  const pad = (max - min) * 0.08
  return { min: min - pad, max: max + pad }
}

const emptyGuesses = (scenario) => Object.fromEntries(scenario.levels.map((l) => [l.kind, null]))

export default function LevelsSimulator() {
  const compact = useCompact()
  const [index, setIndex] = useState(0)
  const scenario = SCENARIOS[index]
  const [guesses, setGuesses] = useState(() => emptyGuesses(scenario))
  const [active, setActive] = useState(scenario.levels[0].kind)
  const [checked, setChecked] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const visible = scenario.candles.slice(0, scenario.visible)
  const shown = revealed ? scenario.candles : visible
  const range = rangeOf(shown)
  const allPlaced = scenario.levels.every((l) => guesses[l.kind] != null)

  const goTo = (i) => {
    const next = SCENARIOS[i]
    setIndex(i)
    setGuesses(emptyGuesses(next))
    setActive(next.levels[0].kind)
    setChecked(false)
    setRevealed(false)
  }

  const place = (kind, price) => {
    if (checked) return
    const updated = { ...guesses, [kind]: Math.round(price * 100) / 100 }
    setGuesses(updated)
    // אחרי סימון, עוברים אוטומטית לקו הבא שעוד לא סומן
    const nextEmpty = scenario.levels.find((l) => updated[l.kind] == null)
    if (nextEmpty) setActive(nextEmpty.kind)
  }

  const nudge = (kind, direction) => {
    const current = guesses[kind] ?? (range.min + range.max) / 2
    const step = Math.max(0.01, Math.round(current * 0.001 * 100) / 100)
    place(kind, current + direction * step)
  }

  const lines = scenario.levels
    .filter((l) => guesses[l.kind] != null)
    .map((l) => ({
      price: guesses[l.kind],
      tone: LEVEL_META[l.kind].tone,
      label: l.kind,
      active: !checked && active === l.kind,
    }))

  const zones = checked
    ? scenario.levels.map((l) => ({ price: l.price, width: l.price * TOLERANCE, tone: 'answer' }))
    : []

  return (
    <div className="widget levels">
      <span className="widget__tag" dir="ltr">
        SIMULATOR
      </span>
      <h3 className="widget__title">סמנו תמיכה והתנגדות</h3>

      <div className="levels__steps" role="group" aria-label="תרחישים">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className="chip"
            aria-pressed={i === index}
            onClick={() => goTo(i)}
          >
            <span className="mono">{i + 1}</span> {s.title}
          </button>
        ))}
      </div>

      <p className="levels__prompt">{scenario.prompt}</p>

      <PriceChart
        candles={shown}
        slots={scenario.candles.length}
        size={compact ? 'compact' : 'wide'}
        lines={lines}
        zones={zones}
        range={range}
        onPick={checked ? undefined : (price) => place(active, price)}
        label={`תרחיש ${index + 1}: ${scenario.title}. ${revealed ? 'כולל ההמשך.' : 'ההמשך מוסתר.'}`}
      />

      {!checked && (
        <p className="levels__hint">
          לחצו על הגרף כדי למקם את הקו המודגש, וכוונו עם הכפתורים + ו-−. האזור המקווקו מימין הוא העתיד, ועוד לא
          רואים אותו.
        </p>
      )}

      <div className="levels__controls">
        {scenario.levels.map((level) => {
          const meta = LEVEL_META[level.kind]
          const guess = guesses[level.kind]
          const grade = checked && guess != null ? gradeLevel(guess, level.price) : null
          return (
            <div
              key={level.kind}
              className={`level-row level-row--${meta.tone}${active === level.kind && !checked ? ' is-active' : ''}`}
            >
              <button
                type="button"
                className="level-row__pick"
                aria-pressed={active === level.kind}
                disabled={checked}
                onClick={() => setActive(level.kind)}
              >
                {meta.label} <bdi className="mono">({meta.en})</bdi>
              </button>
              <div className="level-row__value">
                <button
                  type="button"
                  className="chip"
                  aria-label={`הורידו את קו ה${meta.label}`}
                  disabled={checked}
                  onClick={() => nudge(level.kind, -1)}
                >
                  −
                </button>
                <bdi className="level-row__price mono">{guess != null ? guess.toFixed(2) : '—'}</bdi>
                <button
                  type="button"
                  className="chip"
                  aria-label={`הרימו את קו ה${meta.label}`}
                  disabled={checked}
                  onClick={() => nudge(level.kind, 1)}
                >
                  +
                </button>
              </div>
              {grade && (
                <p className="level-row__grade">
                  <strong className={GRADE_TEXT[grade].tone}>{GRADE_TEXT[grade].label}</strong>{' '}
                  הרמה: <bdi className="mono">{level.price.toFixed(2)}</bdi> ·{' '}
                  <TouchCount count={countTouches(visible, level.price, level.kind)} />
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="levels__actions">
        {!checked && (
          <button type="button" className="btn btn--primary" disabled={!allPlaced} onClick={() => setChecked(true)}>
            בדקו את הסימון
          </button>
        )}
        {checked && !revealed && (
          <button type="button" className="btn btn--primary" onClick={() => setRevealed(true)}>
            מה קרה אחר כך?
          </button>
        )}
        {checked && (
          <button type="button" className="btn btn--ghost btn--small" onClick={() => goTo(index)}>
            נסו שוב
          </button>
        )}
        {revealed && index < SCENARIOS.length - 1 && (
          <button type="button" className="btn btn--ghost btn--small" onClick={() => goTo(index + 1)}>
            לתרחיש הבא ←
          </button>
        )}
      </div>

      {checked && (
        <p className="levels__zone-note">
          האזור הירוק הוא הרמה הנכונה, עם מרווח של <span className="mono">{TOLERANCE * 100}%</span> לכל
          כיוון: תמיכה והתנגדות הן אזורים, לא קו מדויק.
        </p>
      )}

      {revealed && (
        <div className="levels__reveal" aria-live="polite">
          <p className="levels__reveal-title">מה קרה אחר כך</p>
          <p>{scenario.reveal}</p>
        </div>
      )}
    </div>
  )
}
