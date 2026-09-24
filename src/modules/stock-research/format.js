// עיצוב מספרים משותף למודול. סימן מינוס אמיתי (−) כדי שלא יתהפך בטקסט מימין לשמאל.
const sign = (v) => (v < 0 ? '−' : '')

export const usdM = (v) => `${sign(v)}$${Math.abs(Math.round(v)).toLocaleString('en-US')}M`
export const pct = (v, digits = 1) => (v == null ? '—' : `${sign(v)}${Math.abs(v * 100).toFixed(digits)}%`)
export const times = (v, digits = 1) => (v == null ? '—' : `${sign(v)}${Math.abs(v).toFixed(digits)}×`)
export const num = (v) => `${sign(v)}${Math.abs(v).toLocaleString('en-US')}`
