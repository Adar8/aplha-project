// שאלוני בגרות רשמיים: נוסח השאלה מהשאלון, תשובות נבדקות, פתרונות של MATH 5.
import { store } from '../store.js';
import { esc, fmt } from '../core/text.js';
import { checkAnswer } from '../core/answers.js';
import { renderMath } from '../ui.js';

export const EXAMS_LIST = [];
export const EXAM_BY_ID = {};
const BASE = 'learning-content/exams/';
const FORMAT = { old: 'מתכונת ישנה', new: 'מתכונת חדשה' };

export async function loadExams(fetchJson = defaultFetch) {
  EXAMS_LIST.length = 0;
  for (const k of Object.keys(EXAM_BY_ID)) delete EXAM_BY_ID[k];
  let manifest;
  try { manifest = await fetchJson(BASE + 'index.json'); } catch { return EXAMS_LIST; }
  const res = await Promise.allSettled(manifest.exams.map(id => fetchJson(`${BASE}${id}.json`)));
  res.forEach(r => { if (r.status === 'fulfilled') { EXAMS_LIST.push(r.value); EXAM_BY_ID[r.value.id] = r.value; } else console.warn('שאלון לא נטען', r.reason); });
  return EXAMS_LIST;
}
async function defaultFetch(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

const partsOf = X => X.questions.flatMap(q => q.parts.map(p => ({ q, p, key: `${q.n}.${p.id}` })));
const stateOf = id => (store.get().exams || {})[id] || { parts: {}, lastQ: null };
const isDone = s => s && (s.status === 'ok' || s.status === 'self-ok');
const qProgress = (X, q) => {
  const S = stateOf(X.id).parts;
  const done = q.parts.filter(p => isDone(S[`${q.n}.${p.id}`])).length;
  const review = q.parts.filter(p => ['wrong', 'review'].includes(S[`${q.n}.${p.id}`]?.status)).length;
  return { done, review, total: q.parts.length };
};

// ---------- כרטיס ברשימת המבחנים ----------
export function examsHubHTML() {
  if (!EXAMS_LIST.length) return '';
  return `<h2 class="x-hub-title">שאלוני בגרות רשמיים</h2>
  <p class="muted small">שאלות מקוריות מבחינות קודמות של משרד החינוך, עם בדיקת תשובות ופתרון מלא לכל סעיף.</p>
  <ul class="hub-list">${EXAMS_LIST.map(X => {
    const all = partsOf(X), S = stateOf(X.id).parts;
    const done = all.filter(x => isDone(S[x.key])).length;
    const pct = Math.round(100 * done / all.length);
    return `<li class="glass hub x-hub">
      <div class="hub-head"><b><span class="num">${esc(X.code)}</span> · ${esc(X.session)}</b>
        <span class="badge x-official">שאלון רשמי</span></div>
      <p class="muted small">${esc(X.title)} · ${FORMAT[X.format]} · ${X.questions.length} שאלות · ${all.length} סעיפים</p>
      <div class="prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="התקדמות בשאלון"><i style="inline-size:${pct}%"></i></div>
      <p class="small"><span class="num">${done}</span> מתוך <span class="num">${all.length}</span> סעיפים נפתרו</p>
      <a class="btn primary" href="#/exam/${X.id}/${stateOf(X.id).lastQ || 1}">${done ? 'להמשיך' : 'להתחיל'}</a></li>`;
  }).join('')}</ul>`;
}

// ---------- מסך שאלון ----------
export function examRoute(id, nRaw) {
  const X = EXAM_BY_ID[id];
  if (!X) return { html: `<div class="card"><h1>השאלון לא נמצא</h1><a class="btn" href="#/exams">לכל המבחנים</a></div>`, bind() {} };
  const n = Math.min(Math.max(parseInt(nRaw, 10) || 1, 1), X.questions.length);
  const q = X.questions.find(x => x.n === n) || X.questions[0];
  store.setExamLast(X.id, q.n);
  const S = stateOf(X.id).parts;
  const ch = X.chapters.find(c => c.questions.includes(q.n));
  const pdf = `${X.source.url}#page=${q.page}`;

  const nav = X.chapters.map(c => `<div class="x-chap"><span class="x-chap-name">${esc(c.title.split(' – ')[0])}</span>
    <div class="x-chips">${c.questions.map(k => {
      const pr = qProgress(X, X.questions.find(z => z.n === k));
      const cls = pr.done === pr.total ? 'done' : pr.done || pr.review ? 'part' : '';
      return `<a class="x-chip ${cls}" href="#/exam/${X.id}/${k}" ${k === q.n ? 'aria-current="page"' : ''} aria-label="שאלה ${k}, ${pr.done} מתוך ${pr.total} סעיפים"><span class="num">${k}</span></a>`;
    }).join('')}</div></div>`).join('');

  const block = b => typeof b === 'string' ? `<p>${fmt(b)}</p>` : figHTML(b);
  const html = `
  <div class="x-wrap">
    <a class="x-back" href="#/exams">→ לכל המבחנים</a>
    <header class="x-head">
      <h1>שאלון <span class="num">${esc(X.code)}</span> · ${esc(X.session)}</h1>
      <div class="x-badges"><span class="badge x-official">שאלון רשמי – ${esc(X.source.publisher)}</span><span class="badge ghost">${FORMAT[X.format]}</span></div>
    </header>
    <details class="card x-info">
      <summary><b>הוראות השאלון ומקור</b></summary>
      <ul>${X.instructions.map(t => `<li>${fmt(t)}</li>`).join('')}</ul>
      ${X.specialNote ? `<p class="x-warn">${fmt(X.specialNote)}</p>` : ''}
      <p class="muted small">${esc(X.source.transcription)}</p>
      <p class="muted small"><b>פתרונות:</b> ${esc(X.solutions.note)}</p>
      <p class="muted small">${esc(X.source.copyright)}</p>
      <a class="btn sm" href="${X.source.url}" target="_blank" rel="noopener">הקובץ המקורי (PDF)</a>
    </details>
    <nav class="x-nav" aria-label="שאלות בשאלון">${nav}</nav>

    <article class="card x-q">
      <div class="x-q-head">
        <h2>שאלה <span class="num">${q.n}</span></h2>
        <span class="muted small">${esc(ch ? ch.title.split(' – ')[1] || ch.title : '')} · <span class="num">${q.points}</span> נק׳ · ${esc(q.topic)}</span>
        <a class="small" href="${pdf}" target="_blank" rel="noopener">עמוד ${q.page} בקובץ המקורי</a>
      </div>
      <div class="x-stem">${q.stem.map(block).join('')}</div>
    </article>

    ${q.parts.map(p => partHTML(X, q, p, S[`${q.n}.${p.id}`])).join('')}

    <div class="x-pager">
      ${q.n > 1 ? `<a class="btn" href="#/exam/${X.id}/${q.n - 1}">→ שאלה ${q.n - 1}</a>` : '<span></span>'}
      ${q.n < X.questions.length ? `<a class="btn primary" href="#/exam/${X.id}/${q.n + 1}">שאלה ${q.n + 1} ←</a>` : `<a class="btn primary" href="#/exams">סיום</a>`}
    </div>
  </div>`;
  return { html, bind: root => bindExam(root, X, q) };
}

function figHTML(f, cls = '') {
  const file = f.figure || f;
  const isSketch = /\.svg$/.test(file);
  return `<figure class="x-fig ${isSketch ? 'x-sketch' : 'x-scan'} ${f.wide ? 'wide' : ''} ${cls}"><img src="${BASE}${file}" alt="${esc(f.alt || 'סקיצה של הגרף')}" loading="lazy"></figure>`;
}

const STATUS_LABEL = { ok: '✓ נכון', 'self-ok': '✓ פתרתי', wrong: 'לא נכון עדיין', review: 'לחזור על זה' };

function partHTML(X, q, p, st) {
  const key = `${q.n}.${p.id}`, a = p.answer;
  let answer;
  if (a?.type === 'numeric') {
    answer = `<div class="num-input">
      <label class="ans-label" for="in-${key}">${a.prompt ? fmt(a.prompt) : 'התשובה הסופית'}${a.unit ? ` (${esc(a.unit)})` : ''}</label>
      <input id="in-${key}" type="text" inputmode="decimal" dir="ltr" placeholder="?" autocomplete="off" ${st?.status === 'ok' ? `value="${+a.value.toFixed(4)}" class="is-correct"` : ''}>
      <span class="hint-line">אפשר להקליד שבר (למשל 4/3) או מספר עשרוני</span></div>`;
  } else if (a?.type === 'mc') {
    answer = `<div class="options" role="radiogroup" aria-label="אפשרויות">${a.options.map((o, i) => `
      <label class="opt"><input type="radio" name="r-${key}" value="${i}" ${st?.status === 'ok' && i === a.correct ? 'checked' : ''}><span>${fmt(o)}</span></label>`).join('')}</div>`;
  } else {
    answer = `<p class="x-open">סעיף פתוח: פתרו במחברת, ואז השוו לפתרון וסמנו אם הצלחתם.</p>`;
  }
  return `
  ${(p.intro || []).length ? `<div class="x-intro">${p.intro.map(t => `<p>${fmt(t)}</p>`).join('')}</div>` : ''}
  <section class="q card x-part ${isDone(st) ? 'solved' : ''}" data-key="${key}" data-pid="${p.id}">
    <div class="q-head"><span class="q-num">סעיף ${esc(p.label)}</span><span class="x-st ${st?.status || ''}">${st ? STATUS_LABEL[st.status] || '' : ''}</span></div>
    <div class="x-ptext">${fmt(p.text)}</div>
    ${p.list ? `<ul class="x-list">${p.list.map(t => `<li>${fmt(t)}</li>`).join('')}</ul>` : ''}
    ${p.figure ? figHTML(p.figure) : ''}
    ${answer}
    <div class="feedback"></div>
    <div class="q-check">${a ? `<button class="btn primary block" data-act="check" ${st?.status === 'ok' ? '' : 'disabled'}>בדיקה</button>` : ''}</div>
    <div class="q-tools"><button class="btn tertiary sm" data-act="solution" aria-expanded="false">הצגת פתרון</button></div>
    <div class="x-sol" hidden>
      ${p.ambiguity ? `<p class="x-warn">${fmt(p.ambiguity)}</p>` : ''}
      <p class="x-final"><b>תשובה:</b> ${fmt(p.final)}</p>
      <ol class="x-steps">${p.solution.map(t => `<li>${fmt(t)}</li>`).join('')}</ol>
      ${p.sketch ? figHTML(p.sketch) : ''}
      <p class="muted small">פתרון של MATH 5 – לא פתרון רשמי.</p>
      ${!a ? `<div class="x-self"><span>איך הלך?</span>
        <button class="btn green sm" data-act="self-ok">פתרתי נכון</button>
        <button class="btn sm" data-act="self-review">צריך לחזור על זה</button></div>` : ''}
    </div>
  </section>`;
}

function feedback(card, kind, html) {
  const fb = card.querySelector('.feedback');
  fb.className = `feedback ${kind}`;
  fb.innerHTML = `<span class="fb-icon" aria-hidden="true">${{ ok: '✓', bad: '✕', info: 'i' }[kind]}</span><div class="fb-body">${html}</div>`;
  const input = card.querySelector('.num-input input');
  if (input) {
    input.classList.toggle('is-correct', kind === 'ok'); input.classList.remove('is-wrong');
    if (kind === 'bad') { void input.offsetWidth; input.classList.add('is-wrong'); }
  }
  card.querySelectorAll('.opt').forEach(o => o.classList.remove('is-correct', 'is-wrong'));
  const sel = card.querySelector('.opt input:checked');
  if (sel && kind !== 'info') sel.closest('.opt').classList.add(kind === 'ok' ? 'is-correct' : 'is-wrong');
  renderMath(fb);
}

function setStatus(card, st) {
  const el = card.querySelector('.x-st');
  el.className = `x-st ${st}`; el.textContent = STATUS_LABEL[st] || '';
  card.classList.toggle('solved', isDone({ status: st }));
}

function bindExam(root, X, q) {
  root.querySelectorAll('.x-part').forEach(card => {
    const p = q.parts.find(z => z.id === card.dataset.pid), key = card.dataset.key, a = p.answer;
    const btn = card.querySelector('[data-act="check"]');
    const input = card.querySelector('.num-input input');
    const read = () => a?.type === 'mc' ? card.querySelector('.opt input:checked')?.value : input?.value;
    card.addEventListener('input', () => { if (btn) btn.disabled = !String(read() ?? '').trim(); });
    card.addEventListener('change', () => { if (btn) btn.disabled = read() === undefined; });
    input?.addEventListener('keydown', e => { if (e.key === 'Enter' && btn && !btn.disabled) btn.click(); });

    btn?.addEventListener('click', () => {
      const raw = read();
      const qq = a.type === 'mc' ? { type: 'mc', options: a.options.map((_, i) => ({ ok: i === a.correct })) } : { answer: a.value, tol: a.tol };
      const res = checkAnswer(qq, raw);
      if (!res.valid) return feedback(card, 'info', 'לא הצלחתי לקרוא את התשובה. הקלידו מספר, למשל <span dir="ltr">0.25</span> או <span dir="ltr">4/3</span>.');
      const prev = stateOf(X.id).parts[key];
      if (res.ok) {
        feedback(card, 'ok', `<b>נכון!</b> ${fmt(p.final)}`);
        store.recordExamPart(X.id, key, { status: 'ok' }); setStatus(card, 'ok');
      } else {
        feedback(card, 'bad', '<b>עוד לא.</b> בדקו את החישוב, או פתחו את הפתרון.');
        if (prev?.status !== 'ok') { store.recordExamPart(X.id, key, { status: 'wrong' }); setStatus(card, 'wrong'); }
      }
    });

    const solBtn = card.querySelector('[data-act="solution"]'), sol = card.querySelector('.x-sol');
    solBtn.addEventListener('click', () => {
      const open = sol.hidden;
      sol.hidden = !open; solBtn.setAttribute('aria-expanded', String(open));
      solBtn.textContent = open ? 'הסתרת הפתרון' : 'הצגת פתרון';
      if (open) {
        renderMath(sol);
        const prev = stateOf(X.id).parts[key];
        store.recordExamPart(X.id, key, { revealed: true, status: prev?.status || (a ? 'review' : undefined) });
        if (!prev?.status && a) setStatus(card, 'review');
      }
    });
    card.querySelectorAll('[data-act="self-ok"],[data-act="self-review"]').forEach(b => b.addEventListener('click', () => {
      const st = b.dataset.act === 'self-ok' ? 'self-ok' : 'review';
      store.recordExamPart(X.id, key, { status: st }); setStatus(card, st);
    }));
  });
}
