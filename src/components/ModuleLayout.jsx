import { Link } from 'react-router'
import { modules } from '../data/modules.js'
import CompleteButton from './CompleteButton.jsx'
import './ModuleLayout.css'

export default function ModuleLayout({ module, intro, children }) {
  const { id, number, title, accent, minutes } = module
  const next = modules.find((m) => m.kind === 'module' && m.number === number + 1)

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
        <div className="lesson__nav">
          <Link to="/" className="lesson__back">
            → חזרה לכל המודולים
          </Link>
          {next?.status === 'available' && (
            <Link to={next.path} className="lesson__next">
              המודול הבא: {next.title} ←
            </Link>
          )}
        </div>
      </footer>
    </article>
  )
}
