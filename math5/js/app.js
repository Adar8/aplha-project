import { store, mastery, LEVELS, practiceQuestions, onExternalChange } from './store.js';
import { TOPICS, STATUS, CONFIDENCE, SOURCES, EXAMS, VERIFIED_ON } from './data/curriculum.js';
import { LESSONS, LESSON_BY_ID, loadLessons, LOAD_ERRORS } from './data/lessons/index.js';
import { checkAnswer } from './core/answers.js';
import { SECTIONS, SOURCE_LABEL, renderMath, fmtTime, weekSeconds, todaySeconds, meter, lessonState, recommend, ring, ICON, esc } from './ui.js';
import * as extra from './views/extra.js';

const app = document.getElementById('app');

// ---------- מסך הבית ----------
const REC_ICON = { diagnostic: 'compass', review: 'repeat', reduce: 'clock', good: 'check', lesson: 'book', content: 'layers' };

function viewDashboard() {
  const st = store.get();
  const P = st.profile, g = P.grades, T = P.targetGrade;
  const current = 0.6 * g.q1 + 0.4 * g.q2;
  const wk = extra.weekSummary();
  const recs = extra.currentRecommendations().filter(r => r.kind !== 'lesson').slice(0, 3);
  const rec = recommend();
  const last = st.lastLesson && LESSON_BY_ID[st.lastLesson];
  const next = extra.nextLessonToStudy();
  const cont = last || next || rec.lesson;
  const L = st.lessons[cont.id];
  const doneSet = new Set(SECTIONS.filter(s => L && L.sections[s.id]).map(s => s.id));
  const nextSec = SECTIONS.find(s => !doneSet.has(s.id)) || SECTIONS[SECTIONS.length - 1];
  const nextIdx = SECTIONS.indexOf(nextSec);
  const minutesLeft = Math.max(5, Math.round(cont.minutes * (SECTIONS.length - doneSet.size) / SECTIONS.length));
  const states = LESSONS.map(l => lessonState(l));
  const strong = states.filter(s => s.level >= 3).length;
  const avg = states.length ? Math.round(states.reduce((a, s) => a + s.score, 0) / states.length) : 0;
  const weeksLeft = extra.weeksLeft();
  const hour = new Date().getHours();
  const hello = hour < 5 ? 'לילה טוב' : hour < 12 ? 'בוקר טוב' : hour < 18 ? 'צהריים טובים' : 'ערב טוב';
  const board = cont.explain.map(b => (b.body.match(/\$\$[\s\S]*?\$\$/) || [])[0]).find(Boolean) || '';
  const today = new Date().getDay();
  const maxMin = Math.max(30, ...wk.days.map(d => Math.max(d.plannedMin, d.actualMin)));
  const todo = extra.weekTodo().slice(0, 3);

  return `
  <section class="home-head">
    <div>
      <p class="eyebrow">${hello}</p>
      <h1>${st.name ? `שלום, ${esc(st.name)}` : 'שלום'}</h1>
      ${st.name ? '' : `<form class="name-form" id="nameForm"><label for="nm" class="sr-only">איך לקרוא לך?</label>
        <input id="nm" placeholder="איך לקרוא לך?" maxlength="20" autocomplete="given-name"><button class="btn sm">שמירה</button></form>`}
    </div>
    <div class="goal-chip" aria-label="יעד ציון ${T} ומעלה">
      <span>יעד</span><b class="num"><bdi dir="ltr">${T}+</bdi></b>${weeksLeft !== null ? `<span class="sep" aria-hidden="true"></span><span>עוד ${weeksLeft} שבועות לבחינה</span>` : ''}
    </div>
  </section>

  <section class="continue-card" aria-labelledby="cc-title">
    <div>
      <span class="cc-kicker">${last ? 'להמשיך מאיפה שעצרת' : 'השיעור הבא שלך'}</span>
      <h2 class="cc-title" id="cc-title">${esc(cont.title)}</h2>
      <div class="cc-meta"><span class="badge b-common">משותף לשתי המתכונות</span><span class="num">${cont.papers.old} · ${cont.papers.new}</span><span>כ-${minutesLeft} דקות נשארו</span></div>
      <div class="seg-progress" role="img" aria-label="${doneSet.size} מתוך ${SECTIONS.length} שלבים הושלמו">${SECTIONS.map(s => `<span class="${doneSet.has(s.id) ? 'done' : s.id === nextSec.id ? 'now' : ''}"></span>`).join('')}</div>
      <p class="cc-step">השלב הבא: <b>${nextSec.label}</b> · שלב ${nextIdx + 1} מתוך ${SECTIONS.length}</p>
      <div class="cc-actions">
        <a class="btn primary lg" href="#/lesson/${cont.id}/${nextSec.id}"><span>${doneSet.size ? 'המשך ללמוד' : 'להתחלת השיעור'}</span>${ICON.chevEnd}</a>
        <a class="btn tertiary" href="#/plan">כל השיעורים</a>
      </div>
    </div>
    ${board ? `<div class="cc-board" aria-hidden="true"><span class="cc-board-label">הנוסחה המרכזית</span><div class="cc-board-math">${board}</div></div>` : ''}
  </section>

  <section class="metrics" aria-label="מדדי התקדמות">
    <div class="metric">
      <span class="metric-label">ציון משוקלל</span>
      <span class="metric-value num">${current.toFixed(0)}<small>/ יעד ${T}</small></span>
      <span class="metric-sub">לפי הציונים הקודמים שלך (60% שאלון ראשון, 40% שני). חסרות ${Math.max(0, T - current).toFixed(0)} נקודות.</span>
      <span class="bar hue-teal"><span style="inline-size:${Math.min(100, current / T * 100)}%"></span></span>
    </div>
    <div class="metric">
      <span class="metric-label">שליטה בשיעורים</span>
      <span class="metric-value num">${strong}<small>/ ${LESSONS.length}</small></span>
      <span class="metric-sub">ברמת "טוב" ומעלה · ממוצע ${avg}</span>
      <span class="bar"><span style="inline-size:${LESSONS.length ? 100 * strong / LESSONS.length : 0}%"></span></span>
    </div>
    <div class="metric">
      <span class="metric-label">זמן השבוע</span>
      <span class="metric-value num">${wk.actualMin}<small>/ ${wk.plannedMin} דק׳</small></span>
      <span class="metric-sub">היום: ${fmtTime(todaySeconds())}</span>
      <span class="bar hue-violet"><span style="inline-size:${Math.min(100, wk.pct)}%"></span></span>
    </div>
  </section>

  <section class="home-two">
    <div class="card">
      <div class="card-head"><h2>תוכנית השבוע</h2><a href="#/week">לתוכנית המלאה</a></div>
      <div class="mini-week" role="img" aria-label="דקות למידה בכל יום השבוע מול התוכנית">
        ${wk.days.map(d => `<div class="mw-day ${d.day === today ? 'today' : ''}">
          <div class="mw-col ${d.plannedMin ? '' : 'off'}"><span class="mw-fill" style="block-size:${Math.min(100, 100 * d.actualMin / (d.plannedMin || maxMin))}%"></span></div>
          <span class="mw-name">${d.name.slice(0, 1)}׳</span></div>`).join('')}
      </div>
      <p class="week-sum">ימי לימוד מסומנים בעמודה מלאה. למדת <b>${wk.actualMin}</b> מתוך <b>${wk.plannedMin}</b> דקות (${wk.pct}%).</p>
      <ul class="todo">${todo.map(t => `<li><a href="${t.href}"><span class="t-dot" aria-hidden="true"></span><span>${esc(t.text)}</span><span class="t-min">${esc(t.min)}</span></a></li>`).join('')}</ul>
    </div>
    <div class="card">
      <div class="card-head"><h2>המלצות</h2></div>
      ${recs.length ? `<ul class="rec-rows">${recs.map(r => {
        const inner = `<span class="rec-ico">${ICON[REC_ICON[r.kind]] || ICON.compass}</span><span>${esc(r.text)}</span>${r.href ? `<span class="rec-chev" aria-hidden="true">‹</span>` : ''}`;
        return `<li>${r.href ? `<a class="rec-row k-${r.kind}" href="${r.href}">${inner}</a>` : `<div class="rec-row k-${r.kind}">${inner}</div>`}</li>`;
      }).join('')}</ul>` : '<p class="empty-line">אין המלצות מיוחדות כרגע. ממשיכים לפי תוכנית השבוע.</p>'}
    </div>
  </section>

  <section aria-labelledby="quick-h">
    <h2 class="section-title" id="quick-h">עוד במערכת</h2>
    <div class="quick-grid">
      <a class="quick-tile" href="#/diagnostic">${ICON.compass}<b>מבחן אבחון</b><span>${st.diagnostic?.finishedAt ? 'לתוצאות ולנקודת ההתחלה' : 'מאיפה כדאי להתחיל'}</span></a>
      <a class="quick-tile" href="#/map">${ICON.map}<b>מפת ידע</b><span>57 מיומנויות וידע מקדים</span></a>
      <a class="quick-tile" href="#/review">${ICON.repeat}<b>חזרות</b><span>חזרה קצרה אחרי יום, 3 ימים, שבוע</span></a>
      <a class="quick-tile" href="#/exams">${ICON.exam}<b>מבחנים</b><span>מבחן קצר בסוף כל שיעור</span></a>
      <a class="quick-tile" href="#/plan">${ICON.book}<b>תוכנית לימודים</b><span>הנושאים בשתי המתכונות</span></a>
    </div>
  </section>`;
}

