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
        <p className="hero__eyebrow">שוק ההון · מהיסוד</p>
        <h1 id="hero-title" className="hero__title">
          לומדים את שוק ההון <span className="hero__highlight">עם סדר</span>
        </h1>
        <p className="hero__lead">
          יודעים קצת, אבל חסרה התמונה המלאה? AlphaTrader Learn בונה את הידע מהבסיס,
          צעד אחרי צעד ובסדר הגיוני: ממה זו בכלל מניה, דרך סוגי פקודות, ועד דוחות
          ומכפילים. כל מודול מותאם לרמה שלכם וכולל סימולטור שאפשר לשחק איתו.
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
            <dt>כסף אמיתי</dt>
            <dd className="mono">₪0</dd>
          </div>
        </dl>
      </div>
      <div className="hero__grid" aria-hidden="true" />
    </section>
  )
}
