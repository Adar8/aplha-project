// החשבון של ״התיק שלי״. פונקציות טהורות בלבד.
// המשתמש מזין עסקאות שביצע אצל ברוקר אחר (קנייה/מכירה) ומחיר נוכחי ידני לכל מניה.
// שיטת העלות: ממוצע משוקלל (Average Cost). סכומים בדולרים.

const EPS = 1e-9

/** סימול של מניה אמריקאית: אותיות לועזיות, ואפשר ספרות, נקודה או מקף (BRK.B) */
export const SYMBOL_PATTERN = /^[A-Z][A-Z0-9.-]{0,9}$/

export function normalizeSymbol(raw) {
  return String(raw ?? '').trim().toUpperCase()
}

/** עיגול למניעת שאריות נקודה צפה (0.1 + 0.2) */
const round = (v, digits = 8) => Math.round(v * 10 ** digits) / 10 ** digits

/** מיון עסקאות לפי תאריך, ובאותו תאריך לפי סדר ההזנה */
export function sortTransactions(transactions) {
  return [...transactions].sort((a, b) => (a.date === b.date ? a.seq - b.seq : a.date < b.date ? -1 : 1))
}

/**
 * כמה מניות מחזיקים בכל סימול, לפי כל העסקאות (או עד עסקה מסוימת).
 * @returns Record<symbol, shares>
 */
export function sharesBySymbol(transactions) {
  const held = {}
  for (const t of sortTransactions(transactions)) {
    held[t.symbol] = round((held[t.symbol] ?? 0) + (t.type === 'buy' ? t.shares : -t.shares))
  }
  return held
}

/**
 * בדיקת עסקה חדשה לפני שמירה.
 * @param t { symbol, type, date, shares, price, fees }
 * @param existing העסקאות הקיימות
 * @param today תאריך היום (YYYY-MM-DD) — מוזרק כדי שאפשר יהיה לבדוק
 * @returns רשימת שגיאות (ריקה = תקין)
 */
export function validateTransaction(t, existing, today) {
  const errors = []
  if (!SYMBOL_PATTERN.test(t.symbol)) errors.push('סימול לא תקין. כותבים באותיות לועזיות, למשל AAPL או BRK.B.')
  if (t.type !== 'buy' && t.type !== 'sell') errors.push('צריך לבחור קנייה או מכירה.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t.date ?? '')) errors.push('צריך תאריך עסקה.')
  else if (t.date > today) errors.push('תאריך העסקה לא יכול להיות בעתיד.')
  if (!(t.price > 0)) errors.push('המחיר למניה צריך להיות גדול מאפס.')
  if (!(t.shares > 0)) errors.push('הכמות צריכה להיות גדולה מאפס.')
  if (!(t.fees >= 0)) errors.push('העמלה לא יכולה להיות שלילית.')
  if (errors.length) return errors

  if (t.type === 'sell') {
    // אי אפשר למכור יותר ממה שהוחזק בתאריך המכירה, וגם לא לגרום ליתרה שלילית אחר כך
    const all = sortTransactions([...existing, { ...t, seq: Number.MAX_SAFE_INTEGER }]).filter((x) => x.symbol === t.symbol)
    let held = 0
    for (const x of all) {
      held = round(held + (x.type === 'buy' ? x.shares : -x.shares))
      if (held < -EPS) {
        errors.push('אי אפשר למכור יותר מניות ממה שהיו בתיק באותו תאריך.')
        break
      }
    }
  }
  return errors
}

/** האם מחיקת עסקה תשאיר יתרה שלילית (למשל מחיקת קנייה שהייתה מכירה אחריה) */
export function canDelete(id, transactions) {
  const rest = transactions.filter((t) => t.id !== id)
  const bySymbol = {}
  for (const t of sortTransactions(rest)) {
    bySymbol[t.symbol] = round((bySymbol[t.symbol] ?? 0) + (t.type === 'buy' ? t.shares : -t.shares))
    if (bySymbol[t.symbol] < -EPS) return false
  }
  return true
}

/**
 * הפוזיציות והסיכום.
 * @param transactions [{ id, seq, symbol, type, date, shares, price, fees }]
 * @param prices Record<symbol, { price, updatedAt }>
 */
export function computePortfolio(transactions, prices = {}) {
  const pos = {}
  for (const t of sortTransactions(transactions)) {
    const p = (pos[t.symbol] ??= { symbol: t.symbol, shares: 0, cost: 0, realized: 0, invested: 0, firstDate: t.date })
    if (t.type === 'buy') {
      // העמלה בקנייה נכנסת לעלות
      p.cost += t.shares * t.price + t.fees
      p.invested += t.shares * t.price + t.fees
      p.shares = round(p.shares + t.shares)
    } else {
      const avg = p.shares > EPS ? p.cost / p.shares : 0
      const costOfSold = avg * t.shares
      p.realized += t.shares * t.price - t.fees - costOfSold
      p.cost -= costOfSold
      p.shares = round(p.shares - t.shares)
      if (p.shares <= EPS) {
        p.shares = 0
        p.cost = 0
      }
    }
  }

  const positions = Object.values(pos).map((p) => {
    const quote = prices[p.symbol]
    const price = quote?.price > 0 ? quote.price : null
    const value = price != null ? p.shares * price : null
    const unrealized = value != null ? value - p.cost : null
    return {
      ...p,
      avgCost: p.shares > 0 ? p.cost / p.shares : null,
      price,
      priceUpdatedAt: quote?.updatedAt ?? null,
      value,
      unrealized,
      unrealizedPct: unrealized != null && p.cost > 0 ? unrealized / p.cost : null,
    }
  })

  const open = positions.filter((p) => p.shares > 0)
  const priced = open.filter((p) => p.value != null)
  const totalValue = priced.reduce((s, p) => s + p.value, 0)
  const pricedCost = priced.reduce((s, p) => s + p.cost, 0)
  const withWeight = positions.map((p) => ({
    ...p,
    weight: p.value != null && totalValue > 0 ? p.value / totalValue : null,
  }))

  return {
    positions: withWeight.sort((a, b) => (b.value ?? -1) - (a.value ?? -1) || a.symbol.localeCompare(b.symbol)),
    totals: {
      openCount: open.length,
      missingPrices: open.length - priced.length,
      openCost: open.reduce((s, p) => s + p.cost, 0),
      // שווי, רווח ותשואה מחושבים רק על מניות שיש להן מחיר נוכחי
      value: totalValue,
      pricedCost,
      unrealized: totalValue - pricedCost,
      unrealizedPct: pricedCost > 0 ? (totalValue - pricedCost) / pricedCost : null,
      realized: positions.reduce((s, p) => s + p.realized, 0),
    },
  }
}

/** כמה ימים עברו מתאריך (YYYY-MM-DD או ISO) עד היום */
export function daysSince(date, now = new Date()) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  return Math.max(0, Math.floor((now - d) / 86_400_000))
}
