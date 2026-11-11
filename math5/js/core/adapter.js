// ממיר שיעור בפורמט JSON (learning-content) למבנה שהממשק מציג.
import { fmt } from './text.js';

const SECTION = { explanations: 'explain', video: 'video', examples: 'examples', guidedPractice: 'guided',
  independentPractice: 'practice', bagrutQuestions: 'bagrut', quiz: 'quiz' };

function blockHTML(b) {
  switch (b.type) {
    case 'text': return `<p>${fmt(b.text)}</p>`;
    case 'warning': return `<p class="callout">${fmt(b.text)}</p>`;
    case 'tip': return `<p class="tip">${fmt(b.text)}</p>`;
    case 'formula': return `<div class="formula">$$${b.latex}$$</div>`;
    case 'list': return `<ul>${b.items.map(t => `<li>${fmt(t)}</li>`).join('')}</ul>`;
    default: return '';
  }
}

function solutionHTML(sol) {
  if (!sol) return '';
  const steps = sol.steps || [];
  const body = steps.length > 1 ? `<ol class="sol-steps">${steps.map(s => `<li>${fmt(s)}</li>`).join('')}</ol>` : (steps[0] ? fmt(steps[0]) : '');
  const final = sol.final ? ` <span class="sol-final">${fmt(sol.final)}</span>` : '';
  return steps.length > 1 ? body + `<p class="sol-final-row">תשובה:${final}</p>` : body + (sol.final && !String(steps[0] || '').includes(sol.final) ? ` תשובה:${final}` : '');
}

export function adaptQuestion(q, inherited) {
  const src = q.source || inherited || { type: 'original' };
  const out = {
    id: q.id, label: q.label, prompt: fmt(q.prompt), hints: (q.hints || []).map(fmt), solution: solutionHTML(q.solution),
    source: src.type, sourceRef: src, difficulty: q.difficulty,
  };
  if (q.type === 'multipleChoice') {
    out.type = 'mc';
    out.options = q.choices.map(c => ({ t: fmt(c.text), ok: !!c.correct, tag: c.mistake }));
  } else {
    out.type = 'num';
    out.answer = q.answer.value;
    out.tol = q.answer.tolerance || 0;
    out.rounding = q.answer.rounding;
    out.wrong = (q.commonWrongAnswers || []).map(w => ({ v: w.value, tag: w.mistake }));
  }
  return out;
}

export function adaptLesson(J) {
  return {
    id: J.id, title: J.title, topic: J.topic, topicStatus: J.topicStatus,
    papers: { old: (J.papers.old || []).join(' / ') || '—', new: (J.papers.new || []).join(' / ') || '—' },
    paperList: [...(J.papers.old || []), ...(J.papers.new || [])],
    minutes: J.estimatedMinutes, summary: J.summary, reviewStatus: J.review?.status,
    explain: J.explanations.map(e => ({ id: e.id, h: fmt(e.title), body: e.blocks.map(blockHTML).join('') })),
    formulas: J.formulas || [],
    video: { status: J.video.status, note: J.video.note || '', links: J.video.links.map(l => ({ label: l.label, url: l.url, kind: l.kind, verified: l.verified })) },
    examples: J.examples.map(ex => ({ title: ex.title, problem: fmt(ex.problem), steps: ex.steps.map(fmt), answer: fmt(ex.answer) })),
    guided: J.guidedPractice.map(q => adaptQuestion(q)),
    practice: J.independentPractice.map(q => adaptQuestion(q)),
    bagrut: J.bagrutQuestions.map(b => ({ id: b.id, title: b.title, source: b.source.type, sourceRef: b.source, context: `<p>${fmt(b.context)}</p>`, parts: b.parts.map(q => adaptQuestion(q, b.source)) })),
    quiz: J.quiz.map(q => adaptQuestion(q)),
    tags: Object.fromEntries(J.commonMistakes.map(m => [m.id, { label: fmt(m.label), advice: fmt(m.advice), section: SECTION[m.reviewSection] || 'explain' }])),
    next: J.next ?? null,
  };
}
