// חישוב בלתי תלוי לשיעור סדרה הנדסית – בונים את האיברים בכפל חוזר ומחברים בלולאה (בלי הנוסחאות של השיעור).
// זו גם דוגמה לבוני שיעורים: לכל תשובה מספרית – חישוב בדרך אחרת מביטוי ה-check.
const gTerms = (a1, q, n) => { const t = [a1]; while (t.length < n) t.push(t[t.length - 1] * q); return t; };
const gTerm = (a1, q, n) => gTerms(a1, q, n)[n - 1];
const gSum = (a1, q, n) => gTerms(a1, q, n).reduce((s, x) => s + x, 0);
const gInf = (a1, q) => gSum(a1, q, 2000);            // סכום חלקי ארוך מספיק כשמנה בין -1 ל-1
const rootBy = (f, lo, hi) => { for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; (f(lo) * f(m) <= 0) ? (hi = m) : (lo = m); } return (lo + hi) / 2; };

export const expected = {
  'geometric-sequence': {
    g1: gTerm(5, 3, 5),
    g2: rootBy(q => gTerm(6 / q, q, 5) - 162, 1.5, 10),              // q שבעבורו a2=6 ו-a5=162
    g3: gSum(2, 3, 5),
    p1: gTerm(81, 1 / 3, 5), p2: gTerm(-2, -2, 6), p3: gInf(10, -1 / 4),
    p4: (() => { let n = 1; while (gSum(1, 2, n) < 255) n++; return n; })(),
    // b1: מחפשים q ב-(0,1) שבו סכום אין־סופי 12 וסכום שלושה ראשונים 10.5
    b1a: rootBy(q => gSum(12 * (1 - q), q, 3) - 10.5, 0.01, 0.99),
    b1b: 12 * (1 - 0.5),
    b1c: gTerms(6, 0.5, 4000).filter((_, i) => i % 2 === 1).reduce((s, x) => s + x, 0),
    b1d: gTerms(6, 0.5, 4000).reduce((s, x) => s + x * x, 0),
    q1: gTerm(4, 2, 6), q2: -24 / ((-2) * (-2) * (-2)), q3: gSum(1, 2, 6), q5: gInf(3, 1 / 4),
  },
};
