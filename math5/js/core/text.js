// טקסט תוכן: עברית עם LaTeX בתוך $...$ ו-**הדגשה**. בלי HTML.
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// מבריח HTML ומחליף **x** ב-<b>x</b>, בלי לגעת בתוך ביטויי LaTeX.
export function fmt(s) {
  if (s === undefined || s === null) return '';
  const parts = String(s).split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);
  return parts.map((p, i) => i % 2 ? esc(p) : esc(p).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')).join('');
}
