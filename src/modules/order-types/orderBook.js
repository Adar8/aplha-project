// מנוע ספר פקודות פשוט: התאמה לפי עדיפות מחיר-זמן (Price-Time Priority).
// פונקציות טהורות בלבד. מחירים נשמרים כמספרים שלמים בסנטים (10003 = 100.03)
// כדי להימנע משגיאות עיגול של נקודה צפה.
//
// book  = { asks: Order[], bids: Order[], nextId }
// Order = { id, price, size, owner: 'me' | 'others' }
// asks ממוינים מהזול ליקר, bids מהיקר לזול; במחיר זהה — מי שהגיע קודם (id נמוך) ראשון.

export const DEPTH = 5 // כמה רמות מחיר מוצגות בכל צד
const MAX_SPREAD = 5 // סנטים — מעבר לזה עושי שוק נכנסים לתוך המרווח

export const toCents = (price) => Math.round(Number(price) * 100)
export const formatPrice = (cents) => (cents / 100).toFixed(2)
/** מחיר ממוצע יכול ליפול בין סנטים — מציגים 3 ספרות אחרי הנקודה */
export const formatAverage = (cents) => (cents / 100).toFixed(3)

const byAsk = (a, b) => a.price - b.price || a.id - b.id
const byBid = (a, b) => b.price - a.price || a.id - b.id

const INITIAL = {
  asks: [
    [10003, 200],
    [10005, 500],
    [10008, 300],
    [10010, 800],
    [10015, 1200],
  ],
  bids: [
    [9998, 400],
    [9995, 700],
    [9990, 1000],
    [9987, 600],
    [9982, 1500],
  ],
}

export function createBook() {
  let id = 1
  const make = ([price, size]) => ({ id: id++, price, size, owner: 'others' })
  const asks = INITIAL.asks.map(make)
  const bids = INITIAL.bids.map(make)
  return { asks, bids, nextId: id }
}

export const bestAsk = (book) => book.asks[0]?.price ?? null
export const bestBid = (book) => book.bids[0]?.price ?? null

function addOrder(book, side, price, size, owner) {
  const list = [...book[side], { id: book.nextId, price, size, owner }]
  list.sort(side === 'asks' ? byAsk : byBid)
  return { ...book, [side]: list, nextId: book.nextId + 1 }
}

/**
 * שליחת פקודה לספר.
 * @param order { side: 'buy'|'sell', type: 'market'|'limit', qty, limit?: cents }
 * @returns { book, fills: [{ price, size, counterparty }], filled, remaining,
 *            restedId (אם יתרה נכנסה לספר), canceled (יתרה של פקודת שוק שלא מצאה נזילות),
 *            selfCanceled (ids של פקודות שלי שבוטלו כדי לא לסחור מול עצמי) }
 */
export function executeOrder(book, order, owner = 'me') {
  const opposite = order.side === 'buy' ? 'asks' : 'bids'
  const own = order.side === 'buy' ? 'bids' : 'asks'
  const crosses = (price) =>
    order.type === 'market' || (order.side === 'buy' ? price <= order.limit : price >= order.limit)

  const resting = book[opposite].map((o) => ({ ...o }))
  const fills = []
  const selfCanceled = []
  let remaining = order.qty

  while (resting.length && remaining > 0) {
    const top = resting[0]
    if (!crosses(top.price)) break
    // מניעת מסחר עצמי (Self-Trade Prevention): פקודה ישנה שלי שעומדת בדרך מבוטלת,
    // כמו בבורסות אמיתיות. "others" מייצג הרבה סוחרים שונים, ולכן לא חל עליהם.
    if (owner === 'me' && top.owner === 'me') {
      selfCanceled.push(top.id)
      resting.shift()
      continue
    }
    const size = Math.min(remaining, top.size)
    fills.push({ price: top.price, size, counterparty: top.owner })
    top.size -= size
    remaining -= size
    if (top.size === 0) resting.shift()
  }

  let next = { ...book, [opposite]: resting }
  let restedId = null
  let canceled = 0

  if (remaining > 0) {
    if (order.type === 'limit') {
      restedId = next.nextId
      next = addOrder(next, own, order.limit, remaining, owner)
    } else {
      canceled = remaining
    }
  }

  return { book: next, fills, filled: order.qty - remaining, remaining, restedId, canceled, selfCanceled }
}

export function cancelOrder(book, id) {
  return {
    ...book,
    asks: book.asks.filter((o) => o.id !== id),
    bids: book.bids.filter((o) => o.id !== id),
  }
}

