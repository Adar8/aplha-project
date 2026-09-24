import { Link, NavLink } from 'react-router'
import './Header.css'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="logo" aria-label="AlphaTrader Learn — דף הבית">
          <span className="logo__mark" aria-hidden="true">α</span>
          <span className="logo__text" dir="ltr">
            AlphaTrader <span className="logo__accent">Learn</span>
          </span>
        </Link>
        <nav className="site-nav" aria-label="ניווט ראשי">
          <NavLink to="/start" className="site-nav__link">
            המסלול<span className="site-nav__long"> שלי</span>
          </NavLink>
          <NavLink to="/glossary" className="site-nav__link">
            מילון<span className="site-nav__long"> מונחים</span>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
