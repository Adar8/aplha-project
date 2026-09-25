// נתוני הגרפים של מודול 03. הכול נוצר ממחולל אקראי עם seed קבוע, כך שכל תרחיש
// נראה בדיוק אותו דבר בכל פעם — ויש לו תשובה נכונה ידועה (רמות התמיכה וההתנגדות).
//
// candle = { open, high, low, close, volume }

import { seededRandom } from '../../lib/seededRandom.js'

const round2 = (n) => Math.round(n * 100) / 100

/**
 * בונה נרות שעוברים דרך נקודות ציון.
 * @param waypoints [{ i, price, touch?: 'high'|'low', volume?: מכפיל נפח }]
 *   touch — הפתיל של הנר נוגע בדיוק במחיר (כך נוצרת "נגיעה" ברמה)
 * @param opts { seed, noise: תנודה יחסית לנר, wick: אורך פתיל יחסי,
 *               bounds?: [{ from, to, min?, max? }] — תקרה/רצפה לטווח נרות, baseVolume }
 */
export function buildCandles(waypoints, opts) {
  const rand = seededRandom(opts.seed)
  const { noise = 0.004, wick = 0.004, bounds = [], baseVolume = 1000 } = opts
  const last = waypoints[waypoints.length - 1].i
  const candles = []
  let prevClose = waypoints[0].price

  const boundFor = (i) => {
    let min = -Infinity
    let max = Infinity
    for (const b of bounds) {
      if (i >= b.from && i <= b.to) {
        if (b.min != null) min = Math.max(min, b.min)
        if (b.max != null) max = Math.min(max, b.max)
      }
    }
    return { min, max }
  }

  for (let i = 0; i <= last; i++) {
    const nextWp = waypoints.find((w) => w.i >= i)
    const prevWp = [...waypoints].reverse().find((w) => w.i <= i) ?? waypoints[0]
    const span = nextWp.i - prevWp.i
    const target = span ? prevWp.price + ((nextWp.price - prevWp.price) * (i - prevWp.i)) / span : nextWp.price
    const exact = waypoints.find((w) => w.i === i)
    const { min, max } = boundFor(i)
    // "מחזירים" ערך שחרג מהגבול אל תוך הטווח, במקום להצמיד אותו לגבול —
    // אחרת נוצרות עשרות נגיעות מלאכותיות בדיוק ברמה
    const clamp = (v) => {
      if (v < min) return Math.min(min + (min - v), max)
      if (v > max) return Math.max(max - (v - max), min)
      return v
    }

    const open = clamp(prevClose)
    let close = clamp(exact && !exact.touch ? exact.price : target * (1 + (rand() * 2 - 1) * noise))
    let high = Math.max(open, close) * (1 + rand() * wick)
    let low = Math.min(open, close) * (1 - rand() * wick)

    if (exact?.touch === 'high') {
      high = exact.price
      close = Math.min(close, exact.price * (1 - wick * 0.8))
    } else if (exact?.touch === 'low') {
      low = exact.price
      close = Math.max(close, exact.price * (1 + wick * 0.8))
    }
    high = Math.max(clamp(high), open, close)
    low = Math.min(clamp(low), open, close)

    const volumeBoost = exact?.volume ?? (exact?.touch ? 1.5 : 1)
    const volume = Math.round(baseVolume * (0.7 + rand() * 0.6) * volumeBoost)

    candles.push({ open: round2(open), high: round2(high), low: round2(low), close: round2(close), volume })
    prevClose = close
  }
  return candles
}

/** מאחד כל n נרות לנר אחד — כך נוצר גרף של טווח זמן ארוך יותר */
export function aggregate(candles, n) {
  const result = []
  for (let i = 0; i + n <= candles.length; i += n) {
    const group = candles.slice(i, i + n)
    result.push({
      open: group[0].open,
      high: Math.max(...group.map((c) => c.high)),
      low: Math.min(...group.map((c) => c.low)),
      close: group[group.length - 1].close,
      volume: group.reduce((sum, c) => sum + c.volume, 0),
    })
  }
  return result
}

// ---------------------------------------------------------------- טווחי זמן
// סדרה של 192 נרות של 15 דקות: מגמת עלייה ארוכה, עם ירידה בסוף.
const TF_BASE = buildCandles(
  [
    { i: 0, price: 100 },
    { i: 30, price: 106 },
    { i: 42, price: 103.5 },
    { i: 80, price: 111 },
    { i: 95, price: 108.5 },
    { i: 140, price: 117 },
    { i: 150, price: 120 },
    { i: 191, price: 114.5 },
  ],
  { seed: 11, noise: 0.0025, wick: 0.0025, baseVolume: 400 },
)

