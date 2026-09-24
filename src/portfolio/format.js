// עיצוב מספרים לתיק. מינוס אמיתי (−) כדי שלא יתהפך בטקסט מימין לשמאל.
const usdFmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const sharesFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 })

export const usd = (v) => (v == null ? '—' : `${v < 0 ? '−' : ''}$${usdFmt.format(Math.abs(v))}`)
export const signedUsd = (v) => (v == null ? '—' : `${v > 0 ? '+' : v < 0 ? '−' : ''}$${usdFmt.format(Math.abs(v))}`)
export const signedPct = (v) => (v == null ? '—' : `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v * 100).toFixed(2)}%`)
export const pct = (v) => (v == null ? '—' : `${(v * 100).toFixed(1)}%`)
export const shares = (v) => sharesFmt.format(v)

/** צבע לפי כיוון. הסימן + / − מופיע גם בטקסט, כדי שהמידע לא יועבר בצבע בלבד */
export const tone = (v) => (v == null || Math.abs(v) < 0.005 ? '' : v > 0 ? 'is-up' : 'is-down')

/** התאריך של היום לפי אזור הזמן של המשתמש, בפורמט YYYY-MM-DD */
export const todayISO = () => new Date().toLocaleDateString('en-CA')
