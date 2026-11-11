// בדיקת תשובות – פונקציות טהורות (בלי DOM), כדי שאפשר לבדוק אותן אוטומטית.

// ממיר קלט של לומד למספר: מקבל פסיק עשרוני, מינוס טיפוגרפי, רווחים, ושבר פשוט (3/4).
export function parseNumber(raw) {
  if (raw === undefined || raw === null) return NaN;
  let s = String(raw).trim().replace(/[−–]/g, '-').replace(/\s+/g, '');
  if (/^-?\d+,\d+$/.test(s)) s = s.replace(',', '.');
  const frac = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (frac) { const d = +frac[2]; return d === 0 ? NaN : +frac[1] / d; }
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  return parseFloat(s);
}

// q: { answer, tol, wrong:[{v,tag}] } (הפורמט הפנימי)
export function checkNumeric(q, raw) {
  const v = parseNumber(raw);
  if (Number.isNaN(v)) return { valid: false };
  const tol = q.tol ?? 0;
  const ok = Math.abs(v - q.answer) <= tol + 1e-9;
  let tag = null;
  if (!ok && q.wrong) {
    const w = q.wrong.find(w => Math.abs(v - w.v) <= Math.max(tol, 0.01));
    if (w) tag = w.tag;
  }
  return { valid: true, ok, tag: ok ? null : (tag || 'general'), value: v };
}

// q: { options:[{ok, tag}] }, index = מספר האפשרות שנבחרה
export function checkChoice(q, index) {
  if (index === null || index === undefined || index === '' || !q.options[+index]) return { valid: false };
  const o = q.options[+index];
  return { valid: true, ok: !!o.ok, tag: o.ok ? null : (o.tag || 'general') };
}

export function checkAnswer(q, raw) {
  return q.type === 'mc' ? checkChoice(q, raw) : checkNumeric(q, raw);
}
