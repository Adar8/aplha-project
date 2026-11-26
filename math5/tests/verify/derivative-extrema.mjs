// חישוב בלתי תלוי לשיעור derivative-extrema.
// שיטה (שונה מביטויי ה-check בשיעור): הפונקציות נכתבות כפונקציות JS רגילות (לא כמקדמים), הנגזרת מחושבת
// נומרית (הפרש מרכזי + אקסטרפולציית ריצ'רדסון), נקודות קיצון נמצאות בסריקת סימן של f' על רשת צפופה
// + ביסקציה, והסיווג max/min נעשה לפי כיוון החלפת הסימן בפועל. לא משתמשים בכלל "שורש שמאלי = מקסימום"
// ולא בנוסחת הקודקוד/דיסקרימיננטה.

const D = (f, x, h = 1e-2) => {
  const c = k => (f(x + k) - f(x - k)) / (2 * k);
  return (4 * c(h / 2) - c(h)) / 3;              // מדויק לפולינומים עד מעלה 4 (עד שגיאת עיגול)
};
const r8 = v => Math.round(v * 1e8) / 1e8;        // ניקוי רעש נקודה צפה בלבד
const EPS = 1e-7;
const sgn = v => (Math.abs(v) < EPS ? 0 : Math.sign(v));
const bisect = (g, lo, hi) => { for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; (Math.sign(g(lo)) * Math.sign(g(m)) <= 0) ? (hi = m) : (lo = m); } return (lo + hi) / 2; };

// כל נקודות הקיצון ב-[lo,hi]: סריקה של f' ושמירת הסימן האחרון שאינו אפס, כך שאפס בודד בלי החלפת סימן לא נספר.
function extrema(f, lo = -20, hi = 20, step = 1e-3) {
  const g = x => D(f, x);
  const out = [];
  let prevX = lo, prevS = sgn(g(lo));
  const N = Math.round((hi - lo) / step);
  for (let i = 1; i <= N; i++) {
    const x = lo + i * step, s = sgn(g(x));
    if (s === 0) continue;
    if (prevS !== 0 && s !== prevS) {
      const xc = r8(bisect(g, prevX, x));
      out.push({ x: xc, y: r8(f(xc)), type: prevS > 0 ? 'max' : 'min' });
    }
    prevS = s; prevX = x;
  }
  return out;
}
const one = (f, type) => { const e = extrema(f).filter(p => p.type === type); if (e.length !== 1) throw new Error(`expected one ${type}, got ${e.length}`); return e[0]; };

// שורשים שונים של f: החלפות סימן (ביסקציה) + נקודות רשת שבהן |f| כמעט 0 ומינימום מקומי של |f| (שורש כפול).
export function distinctRoots(f, lo = -20, hi = 20, step = 1e-3) {
  const rs = [];
  const add = x => { if (!rs.some(r => Math.abs(r - x) < 1e-6)) rs.push(r8(x)); };
  const N = Math.round((hi - lo) / step);
  const k = Math.round(1 / step);                 // נקודות רשת מדויקות j/k (בלי הצטברות שגיאה מ-lo+i*step)
  for (let i = 0; i < N; i++) {
    const a = (Math.round(lo * k) + i) / k, b = (Math.round(lo * k) + i + 1) / k;
    if (Math.abs(f(a)) < 1e-9) add(a);
    else if (f(a) * f(b) < 0) add(bisect(f, a, b));
  }
  return rs.sort((p, q) => p - q);
}
// סימן f' בנקודת דגימה, לבדיקת תחומי עלייה/ירידה
const inc = (f, x) => D(f, x) > EPS, dec = (f, x) => D(f, x) < -EPS;

// הפונקציות בשיעור
const F = {
  ex1: x => x ** 3 - 3 * x ** 2 - 9 * x + 5,
  ex2: x => x * x - 4 * x + 1,
  ex4: x => -(x ** 3) + 3 * x,
  ex5: a => x => x ** 3 + a * x,
  e5q: x => -x * x + 6 * x,
  g1: x => 2 * x ** 3 - 6 * x,
  g3: x => x * x - 6 * x + 11,
  g4: x => -(x ** 3) + 6 * x * x - 9 * x + 5,
  g5: x => x ** 3 - 3 * x * x + 3 * x,
  p1: x => 4 * x ** 3 - 5 * x * x + x - 7,
  p2: x => x ** 3 - 12 * x + 1,
  p4: x => x * x + 2 * x,
  p5: x => -2 * x ** 3 + 3 * x * x + 12 * x,
  p6: b => x => x ** 3 + 3 * x * x + b * x,
  b1: x => x ** 3 - 6 * x * x + 9 * x,
  q2: x => x * x - 8 * x,
  q3: x => x ** 3 - 3 * x,
  q4: x => 3 * x * x + 1,
  q6: x => -(x ** 3) + 12 * x,
  q7: x => (x - 2) ** 3 / 3,                  // פונקציה שהנגזרת שלה (x-2)^2
};
// a ב-ex3: חיפוש כוח גס על רשת a ∈ [-10,10] בצעד 0.001 של |f_a'(2)| מינימלי
const ex3a = (() => { let best = 0, bv = Infinity; for (let i = -10000; i <= 10000; i++) { const a = i / 1000, v = Math.abs(D(x => x ** 3 + a * x * x + 3, 2)); if (v < bv) { bv = v; best = a; } } return best; })();
const ex3f = x => x ** 3 + ex3a * x * x + 3;
// משיק: b = f(x0) - f'(x0)·x0
const tangentB = (f, x0) => r8(f(x0) - D(f, x0) * x0);

