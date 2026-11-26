// חישוב בלתי תלוי לשיעור סדרה הנדסית – בונים את האיברים בכפל חוזר ומחברים בלולאה (בלי הנוסחאות של השיעור).
// זו גם דוגמה לבוני שיעורים: לכל תשובה מספרית – חישוב בדרך אחרת מביטוי ה-check.
const gTerms = (a1, q, n) => { const t = [a1]; while (t.length < n) t.push(t[t.length - 1] * q); return t; };
const gTerm = (a1, q, n) => gTerms(a1, q, n)[n - 1];
const gSum = (a1, q, n) => gTerms(a1, q, n).reduce((s, x) => s + x, 0);
const gInf = (a1, q) => gSum(a1, q, 2000);            // סכום חלקי ארוך מספיק כשמנה בין -1 ל-1
const rootBy = (f, lo, hi) => { for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; (f(lo) * f(m) <= 0) ? (hi = m) : (lo = m); } return (lo + hi) / 2; };

// סיווג מונוטוניות בכוח גס: בונים 60 איברים בכפל חוזר ובודקים את סימני ההפרשים הסמוכים,
// ואת ההתנהגות של הערך המוחלט (מתקרב ל-0 / גדל בלי גבול). לא משתמשים בכלל הסימנים מההסבר.
const classify = (terms) => {
  const d = terms.slice(1).map((x, i) => x - terms[i]);
  const dir = d.every(x => x > 0) ? 'increasing' : d.every(x => x < 0) ? 'decreasing' : d.every(x => x === 0) ? 'constant' : 'neither';
  const last = Math.abs(terms[terms.length - 1]);
  const lim = last < 1e-6 ? 'to0' : last > 1e6 ? 'unbounded' : 'bounded';
  return `${dir}/${lim}`;
};
const cls = (a1, q) => classify(gTerms(a1, q, 200));
const evenTerms = (a1, q, n) => gTerms(a1, q, 2 * n).filter((_, i) => i % 2 === 1);   // a2, a4, a6, ...

export const expected = {
  'geometric-sequence': {
    g1: gTerm(5, 3, 5),
    g2: rootBy(q => gTerm(6 / q, q, 5) - 162, 1.5, 10),              // q שבעבורו a2=6 ו-a5=162
    g3: gSum(2, 3, 5),
    g5: gTerm(-2, 0.5, 4) - gTerm(-2, 0.5, 3),
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

const near = (a, b) => Math.abs(a - b) < 1e-9;
export const extra = [
  // דוגמאות חדשות
  ['ex5: a5 = -1.5', near(gTerm(-24, 0.5, 5), -1.5)],
  ['ex5: a2-a1 = 12', near(gTerm(-24, 0.5, 2) - gTerm(-24, 0.5, 1), 12)],
  ['ex5: עולה ומתקרבת ל-0', cls(-24, 0.5) === 'increasing/to0'],
  ['ex6(א): לא עולה ולא יורדת', cls(4, -0.5).startsWith('neither/')],
  ['ex6(ב): a4 = 24', near(gTerm(-3, -2, 4), 24)],
  ['ex6(ב): לא עולה ולא יורדת, מתרחקת', cls(-3, -2) === 'neither/unbounded'],
  ['ex6(ג): a4 = 5', near(gTerm(-5, -1, 4), 5)],
  ['ex6(ג): שני ערכים בלבד', new Set(gTerms(-5, -1, 60)).size === 2 && cls(-5, -1).startsWith('neither/')],
  ['ex6(ד): קבועה', cls(7, 1).startsWith('constant/')],
  // שאלות בחירה חדשות
  ['g4: a1=-2,q=1/2 עולה ומתקרבת ל-0', cls(-2, 0.5) === 'increasing/to0'],
  ['p6: a1=-3,q=2 יורדת בלי גבול', cls(-3, 2) === 'decreasing/unbounded'],
  ['p5: a_n לא עולה ולא יורדת', cls(8, -0.5).startsWith('neither/')],
  ['p5: b_n (זוגיים) עולה', classify(evenTerms(8, -0.5, 30)).startsWith('increasing/')],
  ['p5: b1 = a2 = -4', near(evenTerms(8, -0.5, 1)[0], -4)],
  ['q6: a1=-10,q=4/5 עולה ומתקרבת ל-0', cls(-10, 0.8) === 'increasing/to0'],
  // דוגמאות בהסבר monotonicity
  ['expl: a1<0, q>1 יורדת', cls(-2, 2) === 'decreasing/unbounded'],
  ['expl: a1<0, 0<q<1 עולה', cls(-16, 0.5) === 'increasing/to0'],
  ['expl: a1>0, 0<q<1 יורדת', cls(16, 0.5) === 'decreasing/to0'],
  ['expl: a1>0, q>1 עולה', cls(3, 2) === 'increasing/unbounded'],
  // מסיחים שתוקנו: הערך נוצר בפועל מהטעות שבתג
  ['p1 מסיח n-vs-n-1 = 81·(1/3)^5', near(gTerm(81, 1 / 3, 6), 1 / 3)],
  ['p2 מסיח n-vs-n-1 = -2·(-2)^6', near(gTerm(-2, -2, 7), -128)],
  ['g3 מסיח sum-vs-term = a5', near(gTerm(2, 3, 5), 162)],
  ['g5 מסיח subtract-order = a3-a4', near(gTerm(-2, 0.5, 3) - gTerm(-2, 0.5, 4), -0.25)],
  ['g5 מסיח n-vs-n-1 = a5-a4', near(gTerm(-2, 0.5, 5) - gTerm(-2, 0.5, 4), 0.125)],
];