function bindDashboard() {
  const nf = document.getElementById('nameForm');
  if (nf) nf.addEventListener('submit', e => {
    e.preventDefault(); const v = nf.querySelector('input').value.trim();
    if (v) { store.set(s => { s.name = v; }); route(); }
  });
}

// מחשבון יעד (עבר ממסך הבית למסך ההתקדמות)
function calcHTML() {
  const P = store.get().profile;
  return `<section class="card" id="calc"><div class="card-title">${ICON.flag}<h2>מחשבון יעד</h2></div>
    <div class="calc-row">
      <label for="g81">ציון יעד בשאלון הראשון (581/571, 60%)</label>
      <input id="g81" type="range" min="40" max="100" step="1" value="${Math.max(P.grades.q1, P.targetGrade)}">
      <output id="o81" class="num"></output>
    </div>
    <div class="calc-result" id="calcOut" aria-live="polite"></div>
    <p class="fine">משקל 60/40 – רשמי בשתי המתכונות (שאלוני הבגרות והאתר הפדגוגי).</p></section>`;
}
function bindCalc() {
  const r = document.getElementById('g81'); if (!r) return;
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
  const label = q.label ? `<span class="part-label">${esc(q.label)}</span> סעיף ${esc(q.label)}` : `שאלה ${idx + 1}`;
  const check = mode === 'practice' ? `<button class="btn primary" data-act="check">בדיקה</button>` : '';
  const answer = q.type === 'mc'
    ? `<div class="answer-row col"><div class="options" role="radiogroup" aria-label="אפשרויות">${q.options.map((o, i) => `
        <label class="opt"><input type="radio" name="${q.id}" value="${i}" ${solved && o.ok ? 'checked' : ''}><span>${o.t}</span></label>`).join('')}</div>
        ${check ? `<div>${check}</div>` : ''}</div>`
    : `<div class="answer-row"><div class="num-input">
        <input type="text" inputmode="decimal" dir="ltr" aria-label="תשובה" placeholder="תשובה" autocomplete="off" ${solved ? `value="${q.answer}" class="is-correct"` : ''}>
        ${q.rounding ? `<span class="hint-line">עיגול: ${esc(q.rounding)}</span>` : ''}</div>${check}</div>`;
  return `
  <div class="q card ${solved ? 'solved' : ''}" data-q="${q.id}" data-mode="${mode}" data-hints="0">
    <div class="q-head"><span class="q-num">${label}</span>${solved ? `<span class="q-status">${ICON.check} נפתר</span>` : ''}</div>
    <div class="q-prompt">${q.prompt}</div>
    ${answer}
    <div class="feedback" aria-live="polite"></div>
    ${mode === 'practice' ? `
      <div class="q-tools">
        ${q.hints && q.hints.length ? `<button class="btn tertiary sm" data-act="hint">רמז (${q.hints.length})</button>` : ''}
        <button class="btn tertiary sm" data-act="reveal">הצגת פתרון</button>
      </div>
      <ol class="hints"></ol>` : ''}
  </div>`;
}

