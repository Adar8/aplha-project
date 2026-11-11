// מסכים חדשים: חזרות מרווחות, מבחן אבחון, מפת ידע, תוכנית שבועית והגדרות לימוד.
import { store, mastery, allQuestions } from '../store.js';
import { LESSONS, LESSON_BY_ID } from '../data/lessons/index.js';
import { TOPICS, STATUS } from '../data/curriculum.js';
import { checkAnswer } from '../core/answers.js';
import { dueReviews, pickReviewQuestions, PASS, INTERVALS } from '../core/schedule.js';
import { startDiagnostic, nextItem, recordAnswer, diagnosticResults, recommendedStart } from '../core/diagnostic.js';
import { weekReport, weeksUntil, recommendations, DAY_NAMES, firstActivity } from '../core/plan.js';
import { adaptQuestion } from '../core/adapter.js';
import { esc, fmt, fmtTime, ring, ICON, recommend, lessonState, renderMath } from '../ui.js';
import { LEVELS } from '../core/mastery.js';

export let KMAP = { areas: [], skills: [] };
export let DIAG = { probes: [], items: [], maxQuestions: 35 };
const SKILL = {};

export async function loadExtraData(fetchJson = defaultFetch, base = 'learning-content/') {
  const [k, d] = await Promise.all([fetchJson(base + 'knowledge-map.json'), fetchJson(base + 'diagnostic.json')]);
  KMAP = k; DIAG = d;
  for (const s of KMAP.skills) SKILL[s.id] = s;
}
async function defaultFetch(url) { const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) throw new Error(`${url}: ${r.status}`); return r.json(); }

const DAY = 86400000;
export function fmtDue(ts) {
  const d0 = new Date(); d0.setHours(0, 0, 0, 0);
  const diff = Math.round((ts - d0.getTime()) / DAY);
  if (diff <= 0) return 'היום';
  if (diff === 1) return 'מחר';
  return `בעוד ${diff} ימים (${new Date(ts).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })})`;
}

export const MASTERY_EXPLAINER = `
  <ul class="how-list">
    <li>כל ניסיון נשמר: תרגול, מבחן, חזרה ואבחון. ראיה ישנה שוקלת פחות (חצי משקל אחרי שבועיים).</li>
    <li>תשובה נכונה בניסיון ראשון בלי רמזים שווה 1, עם רמז 0.5, ואחרי הצגת פתרון 0.</li>
    <li>הציון: 45% דיוק בתרגול, 35% המבחן הקצר <b>האחרון</b> (לא הטוב ביותר), 20% מגוון תרגילים שנפתרו בלי עזרה.</li>
    <li>"שליטה" דורשת ציון 80 ומעלה, לפחות 3 תרגילים שונים בלי עזרה, הצלחה בחזרה 3 ימים או יותר אחרי הלמידה, ומבחן אחרון של 80 ומעלה.</li>
    <li>אם עבר יותר מחודש מההצלחה האחרונה, הרמה יורדת עד שעושים חזרה.</li>
  </ul>`;

// ---------- המלצות ותוכנית ----------
export function nextLessonToStudy() {
  const d = store.get().diagnostic;
  if (d?.results) {
    for (const sid of recommendedStart(d.results, KMAP, DIAG.probes)) {
      const lid = (SKILL[sid]?.lessons || []).find(id => LESSON_BY_ID[id] && lessonState(LESSON_BY_ID[id]).level < 4);
      if (lid) return LESSON_BY_ID[lid];
    }
  }
  return LESSONS.length ? recommend().lesson : null;
}

export function weekSummary(now = Date.now()) {
  const st = store.get();
  return weekReport(st.profile, st.daily, now);
}

export function currentRecommendations(now = Date.now()) {
  const st = store.get();
  return recommendations({
    lastWeek: weekReport(st.profile, st.daily, now, 1),
    firstActivity: firstActivity(st),
    thisWeek: weekReport(st.profile, st.daily, now),
    dueReviews: dueReviews(st.reviews, now).length,
    diagnosticDone: !!st.diagnostic?.finishedAt,
    nextLesson: nextLessonToStudy(),
    weeksLeft: weeksUntil(st.profile.examDate, now),
    lessonsAvailable: LESSONS.length,
    lessonsMastered: LESSONS.filter(l => lessonState(l).level === 4).length,
  });
}

