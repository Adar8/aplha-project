// ערך שעוד לא נקבע ב-src/data/site.js. מוצג בבירור, כדי שאי אפשר יהיה לפספס אותו לפני עלייה לאוויר.
export default function Missing({ label }) {
  return <span className="missing">[חסר: {label}]</span>
}

/** מציג את הערך, או סימון ״חסר״ אם הוא עוד לא מולא */
export function Field({ value, label, href }) {
  if (value == null || value === '') return <Missing label={label} />
  return href ? <a href={href}>{value}</a> : <bdi>{value}</bdi>
}
