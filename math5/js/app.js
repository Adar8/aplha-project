import { store, mastery, LEVELS, practiceQuestions } from './store.js';
import { TOPICS, STATUS, CONFIDENCE, SOURCES, EXAMS } from './data/curriculum.js';
import { LESSONS, LESSON_BY_ID } from './data/lessons/index.js';

const app = document.getElementById('app');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const SECTIONS = [
  { id: 'explain', label: 'הסבר' },
  { id: 'video', label: 'סרטון' },
  { id: 'examples', label: 'דוגמאות פתורות' },
  { id: 'guided', label: 'תרגול מודרך' },
  { id: 'practice', label: 'תרגול עצמאי' },
  { id: 'bagrut', label: 'ברמת בגרות' },
  { id: 'quiz', label: 'מבחן קצר' },
  { id: 'review', label: 'ניתוח והמשך' },
];

const SOURCE_LABEL = {
  official: 'שאלה רשמית מבגרות',
  adapted: 'עובד משאלה רשמית',
  original: 'שאלה מקורית לתרגול',
};

// ---------- עזרים ----------
function renderMath(el) {
  if (window.renderMathInElement) {
    window.renderMathInElement(el, {
      delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
      throwOnError: false,
    });
  }
}

function fmtTime(sec) {
  if (!sec) return '0 דק׳';
  const h = Math.floor(sec / 3600), mnt = Math.round((sec % 3600) / 60);
  return h ? `${h} שע׳ ${mnt} דק׳` : `${mnt} דק׳`;
}

function weekSeconds() {
  const d = store.get().daily; let s = 0;
  for (let i = 0; i < 7; i++) {
    const k = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
    s += d[k] || 0;
  }
  return s;
}

function meter(score, level) {
  return `<div class="meter lvl-${level}" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${score}" aria-label="רמת שליטה">
    <span style="inline-size:${score}%"></span></div>`;
}

function lessonState(lesson) {
  const L = store.get().lessons[lesson.id];
  const done = L ? SECTIONS.filter(s => L.sections[s.id]).length : 0;
  return { done, total: SECTIONS.length, ...mastery(lesson) };
}

function recommend() {
  // השיעור עם השליטה הנמוכה ביותר שכבר התחלת, ואם אין – השיעור הבא שלא התחלת.
  const rows = LESSONS.map(l => ({ l, ...lessonState(l) }));
  const started = rows.filter(r => r.done > 0 && r.score < 85).sort((a, b) => a.score - b.score);
  if (started.length) return { lesson: started[0].l, why: `רמת השליטה כאן ${started[0].score} מתוך 100. כדאי לחזק לפני שממשיכים.` };
  const fresh = rows.find(r => r.done === 0);
  if (fresh) return { lesson: fresh.l, why: 'השיעור הבא בתוכנית. נושא משותף לשתי המתכונות.' };
  return { lesson: rows.sort((a, b) => a.score - b.score)[0].l, why: 'סיימת את כל השיעורים הקיימים. כדאי לחזור על החלש מביניהם עד ששיעורים נוספים יעלו.' };
}

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

