import { store, mastery, LEVELS, practiceQuestions, onExternalChange } from './store.js';
import { TOPICS, STATUS, CONFIDENCE, SOURCES, EXAMS, VERIFIED_ON } from './data/curriculum.js';
import { LESSONS, LESSON_BY_ID, loadLessons, LOAD_ERRORS } from './data/lessons/index.js';
import { checkAnswer } from './core/answers.js';
import { SECTIONS, SOURCE_LABEL, renderMath, fmtTime, weekSeconds, todaySeconds, meter, lessonState, recommend, ring, ICON, esc } from './ui.js';
import * as extra from './views/extra.js';

const app = document.getElementById('app');

// ---------- מסך הבית ----------
const TOPIC_GLYPH = {
  sequences: 'Σ', probability: 'P', 'plane-geometry': '△', 'plane-trig': 'θ', 'calc-poly': 'f′', integrals: '∫',
  analytic: 'y=', vectors: '→', 'exp-log': 'eˣ', 'word-problems': 'v·t', induction: 'n+1', 'pre-analysis': 'f(x)',
  'calc-rational-root': '√', 'calc-trig': 'sin', 'accum-integral': '∫ₐ', 'short-questions': '?', conics: '◯',
  hyperbola: '⟩⟨', 'space-trig': '◇', complex: 'i', growth: '↗', 'power-func': 'xᵃ', solids: '⬭',
};
const TOPIC_SHORT = { sequences: 'סדרות', probability: 'הסתברות', 'plane-geometry': 'גאומטריה במישור', 'plane-trig': 'טריגונומטריה במישור',
  'calc-poly': 'חדו"א של פולינומים', integrals: 'אינטגרלים ושטחים', analytic: 'גאומטריה אנליטית', vectors: 'וקטורים במרחב',
  'exp-log': 'מעריכיות ולוגריתמים', 'calc-rational-root': 'רציונליות ושורש', 'calc-trig': 'חדו"א טריגונומטרי', 'word-problems': 'בעיות מילוליות',
  induction: 'אינדוקציה', 'pre-analysis': 'קדם-אנליזה', 'accum-integral': 'פונקציה צוברת שטח', conics: 'פרבולה ואליפסה', hyperbola: 'היפרבולה',
  'space-trig': 'טריגונומטריה במרחב', complex: 'מספרים מרוכבים', growth: 'גדילה ודעיכה', 'power-func': 'פונקציות חזקה', solids: 'גופים' };
const TOPIC_HUE = { sequences: 'teal', probability: 'violet', 'plane-geometry': 'blue', 'plane-trig': 'teal', 'calc-poly': 'violet',
  integrals: 'blue', analytic: 'teal', vectors: 'violet', 'exp-log': 'blue' };

function topicCard(t) {
  const lessons = (t.lessons || []).map(id => LESSON_BY_ID[id]).filter(Boolean);
  const glyph = `<span class="tc-ico hue-${TOPIC_HUE[t.id] || 'muted'}" aria-hidden="true" dir="ltr">${TOPIC_GLYPH[t.id] || '∑'}</span>`;
  const name = esc(TOPIC_SHORT[t.id] || t.name.split(':')[0]);
  if (!lessons.length) {
    return `<li><div class="tc locked" aria-disabled="true">${glyph}
      <div class="tc-body"><b>${name}</b><span class="tc-sub">שיעור בהכנה</span></div>
      <span class="tc-state">${ICON.lock}</span></div></li>`;
  }
  const s = lessonState(lessons[0]);
  const state = s.done === 0 ? 'לא התחלת' : s.done === s.total ? 'הושלם' : `${s.done}/${s.total} שלבים`;
  return `<li><a class="tc ${s.done === s.total ? 'complete' : ''}" href="#/lesson/${lessons[0].id}">${glyph}
    <div class="tc-body"><b>${name}</b><span class="tc-sub">${esc(lessons[0].title)}</span></div>
    <div class="tc-foot"><span class="bar hue-${TOPIC_HUE[t.id] || 'blue'}"><span style="inline-size:${s.score}%"></span></span>
      <span class="tc-meta"><span>${state}</span><span class="num">${s.score}%</span></span></div>
    ${s.done === s.total ? `<span class="tc-check" aria-label="הושלם">${ICON.check}</span>` : ''}</a></li>`;
}

