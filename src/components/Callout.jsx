// variant: tip (טורקיז) | warning (ורוד) | simple (ליים)
export default function Callout({ title, variant = 'tip', children }) {
  return (
    <aside className={`callout callout--${variant}`}>
      {title && <p className="callout__title">{title}</p>}
      <div className="callout__body">{children}</div>
    </aside>
  )
}
