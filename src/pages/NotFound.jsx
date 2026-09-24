import { Link } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function NotFound() {
  useDocumentTitle('העמוד לא נמצא')
  return (
    <section className="not-found">
      <p className="mono not-found__code">404</p>
      <h1>העמוד הזה לא קיים</h1>
      <p>
        <Link to="/">חזרה לדף הבית</Link>
      </p>
    </section>
  )
}
