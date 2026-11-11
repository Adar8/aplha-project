// מודל שליטה – מבוסס על כל הניסיונות לאורך זמן, לא על הציון הטוב ביותר.
// פונקציות טהורות: מקבלות נתונים ושעה, מחזירות תוצאה. בלי DOM ובלי localStorage.

export const DAY = 86400000;
export const HALF_LIFE_DAYS = 14;     // ראיה בת 14 יום שוקלת חצי
export const DELAY_DAYS = 3;          // הצלחה "מושהית" = לפחות 3 ימים אחרי הניסיון הראשון בשיעור
export const STALE_DAYS = 30;         // בלי הצלחה עצמאית 30 יום = צריך רענון
export const DISTINCT_REQUIRED = 3;   // תרגילים שונים שנפתרו בלי עזרה
export const LEVELS = ['טרם התחלת', 'בתהליך', 'בסיסי', 'טוב', 'שליטה'];

// משקל ראיה של ניסיון אחד: בלי עזרה 1, עם רמז 0.5, אחרי הצגת פתרון או טעות 0.
export function evidenceWeight(a) {
  if (!a.ok || a.revealed) return 0;
  return a.hints > 0 ? 0.5 : 1;
}
export const isUnassisted = a => a.ok && !a.revealed && !(a.hints > 0);

/**
 * @param {string[]} questionIds  כל מזהי השאלות בשיעור
 * @param {object[]} attempts     ניסיונות של השיעור הזה: {qid, ok, hints, revealed, ctx, ts}
 * @param {object[]} quizHistory  [{score, at}]
 * @param {number}   now
 */
export function computeMastery(questionIds, attempts, quizHistory = [], now = Date.now()) {
  const qset = new Set(questionIds);
  const atts = attempts.filter(a => qset.has(a.qid)).sort((a, b) => a.ts - b.ts);
  const lastQuiz = quizHistory.length ? quizHistory[quizHistory.length - 1].score : null;
  if (!atts.length && lastQuiz === null) {
    return { score: 0, level: 0, accuracy: 0, distinct: 0, delayed: false, lastQuiz: null, stale: false, attempts: 0, missing: ['עוד לא תרגלת את השיעור.'] };
  }
  let num = 0, den = 0;
  for (const a of atts) {
    const d = Math.pow(0.5, Math.max(0, now - a.ts) / DAY / HALF_LIFE_DAYS);
    num += d * evidenceWeight(a); den += d;
  }
  const accuracy = den ? num / den : 0;
  const unassisted = atts.filter(isUnassisted);
  const distinct = new Set(unassisted.map(a => a.qid)).size;
  const first = atts.length ? atts[0].ts : now;
  const delayed = unassisted.some(a => a.ctx === 'review' || a.ts - first >= DELAY_DAYS * DAY);
  const lastSuccess = unassisted.length ? unassisted[unassisted.length - 1].ts : null;
  const stale = lastSuccess !== null && now - lastSuccess > STALE_DAYS * DAY;

  // ציון 0–100: 45% דיוק משוקלל-זמן, 35% המבחן האחרון, 20% מגוון תרגילים שנפתרו בלי עזרה
  const variety = Math.min(1, distinct / (DISTINCT_REQUIRED * 2));
  const score = Math.round(100 * (0.45 * accuracy + 0.35 * ((lastQuiz ?? 0) / 100) + 0.20 * variety));

  const missing = [];
  if (distinct < DISTINCT_REQUIRED) missing.push(`צריך עוד ${DISTINCT_REQUIRED - distinct} תרגילים שונים שנפתרו נכון בלי רמזים.`);
  if (!delayed) missing.push('צריך הצלחה בחזרה, לפחות 3 ימים אחרי הלמידה.');
  if (lastQuiz === null) missing.push('עוד לא עשית את המבחן הקצר.');
  else if (lastQuiz < 80) missing.push(`המבחן האחרון: ${lastQuiz}. צריך 80 ומעלה.`);
  if (stale) missing.push('עבר יותר מחודש מההצלחה האחרונה. כדאי לרענן.');
  if (score < 80 && !missing.length) missing.push('צריך לשפר את הדיוק בתרגול.');

  let level;
  if (score >= 80 && distinct >= DISTINCT_REQUIRED && delayed && lastQuiz !== null && lastQuiz >= 80 && !stale) level = 4;
  else if (score >= 65 && distinct >= DISTINCT_REQUIRED) level = 3;
  else if (score >= 40) level = 2;
  else level = 1;

  return { score, level, accuracy, distinct, delayed, lastQuiz, stale, attempts: atts.length, missing: level === 4 ? [] : missing };
}
