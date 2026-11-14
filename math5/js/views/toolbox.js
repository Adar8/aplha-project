// ארגז הכלים שלי: חומרי יסוד, בדיקת בסיס, דרישות קדם לשיעורים, מחשבון ומחברת טעויות.
import { store } from '../store.js';
import { LESSON_BY_ID, TOOL_LESSONS, TOOLBOX } from '../data/lessons/index.js';
import { KMAP, DIAG } from './extra.js';
import { adaptQuestion } from '../core/adapter.js';
import { checkAnswer } from '../core/answers.js';
import { startDiagnostic, nextItem, recordAnswer, diagnosticResults } from '../core/diagnostic.js';
import { evaluate, formatResult } from '../core/calc.js';
import { esc, renderMath, lessonState, ICON } from '../ui.js';

const art = (glyph, hue, size = 'sm') => `<span class="art hue-${hue} ${size}" aria-hidden="true"><b dir="ltr">${glyph}</b></span>`;
export const allTopics = () => TOOLBOX.tools.flatMap(t => t.topics.map(tp => ({ ...tp, tool: t })));
export const topicById = id => allTopics().find(t => t.id === id);
export const toolOfLesson = lessonId => TOOLBOX.tools.find(t => t.topics.some(tp => tp.lesson === lessonId));

// ---------- מצב נושא ----------
// done = שיעור היסוד הושלם (מבחן קצר 80+) | learning = התחיל | gap = הבדיקה מצאה פער | known = הבדיקה מראה שולט | none = אין מידע
function skillEvidence() {
  const st = store.get();
  return { ...(st.diagnostic?.results || {}), ...(st.baseCheck?.results || {}) };
}
export function topicState(tp) {
  if (tp.lesson && LESSON_BY_ID[tp.lesson]) {
    const s = lessonState(LESSON_BY_ID[tp.lesson]);
    if (s.lastQuiz !== null && s.lastQuiz >= 80) return 'done';
    if (s.done > 0) return 'learning';
  }
  const ev = skillEvidence();
  const vals = (tp.skills || []).map(k => ev[k]).filter(Boolean);
  if (vals.includes('missing')) return 'gap';
  if (vals.length && vals.every(v => v === 'mastered' || v === 'likely')) return 'known';
  return 'none';
}
const STATE_TXT = { done: 'הושלם', learning: 'בתהליך', gap: 'מומלץ לחזק', known: 'נראה שאתה יודע', none: '' };

// ---------- דרישות קדם לשיעור בתוכנית הראשית ----------
export function prereqStatus(lessonId) {
  const ids = TOOLBOX.lessonPrereqs[lessonId] || [];
  const topics = ids.map(topicById).filter(Boolean);
  const gaps = topics.filter(t => topicState(t) === 'gap');
  const unknown = topics.filter(t => topicState(t) === 'none');
  return { topics, gaps, unknown };
}

export function prereqBanner(lesson, onExplain) {
  if (lesson.kind === 'toolbox') return '';
  const { topics, gaps, unknown } = prereqStatus(lesson.id);
  if (!topics.length) return '';
  const st = store.get();
  const checked = !!(st.baseCheck?.finishedAt || st.diagnostic?.finishedAt);
  // פער מאושר – מציגים בכל שלב. לא נבדק – רק בשלב ההסבר, כהצעה.
  const list = gaps.length ? gaps : (!checked && onExplain ? unknown : []);
  if (!list.length) return '';
  const target = list.find(t => t.lesson && LESSON_BY_ID[t.lesson]);
  return `<aside class="prereq" aria-label="דרישות קדם">
    ${art('🧰', 'amber')}
    <div class="prereq-txt"><b>צריך חיזוק? בוא נשלים את הבסיס</b>
      <span>${gaps.length ? 'לפי הבדיקה, כדאי לחזק לפני השיעור:' : 'השיעור נשען על הנושאים האלה. אם משהו לא יושב טוב, כדאי לחזק:'}</span>
      <span class="prereq-list">${list.map(t => `<span class="badge b-found">${esc(t.name)}</span>`).join('')}</span></div>
    ${target ? `<a class="btn sm" href="#/lesson/${target.lesson}" data-return="${esc(location.hash)}" data-return-title="${esc(lesson.title)}">לחיזוק: ${esc(target.name)}</a>`
      : `<a class="btn sm" href="#/toolbox" data-return="${esc(location.hash)}" data-return-title="${esc(lesson.title)}">לארגז הכלים</a>`}
  </aside>`;
}
// לוחצים על כפתור החיזוק – שומרים לאן לחזור
export function bindReturnLinks(root) {
  root.querySelectorAll('[data-return]').forEach(a => a.addEventListener('click', () => {
    store.set(s => { s.returnTo = { hash: a.dataset.return, title: a.dataset.returnTitle, at: Date.now() }; });
  }));
}
export function returnBar() {
  const r = store.get().returnTo;
  if (!r) return '';
  return `<div class="return-bar"><span>אחרי החיזוק אפשר לחזור בדיוק לאן שעצרת: <b>${esc(r.title)}</b></span>
    <a class="btn sm" href="${esc(r.hash)}" data-go-back>לחזרה לשיעור</a></div>`;
}
export function bindReturnBar(root) {
  root.querySelectorAll('[data-go-back]').forEach(a => a.addEventListener('click', () => store.set(s => { s.returnTo = null; })));
}

