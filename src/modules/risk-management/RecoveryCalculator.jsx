import { useState } from 'react'
import { recoveryNeeded } from './riskMath.js'

const REFERENCE = [10, 20, 30, 50, 75, 90]
const DISPLAY_MAX = 300 // % — מעבר לזה הפס פשוט מלא

const pct = (n) => `${Math.round(n)}%`

export default function RecoveryCalculator() {
  const [loss, setLoss] = useState(30)
  const needed = recoveryNeeded(loss / 100) * 100

  return (
    <div className="widget recovery">
      <span className="widget__tag" dir="ltr">
        INTERACTIVE
      </span>
      <h3 className="widget__title">כמה צריך להרוויח כדי לחזור?</h3>

      <label htmlFor="recovery-loss" className="recovery__label">
        הפסדתם <output className="mono is-down">{pct(loss)}</output> מהתיק
      </label>
      <input
        id="recovery-loss"
        type="range"
        min="5"
        max="90"
        step="5"
        value={loss}
        onChange={(e) => setLoss(Number(e.target.value))}
        className="recovery__slider"
      />

      <div className="recovery__bars">
        <div className="recovery__bar">
          <span className="recovery__bar-label">הפסד</span>
          <span className="recovery__track">
            <span className="recovery__fill recovery__fill--loss" style={{ inlineSize: `${(loss / DISPLAY_MAX) * 100}%` }} />
          </span>
          <span className="mono is-down">−{pct(loss)}</span>
        </div>
        <div className="recovery__bar">
          <span className="recovery__bar-label">כדי לחזור</span>
          <span className="recovery__track">
            <span
              className="recovery__fill recovery__fill--gain"
              style={{ inlineSize: `${Math.min(needed / DISPLAY_MAX, 1) * 100}%` }}
            />
          </span>
          <span className="mono is-up">+{pct(needed)}</span>
        </div>
      </div>

      <p className="recovery__example">
        תיק של <span className="mono">₪100,000</span> ירד ל-
        <span className="mono">₪{(100000 * (1 - loss / 100)).toLocaleString('he-IL')}</span>. כדי לחזור ל-
        <span className="mono">₪100,000</span> צריך להרוויח <span className="mono is-up">{pct(needed)}</span> על
        מה שנשאר.
      </p>

      <ul className="recovery__ref" aria-label="נקודות ייחוס">
        {REFERENCE.map((r) => (
          <li key={r} className={r === loss ? 'is-current' : undefined}>
            <span className="mono is-down">−{r}%</span> ← <span className="mono is-up">+{pct(recoveryNeeded(r / 100) * 100)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
