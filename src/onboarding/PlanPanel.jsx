import { Link } from 'react-router'
import { useProfile } from '../profile/ProfileContext.js'
import { answerLabel, levelFor, moduleMinutes } from '../profile/profile.js'
import './PlanPanel.css'

const hours = (minutes) => (minutes < 60 ? `${minutes} דק׳` : `${(minutes / 60).toFixed(minutes % 60 ? 1 : 0)} שע׳`)

/** פאנל המסלול האישי בדף הבית. בלי שאלון: הזמנה למלא אותו */
export default function PlanPanel({ plan }) {
  const { profile, answers } = useProfile()

  if (!answers) {
    return (
      <section className="plan plan--invite" aria-labelledby="plan-title">
        <div>
          <h2 id="plan-title" className="plan__title">
            התאמת המסלול
          </h2>
          <p className="plan__text">
            חמש שאלות על ניסיון, מטרה וזמן פנוי, ואחריהן מבחן מיקום שאפשר לדלג עליו. לפי התשובות נקבעים סדר
            המודולים, רמת ההסבר שבה כל מודול נפתח, והערכת הזמן. בכל מודול אפשר להחליף רמה.
          </p>
        </div>
        <Link to="/start" className="btn btn--primary">
          למילוי השאלון
        </Link>
      </section>
    )
  }

  const { next, weeks, remainingMinutes, known } = plan
  const nextMinutes = next ? moduleMinutes(next, levelFor(profile, next.id)) : null

  return (
    <section className="plan" aria-labelledby="plan-title">
      <div className="plan__main">
        <p className="plan__eyebrow" dir="ltr">
          YOUR PATH
        </p>
        <h2 id="plan-title" className="plan__title">
          המסלול שלך: {answerLabel('goal', answers.goal)}
        </h2>
        {next ? (
          <p className="plan__text">
            הצעד הבא: <strong>{next.title}</strong>
            {nextMinutes && <span className="mono"> · כ-{nextMinutes} דק׳</span>}
          </p>
        ) : (
          <p className="plan__text">סיימת את כל המודולים שזמינים כרגע. מודולים חדשים בדרך.</p>
        )}
        {known.size > 0 && (
          <p className="plan__note">
            לפי מבחן המיקום אפשר לדלג על {known.size === 1 ? 'מודול אחד' : `${known.size} מודולים`}. הם נשארים פתוחים אם
            תרצו לרענן.
          </p>
        )}
      </div>

      <dl className="plan__stats">
        <div>
          <dt>נשאר ללמוד</dt>
          <dd className="mono">{hours(remainingMinutes)}</dd>
        </div>
        <div>
          <dt>בקצב שלך</dt>
          <dd>{weeks ? (weeks === 1 ? 'שבוע אחד' : `כ-${weeks} שבועות`) : '—'}</dd>
        </div>
        <div>
          <dt>ניסיון</dt>
          <dd>{answerLabel('experience', answers.experience)}</dd>
        </div>
      </dl>

      <div className="plan__actions">
        {next && (
          <Link to={next.path} className="btn btn--primary">
            להמשיך ←
          </Link>
        )}
        <Link to="/start" className="btn btn--ghost btn--small">
          לעדכן תשובות
        </Link>
      </div>
    </section>
  )
}