// ---------- עמוד ארגז הכלים ----------
export function viewToolbox() {
  const st = store.get();
  const bc = st.baseCheck;
  const recs = allTopics().filter(t => topicState(t) === 'gap');
  const recLessons = recs.filter(t => t.lesson && LESSON_BY_ID[t.lesson]);
  const firstUnit = Object.entries(TOOLBOX.plannedLessons || {})[0];
  const fuTopics = firstUnit ? (TOOLBOX.lessonPrereqs[firstUnit[0]] || []).map(topicById).filter(Boolean) : [];
  return `
  <section class="tb-head">
    <div><h1>ארגז הכלים שלי</h1><p>היסודות שצריך לפני 5 יחידות – ולחזור אליהם בכל שלב. לא חייבים לעבור על הכול: לוקחים בדיוק את החיזוק שצריך, כשצריך.</p></div>
  </section>
  <p class="tb-note">${art('i', 'blue', 'xs')}<span>חומרי היסוד <b>אינם נושאי בחינה בפני עצמם</b>. הם הכלים שהשאלות בבגרות נשענות עליהם.</span></p>

  <section class="tb-check">
    ${art('✓', 'teal')}
    <div class="tb-check-txt">${bc?.finishedAt
      ? `<h2>בדיקת הבסיס: ${recs.length ? `נמצאו ${recs.length} נושאים לחיזוק` : 'לא נמצאו פערים'}</h2><p>${recLessons.length ? 'המסלול האישי שלך מסומן למטה בכתום.' : recs.length ? 'שיעורי היסוד לנושאים האלה בהכנה. בינתיים כדאי לתרגל במחברת ובמחשבון.' : 'אפשר להתחיל ישר בשיעורים, ולחזור לכאן כשצריך.'}</p>`
      : '<h2>בדיקת בסיס קצרה</h2><p>12 שאלות קלות, בערך 10 דקות. היא לא בגרות – רק מראה מה כבר יושב ומה כדאי לחזק. אפשר גם לדלג.</p>'}</div>
    <div class="tb-check-actions">${bc?.finishedAt
      ? `${recLessons.length ? `<a class="btn primary" href="#/lesson/${recLessons[0].lesson}">להתחיל במסלול</a>` : ''}<a class="btn" href="#/basecheck">לתוצאות</a>`
      : '<a class="btn primary" href="#/basecheck">להתחיל בדיקה</a>'}</div>
  </section>

  ${fuTopics.length ? `<section class="card">
    <div class="card-title">${art('y', 'violet', 'xs')}<h2>לפני היחידה הראשונה: ${esc(firstUnit[1])}</h2></div>
    <p class="muted small">ארבעה כלים שהשיעור על הקו הישר נשען עליהם. כולם זמינים עכשיו.</p>
    <ol class="topics found-path">${fuTopics.map(t => topicRow(t, true)).join('')}</ol>
  </section>` : ''}

  <section aria-labelledby="tools-h">
    <div class="sec-title"><h2 id="tools-h">כל הכלים</h2></div>
    <div class="tools-grid">${TOOLBOX.tools.map(tool => {
      const tps = tool.topics;
      const done = tps.filter(t => ['done', 'known'].includes(topicState(t))).length;
      return `<article class="tool">
        <div class="tool-head">${art(tool.glyph, tool.hue)}<div><span class="tnum">כלי ${tool.num}</span><h2>${esc(tool.name)}</h2></div></div>
        <div class="tool-prog"><div class="prog thin ${tool.hue === 'amber' ? 'amber' : tool.hue === 'violet' ? 'violet' : 'blue'}"><span style="inline-size:${Math.max(4, 100 * done / tps.length)}%"></span></div><span>${done}/${tps.length}</span></div>
        <ul class="topics">${tps.map(t => topicRow(t)).join('')}</ul>
      </article>`;
    }).join('')}</div>
  </section>

  <section aria-labelledby="aids-h">
    <div class="sec-title"><h2 id="aids-h">כלי עזר</h2></div>
    <div class="tb-tools">${TOOLBOX.aids.map(a => {
      const icon = { calculator: ['=', 'blue'], notebook: ['✎', 'red'], fractions: ['½', 'amber'], formulas: ['ƒ', 'teal'], graph: ['y', 'violet'], glossary: ['א', 'green'], tutor: ['?', 'blue'] }[a.id] || ['•', 'blue'];
      const inner = `${art(icon[0], icon[1], 'xs')}<span><b>${esc(a.name)}</b><span>${esc(a.desc)}</span></span>`;
      return a.status === 'ready' ? `<a class="aid" href="#/tool/${a.id}">${inner}</a>` : `<div class="aid soon" aria-disabled="true">${inner}</div>`;
    }).join('')}</div>
  </section>`;
}