// ---------- חזרות ----------
export function reviewRoute(lessonId) {
  if (lessonId && LESSON_BY_ID[lessonId]) return reviewSession(LESSON_BY_ID[lessonId]);
  const st = store.get(), now = Date.now();
  const due = dueReviews(st.reviews, now).filter(r => LESSON_BY_ID[r.lessonId]);
  const upcoming = Object.entries(st.reviews).filter(([id, r]) => LESSON_BY_ID[id] && !due.some(d => d.lessonId === id)).sort((a, b) => a[1].due - b[1].due);
  const html = `
  <h1>חזרות</h1>
  <p class="lead">חזרה קצרה (4 שאלות) על שיעור שכבר למדת, אחרי יום, 3 ימים, שבוע, שבועיים וחודש. כך החומר נשאר בזיכרון עד הבחינה.</p>
  ${due.length ? `<ul class="hub-list">${due.map(r => { const L = LESSON_BY_ID[r.lessonId]; return `
    <li class="glass hub"><div class="hub-head"><b>${esc(L.title)}</b><span class="score-pill mid">${r.overdueDays ? `באיחור של ${r.overdueDays} ימים` : 'היום'}</span></div>
      <p class="muted small">שלב חזרה ${r.box + 1} מתוך ${INTERVALS.length}. עוברים לשלב הבא עם ${PASS}% ומעלה.</p>
      <a class="btn primary" href="#/review/${L.id}">להתחלת החזרה</a></li>`; }).join('')}</ul>`
    : `<div class="glass empty-state"><b>אין חזרות להיום.</b><p class="muted">שיעור נכנס ללוח החזרות אחרי שעושים בו את המבחן הקצר.</p></div>`}
  ${upcoming.length ? `<h2>בהמשך</h2><ul class="plain-list">${upcoming.map(([id, r]) => `<li><span>${esc(LESSON_BY_ID[id].title)}</span><span class="muted">${fmtDue(r.due)}</span></li>`).join('')}</ul>` : ''}`;
  return { html, bind() {} };
}

function qBlock(q, i) {
  const input = q.type === 'mc'
    ? `<div class="options" role="radiogroup">${q.options.map((o, k) => `<label class="opt"><input type="radio" name="${q.id}" value="${k}"><span>${o.t}</span></label>`).join('')}</div>`
    : `<div class="num-input"><input type="text" inputmode="decimal" dir="ltr" aria-label="תשובה" autocomplete="off">${q.rounding ? `<span class="muted small">עיגול: ${esc(q.rounding)}</span>` : ''}</div>`;
  return `<div class="q card" data-q="${q.id}"><div class="q-head"><span class="q-num">שאלה ${i + 1}</span></div><div class="q-prompt">${q.prompt}</div>${input}<div class="feedback" aria-live="polite"></div></div>`;
}
const readAnswer = (card, q) => q.type === 'mc' ? card.querySelector('input:checked')?.value : card.querySelector('.num-input input').value;

function reviewSession(lesson) {
  const st = store.get(), now = Date.now();
  const atts = st.attempts.filter(a => a.lessonId === lesson.id);
  const qs = pickReviewQuestions(allQuestions(lesson), atts, now, 4);
  const html = `
  <nav class="crumbs"><a href="#/review">חזרות</a><span aria-hidden="true">‹</span><span>${esc(lesson.title)}</span></nav>
  <h1>חזרה: ${esc(lesson.title)}</h1>
  <p class="lead">בלי רמזים. אחרי ההגשה רואים פתרון לכל שאלה.</p>
  <form id="reviewForm">${qs.map(qBlock).join('')}<div class="section-end"><button class="btn primary" type="submit">הגשת החזרה</button></div></form>
  <div id="reviewResult"></div>`;
  return { html, bind() {
    const form = document.getElementById('reviewForm');
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (form.dataset.done) return;
      let correct = 0;
      qs.forEach(q => {
        const card = form.querySelector(`[data-q="${q.id}"]`), fb = card.querySelector('.feedback');
        let res = checkAnswer(q, readAnswer(card, q)); if (!res.valid) res = { ok: false, tag: 'general' };
        store.recordAttempt(lesson.id, q.id, { ok: res.ok, ctx: 'review' });
        if (res.ok) correct++; else store.recordMistake(lesson.id, q.id, res.tag);
        fb.className = `feedback ${res.ok ? 'ok' : 'bad'}`;
        fb.innerHTML = `<b>${res.ok ? 'נכון.' : 'התשובה הנכונה:'}</b> ${q.solution}`;
        renderMath(fb);
      });
      const score = Math.round(100 * correct / qs.length);
      const rev = store.recordReview(lesson.id, score);
      form.dataset.done = '1'; form.querySelector('[type=submit]').disabled = true;
      const out = document.getElementById('reviewResult');
      out.innerHTML = `<div class="card result ${score >= PASS ? 'good' : 'mid'}"><span class="num huge">${score}</span>
        <p>${score >= PASS ? `עברת לשלב חזרה ${rev.box + 1}.` : 'חוזרים לשלב הראשון. זה נורמלי – החזרה הבאה מחר.'} החזרה הבאה: ${fmtDue(rev.due)}.</p>
        <a class="btn primary" href="#/review">לחזרות</a> <a class="btn" href="#/lesson/${lesson.id}/review">לרמת השליטה בשיעור</a></div>`;
      out.scrollIntoView({ block: 'center' });
    });
  } };
}

