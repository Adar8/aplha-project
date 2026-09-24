import { Link } from 'react-router'
import { SITE } from '../data/site.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { formatDate } from '../progress/formatDate.js'
import './LegalPage.css'

export default function LegalLayout({ title, updatedAt = SITE.policiesUpdatedAt, children }) {
  useDocumentTitle(title)
  return (
    <article className="legal">
      <nav className="lesson__breadcrumb" aria-label="ניווט">
        <Link to="/">→ דף הבית</Link>
      </nav>
      <header className="legal__header">
        <h1 className="legal__title">{title}</h1>
        <p className="legal__updated">
          עודכן לאחרונה: <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
        </p>
      </header>
      <div className="legal__body">{children}</div>
    </article>
  )
}