let homeTrack = null;
function viewDashboard() {
  const st = store.get();
  const P = st.profile, g = P.grades, T = P.targetGrade;
  const current = 0.6 * g.q1 + 0.4 * g.q2;
  const wk = extra.weekSummary();
  const recs = extra.currentRecommendations().slice(0, 3);
  const rec = recommend();
  const last = st.lastLesson && LESSON_BY_ID[st.lastLesson];
  const cont = last || rec.lesson;
  const cs = lessonState(cont);
  const L = st.lessons[cont.id];
  const nextSec = SECTIONS.find(s => !(L && L.sections[s.id])) || SECTIONS[SECTIONS.length - 1];
  const allDone = LESSONS.reduce((a, l) => a + lessonState(l).done, 0);
  const allTotal = LESSONS.length * SECTIONS.length;
  const overall = Math.round(100 * allDone / allTotal);
  const track = homeTrack || st.track || 'common';
  const topics = TOPICS.filter(t => t.id !== 'short-questions' && (track === 'common' ? t.status === 'common'
    : track === 'old' ? (t.old && t.status !== 'new') : (t.new && t.status !== 'old')));
  topics.sort((a, b) => (b.lessons ? 1 : 0) - (a.lessons ? 1 : 0));
  const hour = new Date().getHours();
  const hello = hour < 5 ? 'לילה טוב' : hour < 12 ? 'בוקר טוב' : hour < 18 ? 'צהריים טובים' : 'ערב טוב';
  const board = cont.explain.map(b => (b.body.match(/\$\$[\s\S]*?\$\$/) || [])[0]).find(Boolean) || '';

  return `
  <section class="home-hero">
    <div class="hh-text">
      <p class="eyebrow-soft">${hello}</p>
      ${st.name ? `<h1>שלום, ${esc(st.name)}</h1>` : `<h1>שלום</h1>
        <form class="name-form" id="nameForm"><label for="nm" class="sr-only">איך לקרוא לך?</label>
          <input id="nm" placeholder="איך לקרוא לך?" maxlength="20" autocomplete="given-name"><button class="btn small-btn">שמירה</button></form>`}
      <p class="lead">ממשיכים בדרך ל-${T} בבגרות במתמטיקה 5 יחידות.</p>
      <a class="btn primary xl" href="#/lesson/${cont.id}/${nextSec.id}">${ICON.play}<span>${cs.done ? 'המשך לימוד' : 'להתחלת הלימוד'}</span></a>
    </div>
    <div class="hh-stats">
      <div class="glass stat-ring">${ring(overall, 132, 'התקדמות כוללת')}<div class="ring-label"><span class="num">${overall}%</span><small>שלבים שהושלמו</small></div></div>
      <div class="glass stat-grade">
        <span class="sg-label">ציון משוקלל נוכחי</span>
        <span class="sg-val num">${current.toFixed(0)}</span>
        <span class="sg-sub">יעד: <b class="num">${T}</b> · חסרות <b class="num">${Math.max(0, T - current).toFixed(0)}</b> נק׳</span>
        <span class="bar hue-violet"><span style="inline-size:${Math.min(100, current / T * 100)}%"></span></span>
      </div>
    </div>
  </section>

  <section class="home-grid">
    <div class="glass continue">
      <div class="card-title">${ICON.resume}<h2>${last ? 'להמשיך מאיפה שעצרת' : 'השיעור הראשון'}</h2></div>
      <b class="cont-title">${esc(cont.title)}</b>
      <p class="muted small">השלב הבא: ${nextSec.label}</p>
      <ol class="mini-steps" aria-label="שלבי השיעור">${SECTIONS.map(s => `<li class="${L && L.sections[s.id] ? 'done' : ''} ${s.id === nextSec.id ? 'now' : ''}" title="${s.label}"></li>`).join('')}</ol>
      <a class="btn" href="#/lesson/${cont.id}/${nextSec.id}">לשלב הבא</a>
    </div>

    <div class="glass daily">
      <div class="card-title">${ICON.calendar}<h2>השבוע</h2></div>
      <div class="daily-row">
        <div class="mini-ring">${ring(Math.min(100, wk.pct), 72, 'ביצוע שבועי')}<span class="num">${wk.pct}%</span></div>
        <div><b><span class="num">${wk.actualMin}</span> מתוך <span class="num">${wk.plannedMin}</span> דקות</b><p class="muted small">היום: ${fmtTime(todaySeconds())}. נמדד בשיעורים, בחזרות ובאבחון.</p></div>
      </div>
      <a class="btn" href="#/week">לתוכנית השבועית</a>
    </div>

    <div class="glass goal">
      <div class="card-title">${ICON.flag}<h2>מחשבון יעד</h2></div>
      <div class="calc-row">
        <label for="g81">ציון יעד בשאלון הראשון (581/571, 60%)</label>
        <input id="g81" type="range" min="40" max="100" step="1" value="${Math.max(g.q1, T)}">
        <output id="o81" class="num"></output>
      </div>
      <div class="calc-result" id="calcOut" aria-live="polite"></div>
      <p class="fine">משקל 60/40 – רשמי בשתי המתכונות (שאלוני הבגרות והאתר הפדגוגי).</p>
    </div>
  </section>

  ${recs.length ? `<section class="glass next-steps"><div class="card-title">${ICON.compass}<h2>מה עכשיו</h2></div>
    <ul class="rec-list">${recs.map(r => `<li class="rec-${r.kind}">${r.href ? `<a href="${r.href}">${esc(r.text)}</a>` : esc(r.text)}</li>`).join('')}</ul></section>` : ''}

  <section class="home-main">
    <div class="topics">
      <div class="section-head"><div class="card-title">${ICON.layers}<h2>הנושאים</h2></div><a href="#/plan">לתוכנית המלאה</a></div>
      <div class="seg" role="tablist" aria-label="סינון לפי מתכונת">
        ${[['common', 'חומר משותף', ''], ['new', 'מתכונת חדשה', '571 / 572'], ['old', 'מתכונת ישנה', '581 / 582']].map(([k, l, s]) =>
          `<button role="tab" aria-selected="${track === k}" data-htrack="${k}"><span>${l}</span>${s ? `<small class="num">${s}</small>` : ''}</button>`).join('')}
      </div>
      <ul class="topic-grid">${topics.map(topicCard).join('')}</ul>
      ${track !== 'common' ? '<p class="muted small">חלק מהסיווגים ממתינים לאימות. הפירוט נמצא בתוכנית המלאה.</p>' : ''}
    </div>

    <aside class="glass teacher" aria-label="מורה וירטואלי">
      <div class="teacher-video">
        <span class="live-pill"><span class="dot-off"></span>מורה וירטואלי</span>
        <div class="tv-empty">${ICON.user}<p>כאן יופיע מורה וירטואלי עם וידאו.</p><span class="badge b-check">בפיתוח</span></div>
        <div class="tv-controls" aria-hidden="true"><span>${ICON.mic}</span><span>${ICON.wave}</span></div>
      </div>
      <div class="board">
        <span class="board-label">לוח · ${esc(cont.title)}</span>
        <div class="board-math">${board}</div>
        <a class="board-link" href="#/lesson/${cont.id}/examples">לדוגמאות הפתורות, צעד אחר צעד</a>
      </div>
    </aside>
  </section>`;
}