// ---------- מבחן אבחון ----------
export function diagnosticRoute() {
  const d = store.get().diagnostic;
  if (d?.finishedAt) return diagnosticResultsView(d);
  if (d?.state) return diagnosticQuestion(d);
  const html = `
  <h1>מבחן אבחון</h1>
  <p class="lead">כ-25–35 שאלות קצרות, בערך 45 דקות. המטרה היא לגלות מאיפה כדאי להתחיל, לא לקבל ציון.</p>
  <div class="glass prose">
    <ul>
      <li>מתחילים בשאלות על הנושאים המרכזיים בבחינה. כשתשובה שגויה, המבחן יורד לידע המקדים של אותו נושא.</li>
      <li>אם לא יודעים – לוחצים "לא יודע". זה עדיף על ניחוש, כי ניחוש מטעה את האבחון.</li>
      <li>אפשר לעצור באמצע ולהמשיך אחר כך. ההתקדמות נשמרת.</li>
      <li>מחשבון רגיל מותר, כמו בבחינה.</li>
    </ul>
    <p class="muted small">כל השאלות נכתבו לאבחון (מקוריות), וכל תשובה נבדקה בחישוב חוזר.</p>
    <button class="btn primary xl" id="diagStart">להתחלת האבחון</button>
  </div>`;
  return { html, bind() {
    document.getElementById('diagStart').onclick = () => { store.setDiagnostic({ state: startDiagnostic(DIAG), results: null, finishedAt: null }); location.hash = '#/diagnostic'; window.dispatchEvent(new HashChangeEvent('hashchange')); };
  } };
}

function diagnosticQuestion(d) {
  const item = nextItem(d.state, DIAG);
  if (!item) { finishDiagnostic(d); return diagnosticResultsView(store.get().diagnostic); }
  const q = adaptQuestion(item);
  const asked = d.state.asked.length;
  const estTotal = Math.min(DIAG.maxQuestions, Math.max(DIAG.probes.length, asked + d.state.queue.length));
  const pct = Math.round(100 * asked / estTotal);
  const area = KMAP.areas.find(a => a.id === SKILL[item.skill]?.area)?.name || '';
  const html = `
  <div class="diag-top"><span class="muted small">שאלה <span class="num">${asked + 1}</span> · ${esc(area)}</span><span class="bar"><span style="inline-size:${pct}%"></span></span></div>
  <form id="diagForm">${qBlock(q, asked).replace('שאלה ' + (asked + 1), esc(SKILL[item.skill]?.name || ''))}
    <div class="q-actions"><button class="btn primary" type="submit">לשאלה הבאה</button><button class="btn" type="button" id="diagSkip">לא יודע</button>
    <a class="btn ghost" href="#/">עצירה – אמשיך אחר כך</a></div></form>`;
  return { html, bind() {
    const form = document.getElementById('diagForm');
    const go = (skipped) => {
      const card = form.querySelector('.q');
      const res = checkAnswer(q, readAnswer(card, q));
      if (!skipped && !res.valid) { const fb = card.querySelector('.feedback'); fb.className = 'feedback info'; fb.textContent = q.type === 'mc' ? 'צריך לבחור תשובה, או ללחוץ "לא יודע".' : 'צריך לכתוב מספר, או ללחוץ "לא יודע".'; return; }
      const ok = !skipped && res.ok;
      store.recordAttempt('diagnostic', item.id, { ok, ctx: 'diagnostic' });
      store.set(s => { recordAnswer(s.diagnostic.state, DIAG, KMAP, item.skill, ok, skipped); });
      const cur = store.get().diagnostic;
      if (cur.state.finishedAt) finishDiagnostic(cur);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    };
    form.addEventListener('submit', e => { e.preventDefault(); go(false); });
    document.getElementById('diagSkip').onclick = () => go(true);
    form.querySelector('input')?.focus();
  } };
}

