import { modules } from '../data/modules.js'
import { useProgress } from '../progress/ProgressContext.js'
import './Hero.css'

export default function Hero() {
  const { progress } = useProgress()
  const lessons = modules.filter((m) => m.kind === 'module')
  const completed = lessons.filter((m) => progress[m.id]).length

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__content">
        <p className="hero__eyebrow">שוק ההון · מהיסוד</p>
        <h1 id="hero-title" className="hero__title">
          לומדים לסחור <span className="hero__highlight">עם סדר</span>
        </h1>
        <p className="hero__lead">
          יודעים קצת לסחור, אבל חסרה התמונה המלאה? AlphaTrader Learn בונה את הידע
          מהבסיס, צעד אחרי צעד ובסדר הגיוני: ממה זו בכלל מניה, דרך סוגי פקודות,
          ועד מושגים מתקדמים. כל מודול כולל הסבר פשוט וסימולטור שאפשר לשחק איתו.
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
            <dd>מתחילים</dd>
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