// משוב צמוד לתשובה: אייקון + טקסט, וסימון שדה התשובה
function showFeedback(card, kind, html) {
  const fb = card.querySelector('.feedback');
  const icon = { ok: '✓', bad: '✕', info: 'i', 'show-sol': '?' }[kind];
  fb.className = `feedback ${kind}`;
  fb.innerHTML = `<span class="fb-icon" aria-hidden="true">${icon}</span><div class="fb-body">${html}</div>`;
  const input = card.querySelector('.num-input input');
  if (input) { input.classList.toggle('is-correct', kind === 'ok'); input.classList.toggle('is-wrong', kind === 'bad'); }
  card.querySelectorAll('.opt').forEach(o => o.classList.remove('is-correct', 'is-wrong'));
  const sel = card.querySelector('.opt input:checked');
  if (sel && (kind === 'ok' || kind === 'bad')) sel.closest('.opt').classList.add(kind === 'ok' ? 'is-correct' : 'is-wrong');
  renderMath(fb);
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
        btn.textContent = left ? `רמז נוסף (${left})` : 'אין עוד רמזים';
        if (!left) btn.disabled = true;
      }
      return;
    }
    const already = !!store.get().lessons[lesson.id]?.answers[q.id]?.correct;  // שאלה שכבר נפתרה לא נספרת שוב
    if (btn.dataset.act === 'reveal') {
      if (!already) store.recordAttempt(lesson.id, q.id, { ok: false, hints: hintsUsed, revealed: true, ctx: 'practice' });
      showFeedback(card, 'show-sol', `<b>הפתרון:</b> ${q.solution}`);
      return;
    }
    // check
    const raw = q.type === 'mc' ? card.querySelector('input[type=radio]:checked')?.value : card.querySelector('.num-input input').value;
    const res = checkAnswer(q, raw);
    if (!res.valid) {
      showFeedback(card, 'info', q.type === 'mc' ? 'צריך לבחור תשובה.' : 'צריך לכתוב מספר. אפשר מספר עשרוני (9.8), שבר (3/4) או מספר שלילי (‎-21).');
      return;
    }
    if (!already) store.recordAttempt(lesson.id, q.id, { ok: res.ok, hints: hintsUsed, ctx: 'practice' });
    if (res.ok) {
      card.classList.add('solved');
      showFeedback(card, 'ok', `<b>נכון.</b> ${q.solution}`);
      btn.classList.add('is-success'); btn.textContent = 'נכון';
      setTimeout(() => { if (btn.isConnected) { btn.classList.remove('is-success'); btn.textContent = 'בדיקה'; } }, 1600);
    } else {
      if (!already) store.recordMistake(lesson.id, q.id, res.tag);
      const t = lesson.tags[res.tag];
      showFeedback(card, 'bad', t ? `<b>לא בדיוק.</b> נראה שזו טעות של ${t.label}. ${t.advice}` : '<b>לא בדיוק.</b> כדאי לבדוק שוב את החישוב, או לבקש רמז.');
    }
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
      return lesson.explain.map(b => `<article class="prose explain-block"><h2>${b.h}</h2>${b.body}</article>`).join('');
    case 'video':
      return `<div class="card">
        <div class="video-pending"><span class="badge b-check">ממתין לבחירת סרטון</span><p>${esc(lesson.video.note)}</p></div>
        <ul class="link-list">${lesson.video.links.map(l => `<li><a href="${l.url}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join('')}</ul>
        <p class="muted small">קישורי חיפוש אינם המלצה על סרטון מסוים. סרטונים ייבחרו אחרי בדיקת תוכן.</p>
      </div>`;
    case 'examples':
      return lesson.examples.map((ex, i) => `
        <article class="card example" data-ex="${i}" data-step="0">
          <div class="ex-head"><span class="ex-num">דוגמה ${i + 1}</span><span class="ex-title">${esc(ex.title)}</span></div>
          <div class="ex-problem">${ex.problem}</div>
          <ol class="steps">${ex.steps.map(s => `<li hidden>${s}</li>`).join('')}</ol>
          <div class="ex-answer" hidden><b>תשובה:</b> ${ex.answer}</div>
          <div class="ex-actions"><button class="btn secondary" data-step>לצעד הראשון</button><button class="btn tertiary" data-all>הצגת כל הפתרון</button></div>
        </article>`).join('');
    case 'guided':
      return srcNote() +
        lesson.guided.map((q, i) => qHTML(q, lesson.id, 'practice', i)).join('');
    case 'practice':
      return srcNote() +
        lesson.practice.map((q, i) => qHTML(q, lesson.id, 'practice', i)).join('');
    case 'bagrut':
      return lesson.bagrut.map(b => `
        <article class="card bagrut">
          <div class="bagrut-head"><span class="q-num">${esc(b.title || 'שאלה ברמת בגרות')}</span><span class="badge src-${b.source}">${SOURCE_LABEL[b.source]}</span></div>
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