function ring(pct, size = 132, label = '') {
  const r = (size - 14) / 2, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${label} ${pct}%">
    <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--teal)"/><stop offset="1" stop-color="var(--blue)"/></linearGradient></defs>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
  </svg>`;
}

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
  const g = st.grades;
  const current = 0.6 * g.q81 + 0.4 * g.q82;
  const rec = recommend();
  const last = st.lastLesson && LESSON_BY_ID[st.lastLesson];
  const cont = last || rec.lesson;
  const cs = lessonState(cont);
  const L = st.lessons[cont.id];
  const nextSec = SECTIONS.find(s => !(L && L.sections[s.id])) || SECTIONS[SECTIONS.length - 1];
  const allDone = LESSONS.reduce((a, l) => a + lessonState(l).done, 0);
  const allTotal = LESSONS.length * SECTIONS.length;
  const overall = Math.round(100 * allDone / allTotal);
  const today = st.daily[new Date().toISOString().slice(0, 10)] || 0;
  const DAILY = 20 * 60, dailyPct = Math.min(100, Math.round(100 * today / DAILY));
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
      <p class="lead">ממשיכים בדרך ל-75 בבגרות במתמטיקה 5 יחידות.</p>
      <a class="btn primary xl" href="#/lesson/${cont.id}/${nextSec.id}">${ICON.play}<span>${cs.done ? 'המשך לימוד' : 'להתחלת הלימוד'}</span></a>
    </div>
    <div class="hh-stats">
      <div class="glass stat-ring">${ring(overall, 132, 'התקדמות כוללת')}<div class="ring-label"><span class="num">${overall}%</span><small>שלבים שהושלמו</small></div></div>
      <div class="glass stat-grade">
        <span class="sg-label">ציון משוקלל נוכחי</span>
        <span class="sg-val num">${current.toFixed(0)}</span>
        <span class="sg-sub">יעד: <b class="num">75</b> · חסרות <b class="num">${Math.max(0, 75 - current).toFixed(0)}</b> נק׳</span>
        <span class="bar hue-violet"><span style="inline-size:${Math.min(100, current / 75 * 100)}%"></span></span>
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
      <div class="card-title">${ICON.target}<h2>משימה יומית</h2></div>
      <div class="daily-row">
        <div class="mini-ring">${ring(dailyPct, 72, 'משימה יומית')}<span class="num">${dailyPct}%</span></div>
        <div><b>20 דקות למידה</b><p class="muted small">היום: ${fmtTime(today)}. הזמן נמדד רק כששיעור פתוח ואתה פעיל.</p></div>
      </div>
    </div>

    <div class="glass goal">
      <div class="card-title">${ICON.flag}<h2>מחשבון יעד</h2></div>
      <div class="calc-row">
        <label for="g81">ציון יעד בשאלון הראשון (581/571, 60%)</label>
        <input id="g81" type="range" min="40" max="100" step="1" value="${Math.max(g.q81, 75)}">
        <output id="o81" class="num"></output>
      </div>
      <div class="calc-result" id="calcOut" aria-live="polite"></div>
      <p class="fine">המשקל 60/40 אומת למתכונת הישנה. בחדשה הוא ממתין לאימות.</p>
    </div>
  </section>

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
      const need = (75 - 0.6 * x) / 0.4;
      const out = document.getElementById('calcOut');
      if (need > 100) out.innerHTML = `עם <b class="num">${x}</b> צריך <b class="num">${need.toFixed(1)}</b> בשאלון השני. זה בלתי אפשרי, ולכן צריך לשפר גם את הראשון.`;
      else if (need <= 0) out.innerHTML = `עם <b class="num">${x}</b> עוברים את 75 גם בלי השאלון השני.`;
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
  return `<h1>תרגול</h1><p class="lead">כל התרגולים לפי שיעור. שאלות שכבר פתרת מסומנות.</p>
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

const ICON = {
  play: '<svg viewBox="0 0 24 24" class="i"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/></svg>',
  lock: '<svg viewBox="0 0 24 24" class="i"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  check: '<svg viewBox="0 0 24 24" class="i"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  resume: '<svg viewBox="0 0 24 24" class="i"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/></svg>',
  target: '<svg viewBox="0 0 24 24" class="i"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8" fill="currentColor"/></svg>',
  flag: '<svg viewBox="0 0 24 24" class="i"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  layers: '<svg viewBox="0 0 24 24" class="i"><path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/></svg>',
  user: '<svg viewBox="0 0 24 24" class="i"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  mic: '<svg viewBox="0 0 24 24" class="i"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  wave: '<svg viewBox="0 0 24 24" class="i"><path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/></svg>',
};

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
  <div class="warn card"><b>מה עוד לא מאומת.</b> הסיווג מבוסס על כותרות הפרקים בשאלונים רשמיים ועל אתרי הוראה פרטיים. מסמך תוכנית הלימודים הרשמי עדיין לא נבדק סעיף אחר סעיף. כל נושא שמסומן "מקור משני" או "דורש בדיקה" צריך אימות.</div>

  <div class="exam-cards grid-2">
    ${['old', 'new'].map(k => `<div class="card"><h3>${EXAMS[k].name}</h3>${EXAMS[k].papers.map(p => `
      <div class="paper"><div><b class="num">${p.code}</b> <span class="badge ghost">${p.weight}%</span> <span class="conf conf-${p.confidence}">${CONFIDENCE[p.confidence]}</span></div><p>${esc(p.structure)}</p></div>`).join('')}</div>`).join('')}
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
function checkNum(q, raw) {
  const v = parseFloat(String(raw).replace(',', '.').replace('−', '-').trim());
  if (Number.isNaN(v)) return { valid: false };
  const tol = q.tol ?? 0.005;
  const ok = Math.abs(v - q.answer) <= tol + 1e-9;
  let tag = null;
  if (!ok && q.wrong) { const w = q.wrong.find(w => Math.abs(v - w.v) <= Math.max(tol, 0.01)); if (w) tag = w.tag; }
  return { valid: true, ok, tag: tag || 'general', v };
}