export function averagePrice(fills) {
  const qty = fills.reduce((sum, f) => sum + f.size, 0)
  if (!qty) return null
  return fills.reduce((sum, f) => sum + f.price * f.size, 0) / qty
}

/** רמות מחיר מצטברות להצגה: [{ price, size, mine }] — עד DEPTH רמות */
export function levels(orders, depth = DEPTH) {
  const result = []
  for (const o of orders) {
    const last = result[result.length - 1]
    if (last && last.price === o.price) {
      last.size += o.size
      if (o.owner === 'me') last.mine += o.size
    } else {
      if (result.length === depth) break
      result.push({ price: o.price, size: o.size, mine: o.owner === 'me' ? o.size : 0 })
    }
  }
  return result
}

/** הפקודות הפתוחות שלי, כולל כמה מניות עומדות לפניהן בתור באותו מחיר */
export function myOpenOrders(book) {
  const result = []
  for (const [sideKey, side] of [
    ['bids', 'buy'],
    ['asks', 'sell'],
  ]) {
    for (const o of book[sideKey]) {
      if (o.owner !== 'me') continue
      const ahead = book[sideKey]
        .filter((x) => x.price === o.price && x.id < o.id)
        .reduce((sum, x) => sum + x.size, 0)
      result.push({ ...o, side, ahead })
    }
  }
  return result
}

function distinctPrices(orders) {
  return new Set(orders.map((o) => o.price)).size
}

// מחזיר נזילות לספר אחרי שעסקאות "אכלו" רמות מחיר
function replenish(book, rand) {
  let next = book
  const randomSize = () => (1 + Math.floor(rand() * 8)) * 100

  for (const side of ['asks', 'bids']) {
    let guard = 0
    while (distinctPrices(next[side]) < DEPTH && guard++ < 20) {
      const orders = next[side]
      const dir = side === 'asks' ? 1 : -1
      let anchor = orders[orders.length - 1]?.price
      if (anchor == null) {
        const other = side === 'asks' ? bestBid(next) : bestAsk(next)
        anchor = (other ?? 10000) + dir * 2
      }
      const price = anchor + dir * (orders.length ? 2 + Math.floor(rand() * 4) : 0)
      next = addOrder(next, side, price, randomSize(), 'others')
    }
  }

  // עושי שוק (Market Makers) סוגרים מרווח רחב מדי בפקודות חדשות בתוכו
  let guard = 0
  while (bestAsk(next) - bestBid(next) > MAX_SPREAD && guard++ < 10) {
    const ask = bestAsk(next)
    const bid = bestBid(next)
    const offset = 2 + Math.floor(rand() * 3) // 2–4 סנט מהצד השני
    next =
      rand() < 0.5
        ? addOrder(next, 'asks', Math.max(bid + offset, bid + 1), randomSize(), 'others')
        : addOrder(next, 'bids', Math.min(ask - offset, ask - 1), randomSize(), 'others')
  }

  // סוחר אחר מצטרף לראש הספר, ולפעמים משפר את המחיר בסנט
  if (rand() < 0.7) {
    const side = rand() < 0.5 ? 'asks' : 'bids'
    const ask = bestAsk(next)
    const bid = bestBid(next)
    const spread = ask - bid
    let price = side === 'asks' ? ask : bid
    if (spread > 2 && rand() < 0.5) price += side === 'asks' ? -1 : 1
    next = addOrder(next, side, price, randomSize(), 'others')
  }

  return next
}

/**
 * צעד אחד של "השוק זז": סוחר אחר שולח פקודת שוק, ואחר כך נכנסת נזילות חדשה.
 * @param rand פונקציה שמחזירה מספר בטווח [0, 1)
 * @returns { book, trade: { side, qty, avg, last }, myFills: [{ price, size, side }] }
 */
export function simulateMarket(book, rand = Math.random) {
  const side = rand() < 0.5 ? 'buy' : 'sell'
  const qty = (1 + Math.floor(rand() * 6)) * 100
  const result = executeOrder(book, { side, type: 'market', qty }, 'others')

  const mySide = side === 'buy' ? 'sell' : 'buy'
  const myFills = result.fills
    .filter((f) => f.counterparty === 'me')
    .map((f) => ({ price: f.price, size: f.size, side: mySide }))

  return {
    book: replenish(result.book, rand),
    trade: {
      side,
      qty: result.filled,
      avg: averagePrice(result.fills),
      last: result.fills[result.fills.length - 1]?.price ?? null,
    },
    myFills,
  }
}