function bindDashboard() {
  const r = document.getElementById('g81');
  if (r) {
    const upd = () => {
      const x = +r.value; document.getElementById('o81').textContent = x;
      const T = store.get().profile.targetGrade;
      const need = (T - 0.6 * x) / 0.4;
      const out = document.getElementById('calcOut');
      if (need > 100) out.innerHTML = `עם <b class="num">${x}</b> צריך <b class="num">${need.toFixed(1)}</b> בשאלון השני. זה בלתי אפשרי, ולכן צריך לשפר גם את הראשון.`;
      else if (need <= 0) out.innerHTML = `עם <b class="num">${x}</b> עוברים את ${T} גם בלי השאלון השני.`;
      else out.innerHTML = `עם <b class="num">${x}</b> בראשון צריך לפחות <b class="num big">${Math.ceil(need)}</b> בשני.`;
    };
    r.addEventListener('input', upd); upd();
  }
  const nf = document.getElementById('nameForm');
  if (nf) nf.addEventListener('submit', e => {
    e.preventDefault(); const v = nf.querySelector('input').value.trim();
    if (v) { store.set(s => { s.name = v; }); route(); }
  });
  app.querySelectorAll('[data-htrack]').forEach(b => b.addEventListener('click', () => {
    homeTrack = b.dataset.htrack; store.set(s => { s.track = homeTrack; }); route();
  }));
}

// ---------- תרגול ומבחנים (מרכזים) ----------
function viewPractice() {
  const st = store.get();
  const dueN = extra.currentRecommendations().find(r => r.kind === 'review');
  return `<h1>תרגול</h1><p class="lead">כל התרגולים לפי שיעור. שאלות שכבר פתרת מסומנות.</p>
  <a class="glass link-card" href="#/review"><span class="card-title">${ICON.repeat}<b>חזרות מרווחות</b></span><span class="muted small">${dueN ? esc(dueN.text) : 'אין חזרות להיום'}</span></a>
  <ul class="hub-list">${LESSONS.map(l => {
    const A = (st.lessons[l.id] || {}).answers || {};
    const cnt = arr => `${arr.filter(q => A[q.id] && A[q.id].correct).length}/${arr.length}`;
    const bag = l.bagrut.flatMap(b => b.parts);
    return `<li class="glass hub"><div class="hub-head"><b>${esc(l.title)}</b><span class="badge ghost num">${l.papers.old} · ${l.papers.new}</span></div>
      <div class="hub-links">
        <a class="chip" href="#/lesson/${l.id}/guided">תרגול מודרך <span class="num">${cnt(l.guided)}</span></a>
        <a class="chip" href="#/lesson/${l.id}/practice">תרגול עצמאי <span class="num">${cnt(l.practice)}</span></a>
        <a class="chip" href="#/lesson/${l.id}/bagrut">ברמת בגרות <span class="num">${cnt(bag)}</span></a>
      </div></li>`;
  }).join('')}</ul>`;
}

function viewExams() {
  const st = store.get();
  return `<h1>מבחנים</h1><p class="lead">מבחן קצר בסוף כל שיעור. נשמר הציון הטוב ביותר.</p>
  <ul class="hub-list">${LESSONS.map(l => { const Q = (st.lessons[l.id] || {}).quiz || { best: null, history: [] }; return `
    <li class="glass hub"><div class="hub-head"><b>${esc(l.title)}</b>
      <span class="score-pill ${Q.best === null ? '' : Q.best >= 80 ? 'good' : 'mid'}">${Q.best === null ? 'טרם נבחנת' : `<span class="num">${Q.best}</span> ציון הכי טוב`}</span></div>
      <p class="muted small">${l.quiz.length} שאלות · ${Q.history.length} ניסיונות</p>
      <a class="btn" href="#/lesson/${l.id}/quiz">${Q.best === null ? 'למבחן' : 'למבחן שוב'}</a></li>`; }).join('')}
    <li class="glass hub locked-hub"><div class="hub-head"><b>סימולציית בגרות מלאה</b><span class="badge b-check">בפיתוח</span></div>
      <p class="muted small">בחינה מלאה עם טיימר לפי מבנה השאלון. תיבנה אחרי שיהיו מספיק שיעורים ומבנה הבחינה יאומת.</p></li>
  </ul>`;
}

