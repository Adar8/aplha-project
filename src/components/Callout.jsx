// variant: tip / simple = מידע (כחול), warning = אזהרה (ענבר)
export default function Callout({ title, variant = 'tip', children }) {
  return (
    <aside className={`callout callout--${variant}`}>
      {title && <p className="callout__title">{title}</p>}
      <div className="callout__body">{children}</div>
    </aside>
  )
}
