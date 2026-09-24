import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { getModule } from '../data/modules.js'
import { useProfile } from '../profile/ProfileContext.js'
import { PLACEMENT, gradePlacement } from '../profile/placement.js'
import { QUESTIONS, defaultLevel, LEVELS } from '../profile/profile.js'
import './OnboardingPage.css'

function QuestionStep({ question, value, onChoose }) {
  return (
    <fieldset className="onb__question">
      <legend className="onb__legend">
        {question.title}
        {question.optional && <span className="onb__optional"> (לא חובה)</span>}
      </legend>
      {question.note && <p className="onb__note">{question.note}</p>}
      <div className="onb__options">
        {question.options.map((o) => (
          <button
            key={o.id}
            type="button"
            className="onb__option"
            aria-pressed={value === o.id}
            onClick={() => onChoose(o.id)}
          >
            <span className="onb__option-label">{o.label}</span>
            {o.hint && <span className="onb__option-hint">{o.hint}</span>}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function Placement({ onDone, onSkip }) {
  const [answers, setAnswers] = useState({})
  const complete = PLACEMENT.every((q) => answers[q.id])
  return (
    <div className="onb__placement">
      <h2 className="onb__legend">מבחן מיקום</h2>
      <p className="onb__note">
        {PLACEMENT.length} שאלות קצרות, שתיים לכל מודול. מודול שעניתם נכון על שתי השאלות שלו יסומן ״אפשר לדלג״. הוא לא
        ייסגר, ולא יסומן כהושלם. לא בטוחים? עדיף לא לנחש.
      </p>
      <ol className="onb__quiz">
        {PLACEMENT.map((q) => (
          <li key={q.id}>
            <p className="onb__quiz-text">
              <span className="onb__quiz-module">{getModule(q.module).title} · </span>
              {q.text}
            </p>
            <div className="onb__quiz-options" role="group">
              {[...q.options, { id: 'unsure', label: 'לא יודע' }].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className="chip onb__quiz-opt"
                  aria-pressed={answers[q.id] === o.id}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: o.id }))}
                >
                  <bdi>{o.label}</bdi>
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <div className="onb__nav">
        <button type="button" className="btn btn--ghost" onClick={onSkip}>
          דלגו על המבחן
        </button>
        <button type="button" className="btn btn--primary" disabled={!complete} onClick={() => onDone(answers)}>
          {complete ? 'לבדוק ולבנות מסלול' : `ענו על כל השאלות (${Object.keys(answers).length}/${PLACEMENT.length})`}
        </button>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const { answers: saved, profile, saveAnswers, savePlacement } = useProfile()
  const navigate = useNavigate()
  const [draft, setDraft] = useState(() => saved ?? {})
  const [step, setStep] = useState(0) // 0..QUESTIONS.length-1 שאלות, אחר כך 'placement' / 'result'
  const [result, setResult] = useState(null)

  const question = QUESTIONS[step]
  const total = QUESTIONS.length
  const isQuestion = typeof step === 'number'
  const canContinue = isQuestion && (question.optional || draft[question.id] != null)

  function next() {
    if (step < total - 1) {
      setStep(step + 1)
      return
    }
    saveAnswers(draft)
    setStep('placement')
  }

  function choose(value) {
    setDraft((prev) => ({
      ...prev,
      [question.id]: prev[question.id] === value && question.optional ? undefined : value,
    }))
  }

  function finishPlacement(quizAnswers) {
    const graded = gradePlacement(quizAnswers)
    savePlacement(graded)
    setResult(graded)
    setStep('result')
  }

  const level = LEVELS.find((l) => l.id === defaultLevel(draft))

  return (
    <section className="onb" aria-labelledby="onb-title">
      <nav className="lesson__breadcrumb" aria-label="ניווט">
        <Link to="/">→ דף הבית</Link>
      </nav>
      <header className="onb__header">
        <p className="onb__eyebrow" dir="ltr">
          SETUP {isQuestion ? `${step + 1}/${total}` : step === 'placement' ? 'QUIZ' : 'DONE'}
        </p>
        <h1 id="onb-title" className="onb__title">
          התאמה אישית
        </h1>
        <p className="onb__lead">
          התשובות משמשות רק כדי להתאים את הלימוד: רמת ההסבר, סדר המודולים והערכת הזמן. הן נשמרות בדפדפן שלך, ואנחנו לא
          משתמשים בהן כדי להמליץ על השקעות.
        </p>
        {isQuestion && (
          <div className="onb__progress" aria-hidden="true">
            {QUESTIONS.map((q, i) => (
              <span key={q.id} className={`onb__dot${i <= step ? ' is-on' : ''}`} />
            ))}
          </div>
        )}
      </header>

      {isQuestion && (
        <>
          <QuestionStep question={question} value={draft[question.id]} onChoose={choose} />
          <div className="onb__nav">
            {step > 0 ? (
              <button type="button" className="btn btn--ghost" onClick={() => setStep(step - 1)}>
                → הקודם
              </button>
            ) : (
              <span />
            )}
            <button type="button" className="btn btn--primary" disabled={!canContinue} onClick={next}>
              {question.optional && draft[question.id] == null ? 'דלגו ←' : 'הבא ←'}
            </button>
          </div>
        </>
      )}

      {step === 'placement' && (
        <>
          <p className="onb__saved is-lime" role="status">
            ✓ התשובות נשמרו. המודולים ייפתחו ברמה <strong>{level.label}</strong>, ובכל מודול אפשר להחליף.
          </p>
          <Placement
            onDone={finishPlacement}
            onSkip={() => {
              if (!profile?.placement) savePlacement({})
              navigate('/')
            }}
          />
        </>
      )}

      {step === 'result' && (
        <div className="onb__result">
          <h2 className="onb__legend">מה יצא</h2>
          <ul className="onb__result-list">
            {Object.entries(result).map(([id, ok]) => (
              <li key={id} className={ok ? 'is-lime' : 'is-muted'}>
                {ok ? '✓ אפשר לדלג: ' : '○ מומלץ ללמוד: '}
                {getModule(id).title}
              </li>
            ))}
          </ul>
          <div className="onb__nav">
            <span />
            <Link to="/" className="btn btn--primary">
              למסלול שלי ←
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