export const expected = {
  'derivative-extrema': {
    g1: one(F.g1, 'max').x,
    g2: r8(D(x => x ** 3, 2)),
    g3: one(F.g3, 'min').y,
    g4: one(F.g4, 'max').x,
    g5: extrema(F.g5).length,
    p1: r8(D(F.p1, 1)),
    p2: one(F.p2, 'min').y,
    p4: tangentB(F.p4, 1),
    p5: one(F.p5, 'min').y,
    b1a: distinctRoots(F.b1).length,
    b1b: one(F.b1, 'max').y,
    b1c: r8(D(F.b1, 0)),
    b1d: (() => { const m = r8(D(F.b1, 0)); return distinctRoots(x => F.b1(x) - m * x).filter(r => Math.abs(r) > 1e-6)[0]; })(),
    q1: r8(D(x => x ** 4, 1)),
    q2: one(F.q2, 'min').x,
    q3: one(F.q3, 'max').y,
    q4: r8(D(F.q4, -1)),
    q6: one(F.q6, 'max').y,
  },
};

const same = (pts, want) => pts.length === want.length && want.every(([x, y, t], i) => Math.abs(pts[i].x - x) < 1e-6 && Math.abs(pts[i].y - y) < 1e-6 && pts[i].type === t);
const countFor = (fam, vals) => vals.map(v => extrema(fam(v), -10, 10, 2e-3).length);

