// מחשבון בטוח: מחשב ביטוי חשבוני בלי eval חופשי. משמש את המחשבון באפליקציה ואת בודק התוכן.
// מותר: מספרים, + - * / ^ ( ) , והפונקציות שברשימה. טריגונומטריה במעלות או ברדיאנים.
const BASE = { sqrt: Math.sqrt, abs: Math.abs, floor: Math.floor, ceil: Math.ceil, round: Math.round, exp: Math.exp, ln: Math.log, log: Math.log10, pi: Math.PI, e: Math.E };
const R = Math.PI / 180;
export function makeFns(deg = true) {
  const k = deg ? R : 1;
  return { ...BASE,
    sin: x => Math.sin(x * k), cos: x => Math.cos(x * k), tan: x => Math.tan(x * k),
    asin: x => Math.asin(x) / k, acos: x => Math.acos(x) / k, atan: x => Math.atan(x) / k };
}
// מנרמל קלט של אדם: × ÷ − √ π, פסיק עשרוני, וכפל משתמע בין מספר לסוגריים/פונקציה (2(3) → 2*(3), 2pi → 2*pi)
export function normalize(input) {
  let s = String(input).trim()
    .replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/π/g, 'pi').replace(/√/g, 'sqrt')
    .replace(/(\d),(\d)/g, '$1.$2').replace(/\*\*/g, '^');
  s = s.replace(/(\d|\))\s*(\(|[a-z])/gi, '$1*$2').replace(/\)\s*(\d)/g, ')*$1');
  return s;
}
export function evaluate(expr, { deg = true } = {}) {
  const s = normalize(expr);
  if (!s) throw new Error('empty');
  if (!/^[0-9a-z+\-*/^().\s]+$/i.test(s)) throw new Error('chars');
  const fns = makeFns(deg);
  for (const id of s.match(/[a-z]+/gi) || []) if (!(id in fns)) throw new Error('fn:' + id);
  const names = Object.keys(fns);
  let v;
  try { v = new Function(...names, `"use strict"; return (${s.replace(/\^/g, '**')});`)(...names.map(n => fns[n])); }
  catch { throw new Error('syntax'); }
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error('nan');
  return v;
}
// תצוגה ידידותית: עד 10 ספרות משמעותיות, בלי 0.30000000000000004
export function formatResult(v) {
  if (Math.abs(v) < 1e-12) return '0';
  const r = parseFloat(v.toPrecision(10));
  return Math.abs(r) >= 1e12 || Math.abs(r) < 1e-6 ? r.toExponential(6) : String(r);
}
