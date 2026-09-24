// מנוע הסימולציה של לחץ קונים מול מוכרים. פונקציות טהורות בלבד —
// האקראיות מוזרקת מבחוץ (noise), כך שקל לבדוק ולשחזר.

export const TICK_MS = 200
export const TICKS_PER_CANDLE = 25 // נר אחד = 5 שניות
export const MAX_CANDLES = 16
export const START_PRICE = 100

const MAX_DRIFT = 0.001 // תזוזה מקסימלית לטיק בחוסר איזון מלא (0.1%)
const MAX_VOLATILITY = 0.0035 // "רעש" מקסימלי לטיק כשהשוק פעיל מאוד

function newCandle(price) {
  return { open: price, high: price, low: price, close: price, ticks: 0 }
}

export function createMarket(price = START_PRICE) {
  return { price, candles: [], current: newCandle(price) }
}

/** 0 = שוק רדום, 1 = שוק פעיל מאוד */
export function activityLevel({ buyers, sellers }) {
  return (buyers + sellers) / 200
}

/** -1 = מוכרים שולטים לגמרי, 1 = קונים שולטים לגמרי */
export function imbalance({ buyers, sellers }) {
  return (buyers - sellers) / 100
}

/**
 * טיק אחד של השוק.
 * @param market   מצב נוכחי
 * @param pressure { buyers: 0..100, sellers: 0..100 }
 * @param noise    מספר אקראי בטווח [-1, 1]
 */
export function stepMarket(market, pressure, noise) {
  const drift = imbalance(pressure) * MAX_DRIFT
  const volatility = activityLevel(pressure) * MAX_VOLATILITY
  const price = Math.max(1, market.price * (1 + drift + noise * volatility))

  const c = market.current
  const current = {
    open: c.open,
    high: Math.max(c.high, price),
    low: Math.min(c.low, price),
    close: price,
    ticks: c.ticks + 1,
  }

  if (current.ticks >= TICKS_PER_CANDLE) {
    return {
      price,
      candles: [...market.candles, current].slice(-(MAX_CANDLES - 1)),
      current: newCandle(price),
    }
  }

  return { ...market, price, current }
}

const round2 = (n) => Math.round(n * 100) / 100

/**
 * Bid / Ask סביב המחיר האחרון. ככל שיש יותר משתתפים — המרווח צר יותר.
 */
export function quote(price, pressure) {
  const spreadPct = 0.002 - activityLevel(pressure) * 0.0017 // 0.20% ברדום → 0.03% בפעיל
  const spread = Math.max(0.01, round2(price * spreadPct))
  const bid = round2(price - spread / 2)
  const ask = round2(bid + spread)
  return { bid, ask, spread: round2(ask - bid) }
}

export function isUp(candle) {
  return candle.close >= candle.open
}