// ---------- תוכנית לימודים ----------
let planFilter = null;
function viewPlan() {
  const track = planFilter || store.get().track || 'common';
  const show = t => track === 'all' ? true : track === 'common' ? t.status === 'common' :
    track === 'old' ? !!t.old || t.status === 'old' : !!t.new || t.status === 'new';
  const groups = [
    { name: 'שאלון ראשון', codes: '035581 / 035571', test: t => (t.old || '').endsWith('81') || (t.new || '').endsWith('71') },
    { name: 'שאלון שני', codes: '035582 / 035572', test: t => (t.old || '').endsWith('82') || (t.new || '').endsWith('72') || (!t.old && !t.new) },
  ];
  const tabs = [['common', 'משותף בלבד'], ['old', 'מתכונת ישנה'], ['new', 'מתכונת חדשה'], ['all', 'הכול']];
  const srcLinks = ids => ids.map(id => SOURCES[id]).filter(Boolean)
    .map(s => `<a href="${s.url}" target="_blank" rel="noopener" class="${s.kind === 'official' ? 'src-off' : 'src-sec'}">${esc(s.title)}</a>`).join('');

  return `
  <h1>תוכנית הלימודים</h1>
  <p class="lead">מיפוי הנושאים בשתי המתכונות. בשלב הראשון לומדים את הנושאים המשותפים.</p>
  <div class="grid-2 plan-links">
    <a class="glass link-card" href="#/map"><span class="card-title">${ICON.map}<b>מפת ידע</b></span><span class="muted small">57 מיומנויות וידע מקדים</span></a>
    <a class="glass link-card" href="#/diagnostic"><span class="card-title">${ICON.compass}<b>מבחן אבחון</b></span><span class="muted small">${store.get().diagnostic?.finishedAt ? 'לתוצאות' : 'מאיפה להתחיל'}</span></a>
  </div>
  <div class="warn card"><b>מה אומת ומה לא (${VERIFIED_ON}).</b> מבנה השאלונים, המשקלות וכותרות הפרקים נבדקו ישירות בשאלוני בגרות רשמיים ובאתר הפדגוגי של משרד החינוך. תוכניות הלימודים המפורטות ודף "מיקוד הלמידה" עוד לא נקראו סעיף אחר סעיף. כל נושא שמסומן "מקור משני" או "דורש בדיקה" לא אומת.
    <ul class="open-q">${EXAMS.openQuestions.map(q => `<li>${esc(q)}</li>`).join('')}</ul></div>

  <div class="exam-cards grid-2">
    ${['old', 'new'].map(k => `<div class="card"><h3>${EXAMS[k].name}</h3>${EXAMS[k].papers.map(p => `
      <div class="paper"><div><b class="num">${p.code}</b> <span class="badge ghost">${p.weight}%</span> <span class="conf conf-${p.confidence}">${CONFIDENCE[p.confidence]}</span></div><p>${esc(p.structure)}</p>
      ${p.versions ? `<div class="versions">${p.versions.map(v => `<div class="ver"><b>${esc(v.label)}</b> <a href="${SOURCES[v.src].url}" target="_blank" rel="noopener">מקור</a><p>${esc(v.text)}</p></div>`).join('')}</div>` : `<a class="small" href="${SOURCES[p.src[0]].url}" target="_blank" rel="noopener">מקור</a>`}</div>`).join('')}</div>`).join('')}
  </div>

  <div class="tabs" role="tablist" aria-label="סינון לפי מתכונת">
    ${tabs.map(([k, l]) => `<button role="tab" aria-selected="${track === k}" data-track="${k}">${l}</button>`).join('')}
  </div>
  <div class="legend">${Object.entries(STATUS).map(([k, v]) => `<span class="badge ${v.cls}">${v.label}</span>`).join('')}</div>

  ${groups.map(g => {
    const rows = TOPICS.filter(t => g.test(t) && show(t));
    if (!rows.length) return '';
    return `<h2>${g.name} <span class="muted num small">${g.codes}</span></h2>
    <ul class="topic-list">${rows.map(t => `
      <li class="card topic">
        <div class="topic-head"><b>${esc(t.name)}</b><span class="badge ${STATUS[t.status].cls}">${STATUS[t.status].label}</span></div>
        <div class="topic-meta"><span>ישנה: <b class="num">${t.old || '—'}</b></span><span>חדשה: <b class="num">${t.new || '—'}</b></span><span class="conf conf-${t.confidence}">${CONFIDENCE[t.confidence]}</span></div>
        ${t.note ? `<p class="muted small">${esc(t.note)}</p>` : ''}
        <details><summary>מקורות</summary><div class="srcs">${srcLinks(t.src)}</div></details>
        ${(t.lessons || []).map(id => `<a class="btn small-btn" href="#/lesson/${id}">לשיעור: ${esc(LESSON_BY_ID[id].title)}</a>`).join('')}
      </li>`).join('')}</ul>`;
  }).join('')}`;
}

function bindPlan() {
  app.querySelectorAll('[data-track]').forEach(b => b.addEventListener('click', () => {
    planFilter = b.dataset.track;
    if (b.dataset.track !== 'all') store.set(s => { s.track = b.dataset.track; });
    route();
  }));
}

// ---------- שאלות ----------
function qHTML(q, lessonId, mode, idx) {
  const L = store.get().lessons[lessonId];
  const prev = mode === 'practice' && L && L.answers[q.id];
  const solved = prev && prev.correct;
  const label = q.label ? `סעיף ${q.label}` : `שאלה ${idx + 1}`;
  const input = q.type === 'mc'
    ? `<div class="options" role="radiogroup">${q.options.map((o, i) => `
        <label class="opt"><input type="radio" name="${q.id}" value="${i}" ${solved && o.ok ? 'checked' : ''}><span>${o.t}</span></label>`).join('')}</div>`
    : `<div class="num-input"><input type="text" inputmode="decimal" dir="ltr" aria-label="תשובה" autocomplete="off" ${solved ? `value="${q.answer}"` : ''}>${q.rounding ? `<span class="muted small">עיגול: ${esc(q.rounding)}</span>` : ''}</div>`;
  return `
  <div class="q card ${solved ? 'solved' : ''}" data-q="${q.id}" data-mode="${mode}" data-hints="0">
    <div class="q-head"><span class="q-num">${label}</span>${solved ? '<span class="ok-mark">✓ נפתר</span>' : ''}</div>
    <div class="q-prompt">${q.prompt}</div>
    ${input}
    ${mode === 'practice' ? `
      <div class="q-actions">
        <button class="btn primary" data-act="check">בדיקת תשובה</button>
        ${q.hints && q.hints.length ? `<button class="btn" data-act="hint">רמז <span class="num">(${q.hints.length})</span></button>` : ''}
        <button class="btn ghost" data-act="reveal">הצגת פתרון</button>
      </div>
      <ol class="hints"></ol>` : ''}
    <div class="feedback" aria-live="polite"></div>
  </div>`;
}

function findQ(lesson, qid) {
  return practiceQuestions(lesson).concat(lesson.quiz).find(q => q.id === qid);
}

function bindPractice(container, lesson) {
  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-act]'); if (!btn) return;
    const card = btn.closest('.q'); const q = findQ(lesson, card.dataset.q);
    const fb = card.querySelector('.feedback');
    const hintsUsed = +card.dataset.hints;

    if (btn.dataset.act === 'hint') {
      if (hintsUsed < q.hints.length) {
        const li = document.createElement('li'); li.innerHTML = q.hints[hintsUsed];
        card.querySelector('.hints').appendChild(li); renderMath(li);
        card.dataset.hints = hintsUsed + 1;
        const left = q.hints.length - hintsUsed - 1;
        btn.innerHTML = left ? `רמז נוסף <span class="num">(${left})</span>` : 'אין עוד רמזים';
        if (!left) btn.disabled = true;
      }
      return;
    }
    const already = !!store.get().lessons[lesson.id]?.answers[q.id]?.correct;  // שאלה שכבר נפתרה לא נספרת שוב
    if (btn.dataset.act === 'reveal') {
      if (!already) store.recordAttempt(lesson.id, q.id, { ok: false, hints: hintsUsed, revealed: true, ctx: 'practice' });
      fb.className = 'feedback show-sol';
      fb.innerHTML = `<b>הפתרון:</b> ${q.solution}`; renderMath(fb);
      return;
    }
    // check
    const raw = q.type === 'mc' ? card.querySelector('input[type=radio]:checked')?.value : card.querySelector('.num-input input').value;
    const res = checkAnswer(q, raw);
    if (!res.valid) {
      fb.className = 'feedback info';
      fb.textContent = q.type === 'mc' ? 'צריך לבחור תשובה.' : 'צריך לכתוב מספר. אפשר מספר עשרוני (9.8), שבר (3/4) או מספר שלילי (‎-21).';
      return;
    }
    if (!already) store.recordAttempt(lesson.id, q.id, { ok: res.ok, hints: hintsUsed, ctx: 'practice' });
    if (res.ok) {
      card.classList.add('solved');
      fb.className = 'feedback ok';
      fb.innerHTML = `<b>נכון.</b> ${q.solution}`;
    } else {
      if (!already) store.recordMistake(lesson.id, q.id, res.tag);
      const t = lesson.tags[res.tag];
      fb.className = 'feedback bad';
      fb.innerHTML = t ? `<b>לא בדיוק.</b> נראה שזו טעות של ${t.label}. ${t.advice}` : '<b>לא בדיוק.</b> כדאי לבדוק שוב את החישוב, או לבקש רמז.';
    }
    renderMath(fb);
    updateStepper(lesson);
    maybeCompleteSection(lesson, card.closest('[data-section]'));
  });
}

