/* Concept B — Minimal Focus Workspace. Plain JS, hash router, no build, no network. */
(function () {
  'use strict';
  var D = window.CONCEPT_B;
  var $bar = document.getElementById('bar');
  var $stage = document.getElementById('stage');
  var $dock = document.getElementById('dock');
  var $shell = document.getElementById('shell');

  /* ---------- storage (per-viewer convenience only; page works without it) ---------- */
  function load(k, d) { try { var v = localStorage.getItem('cb.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem('cb.' + k, JSON.stringify(v)); } catch (e) {} }

  /* ---------- text helpers ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); }
  function n(x) { return '<span class="num">' + x + '</span>'; }
  function math(el) {
    if (window.renderMathInElement) {
      renderMathInElement(el, { delimiters: [{ left: '$', right: '$', display: false }], throwOnError: false });
    }
  }
  function tex(s) { return window.katex ? katex.renderToString(s, { throwOnError: false }) : esc(s); }
  function h(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }

  /* ---------- lesson model: frames = section intro + cards, then a closing frame ---------- */
  var frames = [];
  var totalCards = 0;
  D.sections.forEach(function (sec, si) {
    frames.push({ type: 'intro', si: si });
    sec.cards.forEach(function (c, ci) { frames.push({ type: 'card', si: si, ci: ci, card: c }); totalCards++; });
  });
  frames.push({ type: 'done' });

  function cardsBefore(fi) { var k = 0; for (var i = 0; i < fi; i++) if (frames[i].type === 'card') k++; return k; }
  function progress() { return load('frame', 9); } // demo state: mid-way through section 2
  function practiceDone() { return load('practiceDone', false); }

  /* ---------- router ---------- */
  function route() {
    var hsh = location.hash.replace(/^#\/?/, '');
    var parts = hsh.split('/');
    $shell.classList.remove('wide-card');
    $stage.scrollTop = 0; window.scrollTo(0, 0);
    if (parts[0] === 'path') return viewPath();
    if (parts[0] === 'lesson') {
      var i = parts[1] !== undefined && parts[1] !== '' ? parseInt(parts[1], 10) : progress();
      if (isNaN(i)) i = 0;
      return viewLesson(Math.max(0, Math.min(frames.length - 1, i)));
    }
    if (parts[0] === 'practice') return viewPractice();
    return viewHome();
  }
  window.addEventListener('hashchange', route);
  function go(h) { if (location.hash === h) route(); else location.hash = h; }

  function navBar(active) {
    $bar.innerHTML =
      '<a class="wordmark" href="#/">מתמטיקה 5</a>' +
      '<nav class="nav" aria-label="ניווט">' +
      '<a href="#/" ' + (active === 'home' ? 'aria-current="page"' : '') + '>בית</a>' +
      '<a href="#/path" ' + (active === 'path' ? 'aria-current="page"' : '') + '>מסלול</a>' +
      '<a href="#/practice" ' + (active === 'practice' ? 'aria-current="page"' : '') + '>תרגול</a>' +
      '</nav>';
  }

  /* ---------- 1. Home: one sentence, one action ---------- */
  function viewHome() {
    navBar('home');
    var fi = progress();
    var f = frames[Math.min(fi, frames.length - 1)];
    var done = cardsBefore(fi);
    var left = totalCards - done;
    var hr = new Date().getHours();
    var greet = hr < 12 ? 'בוקר טוב' : hr < 17 ? 'צהריים טובים' : 'ערב טוב';
    var where = f.type === 'done' ? 'הרצף הושלם' : D.sections[f.si].title + ' · צעד ' + n(f.type === 'card' ? f.ci + 1 : 1) + ' מתוך ' + n(D.sections[f.si].cards.length);
    $stage.innerHTML =
      '<section class="home">' +
      '<div><p class="eyebrow">' + greet + '</p>' +
      '<h1>היום: רעיון אחד, עד הסוף.</h1>' +
      '<p class="lede">ממשיכים מאיפה שעצרת. בלי לבחור, בלי לחפש.</p></div>' +
      '<div class="resume">' +
      '<p class="eyebrow" style="margin:0">' + esc(D.lessonTitle) + '</p>' +
      '<div class="where"><p class="title">מקדם מוביל שלילי</p><span class="small muted">' + where + '</span></div>' +
      '<div class="meter" aria-hidden="true"><i style="width:' + Math.round(100 * done / totalCards) + '%"></i></div>' +
      '<p class="small muted" style="margin:0">נשארו ' + n(left) + ' צעדים קצרים, ואז שאלה אחת לבד.</p>' +
      '</div>' +
      '<div class="later">' +
      '<a href="#/practice"><span>תרגול עצמאי</span><span class="small muted">שאלה אחת ' + (practiceDone() ? '· נפתרה' : '') + '</span></a>' +
      '<a href="#/path"><span>המסלול שלי</span><span class="small muted">' + n(D.lessons.length) + ' שיעורים</span></a>' +
      '</div>' +
      '</section>';
    $dock.innerHTML = '<a class="btn btn-primary btn-block" href="#/lesson/' + fi + '">' + (fi > 0 ? 'להמשיך' : 'להתחיל') + ' <span class="arrow" aria-hidden="true">←</span></a>' +
      '<p class="demo-note" style="margin-top:12px">מצב הדגמה: ההתקדמות נשמרת רק בדפדפן הזה</p>';
    math($stage);
  }

  /* ---------- 2. Path: a single line; only the current stop opens ---------- */
  function viewPath() {
    navBar('path');
    var fi = progress();
    var doneCards = cardsBefore(fi);
    var curIdx = D.lessons.findIndex(function (l) { return l.id === D.lessonId; });
    var html = '<p class="eyebrow">המסלול שלי</p><h1>צעד אחרי צעד</h1>' +
      '<p class="lede">רק התחנה הנוכחית פתוחה. השאר יחכו.</p><ol class="path">';
    D.lessons.forEach(function (l, i) {
      var cls = i < curIdx ? 'done' : i === curIdx ? 'now' : 'later';
      var meta = i < curIdx ? 'הושלם (הדגמה)' : 'כ-' + n(l.minutes) + ' דק׳ בשיעור המלא';
      html += '<li class="stop ' + cls + '"' + (cls === 'now' ? ' aria-current="step"' : '') + '><span class="dot" aria-hidden="true"></span>' +
        '<p class="t">' + esc(l.title) + '</p><p class="m">' + meta + '</p>';
      if (cls === 'now') {
        html += '<div class="panel"><p class="small muted" style="margin:0">בהדגמה הזו: הקטע "מקדם מוביל שלילי" (הסבר e5 ודוגמה ex4) ושאלה מהתרגול העצמאי.</p><ul class="substeps">';
        var acc = 0;
        D.sections.forEach(function (s) {
          var len = s.cards.length;
          var st, c = '';
          if (doneCards >= acc + len) st = 'הושלם';
          else if (doneCards >= acc) { st = 'צעד ' + n(doneCards - acc + 1) + ' מתוך ' + n(len); c = 'cur'; }
          acc += len;
          if (!st) st = n(len) + ' צעדים';
          if (c === '' && doneCards < acc - len) st = n(len) + ' צעדים';
          html += '<li class="' + c + '"><span>' + esc(s.title) + '</span><span class="st">' + st + '</span></li>';
        });
        html += '<li class="' + (doneCards >= totalCards && !practiceDone() ? 'cur' : '') + '"><span>תרגול עצמאי</span><span class="st">' + (practiceDone() ? 'הושלם' : 'שאלה אחת') + '</span></li>';
        html += '</ul></div>';
      }
      html += '</li>';
    });
    html += '</ol>';
    $stage.innerHTML = html;
    $dock.innerHTML = '<a class="btn btn-primary btn-block" href="#/lesson/' + fi + '">להמשיך מהצעד הנוכחי <span class="arrow" aria-hidden="true">←</span></a>';
    math($stage);
  }

  /* ---------- 3. Lesson: one idea per frame ---------- */
  var lastFrame = -1;
  function viewLesson(fi) {
    var f = frames[fi];
    var back = fi < lastFrame;
    lastFrame = fi;
    if (fi > progress() || f.type === 'done') save('frame', fi);

    // header: exit + where-am-I + segmented progress (one segment per section, one tick per step)
    var label, segs = '';
    var cardIdx = cardsBefore(fi); // cards completed before this frame
    D.sections.forEach(function (s, si) {
      segs += '<span class="seg" style="flex:' + s.cards.length + '">';
      s.cards.forEach(function (c, ci) {
        var cls = '';
        if (f.type === 'done' || si < f.si || (si === f.si && f.type === 'card' && ci < f.ci)) cls = 'on';
        if (si === f.si && f.type === 'card' && ci === f.ci) cls = 'cur';
        segs += '<i class="' + cls + '"></i>';
      });
      segs += '</span>';
    });
    if (f.type === 'done') label = '<b>הרצף הושלם</b>';
    else if (f.type === 'intro') label = 'חלק ' + n(f.si + 1) + ' מתוך ' + n(D.sections.length);
    else label = '<b>' + esc(D.sections[f.si].title) + '</b> · צעד ' + n(f.ci + 1) + ' מתוך ' + n(D.sections[f.si].cards.length);

    $bar.innerHTML =
      '<div class="focus-head">' +
      '<div class="focus-top"><a class="icon-btn" href="#/path" aria-label="יציאה למסלול">' +
      '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></a>' +
      '<span class="focus-label" aria-live="polite">' + label + '</span><span style="width:40px"></span></div>' +
      '<div class="segments" role="progressbar" aria-valuemin="0" aria-valuemax="' + totalCards + '" aria-valuenow="' + cardIdx + '" aria-label="התקדמות ברצף">' + segs + '</div>' +
      '</div>';

    var el;
    if (f.type === 'intro') {
      var s = D.sections[f.si];
      el = h('<section class="card section-intro"><div>' +
        '<p class="n">חלק ' + n(f.si + 1) + ' מתוך ' + n(D.sections.length) + '</p>' +
        '<h2>' + esc(s.title) + '</h2>' +
        (f.si === 0 ? '<p class="lede">' + esc(D.sectionTitle) + '</p>' : '') +
        (f.si === 2 ? '<p class="lede">' + esc(D.exampleTitle) + '</p>' : '') +
        '<p class="small muted">' + n(s.cards.length) + ' צעדים קצרים</p></div></section>');
    } else if (f.type === 'done') {
      var ans = D.sections[2].cards[D.sections[2].cards.length - 1].text.join(' ');
      el = h('<section class="card"><div><p class="kind-tag">סיימת את הרצף</p><h2>עכשיו לבד, שאלה אחת.</h2></div>' +
        '<div class="prose"><p class="muted">מה שראינו בדוגמה:</p><p>' + md(ans) + '</p></div></section>');
    } else {
      var c = f.card;
      var kind = c.kind || '';
      var tag = { problem: 'השאלה', answer: 'התשובה', tip: 'טיפ לבגרות', aside: 'הערה' }[kind] || '';
      var prose = c.text.map(function (p) { return '<p>' + md(p) + '</p>'; }).join('');
      el = h('<section class="card ' + kind + (c.graph ? ' has-figure' : '') + '"><div class="txt">' +
        (tag ? '<p class="kind-tag">' + tag + '</p>' : '') + '<div class="prose">' + prose + '</div></div></section>');
      if (c.graph) { el.appendChild(figure(c.graph)); $shell.classList.add('wide-card'); }
    }
    if (back) el.classList.add('back');
    $stage.innerHTML = '';
    $stage.appendChild(el);
    math($stage);

    var nextLabel = f.type === 'done' ? 'לשאלה' : f.type === 'intro' ? 'להתחיל' : 'המשך';
    var nextHref = f.type === 'done' ? '#/practice' : '#/lesson/' + (fi + 1);
    $dock.innerHTML =
      '<div class="controls">' +
      '<a class="btn btn-quiet" href="#/lesson/' + Math.max(0, fi - 1) + '"' + (fi === 0 ? ' aria-disabled="true" style="visibility:hidden"' : '') + '><span class="arrow" aria-hidden="true">→</span> הקודם</a>' +
      '<a class="btn btn-primary" id="next" href="' + nextHref + '">' + nextLabel + ' <span class="arrow" aria-hidden="true">←</span></a>' +
      '</div><p class="hint-keys">מקש ← או רווח: הבא · מקש →: הקודם · Esc: יציאה</p>';
  }

  // keyboard + swipe, lesson only. RTL: the next page is on the left.
  document.addEventListener('keydown', function (e) {
    if (!/^#\/lesson/.test(location.hash)) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'BUTTON')) return;
    var fi = parseInt(location.hash.split('/')[2], 10); if (isNaN(fi)) fi = progress();
    if (e.key === 'ArrowLeft' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); var nx = document.getElementById('next'); if (nx) location.hash = nx.getAttribute('href'); }
    else if (e.key === 'ArrowRight' && fi > 0) { e.preventDefault(); go('#/lesson/' + (fi - 1)); }
    else if (e.key === 'Escape') go('#/path');
  });
  var sx = null, sy = 0;
  $stage.addEventListener('touchstart', function (e) {
    if (!/^#\/lesson/.test(location.hash) || e.target.closest('.figure')) { sx = null; return; }
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  $stage.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) < 60 || Math.abs(dy) > 50) return;
    var fi = parseInt(location.hash.split('/')[2], 10); if (isNaN(fi)) fi = progress();
    if (dx > 0) { var nx = document.getElementById('next'); if (nx) location.hash = nx.getAttribute('href'); }
    else if (fi > 0) go('#/lesson/' + (fi - 1));
  });

  /* ---------- graph: one component, the lesson's own functions only ---------- */
  var W = 320, H = 232, X0 = -2.5, X1 = 2.5, Y0 = -3.6, Y1 = 3.6;
  function px(x) { return (x - X0) / (X1 - X0) * W; }
  function py(y) { return H - (y - Y0) / (Y1 - Y0) * H; }
  function curvePath(f) {
    var d = '';
    for (var i = 0; i <= 200; i++) {
      var x = X0 + (X1 - X0) * i / 200, y = f(x);
      y = Math.max(Y0 - 2, Math.min(Y1 + 2, y));
      d += (i ? 'L' : 'M') + px(x).toFixed(1) + ' ' + py(y).toFixed(1);
    }
    return d;
  }
  function axes() {
    var s = '<defs><clipPath id="clip"><rect x="0" y="0" width="' + W + '" height="' + H + '"/></clipPath></defs>';
    for (var gx = -2; gx <= 2; gx++) if (gx) s += '<line class="g-grid" x1="' + px(gx) + '" y1="0" x2="' + px(gx) + '" y2="' + H + '"/>';
    for (var gy = -3; gy <= 3; gy++) if (gy) s += '<line class="g-grid" x1="0" y1="' + py(gy) + '" x2="' + W + '" y2="' + py(gy) + '"/>';
    s += '<line class="g-axis" x1="0" y1="' + py(0) + '" x2="' + W + '" y2="' + py(0) + '"/>';
    s += '<line class="g-axis" x1="' + px(0) + '" y1="0" x2="' + px(0) + '" y2="' + H + '"/>';
    [-2, -1, 1, 2].forEach(function (t) {
      s += '<text class="g-tick" direction="ltr" x="' + px(t) + '" y="' + (py(0) + 15) + '" text-anchor="middle">' + (t < 0 ? '−' + (-t) : t) + '</text>';
    });
    [-2, 2].forEach(function (t) {
      s += '<text class="g-tick" direction="ltr" x="' + (px(0) - 6) + '" y="' + (py(t) + 4) + '" text-anchor="end">' + (t < 0 ? '−' + (-t) : t) + '</text>';
    });
    return s;
  }
  function svgOpen(label) { return '<svg viewBox="-8 -8 ' + (W + 16) + ' ' + (H + 16) + '" role="img" aria-label="' + esc(label) + '">'; }

  function figure(g) {
    var fig = document.createElement('figure');
    fig.className = 'figure';
    if (g.mode === 'shape') {
      var a = g.a, f = function (x) { return a * (x * x * x - 3 * x); };
      // positions of the peak/valley of a(x^3-3x) are at x = ±1 (f' = a(3x^2-3) = 0)
      var maxX = a > 0 ? -1 : 1, minX = -maxX;
      var s = svgOpen(a > 0 ? 'גרף x בשלישית פחות 3x' : 'גרף מינוס x בשלישית ועוד 3x') + axes() +
        '<path class="g-curve" clip-path="url(#clip)" d="' + curvePath(f) + '"/>' +
        '<circle class="g-mark" cx="' + px(maxX) + '" cy="' + py(f(maxX)) + '" r="4.5"/>' +
        '<circle class="g-mark" cx="' + px(minX) + '" cy="' + py(f(minX)) + '" r="4.5"/>' +
        '<text class="g-label-strong" x="' + px(maxX) + '" y="' + (py(f(maxX)) - 12) + '" text-anchor="middle">פסגה</text>' +
        '<text class="g-label-strong" x="' + px(minX) + '" y="' + (py(f(minX)) + 22) + '" text-anchor="middle">עמק</text>' +
        // the text's own words ("מגיע מלמטה ויוצא למעלה" / "מגיע מלמעלה ויוצא למטה"), placed beside the curve's two ends
        '<text class="g-label g-halo-text" x="' + px(a > 0 ? -1.45 : 1.45) + '" y="' + py(-3.1) + '" text-anchor="middle">' + (a > 0 ? 'מגיע מלמטה' : 'יוצא למטה') + '</text>' +
        '<text class="g-label g-halo-text" x="' + px(a > 0 ? 1.45 : -1.45) + '" y="' + py(3.0) + '" text-anchor="middle">' + (a > 0 ? 'יוצא למעלה' : 'מגיע מלמעלה') + '</text>' +
        '</svg>';
      fig.innerHTML = s + '<figcaption>' + tex(a > 0 ? 'f(x)=x^3-3x' : 'f(x)=-x^3+3x') + (a > 0 ? ' · קודם פסגה, אחר כך עמק' : ' · קודם עמק, אחר כך פסגה') + '</figcaption>';
      return fig;
    }
    var F = function (x) { return -x * x * x + 3 * x; };
    var dF = function (x) { return -3 * x * x + 3; }; // ex4 step 1: f'(x) = -3x^2 + 3
    if (g.mode === 'mark') {
      var x = g.x, y = F(x), isMin = x < 0;
      fig.innerHTML = svgOpen(isMin ? 'נקודת מינימום ב-x שווה מינוס 1' : 'נקודת מקסימום ב-x שווה 1') + axes() +
        '<path class="g-curve" clip-path="url(#clip)" d="' + curvePath(F) + '"/>' +
        '<line class="g-tangent" x1="' + px(x - .7) + '" y1="' + py(y) + '" x2="' + px(x + .7) + '" y2="' + py(y) + '"/>' +
        '<circle class="g-halo" cx="' + px(x) + '" cy="' + py(y) + '" r="13"/><circle class="g-point" cx="' + px(x) + '" cy="' + py(y) + '" r="5"/>' +
        '<text class="g-label-strong" direction="ltr" x="' + px(x) + '" y="' + (isMin ? py(y) + 28 : py(y) - 18) + '" text-anchor="middle">(' + (isMin ? '−1, −2' : '1, 2') + ')</text>' +
        '</svg><figcaption>' + (isMin ? 'מינימום: המשיק אופקי, והנגזרת עוברת מ-' + tex('-') + ' ל-' + tex('+') : 'מקסימום: המשיק אופקי, והנגזרת עוברת מ-' + tex('+') + ' ל-' + tex('-')) + '</figcaption>';
      return fig;
    }
    // probe: the student builds the sign table of f' by testing one x per interval
    fig.innerHTML = '<div class="probe">' +
      svgOpen('גרף מינוס x בשלישית ועוד 3x עם משיק בנקודה שנבחרה') + axes() +
      '<path class="g-curve" clip-path="url(#clip)" d="' + curvePath(F) + '"/>' +
      '<line class="g-tangent" id="tan" clip-path="url(#clip)"/>' +
      '<circle class="g-halo" id="halo" r="13"/><circle class="g-point" id="pt" r="5.5"/>' +
      '<rect class="g-hit" id="hit" x="-8" y="-8" width="' + (W + 16) + '" height="' + (H + 16) + '"/>' +
      '</svg>' +
      '<div class="readout" id="ro" aria-live="polite"></div>' +
      '<input class="range" id="rng" type="range" min="-2.2" max="2.2" step="0.1" value="-2" aria-label="בחירת x" dir="ltr">' +
      '<div class="chips" dir="ltr">' + [-2, 0, 2].map(function (v) { return '<button class="chip" type="button" data-x="' + v + '" aria-pressed="false">' + tex('x=' + v) + '</button>'; }).join('') + '</div>' +
      '<div class="signs" aria-label="טבלת הסימנים של הנגזרת">' +
      '<span class="cell" data-i="0">?</span><span class="root">' + tex('-1') + '</span>' +
      '<span class="cell" data-i="1">?</span><span class="root">' + tex('1') + '</span>' +
      '<span class="cell" data-i="2">?</span></div>' +
      '<p class="signs-caption">הסימן של ' + tex("f'") + ' בכל קטע: בדקו נקודה אחת בכל קטע, והטבלה תתמלא.</p>' +
      '</div>';
    var rng = fig.querySelector('#rng'), ro = fig.querySelector('#ro');
    var pt = fig.querySelector('#pt'), halo = fig.querySelector('#halo'), tan = fig.querySelector('#tan');
    var filled = {};
    function set(x, touched) {
      x = Math.round(x * 10) / 10;
      if (Object.is(x, -0)) x = 0;
      var y = F(x), m = dF(x);
      pt.setAttribute('cx', px(x)); pt.setAttribute('cy', py(y));
      halo.setAttribute('cx', px(x)); halo.setAttribute('cy', py(y));
      // tangent: fixed pixel length along direction (1, m) in data units
      var dxp = W / (X1 - X0), dyp = -m * H / (Y1 - Y0), L = Math.hypot(dxp, dyp), k = 48 / L;
      tan.setAttribute('x1', px(x) - dxp * k); tan.setAttribute('y1', py(y) - dyp * k);
      tan.setAttribute('x2', px(x) + dxp * k); tan.setAttribute('y2', py(y) + dyp * k);
      rng.value = x;
      var mm = Math.round(m * 100) / 100;
      var sign = mm > 0 ? '> 0' : mm < 0 ? '< 0' : '= 0';
      var word = mm > 0 ? 'עולה כאן' : mm < 0 ? 'יורדת כאן' : 'משיק אופקי';
      ro.innerHTML = '<span>' + tex('x=' + x) + '</span><span class="v">' + tex("f'(" + x + ")=" + mm + '\\ ' + sign) + '</span><span class="muted">' + word + '</span>';
      fig.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(+c.dataset.x === x)); });
      if (touched && mm !== 0) {
        var i = x < -1 ? 0 : x < 1 ? 1 : 2;
        filled[i] = mm > 0 ? '+' : '−';
        var cell = fig.querySelector('.cell[data-i="' + i + '"]');
        cell.textContent = filled[i]; cell.classList.add('filled');
      }
    }
    rng.addEventListener('input', function () { set(parseFloat(rng.value), true); });
    fig.querySelectorAll('.chip').forEach(function (c) { c.addEventListener('click', function () { set(+c.dataset.x, true); }); });
    var hit = fig.querySelector('#hit'), dragging = false;
    function fromEvent(e) {
      var r = hit.ownerSVGElement.getBoundingClientRect();
      var u = (e.clientX - r.left) / r.width * (W + 16) - 8;
      return Math.max(-2.2, Math.min(2.2, X0 + u / W * (X1 - X0)));
    }
    hit.addEventListener('pointerdown', function (e) { dragging = true; hit.setPointerCapture(e.pointerId); set(fromEvent(e), true); });
    hit.addEventListener('pointermove', function (e) { if (dragging) set(fromEvent(e), true); });
    hit.addEventListener('pointerup', function () { dragging = false; });
    set(-2, false);
    return fig;
  }

  /* ---------- 4. Practice: one question, nothing else ---------- */
  function viewPractice() {
    var P = D.practice;
    $bar.innerHTML =
      '<div class="focus-head"><div class="focus-top"><a class="icon-btn" href="#/path" aria-label="יציאה למסלול">' +
      '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></a>' +
      '<span class="focus-label">תרגול עצמאי · שאלה ' + n(P.index) + ' מתוך ' + n(P.total) + '</span><span style="width:40px"></span></div></div>';
    var hintsShown = 0, solved = false, tries = 0;
    $stage.innerHTML =
      '<section class="practice" id="pr">' +
      '<p class="q-prompt">' + md(P.prompt) + '</p>' +
      '<form class="answer-row" id="form" autocomplete="off">' +
      '<button class="btn sign" type="button" id="sign" aria-label="החלפת סימן">±</button>' +
      '<input id="ans" type="text" inputmode="decimal" enterkeyhint="done" placeholder="תשובה" aria-label="התשובה שלך">' +
      '</form>' +
      '<div id="fb" aria-live="polite"></div>' +
      '<div class="reveal" id="rev"></div>' +
      '<div class="aux"><button class="btn btn-quiet" type="button" id="hint">רמז</button><button class="btn btn-quiet" type="button" id="sol">הפתרון המלא</button></div>' +
      '</section>';
    math($stage);
    $dock.innerHTML = '<button class="btn btn-primary btn-block" type="submit" form="form" id="check">בדיקה</button>';
    var ans = document.getElementById('ans'), form = document.getElementById('form'), fb = document.getElementById('fb'), rev = document.getElementById('rev');
    var hintBtn = document.getElementById('hint'), solBtn = document.getElementById('sol');
    document.getElementById('sign').addEventListener('click', function () {
      var v = ans.value.trim().replace(/^[−–]/, '-');
      ans.value = v.charAt(0) === '-' ? v.slice(1) : '-' + v; ans.focus();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (solved) { go('#/path'); return; }
      var raw = ans.value.trim().replace(/[−–]/g, '-').replace(',', '.');
      if (raw === '' || isNaN(Number(raw))) { fb.innerHTML = '<div class="feedback neutral"><p>כתבו מספר אחד, למשל ' + n('-3') + '.</p></div>'; return; }
      var v = Number(raw); tries++;
      form.classList.remove('state-good', 'state-bad');
      if (Math.abs(v - P.answer.value) <= P.answer.tolerance) {
        solved = true; save('practiceDone', true);
        form.classList.add('state-good');
        fb.innerHTML = '<div class="feedback good"><p class="h">נכון.</p><p>' + md(P.solution.final) + ' הוא שיעור ה-' + tex('y') + ' של המינימום.</p></div>';
        document.getElementById('check').textContent = 'חזרה למסלול';
        hintBtn.hidden = true;
      } else {
        form.classList.add('state-bad');
        var w = P.wrong.find(function (x) { return x.value === v; });
        fb.innerHTML = '<div class="feedback bad"><p class="h">עוד לא.</p>' +
          (w ? '<p><strong>' + md(w.label) + '.</strong> ' + md(w.advice) + '</p>' : '<p>בדקו שוב את החישוב, או פתחו רמז.</p>') + '</div>';
      }
      math(fb);
    });
    hintBtn.addEventListener('click', function () {
      if (hintsShown >= P.hints.length) return;
      var d = h('<div class="item"><span class="lbl">רמז ' + n(hintsShown + 1) + ' מתוך ' + n(P.hints.length) + '</span><p>' + md(P.hints[hintsShown]) + '</p></div>');
      rev.appendChild(d); math(d); hintsShown++;
      if (hintsShown >= P.hints.length) hintBtn.disabled = true;
    });
    solBtn.addEventListener('click', function () {
      // solution enters the DOM only on request (quality-standards §6)
      if (rev.querySelector('.sol')) return;
      var d = h('<div class="item sol"><span class="lbl">הפתרון</span>' + P.solution.steps.map(function (s) { return '<p>' + md(s) + '</p>'; }).join('') + '</div>');
      rev.appendChild(d); math(d); solBtn.disabled = true;
    });
  }

  route();
})();
