import { useState } from 'react'
import { useProfile } from '../../profile/ProfileContext.js'
import { accountSize } from '../../profile/profile.js'
import { positionSize } from './riskMath.js'

const shekel = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('he-IL')

const FIELDS = [
  { key: 'capital', label: 'הון בחשבון (₪)', step: '1000' },
  { key: 'riskPct', label: 'סיכון לעסקה (%)', step: '0.5' },
  { key: 'entry', label: 'מחיר כניסה', step: '0.1' },
  { key: 'stop', label: 'מחיר סטופ', step: '0.1' },
  { key: 'target', label: 'מחיר יעד', step: '0.1' },
]

/** סולם מחירים: יעד למעלה, כניסה באמצע, סטופ למטה — בגובה יחסי למרחקים */
function Ladder({ entry, stop, target }) {
  const top = target
  const bottom = stop
  const span = top - bottom
  const y = (p) => 8 + ((top - p) / span) * 184
  return (
    <svg className="ladder" viewBox="0 0 120 200" role="img" aria-label="סולם מחירים: יעד, כניסה וסטופ" dir="ltr">
      <rect className="ladder__reward" x="10" y={y(target)} width="40" height={y(entry) - y(target)} />
      <rect className="ladder__risk" x="10" y={y(entry)} width="40" height={y(stop) - y(entry)} />
      {[
        ['target', target, 'יעד'],
        ['entry', entry, 'כניסה'],
        ['stop', stop, 'סטופ'],
      ].map(([cls, price, label]) => (
        <g key={cls} className={`ladder__mark ladder__mark--${cls}`}>
          <line x1="6" x2="54" y1={y(price)} y2={y(price)} />
          <text x="60" y={y(price)} dominantBaseline="middle">
            {price.toFixed(2)}
          </text>
          <text x="60" y={y(price) + 12} dominantBaseline="middle" className="ladder__label">
            {label}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function PositionCalculator() {
  const { answers } = useProfile()
  // הסכום ההתחלתי לפי טווח ההשקעה מהשאלון, כדי שהמספרים ירגישו מוכרים
  const [values, setValues] = useState(() => ({
    capital: String(accountSize(answers, 100000)),
    riskPct: '1',
    entry: '50',
    stop: '47.5',
    target: '55',
  }))
  const result = positionSize({
    capital: Number(values.capital),
    riskPct: Number(values.riskPct) / 100,
    entry: Number(values.entry),
    stop: Number(values.stop),
    target: values.target === '' ? undefined : Number(values.target),
  })

  return (
    <div className="widget position">
      <span className="widget__tag">
        מחשבון
      </span>
      <h3 className="widget__title">מחשבון גודל פוזיציה</h3>

      <div className="position__layout">
        <div className="position__inputs">
          {FIELDS.map((f) => (
            <label key={f.key} className="position__field">
              <span>{f.label}</span>
              <input
                type="number"
                inputMode="decimal"
                step={f.step}
                min="0"
                dir="ltr"
                value={values[f.key]}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            </label>
          ))}
        </div>

        {result.valid ? (
          <div className="position__out">
            <p className="position__headline">
              קנו <span className="mono is-lime">{num.format(result.shares)}</span> מניות
            </p>
            <dl className="position__stats">
              <div>
                <dt>סכום בסיכון</dt>
                <dd className="mono is-down">{shekel.format(result.maxLoss)}</dd>
              </div>
              <div>
                <dt>שווי הפוזיציה</dt>
                <dd className="mono">{shekel.format(result.positionValue)}</dd>
              </div>
              <div>
                <dt>חלק מההון</dt>
                <dd className="mono">{Math.round(result.positionPct * 100)}%</dd>
              </div>
              {result.rr != null && (
                <>
                  <div>
                    <dt>רווח אם היעד מושג</dt>
                    <dd className="mono is-up">{shekel.format(result.potentialGain)}</dd>
                  </div>
                  <div>
                    <dt>
                      יחס סיכון-סיכוי <bdi className="mono">(R:R)</bdi>
                    </dt>
                    <dd className="mono">
                      <bdi>1:{Number.isInteger(Math.round(result.rr * 10) / 10) ? Math.round(result.rr) : result.rr.toFixed(1)}</bdi>
                    </dd>
                  </div>
                </>
              )}
            </dl>
            {result.positionPct > 1 && (
              <p className="position__warn">
                הסטופ צמוד כל כך שהפוזיציה גדולה מכל ההון שלכם (פי{' '}
                <span className="mono">{result.positionPct.toFixed(1)}</span>). בלי מינוף אי אפשר לבצע אותה,
                ועם מינוף, כל פער פתיחה מעבר לסטופ יפגע קשה. הרחיקו את הסטופ או הקטינו את הסיכון.
              </p>
            )}
            {result.rr != null && result.rr < 1 && (
              <p className="position__warn">
                מסכנים יותר ממה שאפשר להרוויח. בעסקה כזו צריך להצליח ברוב המקרים רק כדי לא להפסיד.
              </p>
            )}
          </div>
        ) : (
          <p className="position__error">{result.error}</p>
        )}

        {result.valid && result.rr != null && (
          <Ladder entry={Number(values.entry)} stop={Number(values.stop)} target={Number(values.target)} />
        )}
      </div>

      <p className="position__formula">
        הנוסחה: <strong>מספר מניות = (הון × אחוז סיכון) ÷ (כניסה − סטופ)</strong>
      </p>
    </div>
  )
}
