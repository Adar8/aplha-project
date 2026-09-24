// חברה דמיונית למעבדת החקירה. הנתונים בנויים כך שיהיו בהם גם נקודות חוזק וגם סימני אזהרה,
// כמו בחברות אמיתיות. במיליוני דולרים, מניות במיליונים.

export const COMPANY = {
  name: 'נובה-פיי',
  ticker: 'NOVA',
  sector: 'תוכנה לתשלומים',
  price: 60,
  about: [
    'נובה-פיי מספקת מערכת סליקה וקופה בענן לחנויות ולמסעדות קטנות בארה״ב. כ-70% מההכנסות הן עמלה קטנה על כל עסקה שעוברת במערכת, והשאר מנויים חודשיים לתוכנה.',
    'יש לה כ-90 אלף לקוחות עסקיים. הלקוח הגדול ביותר אחראי ל-4% מההכנסות. המתחרות העיקריות הן חברות תשלומים גדולות, שמציעות מוצר דומה ולפעמים זול יותר.',
  ],
  risks: [
    'הסליקה עוברת דרך בנק שותף אחד. אם ההסכם איתו יסתיים, נצטרך למצוא בנק אחר, וזה עלול לקחת זמן.',
    'ההכנסות שלנו תלויות בהיקף הקניות בחנויות של הלקוחות. האטה בצריכה תפגע בהן ישירות.',
    'חלק משמעותי מהתגמול לעובדים ניתן במניות, ואנחנו מצפים שזה יימשך.',
  ],
  years: [
    { year: 2021, revenue: 800, grossProfit: 464, operatingIncome: 40, depreciation: 50, interest: 25, netIncome: 25, operatingCashFlow: 90, capex: 30, sbc: 60, shares: 100, receivables: 100, cash: 300, debt: 500, equity: 900 },
    { year: 2022, revenue: 960, grossProfit: 566, operatingIncome: 72, depreciation: 55, interest: 25, netIncome: 50, operatingCashFlow: 130, capex: 35, sbc: 75, shares: 104, receivables: 125, cash: 320, debt: 500, equity: 1025 },
    { year: 2023, revenue: 1150, grossProfit: 690, operatingIncome: 115, depreciation: 60, interest: 24, netIncome: 85, operatingCashFlow: 180, capex: 40, sbc: 90, shares: 108, receivables: 160, cash: 350, debt: 480, equity: 1200 },
    { year: 2024, revenue: 1330, grossProfit: 811, operatingIncome: 160, depreciation: 65, interest: 23, netIncome: 120, operatingCashFlow: 230, capex: 45, sbc: 105, shares: 112, receivables: 200, cash: 400, debt: 450, equity: 1425 },
    { year: 2025, revenue: 1520, grossProfit: 942, operatingIncome: 213, depreciation: 70, interest: 22, netIncome: 160, operatingCashFlow: 280, capex: 50, sbc: 120, shares: 116, receivables: 250, cash: 450, debt: 420, equity: 1705 },
  ],
}
