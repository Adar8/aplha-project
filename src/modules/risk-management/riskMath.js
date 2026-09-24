// החשבון של ניהול סיכונים. פונקציות טהורות בלבד; האקראיות מוזרקת מבחוץ.
// "R" = יחידת סיכון: הסכום שמפסידים בעסקה אם הסטופ נפגע.

/** כמה אחוז צריך להרוויח כדי לחזור לנקודת ההתחלה אחרי הפסד של lossPct (0–1) */
export function recoveryNeeded(lossPct) {
  if (lossPct >= 1) return Infinity
  return lossPct / (1 - lossPct)
}

/**
 * גודל פוזיציה לפי סיכון קבוע מההון.
 * @param p { capital, riskPct (0–1), entry, stop, target? }
 * @returns { valid, error?, riskAmount, riskPerShare, shares, positionValue, positionPct,
 *            maxLoss, potentialGain?, rr? }
 */
export function positionSize({ capital, riskPct, entry, stop, target }) {
  if (!(capital > 0)) return { valid: false, error: 'הון צריך להיות חיובי' }
  if (!(riskPct > 0 && riskPct <= 1)) return { valid: false, error: 'אחוז הסיכון צריך להיות בין 0 ל-100' }
  if (!(entry > 0) || !(stop > 0)) return { valid: false, error: 'מחיר כניסה וסטופ צריכים להיות חיוביים' }
  if (stop >= entry) return { valid: false, error: 'בעסקת קנייה הסטופ חייב להיות מתחת למחיר הכניסה' }
  if (target != null && target <= entry) {
    return { valid: false, error: 'היעד צריך להיות מעל מחיר הכניסה' }
  }

  const riskAmount = capital * riskPct
  const riskPerShare = entry - stop
  const shares = Math.floor(riskAmount / riskPerShare)
  const positionValue = shares * entry
  const maxLoss = shares * riskPerShare
  const result = {
    valid: true,
    riskAmount,
    riskPerShare,
    shares,
    positionValue,
    positionPct: positionValue / capital,
    maxLoss,
  }
  if (target != null) {
    result.potentialGain = shares * (target - entry)
    result.rr = (target - entry) / riskPerShare
  }
  return result
}

/** אחוז ההצלחה המינימלי כדי לא להפסיד, ביחס סיכוי/סיכון נתון */
export const breakEvenWinRate = (rr) => 1 / (1 + rr)

/** תוחלת לעסקה ביחידות R: כמה מרוויחים (או מפסידים) בממוצע על כל ₪1 שמסכנים */
export const expectancy = (winRate, rr) => winRate * rr - (1 - winRate)

/**
 * סדרת עסקאות עם סיכון קבוע באחוזים מההון הנוכחי.
 * @param outcomes מערך של true/false (הצלחה/כישלון) — מאפשר להשוות אחוזי סיכון על אותו "מזל"
 * @returns { equity: number[], finalEquity, maxDrawdown (0–1), longestLosingStreak }
 */
export function runTrades({ capital, riskPct, rr, outcomes }) {
  const equity = [capital]
  let current = capital
  let peak = capital
  let maxDrawdown = 0
  let streak = 0
  let longestLosingStreak = 0

  for (const win of outcomes) {
    const risk = current * riskPct
    current = win ? current + risk * rr : current - risk
    equity.push(current)
    peak = Math.max(peak, current)
    maxDrawdown = Math.max(maxDrawdown, 1 - current / peak)
    streak = win ? 0 : streak + 1
    longestLosingStreak = Math.max(longestLosingStreak, streak)
  }

  return { equity, finalEquity: current, maxDrawdown, longestLosingStreak }
}

/** רצף הצלחות/כישלונות אקראי: rand() < winRate → הצלחה */
export function drawOutcomes(n, winRate, rand) {
  return Array.from({ length: n }, () => rand() < winRate)
}

export function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