export const TIMEFRAMES = [
  {
    id: '15m',
    label: '15 דקות',
    candles: TF_BASE.slice(-48),
    caption: 'בגרף של 15 דקות רואים ירידה רצופה. סוחר שמסתכל רק על זה עלול לחשוב שהמניה ״קורסת״.',
  },
  {
    id: '1h',
    label: 'שעה',
    candles: aggregate(TF_BASE, 4),
    caption: 'בגרף שעתי כבר רואים שהירידה מגיעה אחרי טיפוס ארוך. זה נראה יותר כמו ״נשימה״ מאשר כמו קריסה.',
  },
  {
    id: '4h',
    label: '4 שעות',
    candles: aggregate(TF_BASE, 16),
    caption: 'בגרף של 4 שעות התמונה ברורה: מגמת עלייה, והירידה האחרונה היא עוד תיקון קטן בתוכה.',
  },
]

// ---------------------------------------------------------------- זיהוי מגמה
export const TREND_QUIZ = [
  {
    id: 'q1',
    answer: 'down',
    candles: buildCandles(
      [
        { i: 0, price: 80 },
        { i: 6, price: 76 },
        { i: 9, price: 78 },
        { i: 15, price: 73 },
        { i: 18, price: 75 },
        { i: 24, price: 70 },
        { i: 27, price: 71.8 },
        { i: 31, price: 68 },
      ],
      { seed: 21, noise: 0.004, wick: 0.004 },
    ),
    explain: 'שיאים יורדים ושפלים יורדים: כל עלייה נעצרת נמוך מהקודמת, וכל ירידה מגיעה נמוך יותר. זו מגמת ירידה.',
  },
  {
    id: 'q2',
    answer: 'sideways',
    candles: buildCandles(
      [
        { i: 0, price: 50 },
        { i: 5, price: 52.6 },
        { i: 10, price: 49.6 },
        { i: 15, price: 52.4 },
        { i: 20, price: 49.8 },
        { i: 25, price: 52.7 },
        { i: 31, price: 50.6 },
      ],
      { seed: 22, noise: 0.004, wick: 0.004 },
    ),
    explain: 'המחיר עולה ויורד באותו טווח, בלי שיאים או שפלים חדשים. זה דשדוש: אף צד לא משתלט.',
  },
  {
    id: 'q3',
    answer: 'up',
    candles: buildCandles(
      [
        { i: 0, price: 30 },
        { i: 6, price: 32 },
        { i: 9, price: 31 },
        { i: 15, price: 33.4 },
        { i: 18, price: 32.4 },
        { i: 24, price: 35 },
        { i: 27, price: 34 },
        { i: 31, price: 36.2 },
      ],
      { seed: 23, noise: 0.004, wick: 0.004 },
    ),
    explain: 'שיאים עולים ושפלים עולים: כל תיקון נעצר גבוה מהקודם. זו מגמת עלייה, גם אם יש בה ירידות קטנות.',
  },
]

export const TREND_LABELS = { up: 'מגמת עלייה', down: 'מגמת ירידה', sideways: 'דשדוש' }