function topicRow(t, showName = false) {
  const state = topicState(t);
  const lesson = t.lesson && LESSON_BY_ID[t.lesson];
  const cls = { done: 'st-done', known: 'st-done', learning: 'st-learning', gap: 'st-gap', none: '' }[state];
  const meta = lesson ? (STATE_TXT[state] || `כ-${lesson.minutes} דק׳`)
    : state === 'gap' ? 'מומלץ לחזק · שיעור בהכנה' : state === 'known' ? 'נראה שאתה יודע' : 'שיעור בהכנה';
  const inner = `<span class="tick" aria-hidden="true">✓</span><span class="tname">${esc(t.name)}</span><span class="tmeta">${meta}</span>`;
  const rec = state === 'gap' ? ' rec-topic' : '';
  return `<li>${lesson ? `<a class="topic-row ${cls}${rec}" href="#/lesson/${t.lesson}">${inner}</a>` : `<div class="topic-row soon ${cls}${rec}">${inner}</div>`}</li>`;
}

// ---------- בדיקת בסיס (לא בגרות) ----------
function baseConfig() {
  const probes = TOOLBOX.baseCheck.probes.filter(p => DIAG.items.some(i => i.skill === p));
  return { probes, items: DIAG.items, maxQuestions: Math.max(TOOLBOX.baseCheck.maxQuestions || 12, probes.length) + 2 };
}
const rerender = () => window.dispatchEvent(new HashChangeEvent('hashchange'));

export function baseCheckRoute() {
  const d = store.get().baseCheck;
  if (d?.finishedAt) return baseResults(d);
  if (d?.state) return baseQuestion(d);
  return { html: `
    <section class="tb-check" style="flex-direction:column;align-items:flex-start">
      ${art('✓', 'teal')}
      <div class="tb-check-txt"><h1 style="font-size:30px;margin:0 0 6px">בדיקת בסיס</h1>
        <p>12 שאלות קלות על היסודות: חשבון, משוואות, חזקות וגרפים. זה לא מבחן ולא בגרות – אין ציון.</p>
        <p>אם לא יודעים, לוחצים "לא יודע". זה עוזר לנו להבין מה לחזק.</p></div>
      <div class="tb-check-actions"><button class="btn primary" id="bcStart">להתחיל</button><a class="btn" href="#/toolbox">אולי אחר כך</a></div>
    </section>`, bind() {
      document.getElementById('bcStart').onclick = () => { store.set(s => { s.baseCheck = { state: startDiagnostic(baseConfig()), results: null, finishedAt: null }; }); rerender(); };
    } };
}

