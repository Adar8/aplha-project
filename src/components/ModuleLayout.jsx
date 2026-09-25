import { Link } from 'react-router'
import { modules } from '../data/modules.js'
import { useProfile, LevelContext } from '../profile/ProfileContext.js'
import { LEVELS, levelFor, moduleMinutes } from '../profile/profile.js'
import Callout from './Callout.jsx'
import CompleteButton from './CompleteButton.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import './ModuleLayout.css'

export default function ModuleLayout({ module, intro, children }) {
  const { id, number, title, accent, why } = module
  const next = modules.find((m) => m.kind === 'module' && m.number === number + 1)
  const { profile, answers, setModuleLevel } = useProfile()
  useDocumentTitle(title)
  const level = levelFor(profile, id)
  const minutes = moduleMinutes(module, level)
  const goalWhy = answers?.goal && why?.[answers.goal]

  return (
    <LevelContext.Provider value={level}>
      <article className={`lesson lesson--${accent}`}>
        <nav className="lesson__breadcrumb" aria-label="ניווט">
          <Link to="/">→ כל המודולים</Link>
        </nav>

        <header className="lesson__header">
          <p className="lesson__eyebrow">
            <span dir="ltr">MODULE {String(number).padStart(2, '0')}</span>
            {minutes && (
              <span>
                {' '}
                · כ-{minutes} דק׳ ברמה {LEVELS.find((l) => l.id === level).label}
              </span>
            )}
          </p>
          <h1 className="lesson__title">{title}</h1>
          {intro && <p className="lesson__intro">{intro}</p>}

          <div className="level-switch">
            <span className="level-switch__label" id={`level-${id}`}>
              רמת ההסבר
            </span>
            <div className="segmented level-switch__options" role="group" aria-labelledby={`level-${id}`}>
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className="segmented__btn"
                  aria-pressed={level === l.id}
                  onClick={() => setModuleLevel(id, l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <p className="level-switch__hint">
              {LEVELS.find((l) => l.id === level).hint}. אפשר להחליף בכל רגע, והרמה השנייה תמיד זמינה בתוך
              השיעור.
            </p>
          </div>

          {goalWhy && (
            <Callout title="למה זה רלוונטי לך" variant="simple">
              <p>{goalWhy}</p>
            </Callout>
          )}
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
    </LevelContext.Provider>
  )
}