function finishDiagnostic(d) {
  const results = diagnosticResults(d.state, KMAP, DIAG.probes);
  store.setDiagnostic({ ...d, state: { ...d.state, finishedAt: d.state.finishedAt || Date.now() }, results, finishedAt: Date.now() });
}

const STATE_LABEL = { mastered: 'שולט', likely: 'כנראה שולט', learning: 'בתהליך', missing: 'פער', unknown: 'לא נבדק' };

function diagnosticResultsView(d) {
  const r = d.results;
  const counts = { mastered: 0, missing: 0, likely: 0 };
  d.state.asked.forEach(a => { counts[a.ok ? 'mastered' : 'missing']++; });
  const start = recommendedStart(r, KMAP, DIAG.probes).slice(0, 8);
  const html = `
  <h1>תוצאות האבחון</h1>
  <p class="lead">ענית על ${d.state.asked.length} שאלות: ${counts.mastered} נכונות, ${counts.missing} שגויות או "לא יודע". זה לא ציון – זו מפה של מאיפה להתחיל.</p>
  <div class="glass"><div class="card-title">${ICON.compass}<h2>מאיפה להתחיל</h2></div>
    ${start.length ? `<ol class="start-list">${start.map(id => { const s = SKILL[id]; const lid = (s.lessons || []).find(l => LESSON_BY_ID[l]); return `
      <li><div><b>${esc(s.name)}</b><span class="muted small">${s.area === 'foundations' ? 'ידע מקדים' : esc(KMAP.areas.find(a => a.id === s.area)?.name || '')}</span></div>
      ${lid ? `<a class="btn small-btn" href="#/lesson/${lid}">לשיעור</a>` : '<span class="badge b-check">שיעור בהכנה</span>'}</li>`; }).join('')}</ol>`
      : '<p>לא נמצאו פערים בנושאים שנבדקו. כדאי להמשיך לפי סדר השיעורים ולעבור לשאלות בגרות.</p>'}
  </div>
  ${mapHTML(r)}
  <div class="section-end"><button class="btn ghost" id="diagRedo" data-armed="0">אבחון חדש</button></div>`;
  return { html, bind() {
    const b = document.getElementById('diagRedo');
    b.onclick = () => {
      if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = 'לחיצה נוספת תתחיל אבחון חדש'; return; }
      store.setDiagnostic(null); window.dispatchEvent(new HashChangeEvent('hashchange'));
    };
  } };
}

// ---------- מפת ידע ----------
function skillStates(diagResults) {
  const out = {};
  for (const s of KMAP.skills) {
    let st = diagResults?.[s.id] || 'unknown';
    const lid = (s.lessons || []).find(id => LESSON_BY_ID[id]);
    if (lid) {
      const lv = lessonState(LESSON_BY_ID[lid]).level;
      if (lv >= 3) st = 'mastered'; else if (lv >= 1 && st !== 'mastered') st = 'learning';
    }
    out[s.id] = st;
  }
  return out;
}

function mapHTML(diagResults) {
  const states = skillStates(diagResults);
  const topicOf = id => TOPICS.find(t => t.id === id);
  return `<div class="legend">${Object.entries(STATE_LABEL).map(([k, v]) => `<span class="sk-dot st-${k}">${v}</span>`).join('')}</div>
  ${KMAP.areas.map(a => {
    const skills = KMAP.skills.filter(s => s.area === a.id);
    return `<section class="glass map-area"><h2>${esc(a.name)}</h2><ul class="skill-list">${skills.map(s => {
      const t = topicOf(s.topic);
      const exam = s.topic === 'foundations' ? 'ידע מקדים' : t ? `${STATUS[t.status].label}${t.old ? ` · ${t.old}` : ''}${t.new ? ` · ${t.new}` : ''}` : '';
      const lid = (s.lessons || []).find(id => LESSON_BY_ID[id]);
      return `<li class="skill st-${states[s.id]}">
        <div class="sk-main"><b>${lid ? `<a href="#/lesson/${lid}">${esc(s.name)}</a>` : esc(s.name)}</b><span class="sk-state">${STATE_LABEL[states[s.id]]}</span></div>
        <div class="sk-meta">${esc(exam)}${s.prereqs.length ? ` · צריך לפני: ${s.prereqs.map(p => esc(SKILL[p]?.name || p)).join(', ')}` : ''}</div></li>`;
    }).join('')}</ul></section>`;
  }).join('')}`;
}

