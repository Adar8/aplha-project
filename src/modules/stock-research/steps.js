// שלבי מעבדת החקירה. כל שלב: על מה מסתכלים, שאלה, והממצא שנכנס לדף המחקר.
// finding.kind: strength (חוזקה) | warning (סימן אזהרה) | question (שאלה פתוחה)
import { pct, times, usdM, num } from './format.js'

// שורות הטבלה הפיננסית. get מקבל את המדדים של שנה (yearMetrics)
export const ROWS = {
  revenue: { label: 'הכנסות', get: (m) => m.revenue, format: usdM },
  revenueGrowth: { label: 'צמיחה בהכנסות', get: (m) => m.revenueGrowth, format: (v) => pct(v, 0) },
  grossMargin: { label: 'שולי רווח גולמי', get: (m) => m.grossMargin, format: (v) => pct(v, 0) },
  operatingMargin: { label: 'שולי רווח תפעולי', get: (m) => m.operatingMargin, format: (v) => pct(v, 1) },
  netIncome: { label: 'רווח נקי', get: (m) => m.netIncome, format: usdM },
  operatingCashFlow: { label: 'תזרים מפעילות שוטפת', get: (m) => m.operatingCashFlow, format: usdM },
  capex: { label: 'השקעות ברכוש קבוע', get: (m) => -m.capex, format: usdM },
  fcf: { label: 'תזרים חופשי', get: (m) => m.fcf, format: usdM },
  sbc: { label: 'תגמול במניות', get: (m) => m.sbc, format: usdM },
  fcfAfterSbc: { label: 'תזרים חופשי אחרי תגמול במניות', get: (m) => m.fcfAfterSbc, format: usdM },
  shares: { label: 'מספר מניות (מיליונים)', get: (m) => m.shares, format: num },
  receivablesToRevenue: { label: 'חובות לקוחות מתוך ההכנסות', get: (m) => m.receivablesToRevenue, format: (v) => pct(v, 1) },
  cash: { label: 'מזומן', get: (m) => m.cash, format: usdM },
  debt: { label: 'חוב', get: (m) => m.debt, format: usdM },
  netDebt: { label: 'חוב נטו', get: (m) => m.netDebt, format: usdM },
  netDebtToEbitda: { label: 'חוב נטו ל-EBITDA', get: (m) => m.netDebtToEbitda, format: (v) => times(v) },
  interestCoverage: { label: 'כיסוי ריבית', get: (m) => m.interestCoverage, format: (v) => times(v) },
}

