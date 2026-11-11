// בדיקת נכונות: מחשב מחדש כל תשובה מספרית באופן בלתי תלוי ומשווה לתשובה שבשיעור.
import { readFileSync } from 'fs';
import { LESSONS, loadLessons } from '../js/data/lessons/index.js';
await loadLessons(async f => JSON.parse(readFileSync(new URL('../' + f, import.meta.url), 'utf8')));
import { TOPICS } from '../js/data/curriculum.js';

const R = Math.PI / 180, sin = d => Math.sin(d * R), cos = d => Math.cos(d * R), acos = x => Math.acos(x) / R;
const an = (a1, d, n) => a1 + (n - 1) * d, Sn = (a1, d, n) => n * (2 * a1 + (n - 1) * d) / 2;
const lawC = (a, b, g) => Math.sqrt(a * a + b * b - 2 * a * b * cos(g));
const angC = (a, b, c) => acos((a * a + b * b - c * c) / (2 * a * b));
const polyD = (cs) => cs.slice(0, -1).map((c, i) => c * (cs.length - 1 - i)); // מקדמים מהחזקה הגבוהה
const ev = (cs, x) => cs.reduce((s, c) => s * x + c, 0);

const expected = {
  'arithmetic-sequence': {
    g1: an(7, -2, 15), g2: Sn(4, 3, 10), g3: an(4, 5, 50), p1: Sn(-3, 4, 12),
    p2: (() => { let n = 1; while (an(100, -7, n) >= 0) n++; return n; })(),
    p4: (() => { let s = 0; for (let k = 10; k < 100; k++) if (k % 3 === 0) s += k; return s; })(),
    b1a: 230 - 210, b1b: 10, b1c: 2, b1d: an(3, 2, 20),
    q1: an(2, 5, 10), q2: Sn(3, 4, 8), q3: (45 - 20) / 5, q5: (2 - 50) / -4 + 1,
  },
  'derivative-extrema': {
    g1: -1, g2: ev(polyD([1, 0, 0, 0]), 2), g3: ev([1, -6, 11], 3), p1: ev(polyD([4, -5, 1, -7]), 1),
    p2: ev([1, 0, -12, 1], 2), p4: ev([1, 2, 0], 1) - ev(polyD([1, 2, 0]), 1) * 1,
    b1a: 2, b1b: ev([1, -6, 9, 0], 1), b1c: ev(polyD([1, -6, 9, 0]), 0), b1d: 6,
    q1: ev(polyD([1, 0, 0, 0, 0]), 1), q2: 4, q3: ev([1, 0, -3, 0], -1), q4: ev(polyD([3, 0, 1]), -1),
  },
  'sine-cosine-law': {
    g1: lawC(3, 5, 120), g2: 6 / sin(30) / 2, g3: angC(3, 5, 7), p1: 0.5 * 6 * 10 * sin(30),
    p2: 12 * sin(45) / sin(60), p3: angC(4, 5, 6),
    b1a: lawC(10, 6, 120), b1b: lawC(10, 6, 120) / sin(120) / 2, b1c: 0.5 * 10 * 6 * sin(120),
    b1d: 2 * (0.5 * 10 * 6 * sin(120)) / lawC(10, 6, 120),
    q1: lawC(5, 7, 60), q2: 8 / sin(30) / 2, q3: 0.5 * 4 * 9 * sin(90), q4: angC(7, 8, 13),
  },
};

