// פרטי האתר והמפעיל. מופיעים בתקנון, במדיניות הפרטיות ובהצהרת הנגישות.
// שדה שערכו null עוד לא נקבע: בעמודים הוא מוצג כ״חסר״, ו-npm run check:launch נכשל עד שימולא.
// אין להעלות את האתר לאוויר לפני שכל השדות מולאו בפרטים אמיתיים.
export const SITE = {
  name: 'AlphaTrader Learn',
  // הדומיין של האתר, בלי https:// (למשל example.co.il)
  domain: null,
  // שם המפעיל כפי שיופיע בתקנון: אדם פרטי, עוסק או חברה (עם מספר ח״פ / עוסק)
  operator: null,
  // כתובת דוא״ל לפניות, לשאלות פרטיות ולדיווח על טעויות בתוכן
  contactEmail: null,
  // העיר שבה נמצא בית המשפט המוסמך לפי התקנון
  jurisdictionCity: null,
  // רכז/ת הנגישות: חובה בהצהרת נגישות
  accessibility: {
    coordinatorName: null,
    phone: null,
    email: null,
  },
  // תאריך העדכון האחרון של המסמכים המשפטיים ושל בדיקת הנגישות (YYYY-MM-DD)
  policiesUpdatedAt: '2026-09-24',
  accessibilityCheckedAt: '2026-09-24',
}

/** כל השדות שעוד חסרים, לבדיקה לפני עלייה לאוויר */
export function missingSiteFields(site = SITE) {
  const missing = []
  const walk = (obj, prefix) => {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key
      if (value && typeof value === 'object') walk(value, path)
      else if (value == null || value === '') missing.push(path)
    }
  }
  walk(site, '')
  return missing
}
