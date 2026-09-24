import { TERMS } from './glossary.js'

// מודולי הלימוד והמילון. הדף הראשי נבנה מהמערך הזה.
// accent: cyan | pink | purple | lime (ממופה לטוקנים ב-tokens.css)
// status: available (יש עמוד) | soon (כרטיס בלבד)
export const modules = [
  {
    id: 'what-is-a-stock',
    kind: 'module',
    number: 1,
    title: 'מהי מניה',
    summary:
      'מה זה אומר להיות בעלים של חברה, מה זו בורסה, שוק ראשוני מול משני, ומה ההבדל בין Bid ל-Ask.',
    accent: 'cyan',
    status: 'available',
    path: '/modules/what-is-a-stock',
    minutes: 15,
  },
  {
    id: 'order-types',
    kind: 'module',
    number: 2,
    title: 'סוגי פקודות',
    summary:
      'פקודת שוק (Market) מול פקודה מוגבלת (Limit), החלקה, עדיפות בתור, וסימולטור ספר פקודות חי.',
    accent: 'pink',
    status: 'available',
    path: '/modules/order-types',
    minutes: 15,
  },
  {
    id: 'chart-reading',
    kind: 'module',
    number: 3,
    title: 'קריאת גרף',
    summary:
      'טווחי זמן, מגמות, תמיכה והתנגדות, ונפח מסחר. כולל תרגיל זיהוי מגמה וסימולטור שבו מסמנים רמות על גרף.',
    accent: 'lime',
    status: 'available',
    path: '/modules/chart-reading',
    minutes: 20,
  },
  {
    id: 'glossary',
    kind: 'glossary',
    title: 'מילון מונחים',
    summary:
      'חיפוש וסינון מונחים לפי קטגוריות: כלי השקעה וקרנות, ניירות ערך, מדדי הערכה, מסחר ותנודתיות, מאקרו, משכנתאות וגופי פיקוח.',
    accent: 'purple',
    status: 'available',
    path: '/glossary',
    termCount: TERMS.length,
  },
]

export function getModule(id) {
  return modules.find((m) => m.id === id)
}