export const extra = [
  // ex1 (שוחזר C1/H1): נקודות, תחומי עלייה/ירידה, ושלבי טבלת הסימנים
  ['de/ex1: max (-1,10), min (3,-22)', same(extrema(F.ex1), [[-1, 10, 'max'], [3, -22, 'min']])],
  ['de/ex1: עולה ב-x<-1 וב-x>3, יורדת ב--1<x<3', [-5, -2, -1.01].every(x => inc(F.ex1, x)) && [-0.99, 0, 2.99].every(x => dec(F.ex1, x)) && [3.01, 4, 8].every(x => inc(F.ex1, x))],
  ["de/ex1: f'(-2)=15, f'(0)=-9, f'(4)=15", [[-2, 15], [0, -9], [4, 15]].every(([x, v]) => Math.abs(D(F.ex1, x) - v) < 1e-6)],
  // ex2
  ['de/ex2: משיק y=2x-8', Math.abs(D(F.ex2, 3) - 2) < 1e-6 && Math.abs(tangentB(F.ex2, 3) + 8) < 1e-6],
  // ex3 (H1 + M2): a, שתי נקודות הקיצון, שלבי הטבלה
  ['de/ex3: a=-3 (חיפוש רשת)', ex3a === -3],
  ['de/ex3: max (0,3), min (2,-1)', same(extrema(ex3f), [[0, 3, 'max'], [2, -1, 'min']])],
  ["de/ex3: f'(1)=-3, f'(3)=9, f'(-1)=9", [[1, -3], [3, 9], [-1, 9]].every(([x, v]) => Math.abs(D(ex3f, x) - v) < 1e-6)],
  // ex4: מקדם מוביל שלילי, הסדר מתהפך
  ['de/ex4: min (-1,-2) משמאל, max (1,2) מימין', same(extrema(F.ex4), [[-1, -2, 'min'], [1, 2, 'max']])],
  ['de/ex4: יורדת ב-x<-1 וב-x>1, עולה ב--1<x<1', dec(F.ex4, -3) && inc(F.ex4, 0) && dec(F.ex4, 3)],
  ["de/ex4: f'(-2)=-9, f'(0)=3, f'(2)=-9", [[-2, -9], [0, 3], [2, -9]].every(([x, v]) => Math.abs(D(F.ex4, x) - v) < 1e-6)],
  ['de/ex4: גרף מגיע מלמעלה ויוצא למטה', F.ex4(-100) > 0 && F.ex4(100) < 0],
  // ex5: x^3+ax בשלושה מקרים
  ['de/ex5: a=-12 → max (-2,16), min (2,-16)', same(extrema(F.ex5(-12)), [[-2, 16, 'max'], [2, -16, 'min']])],
  ["de/ex5: a=-12 → f'(-3)=15, f'(0)=-12, f'(3)=15", [[-3, 15], [0, -12], [3, 15]].every(([x, v]) => Math.abs(D(F.ex5(-12), x) - v) < 1e-6)],
  ['de/ex5: a=0 → אין קיצון, f עולה', extrema(F.ex5(0)).length === 0 && inc(F.ex5(0), -1) && inc(F.ex5(0), 1)],
  ['de/ex5: a=0 → f\'(0)=0 (נקודה חשודה שאינה קיצון)', Math.abs(D(F.ex5(0), 0)) < 1e-9],
  ['de/ex5: a>0 → אין קיצון (a=0.5,3,12)', countFor(F.ex5, [0.5, 3, 12]).every(n => n === 0)],
  ['de/ex5: a<0 → שתי נקודות קיצון (a=-0.5,-3,-12)', countFor(F.ex5, [-0.5, -3, -12]).every(n => n === 2)],
  ['de/ex5: a<0 → השורש השלילי max והחיובי min', [-0.5, -3, -12].every(a => { const e = extrema(F.ex5(a)); return e[0].type === 'max' && e[0].x < 0 && e[1].type === 'min' && e[1].x > 0; })],
  // e5: ריבועית עם מקדם מוביל שלילי
  ['de/e5: -x^2+6x → max (3,9)', same(extrema(F.e5q), [[3, 9, 'max']])],
  // g4: מקדם מוביל שלילי, מסיחים
  ['de/g4: min (1,1), max (3,5)', same(extrema(F.g4), [[1, 1, 'min'], [3, 5, 'max']])],
  ["de/g4: f'(0)=-9, f'(2)=3, f'(4)=-9", [[0, -9], [2, 3], [4, -9]].every(([x, v]) => Math.abs(D(F.g4, x) - v) < 1e-6)],
  // g5: שורש כפול של f'
  ["de/g5: f'(1)=0 אבל f עולה משני הצדדים, f(1)=1", Math.abs(D(F.g5, 1)) < 1e-9 && inc(F.g5, 0) && inc(F.g5, 2) && Math.abs(F.g5(1) - 1) < 1e-12],
  // p5
  ['de/p5: min (-1,-7), max (2,20)', same(extrema(F.p5), [[-1, -7, 'min'], [2, 20, 'max']])],
  ["de/p5: f'(-2)=-24, f'(0)=12, f'(3)=-24", [[-2, -24], [0, 12], [3, -24]].every(([x, v]) => Math.abs(D(F.p5, x) - v) < 1e-6)],
  // p6 (בחירה): שתי נקודות קיצון אם ורק אם b<3
  ['de/p6: b<3 → 2 קיצון, b≥3 → 0 (סריקת b)', (() => { const bs = [-20, -5, 0, 2, 2.9, 2.99, 3, 3.01, 3.5, 10]; const n = countFor(F.p6, bs); return bs.every((b, i) => n[i] === (b < 3 ? 2 : 0)); })()],
  ["de/p6: b=3 → f'(-1)=0 בלי החלפת סימן", Math.abs(D(F.p6(3), -1)) < 1e-9 && inc(F.p6(3), -2) && inc(F.p6(3), 0)],
  // b1: מסיח ונקודה נוספת
  ['de/b1: max (1,4), min (3,0)', same(extrema(F.b1), [[1, 4, 'max'], [3, 0, 'min']])],
  ['de/b1: שורשי f הם 0 ו-3', JSON.stringify(distinctRoots(F.b1)) === JSON.stringify([0, 3])],
  // q5 (בחירה): + ל-- הוא מקסימום (דוגמה קונקרטית)
  ['de/q5: f\' עוברת מ-+ ל-- → max', extrema(x => -(x * x)).every(p => p.type === 'max')],
  // q6
  ['de/q6: min (-2,-16), max (2,16)', same(extrema(F.q6), [[-2, -16, 'min'], [2, 16, 'max']])],
  // q7 (בחירה): f'=(x-2)^2 → אין קיצון
  ["de/q7: f'=(x-2)^2 → אין קיצון, f'(2)=0", Math.abs(D(F.q7, 2)) < 1e-9 && extrema(F.q7).length === 0 && Math.abs(D(F.q7, 5) - 9) < 1e-6],
  // q3: מקדם מוביל חיובי, להשוואה עם ex4
  ['de/q3: x^3-3x → max (-1,2), min (1,-2)', same(extrema(F.q3), [[-1, 2, 'max'], [1, -2, 'min']])],
];