function baseQuestion(d) {
  const cfg = baseConfig();
  const item = nextItem(d.state, cfg);
  if (!item) { finishBase(); return baseResults(store.get().baseCheck); }
  const q = adaptQuestion(item);
  const asked = d.state.asked.length, total = Math.max(cfg.probes.length, asked + d.state.queue.length);
  const sk = KMAP.skills.find(s => s.id === item.skill);
  const input = q.type === 'mc'
    ? `<div class="options" role="radiogroup">${q.options.map((o, k) => `<label class="opt"><input type="radio" name="bc" value="${k}"><span>${o.t}</span></label>`).join('')}</div>`
    : `<div class="num-input"><label class="ans-label" for="bcIn">התשובה שלך</label><input id="bcIn" type="text" inputmode="decimal" dir="ltr" placeholder="?" autocomplete="off">${q.rounding ? `<span class="hint-line">עיגול: ${esc(q.rounding)}</span>` : ''}</div>`;
  return { html: `
    <div class="reading">
      <div class="lt-bar" style="margin-block-end:var(--sp-5)"><a class="lt-x" href="#/toolbox" aria-label="עצירה – אמשיך אחר כך">✕</a>
        <div class="prog" style="flex:1" role="progressbar" aria-valuenow="${Math.round(100 * asked / total)}" aria-valuemin="0" aria-valuemax="100"><span style="inline-size:${Math.max(3, 100 * asked / total)}%"></span></div>
        <span class="lt-count num">${asked + 1}/${total}</span></div>
      <form id="bcForm" class="q card">
        <div class="q-head"><span class="q-num">${esc(sk?.name || '')}</span></div>
        <div class="q-prompt">${q.prompt}</div>${input}<div class="feedback"></div>
        <div class="q-check"><button class="btn primary block" type="submit">לשאלה הבאה</button></div>
        <div class="q-tools"><button class="btn tertiary sm" type="button" id="bcSkip">לא יודע</button></div>
      </form>
      <h1 class="sr-only">בדיקת בסיס</h1>
    </div>`, bind() {
      const form = document.getElementById('bcForm');
      const go = skipped => {
        const raw = q.type === 'mc' ? form.querySelector('input:checked')?.value : form.querySelector('#bcIn').value;
        const res = checkAnswer(q, raw);
        if (!skipped && !res.valid) { const fb = form.querySelector('.feedback'); fb.className = 'feedback info'; fb.innerHTML = '<span class="fb-icon">i</span><div class="fb-body">צריך לענות, או ללחוץ "לא יודע".</div>'; return; }
        const ok = !skipped && res.ok;
        store.recordAttempt('basecheck', item.id, { ok, ctx: 'diagnostic' });
        store.set(s => { recordAnswer(s.baseCheck.state, cfg, KMAP, item.skill, ok, skipped); });
        if (store.get().baseCheck.state.finishedAt) finishBase();
        rerender();
      };
      form.addEventListener('submit', e => { e.preventDefault(); go(false); });
      document.getElementById('bcSkip').onclick = () => go(true);
      renderMath(form);
      form.querySelector('input')?.focus();
    } };
}

function finishBase() {
  store.set(s => {
    const d = s.baseCheck;
    const res = diagnosticResults(d.state, KMAP);
    // רק מיומנויות שנבדקו או שאפשר להסיק עליהן – לא "לא נבדק"
    const results = Object.fromEntries(Object.entries(res).filter(([, v]) => v !== 'unknown'));
    s.baseCheck = { ...d, state: { ...d.state, finishedAt: d.state.finishedAt || Date.now() }, results, finishedAt: Date.now() };
  });
}

