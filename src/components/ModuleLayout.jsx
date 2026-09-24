import { Link } from 'react-router'
import CompleteButton from './CompleteButton.jsx'
import './ModuleLayout.css'

export default function ModuleLayout({ module, intro, children }) {
  const { id, number, title, accent, minutes } = module

  return (
    <article className={`lesson lesson--${accent}`}>
      <nav className="lesson__breadcrumb" aria-label="ניווט">
        <Link to="/">→ כל המודולים</Link>
      </nav>

      <header className="lesson__header">
        <p className="lesson__eyebrow">
          <span dir="ltr">MODULE {String(number).padStart(2, '0')}</span>
          {minutes && <span> · {minutes} דק׳ קריאה</span>}
        </p>
        <h1 className="lesson__title">{title}</h1>
        {intro && <p className="lesson__intro">{intro}</p>}
      </header>

      <div className="lesson__body">{children}</div>

      <footer className="lesson__footer">
        <CompleteButton moduleId={id} />
        <Link to="/" className="lesson__back">
          → חזרה לכל המודולים
        </Link>
      </footer>
    </article>
  )
}