function qHTML(q, lessonId, mode, idx) {
  const L = store.get().lessons[lessonId];
  const prev = mode === 'practice' && L && L.answers[q.id];
  const solved = prev && prev.correct;
  const label = q.label ? `סעיף ${q.label}` : `שאלה ${idx + 1}`;
  const input = q.type === 'mc'
    ? `<div class="options" role="radiogroup">${q.options.map((o, i) => `
        <label class="opt"><input type="radio" name="${q.id}" value="${i}" ${solved && o.ok ? 'checked' : ''}><span>${o.t}</span></label>`).join('')}</div>`
    : `<div class="num-input"><input type="text" inputmode="decimal" dir="ltr" aria-label="תשובה" autocomplete="off" ${solved ? `value="${q.answer}"` : ''}></div>`;
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
    if (btn.dataset.act === 'reveal') {
      store.recordAnswer(lesson.id, q.id, false, hintsUsed, true);
      fb.className = 'feedback show-sol';
      fb.innerHTML = `<b>הפתרון:</b> ${q.solution}`; renderMath(fb);
      return;
    }
    // check
    let res;
    if (q.type === 'mc') {
      const sel = card.querySelector('input[type=radio]:checked');
      if (!sel) { fb.className = 'feedback info'; fb.textContent = 'צריך לבחור תשובה.'; return; }
      const o = q.options[+sel.value]; res = { valid: true, ok: !!o.ok, tag: o.tag || 'general' };
    } else {
      res = checkNum(q, card.querySelector('.num-input input').value);
      if (!res.valid) { fb.className = 'feedback info'; fb.textContent = 'צריך לכתוב מספר. אפשר מספר עשרוני, למשל 9.8 או ‎-21.'; return; }
    }
    store.recordAnswer(lesson.id, q.id, res.ok, hintsUsed);
    if (res.ok) {
      card.classList.add('solved');
      fb.className = 'feedback ok';
      fb.innerHTML = `<b>נכון.</b> ${q.solution}`;
    } else {
      store.recordMistake(lesson.id, q.id, res.tag);
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
      let res;
      if (q.type === 'mc') {
        const sel = card.querySelector('input:checked');
        res = sel ? { ok: !!q.options[+sel.value].ok, tag: q.options[+sel.value].tag || 'general' } : { ok: false, tag: 'general' };
      } else {
        res = checkNum(q, card.querySelector('.num-input input').value);
        if (!res.valid) res = { ok: false, tag: 'general' };
      }
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
  const next = lesson.next && LESSON_BY_ID[lesson.next];

  let advice;
  if (quizBest === null) advice = `<p>עוד לא עשית את המבחן הקצר. הוא מה שקובע את רוב רמת השליטה.</p><a class="btn primary" href="#/lesson/${lesson.id}/quiz">למבחן</a>`;
  else if (quizBest >= 80 && ms.score >= 65) advice = `<p>שולט בנושא ברמה טובה. ${next ? 'אפשר להמשיך לשיעור הבא.' : 'זה השיעור האחרון שקיים כרגע. כדאי לחזור על השיעור החלש ביותר.'}</p>${next ? `<a class="btn primary" href="#/lesson/${next.id}">לשיעור הבא: ${esc(next.title)}</a>` : '<a class="btn primary" href="#/">ללוח הבקרה</a>'}`;
  else if (top.length) { const t = lesson.tags[top[0][0]]; advice = `<p>הטעות שחוזרת הכי הרבה: <b>${t.label}</b>. ${t.advice}</p><a class="btn primary" href="#/lesson/${lesson.id}/${t.section}">לחזרה על ${SECTIONS.find(s => s.id === t.section).label}</a>`; }
  else advice = `<p>כדאי לעשות שוב את התרגול העצמאי ואז את המבחן.</p><a class="btn primary" href="#/lesson/${lesson.id}/practice">לתרגול העצמאי</a>`;

  return `
  <div class="card"><h2>רמת שליטה: ${LEVELS[ms.level]}</h2>${meter(ms.score, ms.level)}
    <div class="stats"><div><span class="num big">${ms.score}</span><span class="muted">מתוך 100</span></div>
    <div><span class="num big">${quizBest ?? '—'}</span><span class="muted">ציון מבחן הכי טוב</span></div>
    <div><span class="num big">${fmtTime(L ? L.timeSec : 0)}</span><span class="muted">זמן בשיעור</span></div></div></div>
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
    <thead><tr><th>שיעור</th><th>שליטה</th><th>מבחן הכי טוב</th><th>שלבים</th><th>זמן</th></tr></thead>
    <tbody>${LESSONS.map(l => { const s = lessonState(l); const L = st.lessons[l.id]; return `<tr>
      <td><a href="#/lesson/${l.id}">${esc(l.title)}</a></td><td>${LEVELS[s.level]} <span class="num muted">(${s.score})</span></td>
      <td class="num">${L && L.quiz.best !== null ? L.quiz.best : '—'}</td><td class="num">${s.done}/${s.total}</td><td>${fmtTime(L ? L.timeSec : 0)}</td></tr>`; }).join('')}</tbody>
  </table></div>
  <div class="card"><h2>גיבוי</h2>
    <p>ההתקדמות נשמרת בדפדפן הזה בלבד. כדי להעביר אותה לטלפון או למחשב אחר, מורידים קובץ גיבוי וטוענים אותו שם.</p>
    <div class="q-actions"><button class="btn primary" id="exp">הורדת קובץ גיבוי</button>
      <label class="btn">טעינת קובץ גיבוי<input type="file" id="imp" accept="application/json" hidden></label>
      <button class="btn ghost danger" id="rst">איפוס ההתקדמות</button></div>
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
  document.getElementById('rst').onclick = () => {
    if (confirm('למחוק את כל ההתקדמות? אי אפשר לבטל את זה.')) { store.reset(); route(); }
  };
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
  const parts = (location.hash || '#/').slice(2).split('/');
  currentLesson = null;
  let html, bind = () => {}, nav = parts[0] || 'home';
  if (parts[0] === 'lesson') { html = viewLesson(parts[1], parts[2]); bind = () => bindLesson(parts[1]); nav = 'plan'; }
  else if (parts[0] === 'plan') { html = viewPlan(); bind = bindPlan; }
  else if (parts[0] === 'progress') { html = viewProgress(); bind = bindProgress; }
  else if (parts[0] === 'sources') { html = viewSources(); nav = 'progress'; }
  else if (parts[0] === 'practice') { html = viewPractice(); }
  else if (parts[0] === 'exams') { html = viewExams(); }
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
let lastActivity = Date.now();
['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(ev => addEventListener(ev, () => { lastActivity = Date.now(); }, { passive: true }));
setInterval(() => {
  if (currentLesson && document.visibilityState === 'visible' && Date.now() - lastActivity < 120000) store.addTime(currentLesson, 10);
}, 10000);

addEventListener('hashchange', route);
route();
