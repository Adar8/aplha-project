// חישוב פשוט של מס רווחי הון על עסקה אחת. פונקציות טהורות בלבד.
// מניח יחיד תושב ישראל, שיעור 25%, בלי הצמדה לאינפלציה, בלי שער חליפין ובלי מס יסף.

export const CAPITAL_GAINS_RATE = 0.25

/**
 * @param p { amount (סכום שמושקע במניות), buyPrice, sellPrice, buyFee, sellFee }
 * @returns { valid, error?, shares, cost, proceeds, grossGain, fees, taxableGain, tax, netInHand, netProfit, netReturn }
 */
export function afterTax({ amount, buyPrice, sellPrice, buyFee, sellFee }) {
  if (!(amount > 0)) return { valid: false, error: 'סכום ההשקעה צריך להיות גדול מאפס.' }
  if (!(buyPrice > 0) || !(sellPrice > 0)) return { valid: false, error: 'מחיר הקנייה ומחיר המכירה צריכים להיות גדולים מאפס.' }
  if (!(buyFee >= 0) || !(sellFee >= 0)) return { valid: false, error: 'עמלה לא יכולה להיות שלילית.' }

  const shares = amount / buyPrice
  const proceeds = shares * sellPrice
  // עמלת הקנייה נכנסת לעלות, ועמלת המכירה מקטינה את התמורה. שתיהן מקטינות את הרווח החייב במס
  const cost = amount + buyFee
  const taxableGain = proceeds - sellFee - cost
  const tax = taxableGain > 0 ? taxableGain * CAPITAL_GAINS_RATE : 0
  const netInHand = proceeds - sellFee - tax
  const netProfit = netInHand - cost

  return {
    valid: true,
    shares,
    cost,
    proceeds,
    grossGain: proceeds - amount,
    fees: buyFee + sellFee,
    taxableGain,
    tax,
    netInHand,
    netProfit,
    netReturn: netProfit / cost,
  }
}