function quizHTML(lesson) {
  const L = store.get().lessons[lesson.id];
  const hist = L ? L.quiz.history : [];
  return `
  <div class="card"><p><b class="num">${lesson.quiz.length}</b> שאלות. אפשר לחזור על המבחן כמה פעמים שרוצים. רמת השליטה מתחשבת בציון <b>האחרון</b>, לא בטוב ביותר.</p>
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
      if (res.ok) { correct++; showFeedback(card, 'ok', `<b>נכון.</b> ${q.solution}`); }
      else {
        wrongTags.push(res.tag); store.recordMistake(lesson.id, q.id, res.tag);
        showFeedback(card, 'bad', `<b>התשובה הנכונה:</b> ${q.solution}`);
      }
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
  if (!lesson) return `<div class="card"><h1>השיעור לא נמצא</h1><p class="muted">ייתכן שהקישור ישן. כל השיעורים נמצאים במסך השיעורים.</p><a class="btn primary" href="#/plan">לשיעורים</a></div>`;
  currentLesson = id;
  store.set(s => { s.lastLesson = id; });
  const active = SECTIONS.some(s => s.id === sid) ? sid : 'explain';
  const i = SECTIONS.findIndex(s => s.id === active);
  const cur = SECTIONS[i], nextS = SECTIONS[i + 1], prevS = SECTIONS[i - 1];
  const readOnly = ['explain', 'video', 'examples'].includes(active);   // שלבי קריאה: "הבא" גם מסמן שהשלב הושלם
  return `
  <header class="lesson-top">
    <div class="lt-inner">
      <div class="lt-row">
        <a class="btn-icon" href="#/plan" aria-label="חזרה לשיעורים">${ICON.chevStart}</a>
        <div class="lt-title"><span class="lt-kicker num">${lesson.papers.old} · ${lesson.papers.new} · כ-${lesson.minutes} דקות</span><h1>${esc(lesson.title)}</h1></div>
      </div>
      <ol class="stepper" id="stepper" aria-label="שלבי השיעור">${stepperItems(lesson, active)}</ol>
      <p class="lt-step"><span>שלב <span class="num">${i + 1}</span> מתוך <span class="num">${SECTIONS.length}</span> · <b>${cur.label}</b></span><span id="lt-done" class="num">${stepDoneText(lesson)}</span></p>
    </div>
  </header>
  <div class="reading">
    <div class="section-intro"><h2>${cur.label}</h2><p>${cur.desc}</p></div>
    <div class="section" data-section="${active}">${sectionBody(lesson, active)}</div>
  </div>
  <nav class="lesson-nav" aria-label="מעבר בין שלבים">
    ${prevS ? `<a class="btn" href="#/lesson/${id}/${prevS.id}">${ICON.chevStart}<span class="nav-label">${prevS.label}</span></a>` : '<span></span>'}
    ${nextS ? `<a class="btn primary" href="#/lesson/${id}/${nextS.id}" ${readOnly ? `data-done="${active}"` : ''}><span class="nav-label">${readOnly ? 'סיימתי, ל' : ''}${nextS.label}</span>${ICON.chevEnd}</a>`
      : `<a class="btn primary" href="#/">לסיום השיעור${ICON.chevEnd}</a>`}
  </nav>`;
}

function stepDoneText(lesson) {
  const L = store.get().lessons[lesson.id];
  const n = L ? SECTIONS.filter(s => L.sections[s.id]).length : 0;
  return `${n}/${SECTIONS.length} הושלמו`;
}

function stepperItems(lesson, active) {
  const L = store.get().lessons[lesson.id];
  return SECTIONS.map((s, i) => {
    const done = L && L.sections[s.id];
    return `<li class="${done ? 'done' : ''} ${s.id === active ? 'active' : ''}">
      <a href="#/lesson/${lesson.id}/${s.id}" ${s.id === active ? 'aria-current="step"' : ''} title="${s.label}"><span class="seg" aria-hidden="true"></span><span class="st-label">${i + 1}. ${s.label}${done ? ' (הושלם)' : ''}</span></a></li>`;
  }).join('');
}

function updateStepper(lesson) {
  const el = document.getElementById('stepper'); if (!el) return;
  const active = (location.hash.split('/')[3]) || 'explain';
  el.innerHTML = stepperItems(lesson, active);
  const d = document.getElementById('lt-done'); if (d) d.textContent = stepDoneText(lesson);
}

function bindLesson(id) {
  const lesson = LESSON_BY_ID[id]; if (!lesson) return;
  const sec = app.querySelector('.section');
  bindPractice(sec, lesson);
  bindQuiz(lesson);
  app.querySelector('.lesson-nav')?.addEventListener('click', e => {
    const d = e.target.closest('[data-done]');
    if (d) store.markSection(id, d.dataset.done);   // הקישור עצמו ממשיך לשלב הבא
  });
  sec.addEventListener('click', e => {
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
      ex.querySelector('.ex-actions').hidden = true;
      if ([...app.querySelectorAll('.example')].every(x => +x.dataset.step >= x.querySelectorAll('.steps li').length)) store.markSection(id, 'examples');
      updateStepper(lesson);
    } else b.textContent = `לצעד הבא: ${n + 1} מתוך ${steps.length}`;
  });
  if (location.hash.endsWith('/review')) { store.markSection(id, 'review'); updateStepper(lesson); }
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
  ${calcHTML()}
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
  bindCalc();
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