function baseResults(d) {
  const topics = allTopics();
  const known = topics.filter(t => topicState(t) === 'known' || topicState(t) === 'done');
  const gaps = topics.filter(t => topicState(t) === 'gap');
  const pathTopics = gaps.filter(t => t.lesson && LESSON_BY_ID[t.lesson]);
  const correct = d.state.asked.filter(a => a.ok).length;
  return { html: `
    <section class="tb-head"><div><h1>תוצאות בדיקת הבסיס</h1><p>ענית נכון על ${correct} מתוך ${d.state.asked.length}. אין כאן ציון – זו מפה של מה לחזק.</p></div></section>
    <div class="grid-2">
      <section class="card"><div class="card-title">${art('✓', 'green', 'xs')}<h2>מה כבר יושב</h2></div>
        ${known.length ? `<ul class="topics">${known.map(t => topicRow(t)).join('')}</ul>` : '<p class="muted">עוד לא זיהינו נושאים שאתה שולט בהם. זה בסדר – בדיוק בשביל זה יש ארגז כלים.</p>'}</section>
      <section class="card"><div class="card-title">${art('!', 'amber', 'xs')}<h2>מה כדאי לחזק</h2></div>
        ${gaps.length ? `<ul class="topics">${gaps.map(t => topicRow(t)).join('')}</ul>` : '<p class="muted">לא נמצאו פערים ביסודות שנבדקו.</p>'}</section>
    </div>
    <section class="card"><div class="card-title">${art('→', 'blue', 'xs')}<h2>מסלול ההשלמה האישי שלך</h2></div>
      ${pathTopics.length ? `<ol class="topics found-path">${pathTopics.map(t => topicRow(t)).join('')}</ol>
        <p class="fine">נושאים שעוד אין להם שיעור יסוד מופיעים ברשימת "מה כדאי לחזק" ויתווספו בהמשך.</p>
        <div class="section-end" style="justify-content:flex-start"><a class="btn primary" href="#/lesson/${pathTopics[0].lesson}">להתחיל במסלול</a></div>`
        : `<p class="muted">${gaps.length ? 'שיעורי היסוד לנושאים שמצאנו עדיין בהכנה.' : 'אין צורך במסלול השלמה. אפשר להתחיל ישר בתוכנית הבגרות.'}</p>
        <div class="section-end" style="justify-content:flex-start"><a class="btn primary" href="#/">למסך הבית</a></div>`}
    </section>
    <div class="section-end"><button class="btn tertiary" id="bcRedo" data-armed="0">בדיקה מחדש</button></div>`, bind() {
      const b = document.getElementById('bcRedo');
      b.onclick = () => { if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = 'לחיצה נוספת תתחיל בדיקה חדשה'; return; } store.set(s => { s.baseCheck = null; }); rerender(); };
    } };
}