export const STEPS = [
  {
    id: 'business',
    title: 'להבין את העסק',
    source: 'דוח 10-K, פרק 1 (Business) ופרק 1A (Risk Factors)',
    rows: [],
    question: 'מה משפיע הכי הרבה על ההכנסות של נובה-פיי?',
    options: [
      { id: 'a', label: 'כמה הלקוחות שלה מוכרים: על כל עסקה בחנות היא מקבלת עמלה' },
      { id: 'b', label: 'כמה עובדים יש לה' },
      { id: 'c', label: 'מחיר המניה שלה בבורסה' },
    ],
    answer: 'a',
    explain:
      '70% מההכנסות הן עמלה על עסקאות. לכן ההכנסות תלויות בהיקף הקניות בחנויות של הלקוחות, והאטה בצריכה תפגע בהן. זה בדיוק אחד מגורמי הסיכון שהחברה עצמה כתבה.',
    findings: [
      { kind: 'strength', text: 'מודל הכנסות חוזר: עמלה על כל עסקה ומנויים חודשיים, בלי תלות בלקוח אחד גדול.' },
      { kind: 'question', text: 'תלות בבנק שותף אחד ובהיקף הצריכה. מה קורה להכנסות בהאטה?' },
    ],
  },
  {
    id: 'growth',
    title: 'צמיחה ושוליים',
    source: 'דוח רווח והפסד, 5 שנים',
    rows: ['revenue', 'revenueGrowth', 'grossMargin', 'operatingMargin', 'netIncome'],
    question: 'ההכנסות צמחו בכ-17% בשנה, והשוליים התפעוליים עלו מ-5% ל-14%. מה ההסבר הסביר?',
    options: [
      { id: 'a', label: 'מינוף תפעולי: ההוצאות הקבועות גדלות לאט יותר מההכנסות' },
      { id: 'b', label: 'החברה העלתה מחירים ב-180%' },
      { id: 'c', label: 'רווח חד-פעמי מנפח את השנה האחרונה' },
    ],
    answer: 'a',
    explain:
      'השיפור הדרגתי ועקבי, שנה אחרי שנה, ולא קפיצה בשנה אחת. זה סימן של מינוף תפעולי: פיתוח התוכנה והמטה עולים כמעט אותו דבר גם כשיש יותר לקוחות. אבל שימו לב לשורת הצמיחה: 20%, 20%, 16%, 14%. הצמיחה מאטה.',
    findings: [
      { kind: 'strength', text: 'צמיחה דו-ספרתית ושיפור עקבי בשוליים (מינוף תפעולי).' },
      { kind: 'question', text: 'הצמיחה מאטה מ-20% ל-14%. זה טבעי לחברה שגדלה, או סימן לתחרות?' },
    ],
  },
  {
    id: 'quality',
    title: 'איכות הרווח',
    source: 'דוח תזרים מזומנים ומאזן',
    rows: ['netIncome', 'operatingCashFlow', 'capex', 'fcf', 'sbc', 'fcfAfterSbc', 'shares', 'receivablesToRevenue'],
    question: 'התזרים החופשי (230) גבוה מהרווח הנקי (160). מה חשוב לבדוק לפני שמתלהבים?',
    options: [
      { id: 'a', label: 'את התגמול במניות: הוא לא יוצא מהקופה, אבל מדלל את בעלי המניות' },
      { id: 'b', label: 'כלום. תזרים גבוה מהרווח זה תמיד סימן טוב' },
      { id: 'c', label: 'את מחיר המניה ביום פרסום הדוח' },
    ],
    answer: 'a',
    explain:
      'תגמול במניות הוא הוצאה אמיתית, אבל בדוח התזרים מחזירים אותו, כי לא שולם במזומן. בפועל משלמים אותו בעלי המניות: מספר המניות עלה מ-100 ל-116 מיליון בארבע שנים. בלי התגמול, התזרים החופשי הוא 110 ולא 230. ועוד פרט: חובות הלקוחות גדלים ב-25% בשנה, מהר מההכנסות.',
    findings: [
      { kind: 'warning', text: 'תגמול במניות גבוה: מספר המניות עולה בכ-4% בשנה, והתזרים ״האמיתי״ כמחצית מהמדווח.' },
      { kind: 'warning', text: 'חובות הלקוחות צומחים מהר מההכנסות (מ-12.5% ל-16.4% מההכנסות). לבדוק למה.' },
    ],
  },
  {
    id: 'balance',
    title: 'חוסן פיננסי',
    source: 'מאזן ודוח רווח והפסד',
    rows: ['cash', 'debt', 'netDebt', 'netDebtToEbitda', 'interestCoverage'],
    question: 'האם החוב של נובה-פיי מדאיג כרגע?',
    options: [
      { id: 'a', label: 'לא במיוחד: יש לה יותר מזומן מחוב, והרווח התפעולי מכסה את הריבית כמעט פי 10' },
      { id: 'b', label: 'כן, חוב של 420 מיליון זה הרבה כסף' },
      { id: 'c', label: 'אי אפשר לדעת בלי מחיר המניה' },
    ],
    answer: 'a',
    explain:
      'סכום החוב לבד לא אומר הרבה. משווים אותו למזומן (חוב נטו) וליכולת לשלם: ב-2021 הכיסוי היה 1.6 בלבד, והיום כמעט 10. החברה עברה ממצב שבו החוב הכביד למצב של מזומן נטו.',
    findings: [{ kind: 'strength', text: 'מאזן חזק: מזומן נטו, וכיסוי ריבית של כמעט פי 10.' }],
  },
  {
    id: 'price',
    title: 'המחיר',
    source: 'מחיר המניה מול הנתונים',
    rows: [],
    question: 'במחיר של $60, מה השוק בעצם מניח?',
    options: [
      { id: 'a', label: 'שהתזרים ימשיך לצמוח בקצב דו-ספרתי במשך שנים' },
      { id: 'b', label: 'שהחברה תפסיק לצמוח' },
      { id: 'c', label: 'שום דבר. מחיר הוא רק מספר' },
    ],
    answer: 'a',
    explain:
      'מכפיל רווח של יותר מ-40 ותשואת תזרים של 3.3% אומרים שמשלמים היום על הרבה צמיחה עתידית. במחשבון ״מה המחיר מניח״ למעלה רואים כמה בדיוק. אם הצמיחה תאט מהר, המחיר צריך לרדת גם אם העסק ממשיך להיות טוב.',
    findings: [
      { kind: 'question', text: 'המחיר מניח שנים של צמיחה דו-ספרתית בתזרים, בזמן שצמיחת ההכנסות מאטה. מה יקרה אם היא תמשיך לרדת?' },
    ],
  },
]

export const FINDING_KINDS = {
  strength: { label: 'חוזקות', one: 'חוזקה', icon: '＋' },
  warning: { label: 'סימני אזהרה', one: 'אזהרה', icon: '!' },
  question: { label: 'שאלות פתוחות', one: 'שאלה פתוחה', icon: '?' },
}
