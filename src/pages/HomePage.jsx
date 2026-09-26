import { Link } from 'react-router'
import { TERMS } from '../data/glossary.js'
import { modules } from '../data/modules.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { usePortfolio } from '../portfolio/PortfolioContext.js'
import { signedPct, signedUsd, tone, usd } from '../portfolio/format.js'
import { computePortfolio } from '../portfolio/portfolio.js'
import { useProfile } from '../profile/ProfileContext.js'
import { answerLabel, buildPlan, levelFor, moduleMinutes } from '../profile/profile.js'
import { formatDate } from '../progress/formatDate.js'
import { useProgress } from '../progress/ProgressContext.js'
import { buildAchievements } from './achievements.js'
import './HomePage.css'

const LEVEL_FEMININE = { basic: 'בסיסית', deep: 'מעמיקה' }

const duration = (minutes) => {
  if (minutes < 60) return `כ-${minutes} דקות`
  const hours = Math.round((minutes / 60) * 2) / 2
  return hours === 1 ? 'כשעה' : `כ-${hours} שעות`
}

const tileTone = (number) => `var(--tone-${((number - 1) % 6) + 1})`

/** לוח הבקרה: מה הבא, כמה נשאר, כל המודולים, הישגים והתיק */
export default function HomePage() {
  useDocumentTitle(null)
  const { progress } = useProgress()
  const { profile, answers } = useProfile()
  const { transactions } = usePortfolio()
  const plan = buildPlan(modules, profile, progress)
  const lessons = answers ? plan.order : modules.filter((m) => m.kind === 'module')
  const done = lessons.filter((m) => progress[m.id]).length
  const { next } = plan
  const nextLevel = next ? levelFor(profile, next.id) : null
  const nextMinutes = next ? moduleMinutes(next, nextLevel) : null
  const achievements = buildAchievements({ lessons, progress, profile, transactions })
  const earned = achievements.filter((a) => a.earned).length

  return (
    <div className="dash">
      <section className="dash-hero" aria-labelledby="dash-title">
        <CandlePattern />
        <div className="dash-hero__main">
          <h1 id="dash-title" className="dash-hero__title">
            לוח הבקרה
          </h1>
          <p className="dash-hero__lead">
            {lessons.length} מודולים על שוק ההון האמריקאי, מילון של {TERMS.length} מונחים ותיק למעקב אחרי עסקאות שביצעתם
            אצל ברוקר. התוכן מסביר איך השוק עובד ולא ממליץ על ניירות ערך.
          </p>

          <div className="dash-hero__next">
            {next ? (
              <>
                <p className="dash-hero__label">
                  {answers ? `הבא במסלול שלך: ${answerLabel('goal', answers.goal)}` : 'המודול הבא'}
                </p>
                <p className="dash-hero__next-title">
                  <span className="dash-tile" style={{ '--tile': tileTone(next.number) }} aria-hidden="true">
                    {next.number}
                  </span>
                  {next.title}
                </p>
                <div className="dash-hero__actions">
                  <Link to={next.path} className="btn btn--hero">
                    {done > 0 ? 'להמשיך ללמוד' : 'להתחיל ללמוד'}
                  </Link>
                  {nextMinutes && (
                    <span className="dash-hero__meta">
                      {duration(nextMinutes)} ברמה {LEVEL_FEMININE[nextLevel]}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="dash-hero__label">המודול הבא</p>
                <p className="dash-hero__next-title">סיימת את כל המודולים שזמינים כרגע</p>
                <p className="dash-hero__meta">אפשר לחזור לכל מודול, להחליף בו רמה, או לחפש מונח במילון.</p>
              </>
            )}
          </div>
        </div>

        <div className="dash-hero__stats">
          <p className="dash-hero__label" id="dash-progress-label">
            התקדמות
          </p>
          <p className="dash-hero__big">
            <span>{done}</span> מתוך {lessons.length} מודולים
          </p>
          <div
            className="dash-steps"
            role="progressbar"
            aria-labelledby="dash-progress-label"
            aria-valuemin={0}
            aria-valuemax={lessons.length}
            aria-valuenow={done}
            aria-valuetext={`${done} מתוך ${lessons.length} מודולים`}
          >
            {lessons.map((m, i) => (
              <span
                key={m.id}
                className={`dash-steps__step${progress[m.id] ? ' is-done' : ''}${next?.id === m.id ? ' is-next' : ''}`}
                style={{ '--i': i }}
              />
            ))}
          </div>
          <p className="dash-hero__meta">
            {plan.remainingMinutes > 0 ? `נשארו ${duration(plan.remainingMinutes)} לימוד` : 'לא נשאר זמן לימוד במסלול'}
            {plan.weeks ? `, ${plan.weeks === 1 ? 'שבוע אחד' : `כ-${plan.weeks} שבועות`} בקצב שלך` : ''}
          </p>
          <p className="dash-hero__meta">
            הישגים: {earned} מתוך {achievements.length}
          </p>
        </div>
      </section>

      <section className="dash__section" aria-labelledby="dash-modules-title">
        <h2 id="dash-modules-title" className="dash__section-title">
          {answers ? 'המודולים בסדר של המסלול שלך' : 'כל המודולים'}
        </h2>
        <ol className="dash-modules">
          {lessons.map((m, i) => (
            <ModuleCard key={m.id} module={m} index={i} isNext={next?.id === m.id} isKnown={plan.known.has(m.id)} />
          ))}
        </ol>
      </section>

      <section className="dash__section" aria-labelledby="dash-badges-title">
        <h2 id="dash-badges-title" className="dash__section-title">
          הישגים
          <span className="dash__section-count">
            {earned} מתוך {achievements.length}
          </span>
        </h2>
        <ul className="dash-badges">
          {achievements.map((a, i) => (
            <li
              key={a.id}
              className={`dash-badge${a.earned ? ' dash-badge--earned' : ''}`}
              style={{ '--tile': `var(--tone-${(i % 6) + 1})` }}
            >
              <span className="dash-badge__mark" aria-hidden="true" />
              <span className="dash-badge__title">{a.title}</span>
              <span className="dash-badge__rule">
                {a.earned ? 'הושג: ' : 'עוד לא: '}
                {a.rule}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="dash__tools">
        <PortfolioPanel />
        <section className="dash-panel" aria-labelledby="dash-glossary-title">
          <h2 id="dash-glossary-title" className="dash-panel__label">
            מילון מונחים
          </h2>
          <p className="dash-stat">
            <span className="dash-stat__value">{TERMS.length}</span> מונחים
          </p>
          <p className="dash-panel__note">
            כל מונח בעברית ובאנגלית, עם הסבר ודוגמה. חיפוש לפי שם בכל אחת מהשפות וסינון לפי נושא.
          </p>
          <Link to="/glossary" className="btn btn--ghost btn--small">
            לפתוח את המילון
          </Link>
        </section>
        <ProfilePanel plan={plan} />
      </div>
    </div>
  )
}

/** קישוט: נרות דקים ברקע הפאנל הראשי. צורה קבועה, לא נתונים */
function CandlePattern() {
  const candles = [
    [10, 60, 30],
    [24, 50, 36],
    [38, 44, 26],
    [52, 52, 34],
    [66, 40, 30],
    [80, 34, 28],
    [94, 42, 22],
    [108, 30, 30],
    [122, 24, 26],
    [136, 30, 20],
    [150, 18, 28],
    [164, 12, 24],
  ]
  return (
    <svg className="dash-hero__pattern" viewBox="0 0 176 100" aria-hidden="true" focusable="false">
      {candles.map(([x, y, h], i) => (
        <g key={x} className={i % 3 === 2 ? 'is-down' : 'is-up'}>
          <line x1={x} x2={x} y1={y - 6} y2={y + h + 6} />
          <rect x={x - 4} y={y} width={8} height={h} />
        </g>
      ))}
    </svg>
  )
}

function ModuleCard({ module, index, isNext, isKnown }) {
  const { progress } = useProgress()
  const { profile } = useProfile()
  const completion = progress[module.id]
  const minutes = moduleMinutes(module, levelFor(profile, module.id))

  let status = <span className="dash-card__status">עוד לא הושלם</span>
  if (completion) {
    status = (
      <span className="dash-card__status dash-card__status--done">הושלם {formatDate(completion.completedAt)}</span>
    )
  } else if (isNext) {
    status = <span className="dash-card__status dash-card__status--next">הבא בתור</span>
  } else if (isKnown) {
    status = <span className="dash-card__status">אפשר לדלג לפי מבחן המיקום</span>
  }

  return (
    <li
      className={`dash-card${isNext ? ' dash-card--next' : ''}${completion ? ' dash-card--done' : ''}`}
      style={{ '--tile': tileTone(module.number), '--i': index }}
    >
      <div className="dash-card__top">
        <span className="dash-tile" aria-hidden="true">
          {module.number}
        </span>
        {status}
      </div>
      <Link to={module.path} className="dash-card__title">
        <span className="visually-hidden">מודול {module.number}: </span>
        {module.title}
      </Link>
      <p className="dash-card__summary">{module.summary}</p>
      {minutes && <p className="dash-card__time">{minutes} דקות</p>}
    </li>
  )
}

function ProfilePanel({ plan }) {
  const { answers } = useProfile()

  if (!answers) {
    return (
      <section className="dash-panel" aria-labelledby="dash-profile-title">
        <h2 id="dash-profile-title" className="dash-panel__label">
          התאמת המסלול
        </h2>
        <p className="dash-panel__text">
          חמש שאלות על ניסיון, מטרה וזמן פנוי, ומבחן מיקום שאפשר לדלג עליו. לפיהם נקבעים סדר המודולים, רמת ההסבר והערכת
          הזמן.
        </p>
        <Link to="/start" className="btn btn--ghost btn--small">
          למילוי השאלון
        </Link>
      </section>
    )
  }

  return (
    <section className="dash-panel" aria-labelledby="dash-profile-title">
      <h2 id="dash-profile-title" className="dash-panel__label">
        המסלול שלך
      </h2>
      <dl className="dash-facts">
        <div>
          <dt>מטרה</dt>
          <dd>{answerLabel('goal', answers.goal)}</dd>
        </div>
        <div>
          <dt>ניסיון</dt>
          <dd>{answerLabel('experience', answers.experience)}</dd>
        </div>
      </dl>
      {plan.known.size > 0 && (
        <p className="dash-panel__note">
          לפי מבחן המיקום אפשר לדלג על {plan.known.size === 1 ? 'מודול אחד' : `${plan.known.size} מודולים`}. הם נשארים
          פתוחים לרענון.
        </p>
      )}
      <Link to="/start" className="btn btn--ghost btn--small">
        לעדכן תשובות
      </Link>
    </section>
  )
}

function PortfolioPanel() {
  const { transactions, prices } = usePortfolio()

  if (transactions.length === 0) {
    return (
      <section className="dash-panel" aria-labelledby="dash-portfolio-title">
        <h2 id="dash-portfolio-title" className="dash-panel__label">
          התיק שלי
        </h2>
        <p className="dash-panel__text">
          עוד לא הוזנו עסקאות. אפשר להזין קניות ומכירות שביצעתם אצל ברוקר אחר ולראות עלות ממוצעת, רווח והפסד ומשקל כל
          מניה. הנתונים נשמרים בדפדפן הזה בלבד.
        </p>
        <Link to="/portfolio" className="btn btn--ghost btn--small">
          לפתוח את התיק
        </Link>
      </section>
    )
  }

  const { totals } = computePortfolio(transactions, prices)
  const priced = totals.openCount > totals.missingPrices

  return (
    <section className="dash-panel" aria-labelledby="dash-portfolio-title">
      <h2 id="dash-portfolio-title" className="dash-panel__label">
        התיק שלי
      </h2>
      <dl className="dash-facts">
        <div>
          <dt>מניות פתוחות</dt>
          <dd>{totals.openCount}</dd>
        </div>
        <div>
          <dt>שווי לפי המחירים שהוזנו</dt>
          <dd dir="ltr">{priced ? usd(totals.value) : '—'}</dd>
        </div>
        <div>
          <dt>רווח או הפסד לא ממומש</dt>
          <dd dir="ltr" className={priced ? tone(totals.unrealized) : ''}>
            {priced ? `${signedUsd(totals.unrealized)} (${signedPct(totals.unrealizedPct)})` : '—'}
          </dd>
        </div>
      </dl>
      {totals.missingPrices > 0 && (
        <p className="dash-panel__note">
          {totals.missingPrices === 1 ? 'למניה אחת' : `ל-${totals.missingPrices} מניות`} אין עדיין מחיר נוכחי, והן לא
          נכללות בשווי.
        </p>
      )}
      <Link to="/portfolio" className="btn btn--ghost btn--small">
        לפתוח את התיק
      </Link>
    </section>
  )
}