// ---------- מחשבון מדעי ----------
let calcDeg = true; const calcHist = [];
export function viewCalculator() {
  const keys = [['sin(', 'fn'], ['cos(', 'fn'], ['tan(', 'fn'], ['√(', 'fn'], ['^', 'fn'],
    ['7'], ['8'], ['9'], ['('], [')'],
    ['4'], ['5'], ['6'], ['×'], ['÷'],
    ['1'], ['2'], ['3'], ['+'], ['−'],
    ['0'], ['.'], ['π', 'fn'], ['⌫', 'fn'], ['=', 'eq']];
  return `
  <div class="reading">
    <div class="lt-bar" style="margin-block-end:var(--sp-5)"><a class="lt-x" href="#/toolbox" aria-label="חזרה לארגז הכלים">✕</a><h1 style="font-size:22px;margin:0;flex:1">מחשבון מדעי</h1></div>
    <div class="calc">
      <div class="calc-mode"><span class="muted small">גם הקלדה מהמקלדת עובדת. Enter לחישוב.</span>
        <div class="tabs" role="group" aria-label="יחידות זווית" style="margin:0"><button type="button" data-deg="1" aria-selected="${calcDeg}">מעלות</button><button type="button" data-deg="0" aria-selected="${!calcDeg}">רדיאנים</button></div></div>
      <div class="calc-screen"><label class="sr-only" for="calcIn">ביטוי לחישוב</label><input id="calcIn" dir="ltr" autocomplete="off" spellcheck="false" placeholder="2^3 + sin(30)"><div class="calc-out" id="calcOut" aria-live="polite"></div></div>
      <div class="calc-keys">${keys.map(([k, c]) => `<button type="button" class="btn ${c === 'eq' ? 'primary' : ''} ${c === 'fn' ? 'fn' : ''}" data-k="${k}">${k}</button>`).join('')}</div>
      <ul class="calc-hist" id="calcHist" aria-label="חישובים אחרונים">${calcHist.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
      <p class="fine">כמו במחשבון בבחינה: אין גרפים ואין תכנות. זוויות במעלות כברירת מחדל.</p>
    </div>
  </div>`;
}
export function bindCalculator() {
  const inp = document.getElementById('calcIn'), out = document.getElementById('calcOut'), hist = document.getElementById('calcHist');
  const run = () => {
    if (!inp.value.trim()) return;
    try {
      const v = formatResult(evaluate(inp.value, { deg: calcDeg }));
      out.className = 'calc-out'; out.textContent = '= ' + v;
      calcHist.unshift(`${inp.value} = ${v}`); calcHist.length = Math.min(calcHist.length, 6);
      hist.innerHTML = calcHist.map(h => `<li>${esc(h)}</li>`).join('');
    } catch (e) {
      out.className = 'calc-out err';
      out.textContent = String(e.message).startsWith('fn:') ? 'פונקציה לא מוכרת. אפשר: sin cos tan sqrt ln log abs.' : 'הביטוי לא שלם או לא תקין. כדאי לבדוק סוגריים וסימנים.';
    }
  };
  document.querySelector('.calc-keys').addEventListener('click', e => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    const k = b.dataset.k;
    if (k === '=') run(); else if (k === '⌫') inp.value = inp.value.slice(0, -1); else inp.value += k;
    inp.focus();
  });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
  document.querySelectorAll('[data-deg]').forEach(b => b.onclick = () => {
    calcDeg = b.dataset.deg === '1';
    document.querySelectorAll('[data-deg]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    if (inp.value.trim()) run();
  });
  inp.focus();
}

// ---------- מחברת טעויות ----------
export function viewNotebook() {
  const st = store.get();
  const groups = {};
  for (const m of st.mistakes) {
    if (!LESSON_BY_ID[m.lessonId]) continue;
    const k = `${m.lessonId}|${m.tag}`;
    (groups[k] = groups[k] || { lessonId: m.lessonId, tag: m.tag, count: 0, last: 0 });
    groups[k].count++; groups[k].last = Math.max(groups[k].last, m.at);
  }
  const rows = Object.values(groups).sort((a, b) => b.last - a.last);
  const fmtD = ts => new Date(ts).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' });
  return `
  <div class="reading">
    <div class="lt-bar" style="margin-block-end:var(--sp-5)"><a class="lt-x" href="#/toolbox" aria-label="חזרה לארגז הכלים">✕</a><h1 style="font-size:22px;margin:0;flex:1">מחברת הטעויות שלי</h1></div>
    <p class="muted">כל טעות שהמערכת זיהתה, עם ההסבר וקישור לחזרה. טעות שחוזרת שוב ושוב היא בדיוק המקום לחזק.</p>
    ${rows.length ? rows.map(r => {
      const L = LESSON_BY_ID[r.lessonId]; const t = L.tags[r.tag];
      return `<article class="card nb-item"><span class="count num">${r.count}</span><div>
        <b>${t ? t.label : 'טעות חישוב או טעות שלא זוהה סוגה'}</b>
        <p>${t ? t.advice : 'כדאי לפתור שוב לאט, ולבדוק כל צעד.'}</p>
        <p class="fine">${esc(L.title)} · לאחרונה ${fmtD(r.last)}</p>
        <div class="nb-links"><a class="btn sm" href="#/lesson/${L.id}/${t ? t.section : 'examples'}">לחזרה על ההסבר</a><a class="btn tertiary sm" href="#/lesson/${L.id}/${L.kind === 'toolbox' ? 'guided' : 'practice'}">לתרגל שוב</a></div>
      </div></article>`;
    }).join('') : `<div class="card empty-state"><b>המחברת ריקה.</b><p class="muted">טעויות בתרגול ובמבחנים יופיעו כאן אוטומטית, עם הסבר.</p><a class="btn primary" href="#/">להתחיל לתרגל</a></div>`}
  </div>`;
}