function maybeCompleteSection(lesson, sec) {
  if (!sec) return;
  const L = store.lesson(lesson.id);
  const ids = [...sec.querySelectorAll('.q')].map(c => c.dataset.q);
  if (ids.every(id => L.answers[id] && (L.answers[id].correct || L.answers[id].revealed))) {
    store.markSection(lesson.id, sec.dataset.section); updateStepper(lesson);
  }
}

// ---------- שיעור ----------
function sectionBody(lesson, sid) {
  switch (sid) {
    case 'explain':
      return lesson.explain.map(b => `<article class="card prose"><h2>${b.h}</h2>${b.body}</article>`).join('') + doneBtn('explain', 'קראתי, להמשך');
    case 'video':
      return `<div class="card prose">
        <h2>סרטון לימוד</h2>
        <div class="video-pending"><span class="badge b-check">ממתין לבחירת סרטון</span><p>${esc(lesson.video.note)}</p></div>
        <ul class="link-list">${lesson.video.links.map(l => `<li><a href="${l.url}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join('')}</ul>
        <p class="muted small">קישורי חיפוש אינם המלצה על סרטון מסוים. סרטונים ייבחרו אחרי בדיקת תוכן.</p>
      </div>` + doneBtn('video', 'להמשך לדוגמאות');
    case 'examples':
      return lesson.examples.map((ex, i) => `
        <article class="card example" data-ex="${i}" data-step="0">
          <div class="q-head"><span class="q-num">דוגמה ${i + 1}</span><span class="muted">${esc(ex.title)}</span></div>
          <div class="q-prompt">${ex.problem}</div>
          <ol class="steps">${ex.steps.map(s => `<li hidden>${s}</li>`).join('')}</ol>
          <div class="ex-answer" hidden><b>תשובה:</b> ${ex.answer}</div>
          <div class="q-actions"><button class="btn primary" data-step>לצעד הראשון</button><button class="btn ghost" data-all>הצגת כל הפתרון</button></div>
        </article>`).join('') + doneBtn('examples', 'הבנתי, לתרגול');
    case 'guided':
      return `<p class="muted">כאן יש רמזים. כדאי לנסות לבד קודם, ולבקש רמז רק כשנתקעים.</p>${srcNote()}` +
        lesson.guided.map((q, i) => qHTML(q, lesson.id, 'practice', i)).join('');
    case 'practice':
      return `<p class="muted">אותו נושא, קצת יותר עצמאות. גם כאן יש רמזים, אבל הם נחשבים: רמת השליטה נמדדת לפי תשובות נכונות בניסיון הראשון ובלי רמזים.</p>${srcNote()}` +
        lesson.practice.map((q, i) => qHTML(q, lesson.id, 'practice', i)).join('');
    case 'bagrut':
      return lesson.bagrut.map(b => `
        <article class="card bagrut">
          <div class="q-head"><span class="q-num">שאלה ברמת בגרות</span><span class="badge src-${b.source}">${SOURCE_LABEL[b.source]}</span></div>
          <div class="prose">${b.context}</div>
          ${b.source === 'original' ? '<p class="muted small">השאלה נכתבה לתרגול בסגנון בגרות, ואינה לקוחה משאלון של משרד החינוך.</p>' : ''}
        </article>
        ${b.parts.map((q, i) => qHTML(q, lesson.id, 'practice', i)).join('')}`).join('') +
        `<div class="card"><h3>לתרגול נוסף משאלונים רשמיים</h3><ul class="link-list">
          <li><a href="${SOURCES.s581.url}" target="_blank" rel="noopener">${SOURCES.s581.title}</a></li>
          <li><a href="${SOURCES.s571.url}" target="_blank" rel="noopener">${SOURCES.s571.title}</a></li></ul></div>`;
    case 'quiz': return quizHTML(lesson);
    case 'review': return reviewHTML(lesson);
  }
}

const srcNote = () => `<p class="src-note"><span class="badge src-original">${SOURCE_LABEL.original}</span> כל השאלות בשלב הזה נכתבו לתרגול.</p>`;
const doneBtn = (sid, label) => `<div class="section-end"><button class="btn primary" data-done="${sid}">${label}</button></div>`;

function quizHTML(lesson) {
  const L = store.get().lessons[lesson.id];
  const hist = L ? L.quiz.history : [];
  return `
  <div class="card prose"><h2>מבחן קצר</h2><p>${lesson.quiz.length} שאלות, בלי רמזים. מגישים הכול יחד ומקבלים ציון וניתוח טעויות. אפשר לחזור על המבחן כמה פעמים שרוצים, ונשמר הציון הטוב ביותר.</p>
  ${hist.length ? `<p class="muted">ניסיונות קודמים: ${hist.map(h => `<b class="num">${h.score}</b>`).join(', ')}</p>` : ''}</div>
  ${srcNote()}
  <form id="quiz">${lesson.quiz.map((q, i) => qHTML(q, lesson.id, 'quiz', i)).join('')}
    <div class="section-end"><button class="btn primary" type="submit">הגשת המבחן</button></div>
  </form>
  <div id="quizResult"></div>`;
}

function bindQuiz(lesson) {
  const form = document.getElementById('quiz'); if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    let correct = 0; const wrongTags = [];
    lesson.quiz.forEach(q => {
      const card = form.querySelector(`[data-q="${q.id}"]`); const fb = card.querySelector('.feedback');
      const raw = q.type === 'mc' ? card.querySelector('input:checked')?.value : card.querySelector('.num-input input').value;
      let res = checkAnswer(q, raw);
      if (!res.valid) res = { ok: false, tag: 'general' };
      store.recordAttempt(lesson.id, q.id, { ok: res.ok, ctx: 'quiz' });
      if (res.ok) { correct++; fb.className = 'feedback ok'; fb.innerHTML = `<b>נכון.</b> ${q.solution}`; }
      else {
        wrongTags.push(res.tag); store.recordMistake(lesson.id, q.id, res.tag);
        fb.className = 'feedback bad'; fb.innerHTML = `<b>התשובה הנכונה:</b> ${q.solution}`;
      }
      renderMath(fb);
    });
    const score = Math.round(100 * correct / lesson.quiz.length);
    store.recordQuiz(lesson.id, score, wrongTags);
    const out = document.getElementById('quizResult');
    out.innerHTML = `<div class="card result ${score >= 80 ? 'good' : 'mid'}"><span class="num huge">${score}</span>
      <p>${correct} מתוך ${lesson.quiz.length} נכונות. ${score >= 80 ? 'מצוין, אפשר להתקדם.' : 'כדאי לעבור על ניתוח הטעויות לפני שממשיכים.'}</p>
      <a class="btn primary" href="#/lesson/${lesson.id}/review">לניתוח הטעויות</a></div>`;
    form.querySelector('[type=submit]').textContent = 'הגשה מחדש';
    updateStepper(lesson);
    out.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  });
}

function reviewHTML(lesson) {
  const st = store.get(); const L = st.lessons[lesson.id];
  const ms = mastery(lesson);
  const counts = {};
  st.mistakes.filter(x => x.lessonId === lesson.id).forEach(x => { counts[x.tag] = (counts[x.tag] || 0) + 1; });
  const top = Object.entries(counts).filter(([t]) => lesson.tags[t]).sort((a, b) => b[1] - a[1]);
  const general = counts.general || 0;
  const quizBest = L ? L.quiz.best : null;
  const quizLast = ms.lastQuiz;
  const next = lesson.next && LESSON_BY_ID[lesson.next];
  const rev = st.reviews[lesson.id];

  let advice;
  if (quizLast === null) advice = `<p>עוד לא עשית את המבחן הקצר. הוא מה שקובע את רוב רמת השליטה.</p><a class="btn primary" href="#/lesson/${lesson.id}/quiz">למבחן</a>`;
  else if (quizLast >= 80 && ms.score >= 65) advice = `<p>שולט בנושא ברמה טובה. ${next ? 'אפשר להמשיך לשיעור הבא.' : 'זה השיעור האחרון שקיים כרגע. כדאי לחזור על השיעור החלש ביותר.'}</p>${next ? `<a class="btn primary" href="#/lesson/${next.id}">לשיעור הבא: ${esc(next.title)}</a>` : '<a class="btn primary" href="#/">ללוח הבקרה</a>'}`;
  else if (top.length) { const t = lesson.tags[top[0][0]]; advice = `<p>הטעות שחוזרת הכי הרבה: <b>${t.label}</b>. ${t.advice}</p><a class="btn primary" href="#/lesson/${lesson.id}/${t.section}">לחזרה על ${SECTIONS.find(s => s.id === t.section).label}</a>`; }
  else advice = `<p>כדאי לעשות שוב את התרגול העצמאי ואז את המבחן.</p><a class="btn primary" href="#/lesson/${lesson.id}/practice">לתרגול העצמאי</a>`;

  return `
  <div class="card"><h2>רמת שליטה: ${LEVELS[ms.level]}</h2>${meter(ms.score, ms.level)}
    <div class="stats"><div><span class="num big">${ms.score}</span><span class="muted">מתוך 100</span></div>
    <div><span class="num big">${quizLast ?? '—'}</span><span class="muted">מבחן אחרון</span></div>
    <div><span class="num big">${ms.distinct}</span><span class="muted">תרגילים שונים בלי עזרה</span></div>
    <div><span class="num big">${fmtTime(L ? L.timeSec : 0)}</span><span class="muted">זמן בשיעור</span></div></div>
    ${ms.missing.length ? `<h3 class="sub-h">מה חסר לרמת "שליטה"</h3><ul class="check-list">${ms.missing.map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : '<p class="ok-line">עמדת בכל התנאים לרמת "שליטה".</p>'}
    ${rev ? `<p class="muted small">חזרה הבאה: ${extra.fmtDue(rev.due)} · שלב חזרה ${rev.box + 1} מתוך 5.</p>` : ''}
    <details class="how"><summary>איך מחושבת רמת השליטה?</summary>${extra.MASTERY_EXPLAINER}</details></div>
  <div class="card"><h2>ניתוח טעויות</h2>
    ${top.length || general ? `<ul class="mistakes">${top.map(([t, c]) => `<li><span class="num count">${c}</span><div><b>${lesson.tags[t].label}</b><p class="muted">${lesson.tags[t].advice}</p></div></li>`).join('')}
      ${general ? `<li><span class="num count">${general}</span><div><b>טעויות אחרות</b><p class="muted">טעויות חישוב או טעויות שהמערכת לא זיהתה את הסוג שלהן.</p></div></li>` : ''}</ul>`
      : '<p class="muted">עוד אין טעויות רשומות בשיעור הזה.</p>'}</div>
  <div class="card rec"><h2>מה עכשיו?</h2>${advice}</div>`;
}

let currentLesson = null;
function viewLesson(id, sid) {
  const lesson = LESSON_BY_ID[id];
  if (!lesson) return `<div class="card"><h1>השיעור לא נמצא</h1><a class="btn primary" href="#/">ללוח הבקרה</a></div>`;
  currentLesson = id;
  store.set(s => { s.lastLesson = id; });
  const active = SECTIONS.some(s => s.id === sid) ? sid : 'explain';
  const i = SECTIONS.findIndex(s => s.id === active);
  const nextS = SECTIONS[i + 1], prevS = SECTIONS[i - 1];
  return `
  <nav class="crumbs"><a href="#/plan">תוכנית</a><span aria-hidden="true">‹</span><span>${esc(lesson.title)}</span></nav>
  <header class="lesson-head">
    <h1>${esc(lesson.title)}</h1>
    <div class="tags"><span class="badge b-common">משותף לשתי המתכונות</span><span class="badge ghost num">${lesson.papers.old}</span><span class="badge ghost num">${lesson.papers.new}</span><span class="muted small">כ-${lesson.minutes} דקות</span></div>
  </header>
  <ol class="stepper" id="stepper">${stepperItems(lesson, active)}</ol>
  <div class="section" data-section="${active}">${sectionBody(lesson, active)}</div>
  <nav class="pager">
    ${prevS ? `<a class="btn ghost" href="#/lesson/${id}/${prevS.id}"><span class="dir">›</span> ${prevS.label}</a>` : '<span></span>'}
    ${nextS ? `<a class="btn" href="#/lesson/${id}/${nextS.id}">${nextS.label} <span class="dir">‹</span></a>` : ''}
  </nav>`;
}

function stepperItems(lesson, active) {
  const L = store.get().lessons[lesson.id];
  return SECTIONS.map((s, i) => `<li class="${L && L.sections[s.id] ? 'done' : ''} ${s.id === active ? 'active' : ''}">
    <a href="#/lesson/${lesson.id}/${s.id}" ${s.id === active ? 'aria-current="step"' : ''}><span class="dot num">${L && L.sections[s.id] ? '✓' : i + 1}</span><span class="st-label">${s.label}</span></a></li>`).join('');
}

function updateStepper(lesson) {
  const el = document.getElementById('stepper'); if (!el) return;
  const active = (location.hash.split('/')[3]) || 'explain';
  el.innerHTML = stepperItems(lesson, active);
}

function bindLesson(id) {
  const lesson = LESSON_BY_ID[id]; if (!lesson) return;
  const sec = app.querySelector('.section');
  bindPractice(sec, lesson);
  bindQuiz(lesson);
  sec.addEventListener('click', e => {
    const d = e.target.closest('[data-done]');
    if (d) {
      store.markSection(id, d.dataset.done);
      const i = SECTIONS.findIndex(s => s.id === d.dataset.done);
      location.hash = `#/lesson/${id}/${SECTIONS[i + 1].id}`;
      return;
    }
    const ex = e.target.closest('.example'); if (!ex) return;
    const steps = [...ex.querySelectorAll('.steps li')];
    const showAll = !!e.target.closest('[data-all]');
    const stepBtn = e.target.closest('[data-step]');
    if (!showAll && !stepBtn) return;
    let n = +ex.dataset.step;
    n = showAll ? steps.length : n + 1;
    steps.forEach((li, k) => { li.hidden = k >= n; });
    ex.dataset.step = n;
    const b = ex.querySelector('[data-step]');
    if (n >= steps.length) {
      ex.querySelector('.ex-answer').hidden = false;
      b.hidden = true; ex.querySelector('[data-all]').hidden = true;
      if ([...app.querySelectorAll('.example')].every(x => +x.dataset.step >= x.querySelectorAll('.steps li').length)) store.markSection(id, 'examples');
      updateStepper(lesson);
    } else b.textContent = `לצעד הבא (${n + 1}/${steps.length})`;
  });
  if (location.hash.endsWith('/review')) store.markSection(id, 'review');
}

// ---------- התקדמות ----------
function viewProgress() {
  const st = store.get();
  const total = Object.values(st.lessons).reduce((a, l) => a + l.timeSec, 0);
  return `
  <h1>ההתקדמות שלי</h1>
  <div class="card"><div class="stats">
    <div><span class="num big">${fmtTime(total)}</span><span class="muted">זמן למידה כולל</span></div>
    <div><span class="num big">${fmtTime(weekSeconds())}</span><span class="muted">השבוע</span></div>
    <div><span class="num big">${st.mistakes.length}</span><span class="muted">טעויות רשומות</span></div>
  </div></div>
  <div class="card table-wrap"><table>
    <thead><tr><th>שיעור</th><th>שליטה</th><th>מבחן אחרון</th><th>שלבים</th><th>זמן</th></tr></thead>
    <tbody>${LESSONS.map(l => { const s = lessonState(l); const L = st.lessons[l.id]; return `<tr>
      <td><a href="#/lesson/${l.id}">${esc(l.title)}</a></td><td>${LEVELS[s.level]} <span class="num muted">(${s.score})</span></td>
      <td class="num">${s.lastQuiz ?? '—'}</td><td class="num">${s.done}/${s.total}</td><td>${fmtTime(L ? L.timeSec : 0)}</td></tr>`; }).join('')}</tbody>
  </table></div>
  ${extra.settingsHTML()}
  <div class="card"><h2>גיבוי</h2>
    <p>ההתקדמות נשמרת בדפדפן הזה בלבד. כדי להעביר אותה לטלפון או למחשב אחר, מורידים קובץ גיבוי וטוענים אותו שם.</p>
    <div class="q-actions"><button class="btn primary" id="exp">הורדת קובץ גיבוי</button>
      <label class="btn">טעינת קובץ גיבוי<input type="file" id="imp" accept="application/json" hidden></label>
      <button class="btn ghost danger" id="rst" data-armed="0">איפוס ההתקדמות</button></div>
    <p id="ioMsg" class="muted" aria-live="polite"></p></div>
  <a class="glass link-card" href="#/sources">מקורות וסימון תוכן <span class="dir">‹</span></a>`;
}

function bindProgress() {
  const msg = document.getElementById('ioMsg');
  document.getElementById('exp').onclick = () => {
    const blob = new Blob([store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `math5-progress-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    msg.textContent = 'קובץ הגיבוי ירד.';
  };
  document.getElementById('imp').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { store.importJSON(await f.text()); msg.textContent = 'ההתקדמות נטענה.'; setTimeout(route, 600); }
    catch { msg.textContent = 'הקובץ לא נראה כמו גיבוי של האפליקציה. כדאי לבדוק שבחרת את הקובץ הנכון.'; }
  };
  const rst = document.getElementById('rst');
  rst.onclick = () => {   // אישור בתוך הדף (חלונות confirm חסומים בחלק מהסביבות)
    if (rst.dataset.armed === '1') { store.reset(); route(); return; }
    rst.dataset.armed = '1'; rst.textContent = 'לחיצה נוספת תמחק הכול';
    msg.textContent = 'המחיקה סופית. כדאי להוריד קובץ גיבוי לפני כן.';
    setTimeout(() => { if (rst.isConnected) { rst.dataset.armed = '0'; rst.textContent = 'איפוס ההתקדמות'; } }, 5000);
  };
  extra.bindSettings(route);
}

// ---------- מקורות ----------
function viewSources() {
  return `<h1>מקורות</h1>
  <div class="card prose"><h2>איך מסומן כל תוכן</h2><ul>
    <li><span class="badge src-official">${SOURCE_LABEL.official}</span> שאלה מתוך שאלון בגרות של משרד החינוך, עם קישור לשאלון.</li>
    <li><span class="badge src-adapted">${SOURCE_LABEL.adapted}</span> שאלה שמבוססת על שאלה רשמית ושונתה. מצוין המקור.</li>
    <li><span class="badge src-original">${SOURCE_LABEL.original}</span> שאלה שנכתבה לאפליקציה. לא מבגרות.</li></ul>
    <p>כל השאלות שקיימות כרגע הן מקוריות. כל התשובות נבדקו בחישוב חוזר.</p></div>
  <div class="card"><h2>מקורות רשמיים</h2><ul class="link-list">${Object.values(SOURCES).filter(s => s.kind === 'official').map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.title)}</a></li>`).join('')}</ul></div>
  <div class="card"><h2>מקורות משניים <span class="muted small">(דורשים אימות מול המקור הרשמי)</span></h2><ul class="link-list">${Object.values(SOURCES).filter(s => s.kind !== 'official').map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.title)}</a></li>`).join('')}</ul></div>
  <div class="card"><h2>לימוד חינמי נוסף</h2><ul class="link-list"><li><a href="https://campus.gov.il/" target="_blank" rel="noopener">קמפוס IL – קורסים מקוונים חינמיים</a></li>
    <li><a href="https://meyda.education.gov.il/sheeloney_bagrut/" target="_blank" rel="noopener">מאגר שאלוני הבגרות של משרד החינוך</a></li></ul></div>`;
}

// ---------- ניתוב ----------
function setActiveNav(name) {
  document.querySelectorAll('[data-nav]').forEach(a => a.toggleAttribute('aria-current', a.dataset.nav === name));
}

function route() {
  const parts = (location.hash || '#/').slice(2).split('#')[0].split('/');
  currentLesson = null; currentActivity = null;
  let html, bind = () => {}, nav = parts[0] || 'home';
  if (parts[0] === 'lesson') { html = viewLesson(parts[1], parts[2]); bind = () => bindLesson(parts[1]); nav = 'plan'; }
  else if (parts[0] === 'plan') { html = viewPlan(); bind = bindPlan; }
  else if (parts[0] === 'progress') { html = viewProgress(); bind = bindProgress; }
  else if (parts[0] === 'sources') { html = viewSources(); nav = 'progress'; }
  else if (parts[0] === 'practice') { html = viewPractice(); }
  else if (parts[0] === 'exams') { html = viewExams(); }
  else if (parts[0] === 'review') { const v = extra.reviewRoute(parts[1]); html = v.html; bind = v.bind; nav = 'practice'; currentActivity = 'review'; }
  else if (parts[0] === 'diagnostic') { const v = extra.diagnosticRoute(); html = v.html; bind = v.bind; nav = 'plan'; currentActivity = 'diagnostic'; }
  else if (parts[0] === 'map') { html = extra.viewMap(); nav = 'plan'; }
  else if (parts[0] === 'week') { html = extra.viewWeek(); nav = 'progress'; }
  else { html = viewDashboard(); bind = bindDashboard; nav = 'home'; }
  app.innerHTML = html;
  app.classList.remove('enter'); void app.offsetWidth; app.classList.add('enter');
  setActiveNav(nav);
  renderMath(app);
  bind();
  if (!route.keepScroll) window.scrollTo(0, 0);
  app.focus({ preventScroll: true });
}

// ---------- מעקב זמן ----------
// נמדד רק כשפתוח שיעור, חזרה או אבחון, הלשונית גלויה, והייתה פעולה בשתי הדקות האחרונות.
let currentActivity = null;
let lastActivity = Date.now();
['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(ev => addEventListener(ev, () => { lastActivity = Date.now(); }, { passive: true }));
setInterval(() => {
  if ((currentLesson || currentActivity) && document.visibilityState === 'visible' && Date.now() - lastActivity < 120000) store.addTime(currentLesson, 10);
}, 10000);

// ---------- אתחול ----------
async function boot() {
  try {
    await Promise.all([loadLessons(), extra.loadExtraData()]);
  } catch (e) {
    app.innerHTML = `<div class="card"><h1>התוכן לא נטען</h1><p>לא הצלחתי לטעון את קובצי השיעורים. אם האפליקציה נפתחה ישירות מקובץ, צריך להפעיל אותה דרך שרת (ראו README).</p><p class="muted small">${esc(e.message)}</p></div>`;
    return;
  }
  if (LOAD_ERRORS.length) console.warn('שיעורים שלא נטענו:', LOAD_ERRORS);
  addEventListener('hashchange', route);
  onExternalChange(() => { if (!document.querySelector('#quiz, #reviewForm, #diagForm')) route(); });
  route();
}
boot();
