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

// ---------- לוח בקרה ----------
function viewDashboard() {
  const st = store.get();
  const g = st.grades;
  const current = 0.6 * g.q81 + 0.4 * g.q82;
  const rec = recommend();
  const last = st.lastLesson && LESSON_BY_ID[st.lastLesson];
  const commonCount = TOPICS.filter(t => t.status === 'common').length;

  return `
  <section class="hero">
    <div class="hero-text">
      <h1>הדרך ל-75</h1>
      <p class="lead">היום הציון המשוקלל שלך הוא <b class="num">${current.toFixed(1)}</b>. ה-HIT דורשת 75. הנה כמה צריך בכל שאלון כדי להגיע לשם.</p>
    </div>
    <div class="calc card">
      <div class="calc-row">
        <label for="g81">ציון יעד ב-581 / 571 <small>(60%)</small></label>
        <input id="g81" type="range" min="40" max="100" step="1" value="${Math.max(g.q81, 75)}">
        <output id="o81" class="num"></output>
      </div>
      <div class="calc-result" id="calcOut" aria-live="polite"></div>
      <p class="fine">החישוב מניח משקלות 60/40. במתכונת הישנה זה מאומת. בחדשה המשקל 60/40 מופיע במקור משני וממתין לאימות. אפשרות השילוב בין ציון ישן לחדש עדיין לא אושרה רשמית.</p>
    </div>
  </section>

  <section class="grid-2">
    <div class="card next">
      <h2>${last ? 'להמשיך מאיפה שעצרת' : 'להתחיל ללמוד'}</h2>
      ${last ? `<p><b>${esc(last.title)}</b></p><a class="btn primary" href="#/lesson/${last.id}">לשיעור</a>` :
        `<p><b>${esc(rec.lesson.title)}</b></p><p class="muted">${rec.why}</p><a class="btn primary" href="#/lesson/${rec.lesson.id}">לשיעור הראשון</a>`}
    </div>
    <div class="card">
      <h2>זמן למידה</h2>
      <div class="stats">
        <div><span class="num big">${fmtTime((st.daily[new Date().toISOString().slice(0, 10)]) || 0)}</span><span class="muted">היום</span></div>
        <div><span class="num big">${fmtTime(weekSeconds())}</span><span class="muted">ב-7 הימים האחרונים</span></div>
      </div>
    </div>
  </section>

  ${last ? `<section class="card rec"><h2>מומלץ עכשיו</h2><p><b>${esc(rec.lesson.title)}</b>. ${rec.why}</p><a class="btn" href="#/lesson/${rec.lesson.id}">לשיעור המומלץ</a></section>` : ''}

  <section>
    <div class="section-head"><h2>השיעורים</h2><a href="#/plan">לתוכנית המלאה</a></div>
    <ul class="lesson-list">
      ${LESSONS.map(l => { const s = lessonState(l); return `
        <li><a class="lesson-row card" href="#/lesson/${l.id}">
          <div class="lr-main"><b>${esc(l.title)}</b><span class="muted">${esc(l.summary)}</span>
            <span class="tags"><span class="badge b-common">משותף</span><span class="badge ghost">${l.papers.old} · ${l.papers.new}</span></span></div>
          <div class="lr-side"><span class="lvl">${LEVELS[s.level]}</span>${meter(s.score, s.level)}<span class="muted small">${s.done}/${s.total} שלבים</span></div>
        </a></li>`; }).join('')}
    </ul>
    <p class="muted small">${commonCount} נושאים מסווגים כרגע כמשותפים לשתי המתכונות. ${LESSONS.length} מהם כבר כוללים שיעור מלא.</p>
  </section>`;
}

function bindDashboard() {
  const r = document.getElementById('g81'); if (!r) return;
  const upd = () => {
    const x = +r.value; document.getElementById('o81').textContent = x;
    const need = (75 - 0.6 * x) / 0.4;
    const out = document.getElementById('calcOut');
    if (need > 100) out.innerHTML = `עם <b class="num">${x}</b> בשאלון הראשון צריך <b class="num">${need.toFixed(1)}</b> בשני. זה בלתי אפשרי, ולכן צריך לשפר גם את השאלון הראשון.`;
    else if (need <= 0) out.innerHTML = `עם <b class="num">${x}</b> בשאלון הראשון עוברים את 75 גם בלי השאלון השני.`;
    else out.innerHTML = `עם <b class="num">${x}</b> בשאלון הראשון צריך לפחות <b class="num big">${Math.ceil(need)}</b> בשאלון השני (582 / 572).`;
  };
  r.addEventListener('input', upd); upd();
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
    <p id="ioMsg" class="muted" aria-live="polite"></p></div>`;
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
  else if (parts[0] === 'sources') { html = viewSources(); }
  else { html = viewDashboard(); bind = bindDashboard; nav = 'home'; }
  app.innerHTML = html;
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