export function viewMap() {
  const d = store.get().diagnostic;
  return `<h1>מפת ידע</h1>
  <p class="lead">${KMAP.skills.length} מיומנויות, והקשרים ביניהן: לכל מיומנות כתוב מה צריך לדעת לפניה. הצבע מתעדכן לפי האבחון ולפי רמת השליטה בשיעורים.</p>
  ${d?.finishedAt ? '' : `<div class="glass next-steps"><b>עוד לא עשית אבחון.</b> <a href="#/diagnostic">למבחן האבחון</a> – כדי שהמפה תראה איפה אתה עומד.</div>`}
  ${mapHTML(d?.results)}`;
}

// ---------- תוכנית שבועית ----------
export function viewWeek() {
  const st = store.get(), P = st.profile, now = Date.now();
  const wk = weekReport(P, st.daily, now);
  const first = firstActivity(st);
  const past = [1, 2, 3, 4].map(o => weekReport(P, st.daily, now, o)).filter(w => first && w.start + 7 * DAY > first);
  const weeksLeft = weeksUntil(P.examDate, now);
  const recs = currentRecommendations(now);
  const due = dueReviews(st.reviews, now).filter(r => LESSON_BY_ID[r.lessonId]);
  const next = nextLessonToStudy();
  const maxBar = Math.max(30, ...wk.days.map(d => Math.max(d.plannedMin, d.actualMin)));
  const sessions = wk.days.filter(d => d.plannedMin);
  const fmtD = ts => new Date(ts).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' });
  return `
  <h1>תוכנית שבועית</h1>
  <p class="lead">${P.hoursPerWeek} שעות בשבוע, ב-${sessions.length} מפגשים. ${weeksLeft !== null ? `עד הבחינה (${new Date(P.examDate).toLocaleDateString('he-IL')}, הערכה): כ-${weeksLeft} שבועות.` : ''}</p>
  <section class="glass">
    <div class="section-head"><div class="card-title">${ICON.calendar}<h2>השבוע, מ-${fmtD(wk.start)} עד ${fmtD(wk.start + 6 * DAY)}</h2></div><span class="num big">${wk.pct}%</span></div>
    <div class="week-bars" role="img" aria-label="דקות מתוכננות מול בפועל לכל יום">
      ${wk.days.map(d => `<div class="wb-day ${d.future ? 'future' : ''}">
        <div class="wb-cols"><span class="wb-plan" style="block-size:${100 * d.plannedMin / maxBar}%"></span><span class="wb-act" style="block-size:${100 * d.actualMin / maxBar}%"></span></div>
        <span class="wb-num num">${d.actualMin}${d.plannedMin ? `/${d.plannedMin}` : ''}</span><span class="wb-name">${d.name}</span></div>`).join('')}
    </div>
    <p class="legend-inline"><span class="lg-plan">מתוכנן</span><span class="lg-act">בפועל</span> · בדקות. נמדד רק כששיעור, חזרה או אבחון פתוחים ויש פעילות.</p>
  </section>
  <section class="grid-2">
    <div class="glass"><div class="card-title">${ICON.compass}<h2>מה לעשות השבוע</h2></div>
      <ol class="todo-list">
        ${!st.diagnostic?.finishedAt ? '<li><a href="#/diagnostic">מבחן אבחון</a> <span class="muted">(כ-45 דק׳, פעם אחת)</span></li>' : ''}
        ${due.map(r => `<li><a href="#/review/${r.lessonId}">חזרה: ${esc(LESSON_BY_ID[r.lessonId].title)}</a> <span class="muted">(כ-15 דק׳)</span></li>`).join('')}
        ${next ? `<li><a href="#/lesson/${next.id}">שיעור: ${esc(next.title)}</a> <span class="muted">(כ-${next.minutes} דק׳)</span></li>` : ''}
        <li><a href="#/practice">תרגול ושאלות ברמת בגרות</a> <span class="muted">(את שאר הזמן)</span></li>
      </ol>
      <p class="muted small">חלוקה מומלצת: כ-50% חומר חדש, 30% תרגול ושאלות בגרות, 20% חזרות.</p>
    </div>
    <div class="glass"><div class="card-title">${ICON.flag}<h2>המלצות</h2></div>
      <ul class="rec-list">${recs.map(r => `<li class="rec-${r.kind}">${r.href ? `<a href="${r.href}">${esc(r.text)}</a>` : esc(r.text)}</li>`).join('') || '<li>אין המלצות מיוחדות. ממשיכים לפי התוכנית.</li>'}</ul>
    </div>
  </section>
  <section class="glass"><h2>שבועות קודמים</h2>
    ${!past.length ? '<p class="muted">עוד אין שבועות קודמים. הטבלה תתמלא מהשבוע הבא.</p>' : `<div class="table-wrap"><table><thead><tr><th>שבוע</th><th>מתוכנן</th><th>בפועל</th><th>ביצוע</th></tr></thead>
    <tbody>${past.map(w => `<tr><td>${fmtD(w.start)}</td><td class="num">${w.plannedMin} דק׳</td><td class="num">${w.actualMin} דק׳</td><td class="num">${w.pct}%</td></tr>`).join('')}</tbody></table></div>`}
  </section>
  <p><a href="#/progress#settings">לשינוי שעות, ימי לימוד ותאריך בחינה</a></p>`;
}

