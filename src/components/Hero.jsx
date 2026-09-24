import { TERMS } from '../data/glossary.js'
import { modules } from '../data/modules.js'
import { useProgress } from '../progress/ProgressContext.js'
import { useProfile } from '../profile/ProfileContext.js'
import './Hero.css'

const LEVEL_NAMES = { new: 'מתחילים', some: 'בסיסית', experienced: 'מנוסים' }

export default function Hero() {
  const { progress } = useProgress()
  const lessons = modules.filter((m) => m.kind === 'module')
  const completed = lessons.filter((m) => progress[m.id]).length
  const { answers } = useProfile()
  const level = LEVEL_NAMES[answers?.experience] ?? 'מתחילים'

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__content">
        <p className="hero__eyebrow">לימוד עצמי של שוק ההון</p>
        <h1 id="hero-title" className="hero__title">
          ממה זו מניה ועד קריאת <span className="hero__highlight">דוח שנתי</span>
        </h1>
        <p className="hero__lead">
          {lessons.length} יחידות לימוד בעברית, כל אחת עם סימולטור: ספר פקודות, גרפים, ניהול סיכונים, דוחות
          כספיים וחקירת חברה. לצידן מילון של {TERMS.length} מונחים. התוכן מסביר איך השוק עובד. הוא לא ממליץ
          על מניות, ואין בו כסף אמיתי.
        </p>
        <dl className="hero__stats">
          <div>
            <dt>הושלמו</dt>
            <dd className="mono" dir="ltr">
              {completed}/{lessons.length}
            </dd>
          </div>
          <div>
            <dt>רמה</dt>
            <dd>{level}</dd>
          </div>
          <div>
            <dt>מונחים במילון</dt>
            <dd className="mono">{TERMS.length}</dd>
          </div>
        </dl>
      </div>
      <div className="hero__grid" aria-hidden="true" />
    </section>
  )
}
