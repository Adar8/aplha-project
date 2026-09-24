import { Link } from 'react-router'
import { SITE } from '../data/site.js'

export default function Footer() {
  return (
    <footer className="site-footer container">
      <nav className="site-footer__links" aria-label="מידע על האתר">
        <Link to="/accessibility">הצהרת נגישות</Link>
        <Link to="/privacy">מדיניות פרטיות</Link>
        <Link to="/terms">תקנון</Link>
      </nav>
      <p>
        {SITE.name} היא מערכת ללימוד עצמי. התוכן לימודי בלבד ואינו ייעוץ השקעות: אנחנו לא ממליצים על ניירות ערך ולא
        מבצעים עסקאות.
      </p>
    </footer>
  )
}
