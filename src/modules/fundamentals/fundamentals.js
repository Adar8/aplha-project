// החשבון של ניתוח יסודי: דוח רווח והפסד ומכפילים. פונקציות טהורות בלבד.
// כל הסכומים של חברות במיליוני ₪, מחיר מניה ב-₪, מספר מניות במיליונים.

/**
 * דוח רווח והפסד מפושט.
 * @param p { revenue, cogsPct (0–1), opex, interest, taxRate (0–1) }
 */
export function incomeStatement({ revenue, cogsPct, opex, interest, taxRate }) {
  const cogs = revenue * cogsPct
  const grossProfit = revenue - cogs
  const operatingProfit = grossProfit - opex
  const preTax = operatingProfit - interest
  const tax = preTax > 0 ? preTax * taxRate : 0 // על הפסד לא משלמים מס (בפישוט)
  const netIncome = preTax - tax
  const margin = (v) => (revenue > 0 ? v / revenue : 0)
  return {
    revenue,
    cogs,
    grossProfit,
    opex,
    operatingProfit,
    interest,
    preTax,
    tax,
    netIncome,
    grossMargin: margin(grossProfit),
    operatingMargin: margin(operatingProfit),
    netMargin: margin(netIncome),
  }
}

/** מכפיל רווח. null כשהרווח שלילי או אפס — אין לו משמעות */
export function peRatio(price, eps) {
  return eps > 0 ? price / eps : null
}

/**
 * צמיחה ברווח לעומת השנה הקודמת. null כשהבסיס הוא הפסד או אפס —
 * אחוז "צמיחה" מהפסד לא אומר כלום (הפסד שמצטמצם ייראה כמו ירידה).
 */
export function profitGrowth(previous, current) {
  if (previous == null || !(previous > 0)) return null
  return current / previous - 1
}

/**
 * כל המכפילים של חברה.
 * @param c נתוני החברה (ראו COMPANIES)
 * @param adjusted true = מנטרלים רווח חד-פעמי
 */
export function companyMetrics(c, adjusted = false) {
  const netIncome = adjusted ? c.netIncome - (c.oneOffGain ?? 0) : c.netIncome
  const marketCap = c.price * c.shares
  const eps = netIncome / c.shares
  return {
    marketCap,
    netIncome,
    eps,
    pe: peRatio(c.price, eps),
    pb: marketCap / c.equity,
    ps: marketCap / c.revenue,
    dividendYield: c.dividend / c.price,
    roe: netIncome / c.equity,
    debtToEquity: c.debt / c.equity,
    netMargin: netIncome / c.revenue,
    growth: profitGrowth(c.history.at(-2), netIncome),
  }
}

// ---------------------------------------------------------------- חברות לדוגמה
// חברות דמיוניות. כל אחת בנויה כדי ללמד משהו אחר.
export const COMPANIES = [
  {
    id: 'market',
    name: 'סופר-שוק',
    sector: 'קמעונאות',
    accent: 'cyan',
    price: 40,
    shares: 50,
    revenue: 5000,
    netIncome: 150,
    equity: 1000,
    debt: 800,
    dividend: 1.2,
    history: [130, 140, 150],
    story: 'רשת סופרמרקטים ותיקה. מוכרת הרבה, מרוויחה מעט על כל שקל, אבל באופן יציב, ומחלקת דיבידנד.',
  },
  {
    id: 'cloud',
    name: 'ענן-טק',
    sector: 'תוכנה',
    accent: 'purple',
    price: 120,
    shares: 25,
    revenue: 600,
    netIncome: 60,
    equity: 500,
    debt: 0,
    dividend: 0,
    history: [20, 38, 60],
    story: 'חברת תוכנה צעירה. הרווח שלה כמעט הוכפל בכל שנה, בלי חובות, ובלי דיבידנד: כל שקל מושקע בצמיחה.',
  },
  {
    id: 'steel',
    name: 'פלדת הצפון',
    sector: 'תעשייה',
    accent: 'pink',
    price: 20,
    shares: 100,
    revenue: 3000,
    netIncome: 400,
    oneOffGain: 250,
    equity: 2500,
    debt: 3500,
    dividend: 0.5,
    history: [300, 220, 400],
    story: 'מפעל ותיק. השנה מכר קרקע ברווח חד-פעמי של ₪250 מיליון, בלי זה הרווח ממשיך לרדת. וגם החוב גבוה.',
  },
  {
    id: 'solar',
    name: 'אנרגיה ירוקה',
    sector: 'אנרגיה',
    accent: 'lime',
    price: 30,
    shares: 40,
    revenue: 400,
    netIncome: -20,
    equity: 600,
    debt: 600,
    dividend: 0,
    history: [-60, -45, -20],
    story: 'מקימה חוות סולאריות. עדיין מפסידה, אבל ההפסד מצטמצם כל שנה והמכירות גדלות.',
  },
]

// שאלות "בלש המכפילים"
export const QUESTIONS = [
  {
    id: 'cheapest',
    text: 'לפי מכפיל הרווח המדווח, איזו חברה נראית הכי זולה?',
    options: ['market', 'cloud', 'steel', 'solar'],
    answer: 'steel',
    explain:
      'פלדת הצפון נסחרת במכפיל 5 בלבד. אבל ״נראית״ היא מילת המפתח: הפעילו את נטרול הרווח החד-פעמי ובדקו מה קורה למכפיל.',
  },
  {
    id: 'trap',
    text: 'אחרי שמנטרלים את הרווח החד-פעמי, מה מתברר על פלדת הצפון?',
    options: [
      { id: 'a', label: 'המכפיל קופץ ל-13.3, והרווח החוזר בכלל ירד' },
      { id: 'b', label: 'היא עדיין החברה הזולה ביותר בפער גדול' },
      { id: 'c', label: 'אין שום שינוי, רווח זה רווח' },
    ],
    answer: 'a',
    explain:
      'בלי מכירת הקרקע הרווח הוא ₪150 מיליון, פחות מלפני שנתיים. זו ״מלכודת ערך״: מכפיל נמוך שנראה כמו מציאה, כי הרווח שבמכנה לא יחזור. בנוסף, החוב שלה גבוה מההון.',
  },
  {
    id: 'growth',
    text: 'למה משקיעים מוכנים לשלם מכפיל 50 על ענן-טק?',
    options: [
      { id: 'a', label: 'כי הרווח שלה צומח מהר, והם משלמים על הרווחים של השנים הבאות' },
      { id: 'b', label: 'כי היא מחלקת את הדיבידנד הגבוה ביותר' },
      { id: 'c', label: 'כי יש לה הכי הרבה נכסים במאזן' },
    ],
    answer: 'a',
    explain:
      'מכפיל גבוה הוא הימור על צמיחה. אם הרווח ימשיך לגדול בקצב הזה, המכפיל ״יירד״ מעצמו תוך כמה שנים. אם הצמיחה תיעצר, המחיר עלול ליפול חזק.',
  },
  {
    id: 'loss',
    text: 'למה אין מכפיל רווח לאנרגיה ירוקה?',
    options: [
      { id: 'a', label: 'כי היא מפסידה כסף, ומכפיל של רווח שלילי חסר משמעות' },
      { id: 'b', label: 'כי היא לא מחלקת דיבידנד' },
      { id: 'c', label: 'כי המניה שלה זולה מדי' },
    ],
    answer: 'a',
    explain:
      'כשאין רווח, בודקים מכפילים אחרים, כמו מכפיל מכירות, ואת המגמה: ההפסד מצטמצם מ-60 ל-20. זו עדיין השקעה ספקולטיבית יותר.',
  },
]