// ---------------------------------------------------------------- תרחישי תמיכה והתנגדות
// visible — כמה נרות מוצגים לפני "מה קרה אחר כך". levels — התשובה הנכונה.
export const SCENARIOS = [
  {
    id: 'range-up',
    title: 'טווח מסחר',
    prompt: 'המחיר מתנהל בתוך טווח. סמנו את התמיכה (הרצפה) ואת ההתנגדות (התקרה).',
    visible: 48,
    levels: [
      { kind: 'support', price: 96 },
      { kind: 'resistance', price: 104 },
    ],
    candles: buildCandles(
      [
        { i: 0, price: 100 },
        { i: 6, price: 104, touch: 'high' },
        { i: 13, price: 96, touch: 'low' },
        { i: 20, price: 103.95, touch: 'high' },
        { i: 27, price: 96.05, touch: 'low' },
        { i: 34, price: 104, touch: 'high' },
        { i: 41, price: 96.1, touch: 'low' },
        { i: 47, price: 101.8 },
        { i: 50, price: 103.6 },
        { i: 52, price: 106.4, volume: 2.8 },
        { i: 53, price: 107.2, volume: 2.2 },
        { i: 57, price: 104.2, touch: 'low' },
        { i: 63, price: 110.5 },
      ],
      {
        seed: 31,
        noise: 0.003,
        wick: 0.003,
        bounds: [
          { from: 0, to: 50, min: 96, max: 104 },
          { from: 54, to: 63, min: 104 },
        ],
      },
    ),
    reveal:
      'המחיר פרץ את ההתנגדות ב-104 בנפח מסחר גבוה פי 2–3 מהרגיל, ואז חזר ״לבדוק״ אותה מלמעלה, והפעם היא החזיקה כתמיכה. תקרה שנפרצה הופכת לרצפה. לזה קוראים היפוך תפקידים.',
  },
  {
    id: 'range-down',
    title: 'טווח צר',
    prompt: 'עוד טווח, במחיר אחר. איפה הרצפה ואיפה התקרה?',
    visible: 44,
    levels: [
      { kind: 'support', price: 48 },
      { kind: 'resistance', price: 54 },
    ],
    candles: buildCandles(
      [
        { i: 0, price: 52 },
        { i: 5, price: 48, touch: 'low' },
        { i: 12, price: 54, touch: 'high' },
        { i: 19, price: 48.05, touch: 'low' },
        { i: 26, price: 53.9, touch: 'high' },
        { i: 33, price: 48, touch: 'low' },
        { i: 39, price: 53.95, touch: 'high' },
        { i: 43, price: 50.5 },
        { i: 46, price: 48.4 },
        { i: 48, price: 46.6, volume: 3 },
        { i: 49, price: 46, volume: 2.2 },
        { i: 53, price: 47.9, touch: 'high' },
        { i: 60, price: 43.5 },
      ],
      {
        seed: 32,
        noise: 0.004,
        wick: 0.004,
        bounds: [
          { from: 0, to: 46, min: 48, max: 54 },
          { from: 50, to: 60, max: 48 },
        ],
      },
    ),
    reveal:
      'הפעם המחיר שבר את התמיכה ב-48 כלפי מטה, שוב בנפח גבוה. כשניסה לעלות בחזרה, הרצפה הישנה עצרה אותו כתקרה. אותו עיקרון, בכיוון ההפוך.',
  },
  {
    id: 'flip',
    title: 'היפוך תפקידים',
    prompt: 'המחיר שבר רמה חשובה ועכשיו חוזר אליה מלמטה. סמנו את הרמה הזו.',
    visible: 46,
    levels: [{ kind: 'flip', price: 200 }],
    candles: buildCandles(
      [
        { i: 0, price: 208 },
        { i: 6, price: 200, touch: 'low' },
        { i: 11, price: 207 },
        { i: 17, price: 200.1, touch: 'low' },
        { i: 22, price: 206 },
        { i: 27, price: 200, touch: 'low' },
        { i: 30, price: 197, volume: 2.6 },
        { i: 31, price: 194, volume: 2 },
        { i: 36, price: 190.5 },
        { i: 45, price: 199 },
        { i: 47, price: 200, touch: 'high' },
        { i: 50, price: 196 },
        { i: 58, price: 186.5 },
      ],
      {
        seed: 33,
        noise: 0.003,
        wick: 0.003,
        bounds: [
          { from: 0, to: 29, min: 200 },
          { from: 31, to: 58, max: 200 },
        ],
      },
    ),
    reveal:
      '200 הייתה תמיכה שהחזיקה שלוש פעמים. אחרי שנשברה, היא עצרה את המחיר מלמעלה והפכה להתנגדות. מי שקנה סביב 200 ו״נתקע״ בהפסד שמח למכור כשהמחיר חזר לשם, ולכן הרמה עוצרת את העלייה.',
  },
]

export const LEVEL_META = {
  support: { label: 'תמיכה', en: 'Support', tone: 'up' },
  resistance: { label: 'התנגדות', en: 'Resistance', tone: 'down' },
  flip: { label: 'הרמה', en: 'Level', tone: 'flip' },
}

/** טולרנס לסימון "מדויק": 1.2% מהמחיר */
export const TOLERANCE = 0.012

/**
 * כמה פעמים המחיר "נגע" ברמה בחלק הגלוי. נרות רצופים ליד הרמה נספרים כנגיעה אחת.
 */
export function countTouches(candles, price, kind) {
  const tol = price * 0.003
  const near = (c) => {
    if (kind === 'support') return Math.abs(c.low - price) <= tol
    if (kind === 'resistance') return Math.abs(c.high - price) <= tol
    return Math.abs(c.low - price) <= tol || Math.abs(c.high - price) <= tol
  }
  let touches = 0
  let wasNear = false
  for (const c of candles) {
    const isNear = near(c)
    if (isNear && !wasNear) touches++
    wasNear = isNear
  }
  return touches
}

/** ציון לסימון: exact / close / far */
export function gradeLevel(guess, price) {
  const diff = Math.abs(guess - price) / price
  if (diff <= TOLERANCE) return 'exact'
  if (diff <= TOLERANCE * 2.5) return 'close'
  return 'far'
}
