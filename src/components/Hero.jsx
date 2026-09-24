import './Hero.css'

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <p className="hero__eyebrow">שוק ההון · למתחילים</p>
      <h1 id="hero-title" className="hero__title">
        לומדים לסחור <span className="hero__highlight">מאפס</span>
      </h1>
      <p className="hero__lead">
        AlphaTrader Learn מסבירה את שוק ההון בשפה פשוטה, צעד אחר צעד — ממה זו
        מניה ועד איך שולחים פקודה ראשונה. בלי ז׳רגון מיותר, בלי כסף אמיתי על
        השולחן.
      </p>
      <dl className="hero__stats">
        <div>
          <dt>מודולים</dt>
          <dd className="mono">02</dd>
        </div>
        <div>
          <dt>רמה</dt>
          <dd>מתחילים</dd>
        </div>
        <div>
          <dt>עלות</dt>
          <dd className="mono">₪0</dd>
        </div>
      </dl>
    </section>
  )
}