// בדיקות מבניות נוספות לטענות בשיעורים
const extra = [
  ['f(x)=x^3-3x^2-9x+5: max (-1,10)', ev([1, -3, -9, 5], -1) === 10 && ev(polyD([1, -3, -9, 5]), -1) === 0],
  ['f(x)=x^3-3x^2-9x+5: min (3,-22)', ev([1, -3, -9, 5], 3) === -22 && ev(polyD([1, -3, -9, 5]), 3) === 0],
  ['tangent y=2x-8 at x=3', ev([1, -4, 1], 3) === 2 * 3 - 8 && ev(polyD([1, -4, 1]), 3) === 2],
  ['a=-3 → f(2)=-1', ev([1, -3, 0, 3], 2) === -1 && ev(polyD([1, -3, 0, 3]), 2) === 0],
  ['2x^3-6x max value 4', ev([2, 0, -6, 0], -1) === 4],
  ['x^3-6x^2+9x min (3,0)', ev([1, -6, 9, 0], 3) === 0 && ev(polyD([1, -6, 9, 0]), 3) === 0],
  ['tangent y=9x meets at x=6', ev([1, -6, 9, 0], 6) === 54],
  ['seq ex1 a20=62 S20=670', an(5, 3, 20) === 62 && Sn(5, 3, 20) === 670],
  ['seq ex2 a1=2 d=3 a32=95', an(2, 3, 4) === 11 && an(2, 3, 9) === 26 && an(2, 3, 32) === 95],
  ['seq ex3 S20=610', Sn(2, 3, 20) === 610],
  ['bagrut seq odd/even sums', (() => { let o = 0, e = 0; for (let k = 1; k <= 20; k++) (k % 2 ? (o += an(3, 2, k)) : (e += an(3, 2, k))); return o === 210 && e === 230; })()],
  ['p2 seq a15=2 a16=-5', an(100, -7, 15) === 2 && an(100, -7, 16) === -5],
  ['trig ex1 a=7', Math.abs(lawC(8, 5, 60) - 7) < 1e-9],
  ['trig ex2 b=10√2 R=10', Math.abs(10 * sin(45) / sin(30) - 10 * Math.SQRT2) < 1e-9 && Math.abs(10 / sin(30) / 2 - 10) < 1e-9],
  ['trig ex3 60° area 10√3', Math.abs(angC(5, 8, 7) - 60) < 1e-9 && Math.abs(0.5 * 5 * 8 * sin(60) - 10 * Math.sqrt(3)) < 1e-9],
];

let fail = 0, count = 0;
for (const L of LESSONS) {
  const qs = [...L.guided, ...L.practice, ...L.bagrut.flatMap(b => b.parts), ...L.quiz];
  const ids = new Set();
  for (const q of qs) {
    if (ids.has(q.id)) { console.error(`✗ ${L.id}/${q.id}: מזהה כפול`); fail++; }
    ids.add(q.id);
    if (q.type === 'mc') {
      const okN = q.options.filter(o => o.ok).length;
      if (okN !== 1) { console.error(`✗ ${L.id}/${q.id}: ${okN} תשובות נכונות`); fail++; }
      continue;
    }
    count++;
    const exp = expected[L.id]?.[q.id];
    if (exp === undefined) { console.error(`✗ ${L.id}/${q.id}: אין חישוב בלתי תלוי`); fail++; continue; }
    const tol = Math.max(q.tol ?? 0, 1e-9);
    if (Math.abs(exp - q.answer) > tol) { console.error(`✗ ${L.id}/${q.id}: בשיעור ${q.answer}, בחישוב ${exp}`); fail++; }
    for (const w of q.wrong || []) {
      if (Math.abs(w.v - q.answer) <= tol) { console.error(`✗ ${L.id}/${q.id}: מסיח ${w.v} נחשב נכון`); fail++; }
      if (!L.tags[w.tag]) { console.error(`✗ ${L.id}/${q.id}: תגית ${w.tag} לא מוגדרת`); fail++; }
    }
  }
  for (const q of qs.filter(q => q.type === 'mc')) for (const o of q.options) if (o.tag && !L.tags[o.tag]) { console.error(`✗ ${L.id}/${q.id}: תגית ${o.tag} לא מוגדרת`); fail++; }
  if (!TOPICS.find(t => t.id === L.topic)) { console.error(`✗ ${L.id}: נושא ${L.topic} לא קיים`); fail++; }
}
for (const [name, ok] of extra) { count++; if (!ok) { console.error(`✗ ${name}`); fail++; } }
console.log(fail ? `${fail} כשלים` : `✓ כל ${count} הבדיקות עברו`);
process.exit(fail ? 1 : 0);
