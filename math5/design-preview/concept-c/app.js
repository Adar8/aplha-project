/* קונספט C — נתב פשוט + רינדור. התוכן נלקח כמות שהוא מ-data.js (העתק לקריאה בלבד של השיעור). */
(function () {
  'use strict';
  var L = window.LESSON, LESSONS = window.LESSONS;
  var CH = 3; // מספר הפרק של "נגזרת" בתוכן העניינים של הקונספט
  var main = document.getElementById('main');
  var BM_KEY = 'conceptC.bookmark';

  // ---------- עזרי טקסט ----------
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tex(src, display) {
    try { return katex.renderToString(src, { displayMode: !!display, throwOnError: false, output: 'html' }); }
    catch (e) { return '<code>' + esc(src) + '</code>'; }
  }
  // $…$ → KaTeX מבודד LTR, **…** → strong. מתמטיקה מוחלפת לפני ה-escape.
  function md(s) {
    var maths = [];
    s = String(s).replace(/\$([^$]+)\$/g, function (_, m) { maths.push(m); return '\u0001' + (maths.length - 1) + '\u0002'; });
    s = esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return s.replace(/\u0001(\d+)\u0002/g, function (_, i) { var m = maths[+i]; return '<span class="m' + (m.length > 28 ? ' m-long' : '') + '" dir="ltr">' + tex(m) + '</span>'; });
  }
  function n(x) { return '<bdi class="n" dir="ltr">' + x + '</bdi>'; }
  function minus(v, d) { var s = Math.abs(v).toFixed(d); return (v < -1e-9 ? '−' : (v > 1e-9 ? '+' : '')) + s; }

  function getBookmark() { try { return localStorage.getItem(BM_KEY) || 'e5'; } catch (e) { return 'e5'; } }
  function setBookmark(id) { try { localStorage.setItem(BM_KEY, id); } catch (e) { /* מצב פרטי — לא חובה */ } }
  function secIndex(id) { for (var i = 0; i < L.explanations.length; i++) if (L.explanations[i].id === id) return i; return 4; }
  function splitTitle(t) { var k = t.indexOf(' ('); return k > 0 && t.slice(-1) === ')' ? [t.slice(0, k), t.slice(k + 2, -1)] : [t, '']; }

  // ---------- מסך 1: בית (עמוד שער) ----------
  function home() {
    var bm = getBookmark(), i = secIndex(bm), sec = L.explanations[i], t = splitTitle(sec.title);
    var ready = LESSONS.length, planned = TOC_PARTS.reduce(function (a, p) { return a + p.items.filter(function (x) { return x.planned; }).length; }, 0);
    return '<div class="title-page">' +
      '<p class="tp-kicker">מתמטיקה · 5 יחידות לימוד · הכנה לבגרות</p>' +
      '<h1 class="tp-title">ספר הלימוד</h1>' +
      '<p class="tp-sub">מהיסודות ועד שאלון הבגרות. פרק אחד בכל פעם, סעיף אחד בכל ישיבה.</p>' +
      '<hr class="double-rule">' +
      '<section class="bookmark" aria-labelledby="bm-h">' +
        '<p class="eyebrow" id="bm-h">כאן עצרת</p>' +
        '<p class="bm-chapter">פרק ' + n(CH) + ' · ' + esc(L.title) + '</p>' +
        '<h2 class="bm-section"><span class="secno">' + n(CH + '.' + (i + 1)) + '</span>' + md(t[0]) + '</h2>' +
        '<p class="bm-meta">סעיף ' + (i + 1) + ' מתוך ' + L.explanations.length + ' בפרק. אחריו: תרגול עצמאי.</p>' +
        '<div class="bm-actions">' +
          '<a class="btn" href="#/lesson/' + sec.id + '">להמשך הקריאה <span class="arrow" aria-hidden="true">←</span></a>' +
          '<a class="link" href="#/practice">או לתרגיל הבא בפרק</a>' +
        '</div>' +
      '</section>' +
      '<div class="tp-after">' +
        '<div><h2>על הפרק</h2><p>' + md(L.summary) + '</p></div>' +
        '<div><h2>היקף</h2><p>כ-' + n(L.estimatedMinutes) + ' דקות לפרק כולו: ' + L.explanations.length + ' סעיפי הסבר ואחריהם ' + L.independentPractice.length + ' תרגילים עצמאיים. אפשר לעצור אחרי כל סעיף, והסימנייה תחכה כאן.</p></div>' +
      '</div>' +
      '<p class="colophon"><a href="#/toc">תוכן העניינים</a> · ' + ready + ' פרקים מוכנים, ' + planned + ' בהכנה לפי מפת הדרכים.</p>' +
    '</div>';
  }

  // ---------- מסך 2: תוכן העניינים ----------
  // פרקים מוכנים = השיעורים הקיימים (data.js). "בהכנה" = שורות מ-ROADMAP.md, מסומנות ככאלה.
  var byId = {}; LESSONS.forEach(function (l) { byId[l.id] = l; });
  var TOC_PARTS = [
    { pn: 'חלק א׳', title: 'סדרות', items: [{ id: 'arithmetic-sequence', no: 1 }, { id: 'geometric-sequence', no: 2 }] },
    { pn: 'חלק ב׳', title: 'חשבון דיפרנציאלי ואינטגרלי', items: [
      { id: 'derivative-extrema', no: 3 },
      { planned: true, title: 'חדו"א של $e^x$ ו-$\\ln$' },
      { planned: true, title: 'חדו"א של פונקציות רציונליות ושורש' },
      { planned: true, title: 'אינטגרלים ושטחים' },
      { planned: true, title: 'חדו"א טריגונומטרית' }] },
    { pn: 'חלק ג׳', title: 'טריגונומטריה וגאומטריה', items: [
      { id: 'sine-cosine-law', no: 4 },
      { planned: true, title: 'גאומטריה בסיסית: זוויות, משולשים, מרובעים' },
      { planned: true, title: 'גאומטריה אנליטית: ישר ומעגל' },
      { planned: true, title: 'גאומטריה של המעגל ודמיון' },
      { planned: true, title: 'וקטורים במרחב' }] },
    { pn: 'חלק ד׳', title: 'הסתברות ומספרים מרוכבים', items: [
      { planned: true, title: 'הסתברות: עץ, מותנית, בינומית' },
      { planned: true, title: 'מספרים מרוכבים' }] }
  ];
  function toc() {
    var bm = getBookmark();
    var h = '<div class="toc"><p class="eyebrow">מסלול הלימודים</p><h1>תוכן העניינים</h1>' +
      '<p class="lede">הפרקים מסודרים כמו בספר. פרק שמוכן אפשר לפתוח; פרק "בהכנה" עוד לא נכתב.</p>';
    TOC_PARTS.forEach(function (p) {
      h += '<section class="part"><div class="part-head"><span class="pn">' + p.pn + '</span><h2>' + esc(p.title) + '</h2></div><ol class="toc-list">';
      p.items.forEach(function (it) {
        if (it.planned) {
          h += '<li class="ch planned"><div class="ch-row"><span class="ch-num" aria-hidden="true">·</span><span class="ch-title">' + md(it.title) + '</span><span class="leader"></span><span class="tag-planned">בהכנה</span></div></li>';
          return;
        }
        var l = byId[it.id], isCur = it.id === L.id;
        var href = isCur ? '#/lesson/' + bm : '#/toc';
        h += '<li class="ch"><a class="ch-row" href="' + href + '"' + (isCur ? '' : ' aria-disabled="true" title="באב-טיפוס פעיל רק פרק 3"') + '><span class="ch-num">' + n(it.no) + '</span><span class="ch-title">' + esc(l.title) + '</span><span class="leader"></span><span class="ch-min">כ-' + n(l.minutes) + ' דק׳</span></a>';
        if (isCur) {
          h += '<ol class="sec-list">';
          l.sections.forEach(function (s, k) {
            var id = L.explanations[k].id;
            h += '<li><span class="sno">' + n(it.no + '.' + (k + 1)) + '</span><a href="#/lesson/' + id + '">' + md(splitTitle(s)[0]) + '</a>' + (id === bm ? ' <span class="here">כאן עצרת</span>' : '') + '</li>';
          });
          h += '<li><span class="sno">' + '·' + '</span><a href="#/practice">תרגול עצמאי (' + L.independentPractice.length + ' תרגילים)</a></li></ol>';
        } else {
          h += '<p class="ch-summary">' + md(l.summary) + '</p>';
        }
        h += '</li>';
      });
      h += '</ol></section>';
    });
    return h + '</div>';
  }

  // ---------- מסך 3: שיעור (סעיף אחד בעמוד) ----------
  function lesson(secId) {
    var i = secIndex(secId || getBookmark()), sec = L.explanations[i], t = splitTitle(sec.title);
    setBookmark(sec.id);
    // בניית שורות: גוף + הערות שוליים (warning/tip עוברים לשוליים, לצד הבלוק שלפניהם)
    var rows = [];
    sec.blocks.forEach(function (b) {
      if ((b.type === 'warning' || b.type === 'tip') && rows.length) { rows[rows.length - 1].notes.push(b); return; }
      rows.push({ blocks: [b], notes: (b.type === 'warning' || b.type === 'tip') ? [] : [] });
      if (b.type === 'warning' || b.type === 'tip') { rows[rows.length - 1].blocks = []; rows[rows.length - 1].notes.push(b); }
    });
    // טעות נפוצה שהשיעור עצמו מפנה לסעיף הזה (reviewRef) — לשוליים של בלוק הרשימה הראשון
    var mist = L.commonMistakes.filter(function (m) { return m.reviewRef === sec.id; });
    if (mist.length) {
      var target = rows.filter(function (r) { return r.blocks[0] && r.blocks[0].type === 'list'; })[0] || rows[0];
      mist.forEach(function (m) { target.notes.push({ type: 'mistake', label: m.label, text: m.advice }); });
    }
    // סעיף 3.5: מיזוג שורות טקסט רצופות בלי הערות כדי לשמור על זרימה, ואיור אחרי הרשימה
    var body = '';
    rows.forEach(function (r, k) {
      body += '<div class="row"><div class="main">' + r.blocks.map(block).join('') + '</div>' +
        (r.notes.length ? '<aside class="notes" aria-label="הערות שוליים">' + r.notes.map(note).join('') + '</aside>' : '<div></div>') + '</div>';
      if (sec.id === 'e5' && r.blocks[0] && r.blocks[0].type === 'list') body += '<div class="row">' + figureHTML() + '</div>';
    });
    var prev = L.explanations[i - 1], next = L.explanations[i + 1];
    var pager = '<nav class="pager" aria-label="דפדוף בין סעיפים">' +
      (prev ? '<a class="prev" href="#/lesson/' + prev.id + '"><span class="pl"><span class="arrow" aria-hidden="true">→</span> הסעיף הקודם, ' + n(CH + '.' + i) + '</span><span class="pt">' + md(splitTitle(prev.title)[0]) + '</span></a>' : '<span></span>') +
      (next ? '<a class="next" href="#/lesson/' + next.id + '"><span class="pl">הסעיף הבא, ' + n(CH + '.' + (i + 2)) + ' <span class="arrow" aria-hidden="true">←</span></span><span class="pt">' + md(splitTitle(next.title)[0]) + '</span></a>'
            : '<a class="next" href="#/practice"><span class="pl">סוף הפרק <span class="arrow" aria-hidden="true">←</span></span><span class="pt">לתרגול עצמאי</span></a>') +
      '</nav>';
    var map = '<div class="chapter-map"><span class="small-label">המיקום שלך בפרק ' + n(CH) + ': סעיף ' + (i + 1) + ' מתוך ' + L.explanations.length + '</span><ol>' +
      L.explanations.map(function (e, k) {
        return '<li><a href="#/lesson/' + e.id + '"' + (k === i ? ' aria-current="true"' : '') + (k < i ? ' class="done"' : '') + ' aria-label="סעיף ' + CH + '.' + (k + 1) + '">' + n(CH + '.' + (k + 1)) + '</a></li>';
      }).join('') + '</ol></div>';
    return '<article class="sheet">' +
      '<div class="running"><a href="#/toc">פרק ' + n(CH) + ' · ' + esc(L.title) + '</a><span>סעיף ' + n(CH + '.' + (i + 1)) + '</span></div>' +
      '<header class="sec-head"><p class="sec-num">' + n(CH + '.' + (i + 1)) + '</p><h1>' + md(t[0]) + '</h1>' + (t[1] ? '<p class="sub">' + md(t[1]) + '</p>' : '') + '</header>' +
      body + map + pager + '</article>';
  }
  function block(b) {
    if (b.type === 'text') return '<p>' + md(b.text) + '</p>';
    if (b.type === 'formula') return '<div class="formula" dir="ltr">' + tex(b.latex, true) + '</div>';
    if (b.type === 'list') return '<ul>' + b.items.map(function (x) { return '<li>' + md(x) + '</li>'; }).join('') + '</ul>';
    return '<p>' + md(b.text || '') + '</p>';
  }
  function note(b) {
    var lab = b.type === 'warning' ? 'זהירות' : b.type === 'tip' ? 'בבגרות' : 'טעות נפוצה';
    var cls = b.type === 'tip' ? 'tip' : 'mistake';
    return '<div class="note ' + cls + '"><span class="nl">' + lab + '</span>' + (b.label ? '<span class="nt">' + md(b.label) + '</span>' : '') + md(b.text) + '</div>';
  }

  // ---------- האיור: f(x)=x^3-3x מול f(x)=-x^3+3x (סעיף e5 + דוגמה ex4) ----------
  var PANELS = [
    { key: 'a', a: 1, tex: 'f(x)=x^3-3x', cond: 'a=1>0', extrema: [{ x: -1, kind: 'מקסימום' }, { x: 1, kind: 'מינימום' }], signs: ['+', '−', '+'] },
    { key: 'b', a: -1, tex: 'f(x)=-x^3+3x', cond: 'a=-1<0', extrema: [{ x: -1, kind: 'מינימום' }, { x: 1, kind: 'מקסימום' }], signs: ['−', '+', '−'] }
  ];
  var G = { W: 320, H: 290, x0: 26, x1: 306, y0: 14, y1: 222, xmin: -2.4, xmax: 2.4, ymin: -3.4, ymax: 3.4, sy0: 240, sy1: 266 };
  function X(x) { return G.x0 + (x - G.xmin) / (G.xmax - G.xmin) * (G.x1 - G.x0); }
  function Y(y) { return G.y1 - (y - G.ymin) / (G.ymax - G.ymin) * (G.y1 - G.y0); }
  function f(a, x) { return a * (x * x * x - 3 * x); }
  function fp(a, x) { return a * (3 * x * x - 3); }
  function fmt(v) { return (v < 0 ? '−' : '') + Math.abs(v); }
  function panelSVG(p) {
    var s = '<svg viewBox="0 0 ' + G.W + ' ' + G.H + '" role="img" aria-label="גרף ' + p.tex + '" data-a="' + p.a + '">';
    s += '<defs><clipPath id="clip-' + p.key + '"><rect x="' + G.x0 + '" y="' + G.y0 + '" width="' + (G.x1 - G.x0) + '" height="' + (G.y1 - G.y0) + '"/></clipPath></defs>';
    for (var gx = -2; gx <= 2; gx++) s += '<line class="svg-grid" x1="' + X(gx) + '" x2="' + X(gx) + '" y1="' + G.y0 + '" y2="' + G.y1 + '"/>';
    for (var gy = -3; gy <= 3; gy++) s += '<line class="svg-grid" x1="' + G.x0 + '" x2="' + G.x1 + '" y1="' + Y(gy) + '" y2="' + Y(gy) + '"/>';
    s += '<line class="svg-axis" x1="' + G.x0 + '" x2="' + G.x1 + '" y1="' + Y(0) + '" y2="' + Y(0) + '"/>';
    s += '<line class="svg-axis" x1="' + X(0) + '" x2="' + X(0) + '" y1="' + G.y0 + '" y2="' + G.y1 + '"/>';
    [-2, -1, 1, 2].forEach(function (t) { s += '<text class="svg-tick" x="' + X(t) + '" y="' + (Y(0) + 12) + '" text-anchor="middle" direction="ltr">' + fmt(t) + '</text>'; });
    [-2, 2].forEach(function (t) { s += '<text class="svg-tick" x="' + (X(0) - 5) + '" y="' + (Y(t) + 3.5) + '" text-anchor="end" direction="ltr">' + fmt(t) + '</text>'; });
    s += '<text class="svg-tick" x="' + (G.x1 - 2) + '" y="' + (Y(0) - 5) + '" text-anchor="end" font-style="italic">x</text>';
    var pf = '', pd = '';
    for (var k = 0; k <= 240; k++) {
      var x = G.xmin + (G.xmax - G.xmin) * k / 240;
      pf += (k ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(f(p.a, x)).toFixed(1);
      pd += (k ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(fp(p.a, x)).toFixed(1);
    }
    s += '<g clip-path="url(#clip-' + p.key + ')"><path class="svg-fp" d="' + pd + '"/><path class="svg-f" d="' + pf + '"/>';
    s += '<line class="svg-tan" data-role="tan" x1="0" y1="0" x2="0" y2="0"/></g>';
    var lx = p.a > 0 ? 1.62 : -1.62; // תווית f' ליד הענף הנראה של הפרבולה
    s += '<text class="svg-fp-label" x="' + (X(0) + (p.a > 0 ? 8 : 8)) + '" y="' + (Y(fp(p.a, 0)) + (p.a > 0 ? 15 : -7)) + '" direction="ltr">f′</text>';
    p.extrema.forEach(function (e) {
      var y = f(p.a, e.x), above = e.kind === 'מקסימום';
      s += '<line class="svg-drop" x1="' + X(e.x) + '" x2="' + X(e.x) + '" y1="' + Y(y) + '" y2="' + G.sy0 + '"/>';
      s += '<circle class="svg-pt" cx="' + X(e.x) + '" cy="' + Y(y) + '" r="3.6"/>';
      var ty = above ? Y(y) - 22 : Y(y) + 20;
      s += '<text class="svg-ptlabel" x="' + X(e.x) + '" y="' + ty + '" text-anchor="middle">' + e.kind + '</text>';
      s += '<text class="svg-coord" x="' + X(e.x) + '" y="' + (ty + 12) + '" text-anchor="middle" direction="ltr">(' + fmt(e.x) + ', ' + fmt(y) + ')</text>';
    });
    // רצועת סימני f'
    var cuts = [G.xmin, -1, 1, G.xmax];
    for (var j = 0; j < 3; j++) {
      s += '<rect class="svg-strip" data-seg="' + j + '" x="' + X(cuts[j]) + '" y="' + G.sy0 + '" width="' + (X(cuts[j + 1]) - X(cuts[j])) + '" height="' + (G.sy1 - G.sy0) + '"/>';
      s += '<text class="svg-sign" x="' + (X(cuts[j]) + X(cuts[j + 1])) / 2 + '" y="' + (G.sy0 + 19) + '" text-anchor="middle">' + p.signs[j] + '</text>';
    }
    s += '<text class="svg-striplabel" x="' + G.x1 + '" y="' + (G.sy1 + 15) + '" text-anchor="start" direction="rtl">הסימן של הנגזרת</text>';
    s += '<circle class="svg-tanpt" data-role="tanpt" r="4.2" cx="-10" cy="-10"/>';
    return s + '</svg>';
  }
  function figureHTML() {
    return '<figure class="fig" id="fig-35">' +
      '<div class="fig-panels">' + PANELS.map(function (p) {
        return '<div class="panel">' + panelSVG(p) + '<div class="panel-cap"><b>(' + (p.key === 'a' ? 'א' : 'ב') + ')</b>' + md('$' + p.tex + '$, $' + p.cond + '$') + '</div></div>';
      }).join('') + '</div>' +
      '<div class="fig-ctrl"><label for="xr">הנקודה על ציר <span class="m">' + tex('x') + '</span></label><input id="xr" type="range" min="-2.2" max="2.2" step="0.05" value="-1.6" dir="ltr" aria-describedby="readout">' +
      '<p class="readout" id="readout" aria-live="polite"></p></div>' +
      '<figcaption><span class="fl">איור ' + n(CH + '.5') + '</span>' +
        md('לשתי הפונקציות אותן נקודות חשודות, $x=-1$ ו-$x=1$, אבל הסדר הפוך. קוראים את הגרף משמאל לימין, כמו את ציר ה-$x$: ב-(א) קודם פסגה ואחריה עמק, וב-(ב) קודם עמק ואחריו פסגה. הקו המקווקו הוא $f\'$: ב-(א) הפרבולה "מחייכת" וב-(ב) "בוכה". אפשר לגרור על הגרף או להזיז את המחוון כדי לראות את המשיק באותו $x$ בשני הגרפים.') +
        ' <span class="small-label">הנתונים: הפונקציות והנקודות מסעיף זה ומדוגמה 4 בפרק.</span>' +
      '</figcaption></figure>';
  }
  function bindFigure() {
    var range = document.getElementById('xr'); if (!range) return;
    var svgs = main.querySelectorAll('.panel svg'), out = document.getElementById('readout');
    function setX(x) {
      x = Math.max(-2.2, Math.min(2.2, x));
      range.value = x;
      var parts = [];
      svgs.forEach(function (svg, k) {
        var a = +svg.getAttribute('data-a'), y = f(a, x), m = fp(a, x), d = 0.65;
        var tan = svg.querySelector('[data-role=tan]'), pt = svg.querySelector('[data-role=tanpt]');
        tan.setAttribute('x1', X(x - d)); tan.setAttribute('y1', Y(y - m * d)); tan.setAttribute('x2', X(x + d)); tan.setAttribute('y2', Y(y + m * d));
        pt.setAttribute('cx', X(x)); pt.setAttribute('cy', Y(y));
        var seg = x < -1 ? 0 : x < 1 ? 1 : 2;
        svg.querySelectorAll('.svg-strip').forEach(function (r) { r.classList.toggle('active', +r.getAttribute('data-seg') === seg); });
        var dir = Math.abs(m) < 0.03 ? '<span>המשיק אופקי</span>' : m > 0 ? '<span class="up">הפונקציה עולה</span>' : '<span class="down">הפונקציה יורדת</span>';
        parts.push('ב-(' + (k ? 'ב' : 'א') + ') שיפוע המשיק ' + n(minus(m, 2)) + ', ' + dir);
      });
      out.innerHTML = 'כאשר ' + '<span class="m" dir="ltr">' + tex('x=' + (x < 0 ? '-' : '') + Math.abs(x).toFixed(2)) + '</span>' + ': ' + parts.join('. ') + '.';
    }
    range.addEventListener('input', function () { setX(+range.value); });
    svgs.forEach(function (svg) {
      function fromEvent(ev) {
        var r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width * G.W;
        return G.xmin + (px - G.x0) / (G.x1 - G.x0) * (G.xmax - G.xmin);
      }
      var down = false;
      svg.addEventListener('pointerdown', function (ev) { down = true; setX(fromEvent(ev)); });
      svg.addEventListener('pointermove', function (ev) { if (down || ev.pointerType === 'mouse') setX(fromEvent(ev)); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (e) { svg.addEventListener(e, function () { down = false; }); });
    });
    setX(+range.value);
  }

  // ---------- מסך 4: תרגול עצמאי (תרגיל p5) ----------
  var P_INDEX = 4, P = L.independentPractice[P_INDEX];
  var st = { hints: 0, solved: false, showSol: false, fb: null };
  function practice() {
    var total = L.independentPractice.length;
    return '<article class="sheet">' +
      '<div class="running"><a href="#/toc">פרק ' + n(CH) + ' · ' + esc(L.title) + '</a><span>תרגול עצמאי</span></div>' +
      '<div class="ex">' +
        '<div class="ex-num" aria-hidden="true">' + n(P_INDEX + 1) + '</div>' +
        '<div class="ex-body">' +
          '<h1>תרגיל ' + (P_INDEX + 1) + ' מתוך ' + total + ' · תרגול עצמאי</h1>' +
          '<p class="ex-prompt">' + md(P.prompt) + '</p>' +
          '<form id="ansform" class="answer-line" novalidate>' +
            '<label for="ans">התשובה שלך (מספר)</label>' +
            '<div class="field" dir="ltr"><button type="button" class="sign-btn" id="signbtn" aria-label="החלפת סימן פלוס/מינוס">±</button><input id="ans" type="text" inputmode="decimal" autocomplete="off" dir="ltr" aria-describedby="fbk"></div>' +
            '<button class="btn" type="submit">בדיקה</button>' +
          '</form>' +
          '<div class="ex-aux" id="aux"></div>' +
          '<ol class="hints" id="hints"></ol>' +
          '<div class="feedback" id="fbk" aria-live="polite"></div>' +
          '<div id="sol"></div>' +
        '</div>' +
      '</div>' +
      '<div class="ex-foot"><a class="link" href="#/lesson/e5"><span class="arrow" aria-hidden="true">→</span>&nbsp;חזרה לסעיף ' + n(CH + '.5') + '</a><a class="link" href="#/toc">לתוכן העניינים&nbsp;<span class="arrow" aria-hidden="true">←</span></a></div>' +
    '</article>';
  }
  function bindPractice() {
    var form = document.getElementById('ansform'), inp = document.getElementById('ans');
    st = { hints: 0, solved: false, showSol: false, fb: null };
    document.getElementById('signbtn').addEventListener('click', function () {
      var v = inp.value.trim(); inp.value = /^[-−]/.test(v) ? v.replace(/^[-−]/, '') : '−' + v; inp.focus();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var raw = inp.value.trim().replace(/−/g, '-').replace(',', '.');
      var fb = document.getElementById('fbk');
      if (raw === '' || isNaN(+raw)) { fb.innerHTML = '<div class="fb"><p>כדאי לכתוב מספר אחד, למשל ' + n('−12') + '.</p></div>'; return; }
      var v = +raw;
      if (Math.abs(v - P.answer.value) <= (P.answer.tolerance || 0)) {
        st.solved = true;
        fb.innerHTML = '<div class="fb ok"><span class="fh">נכון</span><p>' + md('נקודת המינימום המקומי היא ב-$x=-1$, והגובה שלה $f(-1)=-7$. שימו לב שהמינימום כאן הוא דווקא בשורש השמאלי, כי המקדם המוביל שלילי.') + '</p></div>';
      } else {
        var w = (P.commonWrongAnswers || []).filter(function (c) { return c.value === v; })[0];
        var m = w && L.commonMistakes.filter(function (c) { return c.id === w.mistake; })[0];
        if (m) {
          var ref = m.reviewRef ? '<p><a class="link" href="#/lesson/' + m.reviewRef + '">לקריאה חוזרת: סעיף ' + n(CH + '.' + (secIndex(m.reviewRef) + 1)) + '</a></p>' : '';
          fb.innerHTML = '<div class="fb no"><span class="fh">לא בדיוק · ' + md(m.label) + '</span><p>' + md(m.advice) + '</p>' + ref + '</div>';
        } else {
          fb.innerHTML = '<div class="fb no"><span class="fh">לא בדיוק</span><p>כדאי לבדוק שוב את הסימן של הנגזרת בכל קטע. אפשר גם לפתוח רמז.</p></div>';
        }
      }
      renderAux();
    });
    renderAux();
  }
  function renderAux() {
    var aux = document.getElementById('aux'), h = '';
    if (st.hints < P.hints.length) h += '<button type="button" class="link" id="hintbtn">' + (st.hints ? 'רמז נוסף' : 'רמז') + '</button>';
    if (!st.showSol) h += '<button type="button" class="link" id="solbtn">' + (st.solved ? 'לפתרון המלא' : 'הצגת הפתרון') + '</button>';
    aux.innerHTML = h;
    var hb = document.getElementById('hintbtn'), sb = document.getElementById('solbtn');
    if (hb) hb.addEventListener('click', function () {
      st.hints++;
      document.getElementById('hints').innerHTML = P.hints.slice(0, st.hints).map(function (x, k) { return '<li><span class="hl">רמז ' + ['א׳', 'ב׳', 'ג׳'][k] + '</span>' + md(x) + '</li>'; }).join('');
      renderAux();
    });
    if (sb) sb.addEventListener('click', function () {
      st.showSol = true; // הפתרון נכנס ל-DOM רק עכשיו (quality-standards §6)
      document.getElementById('sol').innerHTML = '<section class="solution"><h2>פתרון</h2><ol>' + P.solution.steps.map(function (x) { return '<li>' + md(x) + '</li>'; }).join('') + '</ol><p class="final">התשובה: ' + md(P.solution.final) + '</p></section>';
      renderAux();
    });
  }

  // ---------- נתב ----------
  function route() {
    var parts = (location.hash || '#/home').slice(2).split('/'), name = parts[0] || 'home', html;
    if (name === 'toc') html = toc();
    else if (name === 'lesson') html = lesson(parts[1]);
    else if (name === 'practice') html = practice();
    else { name = 'home'; html = home(); }
    main.innerHTML = html;
    document.querySelectorAll('[data-nav]').forEach(function (a) { if (a.getAttribute('data-nav') === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.title = { home: 'ספר הלימוד', toc: 'תוכן העניינים', lesson: 'שיעור', practice: 'תרגול עצמאי' }[name] + ' · מתמטיקה 5';
    if (name === 'lesson') bindFigure();
    if (name === 'practice') bindPractice();
    window.scrollTo(0, 0);
    if (route.ran) main.focus({ preventScroll: true });
    route.ran = true;
  }
  window.addEventListener('hashchange', route);
  route();
})();
