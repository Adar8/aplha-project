import { Link, NavLink } from 'react-router'
import './Header.css'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="logo" aria-label="AlphaTrader Learn — דף הבית">
          {/* אותו סימן כמו בפביקון (public/favicon.svg) */}
          <svg className="logo__mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <rect className="logo__mark-bg" width="32" height="32" rx="2" />
            <path
              className="logo__mark-alpha"
              d="M23.5 9.5C22 16 18.5 23 13.5 23 9.5 23 8 20 8 16.5 8 12.5 10.5 9.5 14 9.5c4 0 6 5 7.5 9 1 2.5 2 4.5 4 4.5"
            />
          </svg>
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
