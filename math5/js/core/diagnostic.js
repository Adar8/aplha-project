// מבחן אבחון מסתגל – לוגיקה טהורה.
// מתחילים בשאלות "בדיקה" על מיומנויות מרכזיות (probes). על כל טעות או דילוג, יורדים לידע המקדים
// של אותה מיומנות (עד שתי רמות), כדי לגלות מאיפה הפער מתחיל.

export const MAX_DEPTH = 2;

export function startDiagnostic(D) {
  return { queue: D.probes.map(s => ({ skill: s, depth: 0 })), asked: [], startedAt: Date.now(), finishedAt: null };
}

function itemFor(D, skill) { return D.items.find(i => i.skill === skill); }

export function nextItem(state, D) {
  if (state.asked.length >= D.maxQuestions) return null;
  while (state.queue.length) {
    const head = state.queue[0];
    if (state.asked.some(a => a.skill === head.skill) || !itemFor(D, head.skill)) { state.queue.shift(); continue; }
    return { ...itemFor(D, head.skill), depth: head.depth };
  }
  return null;
}

// ok: true / false; skipped: "לא יודע"
export function recordAnswer(state, D, K, skill, ok, skipped = false) {
  const head = state.queue.findIndex(q => q.skill === skill);
  const depth = head >= 0 ? state.queue[head].depth : 0;
  if (head >= 0) state.queue.splice(head, 1);
  state.asked.push({ skill, ok: !!ok && !skipped, skipped: !!skipped, depth, ts: Date.now() });
  if ((!ok || skipped) && depth < MAX_DEPTH) {
    const sk = K.skills.find(s => s.id === skill);
    const pre = (sk?.prereqs || []).filter(p => itemFor(D, p) && !state.asked.some(a => a.skill === p) && !state.queue.some(q => q.skill === p));
    state.queue.unshift(...pre.map(p => ({ skill: p, depth: depth + 1 })));   // הידע המקדים נשאל מיד
  }
  if (!nextItem(state, D)) state.finishedAt = Date.now();
  return state;
}

// תוצאה לכל מיומנות: mastered / missing / likely (לא נבדק, אבל מיומנות שתלויה בו הצליחה) / unknown
export function diagnosticResults(state, K, probesOrder = []) {
  const res = {};
  for (const a of state.asked) res[a.skill] = a.ok ? 'mastered' : 'missing';
  const dependents = {};
  for (const s of K.skills) for (const p of s.prereqs || []) (dependents[p] = dependents[p] || []).push(s.id);
  const hasSuccessfulDependent = (id, seen = new Set()) => (dependents[id] || []).some(d => {
    if (seen.has(d)) return false; seen.add(d);
    return res[d] === 'mastered' || hasSuccessfulDependent(d, seen);
  });
  for (const s of K.skills) if (!res[s.id]) res[s.id] = hasSuccessfulDependent(s.id) ? 'likely' : 'unknown';
  return res;
}

// סדר לימוד מומלץ: קודם פערים בידע המקדים (לפי סדר תלות), אחר כך מיומנויות הליבה שנכשלו, לפי סדר החשיבות.
export function recommendedStart(results, K, probesOrder = []) {
  const byId = Object.fromEntries(K.skills.map(s => [s.id, s]));
  const order = [], seen = new Set();
  const visit = id => {
    if (seen.has(id) || !byId[id]) return; seen.add(id);
    (byId[id].prereqs || []).forEach(visit);
    if (results[id] === 'missing') order.push(id);
  };
  [...probesOrder, ...K.skills.map(s => s.id)].forEach(visit);
  const isFoundation = id => byId[id].area === 'foundations';
  return [...order.filter(isFoundation), ...order.filter(id => !isFoundation(id))];
}
