/* Concept A — router + 4 screens. All math content comes from data.js (generated read-only from learning-content). */
(function () {
  const D = window.LESSON_DATA;
  const DV = D.deriv;
  const view = document.getElementById('view');
  const ctx = document.getElementById('ctx');
  const isPhone = () => window.matchMedia('(max-width: 759px)').matches;
  const fmt = window.WSfmt;
  let charts = [];

  /* ---------- text renderer: $..$ -> KaTeX (isolated LTR), **x** -> strong ---------- */
  const escH = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function md(src) {
    const parts = String(src).split('$');
    let bold = false, out = '', carry = '';
    parts.forEach((p, i) => {
      if (i % 2 === 1) {
        let html;
        try { html = katex.renderToString(p, { throwOnError: false }); } catch (e) { html = escH(p); }
        const m = `<span class="m" dir="ltr">${html}</span>`;
        // keep a Hebrew prefix like "ב-" / "ל-" glued to its formula (no line break between them)
        out += carry ? `<span class="nw">${carry}${m}</span>` : m;
        carry = '';
      } else {
        let t = escH(p).split('**').map((t, j) => { if (j === 0) return t; bold = !bold; return (bold ? '<strong>' : '</strong>') + t; }).join('');
        const g = i < parts.length - 1 && t.match(/(^|\s)([\u05D0-\u05EA]{1,3}-)$/);
        if (g) { carry = g[2]; t = t.slice(0, t.length - g[2].length); }
        out += t;
      }
    });
    if (bold) out += '</strong>';
    return out;
  }
  const n = (v) => `<bdi class="num">${v}</bdi>`; // numbers inside Hebrew sentences: always isolated
  const K = (tex) => md('$' + tex + '$');

  /* ---------- placeholder progress (NOT real data — marked as such everywhere it shows) ---------- */
  const DEMO = { stepsDone: 4 };

  /* ======================= LESSON definition: ex4 f(x) = -x^3 + 3x ======================= */
  const ex4 = DV.ex4;
  const f = (x) => -x * x * x + 3 * x;
  const fp = (x) => -3 * x * x + 3;
  const STEP_TITLES = ['גוזרים', 'משווים לאפס', 'צורת הנגזרת', 'טבלת סימנים', 'מינימום', 'מקסימום', 'למה הסדר הפוך', 'תשובה'];
  const TOTAL = STEP_TITLES.length; // 7 solution steps from ex4.steps + the answer
  const R = [-1, 1];
  const SIGNS = [{ a: -9, b: -1, s: -1 }, { a: -1, b: 1, s: 1 }, { a: 1, b: 9, s: -1 }];
  const TR_ALL = [{ a: -9, b: -1, dir: -1 }, { a: -1, b: 1, dir: 1 }, { a: 1, b: 9, dir: -1 }];
  const MIN = { x: -1, y: f(-1), type: 'min' }, MAX = { x: 1, y: f(1), type: 'max' };
  const ARROWS = [{ from: -2.35, to: -1.75, lx: -1.15, ly: 4.3, text: 'מגיע מלמעלה' }, { from: 1.75, to: 2.35, lx: 1.15, ly: -4.6, text: 'יוצא למטה' }];
  const LAYERS = [
    { showFp: true, fDim: true, focus: 'ind' },
    { showFp: true, fDim: true, roots: R, focus: 'ind', snap: R },
    { showFp: true, fpBold: true, fDim: true, roots: R, concave: { x: 0, y: -4, text: 'פרבולה "בוכה": נפתחת למטה' }, focus: 'ind', snap: R },
    { showFp: true, hist: true, signs: SIGNS, fDim: true, roots: R, testPts: [{ x: -2 }, { x: 0 }, { x: 2 }], focus: 'ind', snap: [-2, 0, 2, -1, 1] },
    { showFp: true, hist: true, signs: SIGNS, roots: R, extrema: [MIN], trend: TR_ALL.slice(0, 2), focus: 'main', snap: R },
    { showFp: true, hist: true, signs: SIGNS, roots: R, extrema: [MIN, MAX], trend: TR_ALL, focus: 'main', snap: R },
    { showFp: true, hist: true, signs: SIGNS, roots: R, extrema: [MIN, MAX], trend: TR_ALL, endArrows: ARROWS, focus: 'main', snap: R },
    { showFp: true, hist: true, signs: SIGNS, roots: R, extrema: [MIN, MAX], trend: TR_ALL, endArrows: ARROWS, snap: R },
  ];
  const START_X = [-2, -1, 0, -2, -1, 1, -2.2, 0];
  // "On the chart" captions: UI pointers that tie the step text to what the chart now shows.
  const ONCHART = [
    "בפאנל התחתון נפתח עכשיו הגרף של $f'(x) = -3x^2 + 3$. הגרף העליון של $f$ מעומעם: בשלב הזה עובדים רק עם הנגזרת.",
    "הקווים המקווקווים הם $x=-1$ ו-$x=1$: בדיוק שם הגרף של $f'$ חוצה את הציר בפאנל התחתון. גררו את הסמן והוא ייצמד אליהם.",
    "בפאנל התחתון: הפרבולה של $f'$ נפתחת כלפי מטה, ולכן היא מעל הציר רק בין שני השורשים.",
    "שלוש נקודות הבדיקה מסומנות על $f'$. עמודות ירוקות: $f'>0$. עמודות אדומות: $f'<0$. טבלת הסימנים בצד מתמלאת בהתאם.",
    "בגרף העליון: משמאל ל-$x=-1$ הקו אדום (יורדת) ומימין לו ירוק (עולה). בנקודה עצמה המשיק אופקי.",
    "ב-$x=1$ הקו עובר מירוק לאדום: מעלייה לירידה, כלומר פסגה.",
    "החצים בקצוות: משמאל הגרף מגיע מלמעלה, ומימין הוא יוצא למטה. לכן העמק מגיע לפני הפסגה.",
    "התמונה המלאה: אדום הם תחומי הירידה, ירוק הוא תחום העלייה, ושתי נקודות הקיצון מסומנות.",
  ];

  let L = { step: 0, panel: 'step' };

  function signTable(step) {
    const c = (cls, txt) => `<td class="${cls}">${txt}</td>`;
    const fpRow = [
      step >= 3 ? c('neg', '−') : c('unk', '?'),
      step >= 1 ? c('crit zero', '0') : c('crit unk', '?'),
      step >= 3 ? c('pos', '+') : c('unk', '?'),
      step >= 1 ? c('crit zero', '0') : c('crit unk', '?'),
      step >= 3 ? c('neg', '−') : c('unk', '?'),
    ].join('');
    const fRow = [
      step >= 4 ? c('arr-dn', '↘') : c('unk', '·'),
      step >= 4 ? c('crit', `<span class="lab">מינ'</span>`) : c('crit unk', '·'),
      step >= 4 ? c('arr-up', '↗') : c('unk', '·'),
      step >= 5 ? c('crit', `<span class="lab">מקס'</span>`) : c('crit unk', '·'),
      step >= 5 ? c('arr-dn', '↘') : c('unk', '·'),
    ].join('');
    return `<table class="signtbl" aria-label="טבלת סימנים של f' ו-f">
      <tr><th class="rowh">${K('x')}</th><th>${K('x<-1')}</th><th>${step >= 1 ? K('-1') : '?'}</th><th>${K('-1<x<1')}</th><th>${step >= 1 ? K('1') : '?'}</th><th>${K('x>1')}</th></tr>
      <tr><th class="rowh">${K("f'")}</th>${fpRow}</tr>
      <tr><th class="rowh">${K('f')}</th>${fRow}</tr></table>`;
  }

  function pointsTable(step) {
    const row = (p, shown, xShown) => `<tr><td class="n">${xShown ? fmt(p.x) : '—'}</td><td class="n">${shown ? fmt(p.y) : '—'}</td><td>${shown ? `<span class="pill ${p.type}">${p.type === 'max' ? 'מקסימום' : 'מינימום'}</span>` : `<span class="pill wait">${xShown ? 'חשודה' : 'טרם נמצאה'}</span>`}</td></tr>`;
    return `<table class="pts"><thead><tr><th>${K('x')}</th><th>${K('f(x)')}</th><th>סוג</th></tr></thead><tbody>${row(MIN, step >= 4, step >= 1)}${row(MAX, step >= 5, step >= 1)}</tbody></table>`;
  }

  function checksList(step) {
    // ex4.checks from the lesson file, recomputed live from f / f' and compared to their "equals"
    const live = { "f'(-2)": fp(-2), 'f(-1)': f(-1), 'f(1)': f(1) };
    const need = { "f'(-2)": 3, 'f(-1)': 4, 'f(1)': 5 };
    return ex4.checks.map((ch) => {
      const shown = step >= (need[ch.label] ?? 7);
      const v = live[ch.label];
      const ok = v !== undefined && Math.abs(v - ch.equals) < 1e-9;
      return `<div class="check-row"><span>${K(ch.label.replace("'", "'"))}</span><span class="num">${shown ? fmt(ch.equals) : '—'}</span><span class="${shown && ok ? 'ok' : 'faint'}">${shown ? (ok ? '✓ חושב' : '✗') : ''}</span></div>`;
    }).join('');
  }

  function theory() {
    const e5 = DV.e5;
    return e5.blocks.map((b) => b.type === 'list' ? `<ul>${b.items.map((i) => `<li>${md(i)}</li>`).join('')}</ul>` : `<p>${md(b.text)}</p>`).join('');
  }

  function renderLesson(stepFromHash) {
    if (stepFromHash != null) L.step = Math.max(0, Math.min(TOTAL - 1, stepFromHash));
    setCtx([chip(`<b>${K('f(x) = -x^3 + 3x')}</b>`, 'keep'), chip(`דוגמה ${n(4)} · ${escH(ex4.title)}`)]);
    view.innerHTML = `
    <div class="screen ws" data-panel="${L.panel}" id="ws">
      <section class="ws-read" aria-label="הסבר השלב">
        <div class="paneh"><span>${escH(DV.title)}</span><span class="sp"></span><span class="tag faint micro">ex4</span></div>
        <ol class="outline" id="outline"></ol>
        <div class="step-body scroll" id="stepBody"></div>
        <div class="stepper">
          <button class="btn" id="prev">→ הקודם</button>
          <span class="pos" id="pos"></span>
          <button class="btn primary" id="next">הבא ←</button>
        </div>
      </section>
      <section class="ws-chart" aria-label="גרף">
        <div class="paneh">
          <span>${K('y = f(x)')} <span class="faint">+ פאנל</span> ${K("f'(x)")}</span><span class="sp"></span>
          <div class="chart-tools" id="tools"></div>
        </div>
        <div class="readout" id="readout" aria-live="off"></div>
        <div class="chart-host" id="chartHost"></div>
        <div class="scrub"><label for="xr">הזזת הסמן</label><input type="range" id="xr" min="-2.4" max="2.4" step="0.01" value="0" aria-label="מיקום הסמן על ציר x"><span class="kbd">← →</span><span>שלבים</span></div>
      </section>
      <div class="seg" role="tablist" aria-label="פאנל">
        <button role="tab" data-p="step">שלב</button>
        <button role="tab" data-p="table">טבלת סימנים</button>
        <button role="tab" data-p="points">נקודות ובדיקה</button>
      </div>
      <aside class="ws-data scroll" aria-label="נתונים" id="dataPane"></aside>
    </div>`;

    const chart = new WSChart(document.getElementById('chartHost'), {
      id: 'lc', f, fp, xMin: -2.4, xMax: 2.4, yMin: -7, yMax: 7, yTick: 2, pMin: -15, pMax: 8, pTick: 5,
      fLabel: 'f(x) = -x³ + 3x', fpLabel: "f'(x) = -3x² + 3",
      ariaLabel: 'גרף של f(x) = -x³ + 3x ומתחתיו גרף הנגזרת f\'(x) = -3x² + 3',
      onMove: (x) => { readout(x); document.getElementById('xr').value = x; },
    });
    charts.push(chart);
    const xr = document.getElementById('xr');
    xr.addEventListener('input', () => chart.setX(+xr.value));

    const readout = (x) => {
      const v = fp(x); const flat = Math.abs(v) < 0.02;
      const tr = flat ? '<span class="trend flat">משיק אופקי</span>' : v > 0 ? '<span class="trend up">עולה</span>' : '<span class="trend down">יורדת</span>';
      document.getElementById('readout').innerHTML = `<span><span class="k">x</span> ${fmt(x)}</span><span><span class="k">f(x)</span> ${fmt(f(x))}</span><span><span class="k">f'(x)</span> ${fmt(v)}</span>${tr}`;
    };

    document.querySelectorAll('.seg button').forEach((b) => b.addEventListener('click', () => { L.panel = b.dataset.p; document.getElementById('ws').dataset.panel = L.panel; syncSeg(); }));
    const syncSeg = () => document.querySelectorAll('.seg button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.p === L.panel)));
    syncSeg();

    const go = (i) => { L.step = Math.max(0, Math.min(TOTAL - 1, i)); history.replaceState(null, '', '#lesson/' + (L.step + 1)); paint(); };
    document.getElementById('prev').onclick = () => go(L.step - 1);
    document.getElementById('next').onclick = () => { if (L.step === TOTAL - 1) location.hash = '#practice'; else go(L.step + 1); };
    view._key = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(L.step + 1); }   // RTL: left = forward
      if (e.key === 'ArrowRight') { e.preventDefault(); go(L.step - 1); }
    };

    function paint() {
      const s = L.step;
      document.getElementById('outline').innerHTML = STEP_TITLES.map((t, i) =>
        `<li><button data-i="${i}" class="${i < s ? 'done' : ''}" ${i === s ? 'aria-current="step"' : ''}><span class="i">${i < s ? '✓' : i + 1}</span><span>${t}</span></button></li>`).join('');
      document.querySelectorAll('#outline button').forEach((b) => b.onclick = () => go(+b.dataset.i));
      const body = s < TOTAL - 1 ? `<p>${md(ex4.steps[s])}</p>` : `<div class="answer-box">${md(ex4.answer)}</div>`;
      document.getElementById('stepBody').innerHTML = `
        <div class="stepdots" role="group" aria-label="שלבים">${STEP_TITLES.map((t, i) => `<button data-i="${i}" class="${i < s ? 'done' : ''}" ${i === s ? 'aria-current="step"' : ''} aria-label="שלב ${i + 1}: ${t}"><i></i></button>`).join('')}</div>
        <div class="problem"><span class="lbl">${escH(ex4.title)}</span>${md(ex4.problem)}</div>
        <div class="step-kicker"><span>שלב ${n(s + 1)} מתוך ${n(TOTAL)}</span><span>·</span><strong>${STEP_TITLES[s]}</strong></div>
        <div class="step-text">${body}</div>
        <div class="onchart"><span class="lbl">◧ מה רואים עכשיו בגרף</span>${md(ONCHART[s])}</div>`;
      document.querySelectorAll('.stepdots button').forEach((b) => b.onclick = () => go(+b.dataset.i));
      document.getElementById('pos').innerHTML = `שלב ${n(s + 1)} מתוך ${n(TOTAL)}`;
      document.getElementById('prev').disabled = s === 0;
      document.getElementById('next').innerHTML = s === TOTAL - 1 ? 'לתרגול עצמאי ←' : 'הבא ←';
      document.getElementById('stepBody').scrollTop = 0;
      document.getElementById('dataPane').innerHTML = `
        <div class="paneh"><span>נתוני הדוגמה</span><span class="sp"></span><span class="tag faint micro">מתעדכן בכל שלב</span></div>
        <section class="data-sec sec-table"><div class="ph"><h3>טבלת סימנים</h3><span class="sp"></span><span class="tag">ציר x משמאל לימין</span></div><div class="pb">${signTable(s)}</div></section>
        <section class="data-sec"><div class="ph"><h3>נקודות חשודות</h3></div><div class="pb tight">${pointsTable(s)}</div></section>
        <section class="data-sec"><div class="ph"><h3>אימות מספרי</h3><span class="sp"></span><span class="tag">checks · ex4</span></div><div class="pb">${checksList(s)}</div></section>
        <section class="data-sec"><details class="fold"><summary class="ph"><h3>רקע: ${escH(DV.e5.title.split(':')[0])}</h3><span class="sp"></span><span class="chev">‹</span></summary><div class="pb theory">${theory()}</div></details></section>`;
      chart.set(LAYERS[s]);
      chart.setX(START_X[s]);
    }
    paint();
  }

  /* ======================= PRACTICE: independentPractice p5 ======================= */
  const P5 = DV.practice;
  const pf = (x) => -2 * x ** 3 + 3 * x ** 2 + 12 * x;     // f from the prompt
  const pfp = (x) => -6 * x * x + 6 * x + 12;              // f' as given in the item's own hint 2 (shown only after solving)
  let PS = { hints: 0, solved: false, showSol: false, log: [], lastFb: null, val: '' };

  function renderPractice() {
    setCtx([chip(`תרגיל עצמאי <b>${n(DV.practiceIndex)}</b> מתוך ${n(DV.practiceTotal)}`, 'keep'), chip(escH(DV.title))]);
    view.innerHTML = `
    <div class="screen prac">
      <section class="prac-q scroll" aria-label="השאלה">
        <div class="paneh"><span class="q-counter">תרגיל ${n(DV.practiceIndex)} מתוך ${n(DV.practiceTotal)}<span class="q-dots" aria-hidden="true">${Array.from({ length: DV.practiceTotal }, (_, i) => `<i class="${i + 1 === DV.practiceIndex ? 'cur' : ''}"></i>`).join('')}</span></span><span class="sp"></span><span class="tag faint micro">p5 · מקורי</span></div>
        <div class="step-body">
          <p class="q-prompt">${md(P5.prompt)}</p>
          <label for="ans" class="small muted">התשובה שלך (מספר)</label>
          <div class="ans-row" style="margin-top:6px">
            <div class="ans-field"><button class="pm" id="pm" type="button" aria-label="החלפת סימן פלוס/מינוס">±</button><input id="ans" inputmode="decimal" autocomplete="off" enterkeyhint="done" value="${escH(PS.val)}" aria-describedby="fb"></div>
            <button class="btn primary lg" id="chk">בדיקה</button>
          </div>
          <div id="fb" aria-live="polite"></div>
          <div class="aux">
            <button class="btn" id="hintBtn"></button>
            <button class="btn ghost" id="solBtn">הצגת הפתרון המלא</button>
          </div>
          <ol class="hint-list" id="hints"></ol>
          <div id="sol"></div>
        </div>
      </section>
      <section class="prac-chart" aria-label="כלים וגרף">
        <div class="paneh"><span>כלים</span><span class="sp"></span><span class="tag faint micro">הגרף ננעל עד שפותרים</span></div>
        <div class="pb" style="border-bottom:1px solid var(--line)">
          <div class="small muted" style="margin-bottom:6px">מחשבון הצבה: מציבים ${K('x')} בפונקציה ${K('f')} שבשאלה (בלי לגזור בשבילכם)</div>
          <div class="calc"><div class="ans-field" style="flex:0 1 150px"><button class="pm" id="cpm" type="button" aria-label="החלפת סימן">±</button><input id="cx" inputmode="decimal" aria-label="ערך x להצבה" placeholder="x"></div><button class="btn" id="cgo">הצבה</button><span class="calc-out" id="cout" aria-live="polite"></span></div>
        </div>
        <div class="readout" id="pread" hidden></div>
        <div id="pchartWrap" style="flex:1;display:flex;flex-direction:column;min-height:0"></div>
      </section>
      <aside class="prac-log scroll" aria-label="יומן">
        <div class="paneh"><span>יומן הניסיונות</span><span class="sp"></span><span class="tag faint micro">הסשן הנוכחי</span></div>
        <div class="pb"><ul class="log-list" id="log"></ul></div>
      </aside>
    </div>`;

    const $ = (id) => document.getElementById(id);
    const flip = (inp) => { const v = inp.value.trim(); inp.value = v.startsWith('-') || v.startsWith('−') ? v.replace(/^[-−]/, '') : '-' + v; inp.focus(); };
    $('pm').onclick = () => flip($('ans'));
    $('cpm').onclick = () => flip($('cx'));
    const parse = (s) => { const t = String(s).trim().replace('−', '-').replace(',', '.'); return t === '' || isNaN(+t) ? null : +t; };
    const log = (cls, txt) => { PS.log.push({ cls, txt }); drawLog(); };
    const drawLog = () => { $('log').innerHTML = PS.log.length ? PS.log.map((l) => `<li><span class="${l.cls}">${l.cls === 'ok' ? '✓' : l.cls === 'no' ? '✗' : '·'}</span><span>${l.txt}</span></li>`).join('') : '<li><span class="info">·</span><span class="faint">עדיין אין ניסיונות.</span></li>'; };

    $('cgo').onclick = () => {
      const x = parse($('cx').value);
      if (x === null) { $('cout').innerHTML = '<span class="faint" dir="rtl">כתבו מספר</span>'; return; }
      $('cout').textContent = `f(${fmt(x)}) = ${fmt(pf(x))}`;
      log('info', `הצבה: <span class="v">f(${fmt(x)}) = ${fmt(pf(x))}</span>`);
    };
    $('cx').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('cgo').click(); });

    const drawHints = () => {
      $('hints').innerHTML = P5.hints.slice(0, PS.hints).map((h, i) => `<li><span class="lbl">רמז ${n(i + 1)}</span>${md(h)}</li>`).join('');
      $('hintBtn').innerHTML = PS.hints < P5.hints.length ? `רמז ${n(PS.hints + 1)} מתוך ${n(P5.hints.length)}` : 'אין עוד רמזים';
      $('hintBtn').disabled = PS.hints >= P5.hints.length;
    };
    $('hintBtn').onclick = () => { PS.hints++; log('info', `נפתח רמז ${n(PS.hints)}`); drawHints(); };

    const drawSol = () => {
      // solution DOM is created only on demand (quality-standards §6)
      $('sol').innerHTML = PS.showSol ? `<div class="sol"><div class="small muted" style="margin-bottom:6px">פתרון מלא</div><ol>${P5.solution.steps.map((s) => `<li>${md(s)}</li>`).join('')}</ol><div style="margin-top:8px">תשובה סופית: ${md(P5.solution.final)}</div></div>` : '';
      $('solBtn').hidden = PS.showSol;
    };
    $('solBtn').onclick = () => { PS.showSol = true; log('info', 'נפתח הפתרון המלא'); drawSol(); unlock(); };

    const fbHtml = (fb) => {
      if (!fb) return '';
      if (fb.kind === 'ok') return `<div class="fb ok"><span class="h">נכון: ${md('$' + fmt(P5.answer.value).replace('−', '-') + '$')}</span>זה שיעור ה-${K('y')} של המינימום. בגרף מימין אפשר לראות למה. ${PS.solved ? '' : ''}</div>`;
      if (fb.kind === 'nan') return `<div class="fb no"><span class="h">צריך מספר</span>כתבו את התשובה כמספר, למשל ${K('-3')}. כפתור ± מוסיף מינוס.</div>`;
      if (fb.mistake) { const m = DV.mistakes[fb.mistake]; return `<div class="fb no"><span class="h">${escH(m.label)}</span>${md(m.advice)}</div>`; }
      return `<div class="fb no"><span class="h">עוד לא</span>נסו לבנות טבלת סימנים, או לפתוח רמז.</div>`;
    };
    $('fb').innerHTML = fbHtml(PS.lastFb);

    const check = () => {
      PS.val = $('ans').value;
      const v = parse($('ans').value);
      let fb;
      if (v === null) fb = { kind: 'nan' };
      else if (Math.abs(v - P5.answer.value) <= (P5.answer.tolerance || 0) + 1e-9) { fb = { kind: 'ok' }; PS.solved = true; }
      else { const w = (P5.commonWrongAnswers || []).find((c) => Math.abs(c.value - v) < 1e-9); fb = { kind: 'no', mistake: w && DV.mistakes[w.mistake] ? w.mistake : null }; }
      PS.lastFb = fb;
      if (v !== null) log(fb.kind === 'ok' ? 'ok' : 'no', `תשובה <span class="v">${fmt(v)}</span>`);
      $('fb').innerHTML = fbHtml(fb);
      if (fb.kind === 'ok') unlock();
    };
    $('chk').onclick = check;
    $('ans').addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });

    function unlock() {
      const wrap = $('pchartWrap');
      if (wrap.dataset.on) return;
      wrap.dataset.on = '1';
      wrap.innerHTML = `<div class="chart-host" id="pchart"></div><div class="onchart" style="margin:var(--sp-3)"><span class="lbl">◧ מה רואים בגרף</span>${md("המינימום $(-1, -7)$ נמצא דווקא בשורש **השמאלי** של $f'$, והמקסימום $(2, 20)$ בימני: המקדם המוביל שלילי, ולכן הסדר מתהפך.")}</div>`;
      $('pread').hidden = false;
      const c = new WSChart($('pchart'), {
        id: 'pc', f: pf, fp: pfp, xMin: -2, xMax: 3.2, yMin: -10, yMax: 24, yTick: 5, pMin: -32, pMax: 16, pTick: 10,
        fLabel: 'f(x) = -2x³ + 3x² + 12x', fpLabel: "f'(x) = -6x² + 6x + 12",
        ariaLabel: 'גרף של f(x) = -2x³ + 3x² + 12x עם נקודות הקיצון',
        onMove: (x) => { const v = pfp(x); $('pread').innerHTML = `<span><span class="k">x</span> ${fmt(x)}</span><span><span class="k">f(x)</span> ${fmt(pf(x))}</span><span><span class="k">f'(x)</span> ${fmt(v)}</span>`; },
      });
      charts.push(c);
      c.set({ showFp: true, hist: true, signs: [{ a: -9, b: -1, s: -1 }, { a: -1, b: 2, s: 1 }, { a: 2, b: 9, s: -1 }], roots: [-1, 2], extrema: [{ x: -1, y: -7, type: 'min' }, { x: 2, y: 20, type: 'max' }], trend: [{ a: -9, b: -1, dir: -1 }, { a: -1, b: 2, dir: 1 }, { a: 2, b: 9, dir: -1 }], snap: [-1, 2] });
      c.setX(-1);
    }

    drawHints(); drawSol(); drawLog();
    if (PS.solved || PS.showSol) unlock();
    else $('pchartWrap').innerHTML = `<div class="locked"><div><span class="ico">⌧</span>הגרף של הפונקציה ייפתח אחרי תשובה נכונה או אחרי פתיחת הפתרון,<br>כדי שלא יסגיר את נקודת המינימום מראש.</div></div>`;
  }

  /* ======================= HOME ======================= */
  const SYM = { sequences: ['SEQ', 'seq'], 'calc-poly': ['CALC', 'calc'], 'plane-trig': ['TRIG', 'trig'] };
  const COVERAGE = [ // from ROADMAP.md "מצב נוכחי (26.11.2026)" — skill coverage, not a grade forecast
    { code: '35581', v: 22 }, { code: '35571', v: 19 }, { code: '35582', v: 9 }, { code: '35572', v: null },
  ];

  function renderHome() {
    setCtx([chip('התקדמות לדוגמה (לא נתון אמיתי)', 'demo keep')]);
    const nextL = D.lessons.find((l) => l.id === 'derivative-extrema');
    const after = D.lessons.find((l) => l.id === nextL.next);
    const lessonRows = D.lessons.map((l) => {
      const [code, cls] = SYM[l.topic] || [l.topic.toUpperCase().slice(0, 4), ''];
      return `<tr class="row-link" data-id="${l.id}" tabindex="0"><td><span class="sym ${cls}">${code}</span></td><td>${escH(l.title)}</td><td class="n">${l.minutes}</td><td class="n col-hide">${l.nExplanations}</td><td class="n col-hide">${l.nExamples}</td><td class="n">${l.nPractice}</td><td class="col-hide micro faint num">${[...l.papers.old, ...l.papers.new].join(' · ')}</td></tr>`;
    }).join('');
    const open = isPhone() ? '' : ' open';
    view.innerHTML = `
    <div class="screen scroll"><div class="home">
      <section class="panel resume" aria-labelledby="rh">
        <div class="ph"><h2 id="rh">להמשיך מאיפה שעצרת</h2><span class="sp"></span><span class="chip demo">דמו</span></div>
        <div class="resume-body">
          <div>
            <div class="micro faint">${escH(nextL.title)}</div>
            <h3>דוגמה ${n(4)}: ${escH(ex4.title)}</h3>
            <div class="eq">${K('f(x) = -x^3 + 3x')}</div>
            <div class="stepbar" aria-hidden="true">${Array.from({ length: TOTAL }, (_, i) => `<i class="${i < DEMO.stepsDone ? 'done' : ''}"></i>`).join('')}</div>
            <a class="btn primary lg block" href="#lesson/${DEMO.stepsDone + 1}">המשך לשלב ${n(DEMO.stepsDone + 1)} מתוך ${n(TOTAL)} ←</a>
          </div>
          <div class="mini-chart" id="mini" aria-hidden="true"></div>
        </div>
      </section>

      <section class="panel session" aria-labelledby="sh">
        <div class="ph"><h2 id="sh">הסשן המוצע</h2><span class="sp"></span><span class="tag">3 פעולות</span></div>
        <ol>
          <li><span>לסיים את דוגמה ${n(4)} <span class="faint small">(שלבים ${n('5–8')})</span></span><a href="#lesson/5">פתיחה</a></li>
          <li><span>תרגיל עצמאי ${n(DV.practiceIndex)} מתוך ${n(DV.practiceTotal)}: מינימום כשהמקדם המוביל שלילי</span><a href="#practice">פתיחה</a></li>
          <li><span>הבא במסלול: ${escH(after ? after.title : '')}</span><a href="#path/${after ? after.id : ''}">במסלול</a></li>
        </ol>
      </section>

      <section class="panel watch" aria-labelledby="wh">
        <div class="ph"><h2 id="wh">שיעורים ראשיים</h2><span class="sp"></span><span class="tag">${n(D.lessons.length)} שיעורים · מהקבצים</span></div>
        <div class="pb tight" style="overflow-x:auto">
          <table class="tbl"><thead><tr><th></th><th>שיעור</th><th class="n">דק'</th><th class="n col-hide">הסברים</th><th class="n col-hide">דוגמאות</th><th class="n">תרגול</th><th class="col-hide">שאלונים</th></tr></thead><tbody>${lessonRows}</tbody></table>
        </div>
      </section>

      <div class="side">
        <details class="panel fold"${open}><summary class="ph"><h2>ארגז כלים</h2><span class="sp"></span><span class="tag">${n(D.tools.length)} תחומים</span><span class="chev">‹</span></summary>
          <div class="pb">${D.tools.map((t) => `<div class="tool-row"><span class="g">${escH(t.glyph)}</span><span>${escH(t.name)}</span><span class="micro faint">${n(t.nBuilt)} מתוך ${n(t.nTopics)} נושאים עם שיעור</span></div>`).join('')}</div>
        </details>
        <details class="panel fold"${open}><summary class="ph"><h2>כיסוי מיומנויות בגרות</h2><span class="sp"></span><span class="chev">‹</span></summary>
          <div class="pb">${COVERAGE.map((c) => `<div class="cov-row"><span class="num">${c.code}</span><div class="meter"><i style="width:${c.v || 0}%"></i></div><span class="num small">${c.v == null ? '—' : c.v + '%'}</span></div>`).join('')}
          <div class="micro faint" style="margin-top:6px">מקור: ROADMAP.md, 26.11.2026. כיסוי חומר, לא תחזית ציון. ${n('35572')} עדיין לא נמדד.</div></div>
        </details>
      </div>
    </div></div>`;
    document.querySelectorAll('tr.row-link').forEach((tr) => {
      const go = () => { location.hash = tr.dataset.id === 'derivative-extrema' ? '#lesson/1' : '#path/' + tr.dataset.id; };
      tr.onclick = go; tr.onkeydown = (e) => { if (e.key === 'Enter') go(); };
    });
    const mini = new WSChart(document.getElementById('mini'), { id: 'mc', f, fp, xMin: -2.4, xMax: 2.4, yMin: -7, yMax: 7, yTick: 7, pMin: -15, pMax: 8, pTick: 10, compact: true, interactive: false, mainRatio: 0.6, fLabel: 'f', fpLabel: "f'" });
    mini.set(LAYERS[DEMO.stepsDone - 1]);
    charts.push(mini);
  }

  /* ======================= PATH (roadmap) ======================= */
  const PLANNED = [ // ROADMAP.md build order, items 1–6 (not built yet; no duration data exists)
    'גאומטריה בסיסית', 'חדו"א של $e^x$ ו-$\\ln$', 'גאומטריה אנליטית: ישר ומעגל', 'חדו"א של פונקציות רציונליות ושורש', 'הסתברות: עץ, מותנית, בינומית', 'אינטגרלים ושטחים',
  ];
  let selPath = 'derivative-extrema';

  function chain() {
    const byId = Object.fromEntries(D.lessons.map((l) => [l.id, l]));
    const hasPrev = new Set(D.lessons.map((l) => l.next).filter(Boolean));
    let cur = D.lessons.find((l) => !hasPrev.has(l.id)); const out = [];
    while (cur && out.length < 20) { out.push(cur); cur = byId[cur.next]; }
    return out;
  }

  function renderPath(sel) {
    if (sel) selPath = sel;
    setCtx([chip('מסלול לפי שדה <b>next</b> בשיעורים', 'keep')]);
    const ch = chain();
    const total = ch.reduce((a, l) => a + l.minutes, 0);
    const tbTotal = D.tools.reduce((a, t) => a + t.lessons.reduce((b, l) => b + l.minutes, 0), 0);
    const tbCount = D.tools.reduce((a, t) => a + t.lessons.length, 0);
    let cum = 0; const ticks = [0];
    ch.forEach((l) => { cum += l.minutes; ticks.push(cum); });
    const maxMin = Math.max(...ch.map((l) => l.minutes));
    const comp = (l) => {
      const parts = [['c-exp', l.nExplanations], ['c-ex', l.nExamples], ['c-g', l.nGuided], ['c-p', l.nPractice], ['c-q', l.nQuiz]];
      return `<div class="comp" aria-hidden="true">${parts.map(([c, v]) => `<i class="${c}" style="flex:${v}"></i>`).join('')}</div>`;
    };
    const detailHtml = (l) => `
      <div class="micro faint">${escH(l.topic)} · ${n(l.minutes)} דק'</div>
      <p class="small" style="margin:6px 0">${md(l.summary)}</p>
      <dl class="kv"><dt>הסברים</dt><dd class="num">${l.nExplanations}</dd><dt>דוגמאות פתורות</dt><dd class="num">${l.nExamples}</dd><dt>תרגול מודרך</dt><dd class="num">${l.nGuided}</dd><dt>תרגול עצמאי</dt><dd class="num">${l.nPractice}</dd><dt>מבחן קצר</dt><dd class="num">${l.nQuiz}</dd><dt>שאלונים</dt><dd class="num">${[...l.papers.old, ...l.papers.new].join(' · ')}</dd><dt>סטטוס בדיקה</dt><dd>${escH(l.reviewStatus)}</dd></dl>
      ${l.id === 'derivative-extrema' ? `<a class="btn primary block" href="#lesson/1">לשיעור ←</a>` : `<span class="micro faint">השיעור הזה לא כלול בהדגמת הקונספט.</span>`}`;

    const blocks = ch.map((l) => `
      <div class="blk" role="button" tabindex="0" data-id="${l.id}" aria-pressed="${l.id === selPath}" style="flex:${l.minutes} 1 0">
        ${l.id === 'derivative-extrema' ? '<span class="here">כאן (דמו)</span>' : ''}
        <span class="t">${escH(l.title)}</span>
        <span class="mins">${l.minutes} דק'</span>
        <span class="mbar" style="display:none"><span class="meter"><i style="width:${Math.round(l.minutes / maxMin * 100)}%;background:var(--text-3)"></i></span></span>
        ${comp(l)}
        <div class="inline-detail" style="display:none">${l.id === selPath ? detailHtml(l) : ''}</div>
      </div>`).join('');
    const planned = PLANNED.map((t, i) => `<div class="blk planned" style="flex:1 1 0" tabindex="0"><span class="mins">#${i + 1}</span><span class="t">${md(t)}</span><span class="micro faint">לא נבנה · משך לא ידוע</span></div>`).join('');
    const sel0 = ch.find((l) => l.id === selPath) || ch[0];

    view.innerHTML = `
    <div class="screen scroll"><div class="path">
      <div class="stats" role="list">
        <div class="stat" role="listitem"><div class="k">שיעורים ראשיים</div><div class="v">${ch.length}</div></div>
        <div class="stat" role="listitem"><div class="k">דקות במסלול הראשי</div><div class="v">${total}</div></div>
        <div class="stat" role="listitem"><div class="k">שיעורי יסוד (ארגז כלים)</div><div class="v">${tbCount}</div></div>
        <div class="stat" role="listitem"><div class="k">דקות ביסודות</div><div class="v">${tbTotal}</div></div>
        <div class="stat" role="listitem"><div class="k">נושאים מתוכננים</div><div class="v">${PLANNED.length}</div></div>
      </div>
      <section class="panel track-panel">
        <div class="ph"><h2>מסלול לימוד</h2><span class="sp"></span><span class="tag">רוחב כל בלוק = משך השיעור בדקות</span></div>
        <div class="pb">
          <div class="legend"><span><i class="c-exp"></i>הסברים</span><span><i class="c-ex"></i>דוגמאות</span><span><i class="c-g"></i>תרגול מודרך</span><span><i class="c-p"></i>תרגול עצמאי</span><span><i class="c-q"></i>מבחן קצר</span><span class="faint">(יחסי מספר הפריטים בשיעור)</span></div>
          <div class="lane-title">שיעורים ראשיים, לפי הסדר</div>
          <div class="lane-axis" aria-hidden="true">${ticks.map((t) => `<span style="right:${(t / total * 100).toFixed(2)}%">${t}′</span>`).join('')}</div>
          <div class="lane">${blocks}</div>
          <div class="lane-title">הבא בתור לפי ROADMAP.md <span class="faint">(עדיין לא נבנו)</span></div>
          <div class="lane">${planned}</div>
          <div class="lane-title">ארגז כלים: יסודות, לפי צורך <span class="faint">(בכל תחום, פס לכל שיעור לפי משכו)</span></div>
          <div class="tb-grid">${D.tools.map((t) => { const m = t.lessons.reduce((a, l) => a + l.minutes, 0); return `<div class="tb-cell"><div><span class="faint num">${escH(t.glyph)}</span> ${escH(t.name)}</div><div class="micro faint">${n(t.lessons.length)} שיעורים · ${n(m)} דק'</div><div class="bar">${t.lessons.map((l) => `<i title="${escH(l.title)}" style="width:${l.minutes * 1.4}px"></i>`).join('') || '<span class="micro faint">אין עדיין</span>'}</div></div>`; }).join('')}</div>
        </div>
      </section>
      <aside class="panel detail" aria-live="polite"><div class="ph"><h2>${escH(sel0.title)}</h2></div><div class="pb">${detailHtml(sel0)}</div></aside>
    </div></div>`;
    document.querySelectorAll('.blk[data-id]').forEach((b) => {
      const pick = () => { history.replaceState(null, '', '#path/' + b.dataset.id); renderPath(b.dataset.id); const nb = document.querySelector(`.blk[data-id="${b.dataset.id}"]`); if (nb) nb.focus({ preventScroll: true }); };
      b.onclick = (e) => { if (!e.target.closest('a')) pick(); };
      b.onkeydown = (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === b) { e.preventDefault(); pick(); } };
    });
  }

  /* ======================= router ======================= */
  function chip(html, cls = '') { return `<span class="chip ${cls}">${html}</span>`; }
  function setCtx(arr) { ctx.innerHTML = arr.join(''); }

  function route() {
    charts.forEach((c) => c.destroy()); charts = [];
    view._key = null;
    const [name, arg] = (location.hash.replace('#', '') || 'home').split('/');
    const r = ['home', 'path', 'lesson', 'practice'].includes(name) ? name : 'home';
    document.querySelectorAll('.nav a').forEach((a) => { if (a.dataset.route === r) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (r === 'home') renderHome();
    if (r === 'path') renderPath(arg);
    if (r === 'lesson') renderLesson(arg ? parseInt(arg, 10) - 1 : null);
    if (r === 'practice') renderPractice();
    document.title = { home: 'בית', path: 'מסלול', lesson: 'שיעור', practice: 'תרגול' }[r] + ' · MATH5 סביבת עבודה';
  }
  document.addEventListener('keydown', (e) => { if (view._key) view._key(e); });
  window.addEventListener('hashchange', route);
  route();
})();
