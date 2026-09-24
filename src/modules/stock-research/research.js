// החשבון של חקירת מניה: מגמות רב-שנתיות, איכות רווח, מאזן ו״מה המחיר מניח״.
// פונקציות טהורות בלבד. כל הסכומים במיליוני דולרים, מספר מניות במיליונים.

/** קצב צמיחה שנתי ממוצע (CAGR) בין הערך הראשון לאחרון */
export function cagr(first, last, years) {
  if (!(first > 0) || !(last > 0) || years <= 0) return null
  return (last / first) ** (1 / years) - 1
}

/** השינוי מהשנה הקודמת, לכל שנה (הראשונה null) */
export function yearOverYear(values) {
  return values.map((v, i) => (i === 0 || !(values[i - 1] > 0) ? null : v / values[i - 1] - 1))
}

/**
 * כל המדדים של שנה אחת.
 * @param y שורת נתונים של שנה (ראו COMPANY.years)
 */
export function yearMetrics(y) {
  const fcf = y.operatingCashFlow - y.capex
  const ebitda = y.operatingIncome + y.depreciation
  const netDebt = y.debt - y.cash
  return {
    ...y,
    grossMargin: y.grossProfit / y.revenue,
    operatingMargin: y.operatingIncome / y.revenue,
    netMargin: y.netIncome / y.revenue,
    fcf,
    fcfAfterSbc: fcf - y.sbc,
    // כמה מהרווח הנקי הפך למזומן פנוי
    cashConversion: y.netIncome > 0 ? fcf / y.netIncome : null,
    receivablesToRevenue: y.receivables / y.revenue,
    ebitda,
    netDebt,
    netDebtToEbitda: ebitda > 0 ? netDebt / ebitda : null,
    // כמה פעמים הרווח התפעולי ״מכסה״ את הריבית
    interestCoverage: y.interest > 0 ? y.operatingIncome / y.interest : null,
    roe: y.netIncome / y.equity,
  }
}

/** תמונת מחיר: שווי שוק, שווי פירמה ומכפילים על השנה האחרונה */
export function valuation(price, last) {
  const m = yearMetrics(last)
  const marketCap = price * last.shares
  const ev = marketCap + m.netDebt
  return {
    marketCap,
    ev,
    pe: m.netIncome > 0 ? marketCap / m.netIncome : null,
    ps: marketCap / m.revenue,
    evToEbitda: m.ebitda > 0 ? ev / m.ebitda : null,
    fcfYield: m.fcf / marketCap,
    fcfYieldAfterSbc: m.fcfAfterSbc / marketCap,
  }
}

/**
 * שווי לפי היוון תזרים (DCF) פשוט: תזרים שגדל בקצב g במשך `years` שנים,
 * ואחר כך בקצב קבוע terminalGrowth לנצח.
 */
export function dcfValue({ fcf, growth, discount, years = 10, terminalGrowth = 0.025 }) {
  let value = 0
  let cash = fcf
  for (let t = 1; t <= years; t++) {
    cash *= 1 + growth
    value += cash / (1 + discount) ** t
  }
  const terminal = (cash * (1 + terminalGrowth)) / (discount - terminalGrowth)
  return value + terminal / (1 + discount) ** years
}

/**
 * ״DCF הפוך״: איזה קצב צמיחה שנתי המחיר של היום מניח.
 * מחפשים g כך ש-dcfValue = השווי בשוק (חיפוש בינארי — הפונקציה עולה ב-g).
 * @returns g, או null כשהתזרים לא חיובי או שאין פתרון בטווח
 */
export function impliedGrowth({ value, fcf, discount, years = 10, terminalGrowth = 0.025 }) {
  if (!(fcf > 0) || !(value > 0) || discount <= terminalGrowth) return null
  let lo = -0.5
  let hi = 1
  const at = (g) => dcfValue({ fcf, growth: g, discount, years, terminalGrowth })
  if (at(lo) > value || at(hi) < value) return null
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (at(mid) < value) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
