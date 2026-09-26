// מבחן מיקום: שתי שאלות לכל מודול. מי שעונה נכון על שתיהן יכול לדלג על המודול.
// הדילוג הוא המלצה בלבד — המודול נשאר פתוח, וזה לא מסמן אותו כהושלם.

export const PLACEMENT = [
  {
    module: 'what-is-a-stock',
    id: 'owner',
    text: 'קנית מניה של חברה. מה בדיוק קיבלת?',
    options: [
      { id: 'a', label: 'חלק קטן מהבעלות על החברה' },
      { id: 'b', label: 'הלוואה שהחברה צריכה להחזיר לך עם ריבית' },
      { id: 'c', label: 'התחייבות של החברה שהמחיר יעלה' },
    ],
    answer: 'a',
  },
  {
    module: 'what-is-a-stock',
    id: 'bidask',
    text: 'במסך רואים Bid 99.8 ו-Ask 100.0. בקנייה עכשיו בפקודת שוק, באיזה מחיר סביר שהעסקה תתבצע?',
    options: [
      { id: 'a', label: '99.8' },
      { id: 'b', label: '100.0' },
      { id: 'c', label: '99.9, באמצע' },
    ],
    answer: 'b',
  },
  {
    module: 'order-types',
    id: 'limit',
    text: 'שמת פקודת Limit לקנייה ב-50, והמניה נסחרת ב-52. מה יקרה?',
    options: [
      { id: 'a', label: 'הפקודה תבוצע מיד ב-52' },
      { id: 'b', label: 'הפקודה תחכה, ותבוצע רק אם מישהו ימכור ב-50 או פחות' },
      { id: 'c', label: 'הפקודה תבוטל אוטומטית' },
    ],
    answer: 'b',
  },
  {
    module: 'order-types',
    id: 'slippage',
    text: 'מה הסיכון העיקרי של פקודת שוק גדולה במניה עם מעט מסחר?',
    options: [
      { id: 'a', label: 'שהיא לא תבוצע בכלל' },
      { id: 'b', label: 'שהיא ״תאכל״ כמה רמות מחיר ותבוצע במחיר ממוצע גרוע (החלקה)' },
      { id: 'c', label: 'שהבורסה תגבה עליה עמלה כפולה' },
    ],
    answer: 'b',
  },
  {
    module: 'chart-reading',
    id: 'trend',
    text: 'איך נראית מגמת עלייה בגרף?',
    options: [
      { id: 'a', label: 'שיאים ושפלים שעולים, כל אחד גבוה מהקודם' },
      { id: 'b', label: 'כמה נרות ירוקים ברצף' },
      { id: 'c', label: 'מחיר שגבוה ממה שהיה לפני שנה' },
    ],
    answer: 'a',
  },
  {
    module: 'chart-reading',
    id: 'support',
    text: 'מה זו רמת תמיכה?',
    options: [
      { id: 'a', label: 'מחיר שהחברה מתחייבת לשמור עליו' },
      { id: 'b', label: 'אזור שבו המחיר הפסיק לרדת כמה פעמים בעבר, כי קונים נכנסו' },
      { id: 'c', label: 'המחיר הממוצע של השנה האחרונה' },
    ],
    answer: 'b',
  },
  {
    module: 'risk-management',
    id: 'recovery',
    text: 'תיק ירד ב-50%. כמה הוא צריך לעלות כדי לחזור לנקודת ההתחלה?',
    options: [
      { id: 'a', label: '50%' },
      { id: 'b', label: '75%' },
      { id: 'c', label: '100%' },
    ],
    answer: 'c',
  },
  {
    module: 'risk-management',
    id: 'size',
    text: 'חשבון של ₪10,000, מוכנים לסכן 1% ממנו, והסטופ רחוק ₪2 ממחיר הכניסה. כמה מניות זה?',
    options: [
      { id: 'a', label: '50 מניות' },
      { id: 'b', label: '100 מניות' },
      { id: 'c', label: '500 מניות' },
    ],
    answer: 'a',
  },
  {
    module: 'fundamentals',
    id: 'pe',
    text: 'מניה במחיר ₪60 עם רווח למניה של ₪4. מה מכפיל הרווח?',
    options: [
      { id: 'a', label: '4' },
      { id: 'b', label: '15' },
      { id: 'c', label: '240' },
    ],
    answer: 'b',
  },
  {
    module: 'fundamentals',
    id: 'trap',
    text: 'למה מכפיל רווח נמוך מאוד לא תמיד אומר שהמניה זולה?',
    options: [
      { id: 'a', label: 'כי הרווח יכול לכלול רווח חד-פעמי שלא יחזור' },
      { id: 'b', label: 'כי מכפיל נמוך תמיד אומר שהמניה יקרה' },
      { id: 'c', label: 'כי מכפיל רווח לא קשור לרווח' },
    ],
    answer: 'a',
  },
  {
    module: 'stock-research',
    id: 'filing',
    text: 'איפה מוצאים את התיאור המלא של העסק וגורמי הסיכון של חברה אמריקאית?',
    options: [
      { id: 'a', label: 'בדוח השנתי 10-K שהיא מגישה ל-SEC' },
      { id: 'b', label: 'בגרף המחיר של המניה' },
      { id: 'c', label: 'בדירוג של האנליסטים' },
    ],
    answer: 'a',
  },
  {
    module: 'stock-research',
    id: 'quality',
    text: 'חברה מדווחת רווח נקי של 100 כל שנה, אבל התזרים מפעילות שוטפת הוא רק 20. מה זה מרמז?',
    options: [
      { id: 'a', label: 'שהרווח לא הופך למזומן, וכדאי לבדוק למה' },
      { id: 'b', label: 'שהחברה חוסכת במיסים' },
      { id: 'c', label: 'כלום, תזרים ורווח הם אותו דבר' },
    ],
    answer: 'a',
  },
  {
    module: 'trading-psychology',
    id: 'disposition',
    text: 'מה מתאר ״אפקט הדיספוזיציה״?',
    options: [
      { id: 'a', label: 'הנטייה למכור מהר מניות שעלו ולהחזיק מניות שירדו' },
      { id: 'b', label: 'הנטייה של מניות לחזור למחיר הממוצע שלהן' },
      { id: 'c', label: 'ההשפעה של דיבידנד על מחיר המניה' },
    ],
    answer: 'a',
  },
  {
    module: 'trading-psychology',
    id: 'revenge',
    text: 'אחרי הפסד, סוחר פותח מיד עסקה גדולה מהרגיל כדי להחזיר את הכסף. איך קוראים לזה?',
    options: [
      { id: 'a', label: 'גידור' },
      { id: 'b', label: 'מסחר נקמה' },
      { id: 'c', label: 'מיצוע כלפי מטה' },
    ],
    answer: 'b',
  },
  {
    module: 'taxes-israel',
    id: 'when',
    text: 'מתי נוצר מס רווחי הון על מניה שעלתה, אצל ברוקר ישראלי?',
    options: [
      { id: 'a', label: 'כשמעבירים את הכסף מחשבון המסחר לחשבון הבנק' },
      { id: 'b', label: 'בסוף כל שנה, על כל מניה שעלתה' },
      { id: 'c', label: 'ברגע שמוכרים את המניה ברווח' },
    ],
    answer: 'c',
  },
  {
    module: 'taxes-israel',
    id: 'offset',
    text: 'באותה שנה הרווחתם ₪4,000 במניה אחת והפסדתם ₪4,000 במניה אחרת, ומכרתם את שתיהן. כמה מס רווחי הון יש?',
    options: [
      { id: 'a', label: 'אפס, ההפסד מקוזז מול הרווח' },
      { id: 'b', label: '₪1,000, 25% מהרווח' },
      { id: 'c', label: '₪2,000, 25% מהרווח ומההפסד' },
    ],
    answer: 'a',
  },
]

/** @returns Record<moduleId, boolean> — true אם כל השאלות של המודול נענו נכון */
export function gradePlacement(answers) {
  const result = {}
  for (const q of PLACEMENT) {
    const ok = answers[q.id] === q.answer
    result[q.module] = (result[q.module] ?? true) && ok
  }
  return result
}
