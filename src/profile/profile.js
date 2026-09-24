// פרופיל הלמידה: השאלות בשאלון הפתיחה, והחשבון שהופך את התשובות למסלול.
// פונקציות טהורות בלבד — בלי React ובלי אחסון.
// התשובות משמשות רק להתאמת הלימוד (רמה, סדר, זמן, דוגמאות). הן לא בסיס להמלצת השקעה.

export const LEVELS = [
  { id: 'basic', label: 'בסיסי', hint: 'הסבר פשוט, צעד אחרי צעד' },
  { id: 'deep', label: 'מעמיק', hint: 'יותר מספרים, יותר ניואנסים' },
]

export const QUESTIONS = [
  {
    id: 'experience',
    title: 'מה הניסיון שלך עם שוק ההון?',
    options: [
      { id: 'new', label: 'אף פעם לא השקעתי', hint: 'מתחילים מאפס, וזה בסדר גמור' },
      { id: 'some', label: 'קניתי קצת, אבל בלי סדר', hint: 'מניה פה, קרן שם, בלי תמונה מלאה' },
      { id: 'experienced', label: 'משקיע או סוחר באופן קבוע', hint: 'מכיר את הבסיס, רוצה לסגור פערים' },
    ],
  },
  {
    id: 'goal',
    title: 'מה הכי חשוב לך להבין?',
    options: [
      { id: 'understand', label: 'איך שוק ההון עובד', hint: 'להבין חדשות, מושגים ואיך הכול מתחבר' },
      { id: 'longterm', label: 'השקעה לטווח ארוך', hint: 'חיסכון, קרנות, ולמה סבלנות משנה' },
      { id: 'active', label: 'מסחר עצמאי מסודר יותר', hint: 'גרפים, פקודות וניהול סיכונים' },
      { id: 'track', label: 'להבין את התיק שכבר יש לי', hint: 'מה קניתי, ומה המספרים אומרים' },
    ],
  },
  {
    id: 'weekly',
    title: 'כמה זמן בשבוע יש לך ללמידה?',
    options: [
      { id: 30, label: 'חצי שעה' },
      { id: 60, label: 'שעה' },
      { id: 120, label: 'שעתיים' },
      { id: 180, label: 'שלוש שעות ומעלה' },
    ],
  },
  {
    id: 'age',
    optional: true,
    title: 'טווח גילאים',
    note: 'לא חובה. עוזר לנו לבחור דוגמאות רלוונטיות יותר.',
    options: [
      { id: 'u25', label: 'עד 25' },
      { id: '25-34', label: '25–34' },
      { id: '35-49', label: '35–49' },
      { id: '50+', label: '50 ומעלה' },
    ],
  },
  {
    id: 'invest',
    optional: true,
    title: 'באיזה סדר גודל אתה משקיע, או חושב להשקיע?',
    note: 'לא חובה. משמש רק כדי שהמספרים בסימולטורים ירגישו כמו שלך. אנחנו לא ממליצים כמה להשקיע.',
    options: [
      { id: 'none', label: 'עדיין לא משקיע' },
      { id: 'u10k', label: 'עד ₪10,000' },
      { id: '10-50k', label: '₪10,000–50,000' },
      { id: '50-250k', label: '₪50,000–250,000' },
      { id: '250k+', label: 'מעל ₪250,000' },
    ],
  },
]

export function getQuestion(id) {
  return QUESTIONS.find((q) => q.id === id)
}

export function answerLabel(questionId, answerId) {
  return getQuestion(questionId)?.options.find((o) => o.id === answerId)?.label ?? null
}

/** רמת ההסבר ההתחלתית לפי הניסיון. תמיד אפשר להחליף בכל מודול */
export function defaultLevel(answers) {
  return answers?.experience === 'experienced' ? 'deep' : 'basic'
}

/** הרמה של מודול מסוים: בחירה ידנית במודול גוברת על ברירת המחדל מהשאלון */
export function levelFor(profile, moduleId) {
  return profile?.moduleLevels?.[moduleId] ?? defaultLevel(profile?.answers)
}

// הסדר המומלץ לפי המטרה. המודולים בנויים אחד על השני, אז מודול 01 תמיד ראשון.
const ORDER_BY_GOAL = {
  understand: ['what-is-a-stock', 'order-types', 'fundamentals', 'stock-research', 'chart-reading', 'risk-management'],
  longterm: ['what-is-a-stock', 'fundamentals', 'stock-research', 'risk-management', 'order-types', 'chart-reading'],
  active: ['what-is-a-stock', 'order-types', 'chart-reading', 'risk-management', 'fundamentals', 'stock-research'],
  track: ['what-is-a-stock', 'fundamentals', 'stock-research', 'risk-management', 'chart-reading', 'order-types'],
}

// סכום ברירת מחדל לחשבון בסימולטורים, לפי טווח ההשקעה
const ACCOUNT_BY_INVEST = { none: 10000, u10k: 10000, '10-50k': 30000, '50-250k': 100000, '250k+': 300000 }

export function accountSize(answers, fallback) {
  return ACCOUNT_BY_INVEST[answers?.invest] ?? fallback
}

/** זמן לימוד של מודול ברמה נתונה, בדקות */
export function moduleMinutes(module, level) {
  if (!module.minutes) return null
  return typeof module.minutes === 'number' ? module.minutes : module.minutes[level]
}

/**
 * המסלול האישי.
 * @param modules כל המודולים (מ-data/modules.js)
 * @param profile הפרופיל השמור (או null)
 * @param progress מודולים שהושלמו
 * @returns { order, next, known, remainingMinutes, weeks }
 */
export function buildPlan(modules, profile, progress) {
  const lessons = modules.filter((m) => m.kind === 'module' && m.status === 'available')
  const byId = Object.fromEntries(lessons.map((m) => [m.id, m]))
  const answers = profile?.answers
  const preferred = ORDER_BY_GOAL[answers?.goal] ?? lessons.map((m) => m.id)
  // מודולים שנוספו ועוד לא נכנסו לסדר של מטרה כלשהי — בסוף, לפי המספר
  const order = [
    ...preferred.filter((id) => byId[id]),
    ...lessons.map((m) => m.id).filter((id) => !preferred.includes(id)),
  ].map((id) => byId[id])

  const known = new Set(
    Object.entries(profile?.placement ?? {})
      .filter(([, ok]) => ok)
      .map(([id]) => id),
  )
  const todo = order.filter((m) => !progress[m.id] && !known.has(m.id))
  const next = todo[0] ?? order.find((m) => !progress[m.id]) ?? null
  const remainingMinutes = todo.reduce((sum, m) => sum + (moduleMinutes(m, levelFor(profile, m.id)) ?? 0), 0)
  const weekly = answers?.weekly
  const weeks = weekly ? Math.max(1, Math.ceil(remainingMinutes / weekly)) : null
  return { order, next, known, remainingMinutes, weeks }
}