// ---------- הגדרות לימוד ----------
export function settingsHTML() {
  const st = store.get(), P = st.profile;
  return `<section class="card" id="settings"><div class="card-title">${ICON.settings}<h2>הגדרות לימוד</h2></div>
  <form id="settingsForm" class="settings-grid">
    <label>שם<input id="s-name" value="${esc(st.name || '')}" maxlength="20" autocomplete="given-name"></label>
    <label>ציון יעד<input id="s-target" type="number" min="55" max="100" value="${P.targetGrade}"></label>
    <label>ציון עבר בשאלון ראשון (581)<input id="s-g1" type="number" min="0" max="100" value="${P.grades.q1}"></label>
    <label>ציון עבר בשאלון שני (582)<input id="s-g2" type="number" min="0" max="100" value="${P.grades.q2}"></label>
    <label>שעות לימוד בשבוע<input id="s-hours" type="number" min="1" max="30" step="0.5" value="${P.hoursPerWeek}"></label>
    <label>תאריך בחינה משוער<input id="s-exam" type="date" value="${esc(P.examDate)}"></label>
    <label>מתכונת<select id="s-format">
      ${[['undecided', 'עדיין לא הוכרע'], ['old', 'ישנה (581/582)'], ['new', 'חדשה (571/572)']].map(([v, l]) => `<option value="${v}" ${P.format === v ? 'selected' : ''}>${l}</option>`).join('')}
    </select></label>
    <fieldset class="days"><legend>ימי לימוד</legend>${DAY_NAMES.map((n, i) => `<label class="day-chk"><input type="checkbox" value="${i}" ${P.sessionDays.includes(i) ? 'checked' : ''}><span>${n}</span></label>`).join('')}</fieldset>
    <div class="settings-actions"><button class="btn primary" type="submit">שמירת ההגדרות</button><span id="s-msg" class="muted" aria-live="polite"></span></div>
  </form></section>`;
}

export function bindSettings(rerender) {
  const f = document.getElementById('settingsForm'); if (!f) return;
  f.addEventListener('submit', e => {
    e.preventDefault();
    const num = (id, min, max, def) => { const v = parseFloat(document.getElementById(id).value); return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def; };
    const days = [...f.querySelectorAll('.days input:checked')].map(i => +i.value);
    const msg = document.getElementById('s-msg');
    if (!days.length) { msg.textContent = 'צריך לבחור לפחות יום לימוד אחד.'; return; }
    store.set(s => {
      s.name = document.getElementById('s-name').value.trim();
      const P = s.profile;
      P.targetGrade = num('s-target', 55, 100, 80);
      P.grades = { q1: num('s-g1', 0, 100, 58), q2: num('s-g2', 0, 100, 43) };
      P.hoursPerWeek = num('s-hours', 1, 30, 7);
      P.examDate = document.getElementById('s-exam').value || P.examDate;
      P.format = document.getElementById('s-format').value;
      P.sessionDays = days;
    });
    msg.textContent = 'נשמר.';
  });
  if (location.hash.endsWith('#settings')) document.getElementById('settings').scrollIntoView();
}
