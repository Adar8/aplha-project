// מחולל docs/knowledge-map-status.json: עבור כל מיומנות ב-learning-content/knowledge-map.json,
// מחשב בפועל (לא מניח) אם יש לה שיעור מלמד, אם היא גם מתורגלת בפועל (לא רק מוזכרת בשם),
// באילו שאלוני/שאלות בגרות היא נדרשת, ומה סטטוס הביקורת המתמטית שלה.
// הרצה: node tools/gen-knowledge-map-status.mjs   (מתוך תיקיית math5)
// אל תערכו את docs/knowledge-map-status.json ידנית — הריצו מחדש את הסקריפט הזה אחרי כל שינוי
// ב-knowledge-map.json / covers של שיעור / exam-skills.json / תוכן בחינה.
//
// כלל מחייב (יעד הבדיקה, ראה בקשת המשתמש 26.11.2026):
// "אין לסמן מושג כמכוסה רק משום ששמו מופיע בשיעור". מיומנות נחשבת 'taught_practiced' רק אם:
//   (1) יש שיעור ש-covers שלו מכיל אחד מ-examSkillIds של המיומנות (או, למיומנות יסוד בלי
//       examSkillIds, שיעור-יסוד שה-curriculum-architect אימת ידנית שהוא באמת מתרגל את המושג —
//       ראו EXERCISE_MAP למטה, לא רק "הנושא דומה בשם"), וגם
//   (2) יש לפחות תרגיל אחד מאומת (EXERCISE_MAP, נבדק ידנית מול תוכן השיעור) שבאמת מתרגל אותה,
//       לא רק מילה שמופיעה בטקסט ההסבר.
// אם (1) חסר: 'untaught'. אם (1) יש אבל (2) חסר: 'mentioned_not_practiced' (המלכודת שהמשתמש הזהיר ממנה).

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const C = p => JSON.parse(readFileSync(resolve(ROOT, p), 'utf8'));
const today = new Date().toISOString().slice(0, 10);

// ---------- טעינת תוכן ----------
const km = C('learning-content/knowledge-map.json');
const examSkills = C('learning-content/exam-skills.json').skills;
const mainLessons = C('learning-content/index.json').lessons.map(f => C('learning-content/' + f));
const toolboxIndex = C('learning-content/toolbox.json');
const toolLessons = (toolboxIndex.lessons || []).map(f => C('learning-content/' + f));
const allLessons = [...mainLessons, ...toolLessons];

const examsDir = resolve(ROOT, 'learning-content/exams');
const bpDir = resolve(examsDir, 'blueprints');
const evalDir = resolve(examsDir, 'eval-reserved');
const examIndex = existsSync(resolve(examsDir, 'index.json')) ? C('learning-content/exams/index.json').exams : [];
const fullExams = examIndex.map(id => ({ ...C(`learning-content/exams/${id}.json`), _kind: 'full' }));
const haveFullCode = new Set(fullExams.map(x => x.code));
const loadDir = (dir, kind) => existsSync(dir)
  ? readdirSync(dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(resolve(dir, f), 'utf8')))
    .filter(b => !haveFullCode.has(b.code)).map(b => ({ ...b, _kind: kind }))
  : [];
const exams = [...fullExams, ...loadDir(bpDir, 'blueprint'), ...loadDir(evalDir, 'eval-reserved')];

// ---------- תרגילים מאומתים ידנית (curriculum-architect, 26.11.2026) ----------
// לכל שיעור: אוסף מזהי התרגילים הקיימים בפועל בקובץ (לאימות ש-EXERCISE_MAP לא מתייחס למזהה שאינו קיים),
// ומיפוי examSkillId -> רשימת מזהי תרגילים שנקראו ידנית ואומתו שהם *באמת* מתרגלים את המיומנות הזו
// (לא רק מזכירים אותה). לשיעורי-יסוד עם מיומנות יחידה (ה-covers/concept שלהם הוא אחד) — '*' = כל התרגילים.
const existingExerciseIds = L => {
  const ids = new Set();
  for (const sec of ['examples', 'guidedPractice', 'independentPractice', 'quiz']) (L[sec] || []).forEach(e => ids.add(e.id));
  (L.bagrutQuestions || []).forEach(b => (b.parts || []).forEach(p => ids.add(`${b.id}.${p.id}`)));
  return ids;
};

const EXERCISE_MAP = {
  'arithmetic-sequence': { 'arithmetic-sequence': '*' },
  'geometric-sequence': {
    'geometric-sequence': ['ex1', 'ex2', 'g1', 'g2', 'g3', 'p1', 'p2', 'q1', 'q2', 'q3', 'b1.b1a', 'b1.b1b'],
    'geometric-infinite-sum': ['ex3', 'p3', 'p4', 'q4', 'q5', 'b1.b1c'],
    'sequence-proof': ['ex4', 'ex5', 'ex6', 'g4', 'g5', 'p5', 'p6', 'q6', 'b1.b1d'],
  },
  'derivative-extrema': {
    'poly-derivative': ['ex2', 'g2', 'p1', 'q1', 'q4', 'b1.b1c'],
    'tangent-line': ['ex2', 'p4', 'b1.b1c', 'b1.b1d'],
    'poly-extrema': ['ex1', 'ex3', 'ex4', 'ex5', 'g1', 'g3', 'g4', 'g5', 'p2', 'p3', 'p5', 'p6', 'q2', 'q3', 'q5', 'q6', 'q7', 'b1.b1a', 'b1.b1b'],
  },
  'sine-cosine-law': {
    'cosine-law': ['ex1', 'ex3', 'g1', 'g3', 'p3', 'q1', 'q4', 'q5', 'b1.b1a'],
    'sine-law': ['ex2', 'g2', 'p2', 'p4', 'q2', 'b1.b1b'],
    'circumradius': ['ex2', 'g2', 'q2', 'b1.b1b'],
    'trig-area': ['ex3', 'p1', 'q3', 'b1.b1c', 'b1.b1d'],
  },
  // שיעורי-יסוד (toolbox): כל אחד מלמד מושג יסוד אחד; כל גוף התרגול (g*/q*) שלו שייך לאותו מושג.
  'tb-fractions': '*', 'tb-powers': '*', 'tb-factoring': '*', 'tb-linear-eq': '*', 'tb-quadratic': '*',
  'tb-inequalities': '*', 'tb-systems': '*', 'tb-brackets': '*', 'tb-pythagoras': '*', 'tb-axes': '*',
  'tb-slope': '*', 'tb-intercepts': '*', 'tb-substitution': '*', 'tb-negatives': '*', 'tb-order-ops': '*',
};

function exercisesFor(lessonId, skillKey) {
  const L = allLessons.find(x => x.id === lessonId);
  if (!L) return { exists: false, ids: [], invalid: [] };
  const map = EXERCISE_MAP[lessonId];
  if (map === undefined) return { exists: true, ids: [], invalid: [], unmapped: true };
  let ids;
  if (map === '*') ids = [...existingExerciseIds(L)];
  else ids = map[skillKey] === '*' ? [...existingExerciseIds(L)] : (map[skillKey] || []);
  const real = existingExerciseIds(L);
  const invalid = ids.filter(id => !real.has(id));
  return { exists: true, ids: ids.filter(id => real.has(id)), invalid };
}

// ---------- מה שיעור מלמד בפועל (covers, לא כותרת/תיאור) ----------
const lessonsByExamSkill = {}; // examSkillId -> [lessonId]
for (const L of allLessons) for (const sk of (L.covers || [])) (lessonsByExamSkill[sk] ||= []).push(L.id);

// ---------- איפה המיומנות נדרשת בבחינה (לפי examSkillIds) ----------
function examMatches(examSkillIds) {
  if (!examSkillIds.length) return [];
  const out = [];
  for (const X of exams) {
    for (const q of X.questions) {
      const need = (q.skills || []).filter(s => examSkillIds.includes(s));
      if (need.length) out.push({ code: X.code, session: X.session, kind: X._kind, n: q.n, points: q.points, matchedSkills: need });
    }
  }
  return out;
}

// ---------- בניית הפלט לכל מיומנות ----------
const results = km.skills.map(skill => {
  const examSkillIds = skill.examSkillIds || [];
  const curatedLessons = skill.lessons || [];

  // אימות: כל שיעור שה-knowledge-map טוען שמלמד את המיומנות — חייב להיות אמיתי:
  // אם יש examSkillIds, השיעור חייב לכלול את אחד מהם ב-covers בפועל (לא רק מופיע ב-knowledge-map).
  const verifiedLessons = [];
  const rejectedLessons = [];
  for (const lid of curatedLessons) {
    const L = allLessons.find(x => x.id === lid);
    if (!L) { rejectedLessons.push({ lid, reason: 'lesson-not-found' }); continue; }
    if (examSkillIds.length) {
      const matchedSkill = examSkillIds.find(sk => (L.covers || []).includes(sk));
      if (!matchedSkill) { rejectedLessons.push({ lid, reason: 'covers-does-not-include-examSkillIds' }); continue; }
      verifiedLessons.push({ lessonId: lid, matchedExamSkillId: matchedSkill });
    } else {
      // מיומנות יסוד בלי examSkillIds: אין covers לבדוק מולו, רק EXERCISE_MAP אם קיים
      verifiedLessons.push({ lessonId: lid, matchedExamSkillId: null });
    }
  }

  // תרגילים מאומתים לכל שיעור מאומת
  let exercises = [];
  let mentionedNotPracticed = false;
  for (const vl of verifiedLessons) {
    const key = vl.matchedExamSkillId || skill.id;
    const r = exercisesFor(vl.lessonId, key);
    if (r.invalid && r.invalid.length) rejectedLessons.push({ lid: vl.lessonId, reason: 'EXERCISE_MAP has invalid exercise ids: ' + r.invalid.join(',') });
    if (r.ids.length === 0) mentionedNotPracticed = true;
    exercises.push(...r.ids.map(id => ({ lessonId: vl.lessonId, exerciseId: id })));
  }

  const taughtLessons = verifiedLessons.map(v => v.lessonId);
  let coverageStatus;
  if (taughtLessons.length === 0) coverageStatus = 'untaught';
  else if (exercises.length === 0 || mentionedNotPracticed) coverageStatus = 'mentioned_not_practiced';
  else coverageStatus = 'taught_practiced';

  // ביקורת מתמטית: לפי review.mathCheckedBy של כל שיעור מלמד
  let auditStatus = 'n/a_no_lesson';
  if (taughtLessons.length) {
    const reviewed = taughtLessons.map(lid => allLessons.find(x => x.id === lid)?.review || {});
    auditStatus = reviewed.some(r => (r.mathCheckedBy || []).length > 0) ? 'audited' : 'unaudited';
  }

  const matches = examMatches(examSkillIds);
  const papers = [...new Set(matches.map(m => m.code))];
  const bagrutQuestions = matches.map(m => ({ code: m.code, session: m.session, kind: m.kind, n: m.n, points: m.points, matchedSkills: m.matchedSkills }));

  const openGaps = [];
  if (coverageStatus === 'untaught') {
    openGaps.push(examSkillIds.length
      ? `אין שיעור קיים המלמד מיומנות זו (examSkillIds: ${examSkillIds.join(', ')})`
      : 'אין שיעור יסוד קיים המלמד מיומנות זו');
  }
  if (coverageStatus === 'mentioned_not_practiced') {
    openGaps.push('יש שיעור שאמור ללמד את זה אך אין תרגיל מאומת שבאמת מתרגל אותה — ייתכן שהמושג רק מוזכר בטקסט ההסבר');
  }
  if (rejectedLessons.length) {
    for (const r of rejectedLessons) openGaps.push(`knowledge-map מציין "${r.lid}" כשיעור מלמד אבל: ${r.reason} — נדרש תיקון ב-knowledge-map.json או ב-lesson.covers`);
  }
  const missingPrereqs = (skill.prereqs || []).filter(p => !km.skills.some(s => s.id === p));
  if (missingPrereqs.length) openGaps.push(`prereqs מצביע על מיומנות שלא קיימת ב-knowledge-map: ${missingPrereqs.join(', ')}`);

  return {
    id: skill.id, name: skill.name, area: skill.area, difficulty: skill.difficulty,
    examSkillIds, examSkillNames: examSkillIds.map(sk => examSkills[sk] || sk),
    taughtByLessons: taughtLessons,
    rejectedLessonClaims: rejectedLessons,
    exercisesVerified: exercises,
    papers,
    bagrutQuestionsRequiring: bagrutQuestions,
    coverageStatus,
    auditStatus,
    openGaps,
  };
});

const untaughtRequiredByExam = results.filter(r => r.coverageStatus === 'untaught' && r.bagrutQuestionsRequiring.length > 0)
  .map(r => ({ id: r.id, name: r.name, papers: r.papers, questions: r.bagrutQuestionsRequiring.length }));
const mentionedNotPracticed = results.filter(r => r.coverageStatus === 'mentioned_not_practiced');
const inconsistencies = results.filter(r => r.rejectedLessonClaims.length > 0);

// מיומנויות exam-skills.json שאין להן שום צומת ב-knowledge-map (לא ממופות כלל) — זיהוי אוטומטי נוסף
const mappedExamSkillIds = new Set(km.skills.flatMap(s => s.examSkillIds || []));
const examSkillsWithoutNode = Object.keys(examSkills).filter(id => !mappedExamSkillIds.has(id));
// מתוכן: אילו באמת נדרשות באחד מהשאלונים שנאספו (לא רק קיימות בקטלוג)
const examSkillsWithoutNodeRequired = examSkillsWithoutNode.filter(id => exams.some(X => X.questions.some(q => (q.skills || []).includes(id))));

const out = {
  schemaVersion: 1,
  generatedAt: today,
  generatedBy: 'tools/gen-knowledge-map-status.mjs (מתוך learning-content/knowledge-map.json + exam-skills.json + lessons/*.covers + toolbox/*.covers + exams/*/blueprints/*/eval-reserved/*)',
  note: 'נוצר אוטומטית. אל תערכו ידנית — הריצו מחדש אחרי כל שינוי בתוכן. coverageStatus/auditStatus/openGaps מחושבים מצומת-חוצה אמיתי, לא מהונחתים.',
  summary: {
    totalSkills: results.length,
    untaught: results.filter(r => r.coverageStatus === 'untaught').length,
    mentionedNotPracticed: mentionedNotPracticed.length,
    taughtPracticed: results.filter(r => r.coverageStatus === 'taught_practiced').length,
    audited: results.filter(r => r.auditStatus === 'audited').length,
    unaudited: results.filter(r => r.auditStatus === 'unaudited').length,
  },
  untaughtRequiredByExam,
  mentionedNotPracticedList: mentionedNotPracticed.map(r => ({ id: r.id, name: r.name, lessons: r.taughtByLessons })),
  knowledgeMapInconsistencies: inconsistencies.map(r => ({ id: r.id, name: r.name, issues: r.rejectedLessonClaims })),
  examSkillsWithoutKnowledgeMapNode: examSkillsWithoutNode,
  examSkillsWithoutKnowledgeMapNodeAndRequiredByCollectedExam: examSkillsWithoutNodeRequired,
  skills: results,
};

writeFileSync(resolve(ROOT, 'docs/knowledge-map-status.json'), JSON.stringify(out, null, 2) + '\n');

console.log(`knowledge-map-status.json עודכן: ${out.summary.totalSkills} מיומנויות — ${out.summary.taughtPracticed} נלמדות+מתורגלות, ${out.summary.mentionedNotPracticed} מוזכרות-בלי-תרגול, ${out.summary.untaught} לא נלמדות כלל.`);
console.log(`מתוכן נדרשות ישירות בבחינה שנאספה ולא נלמדות: ${untaughtRequiredByExam.length}.`);
if (inconsistencies.length) console.log(`אזהרה: ${inconsistencies.length} טענות knowledge-map לא עמדו באימות (ראו knowledgeMapInconsistencies).`);
if (examSkillsWithoutNodeRequired.length) console.log(`אזהרה: ${examSkillsWithoutNodeRequired.length} מיומנויות exam-skills.json נדרשות בבחינה שנאספה ואין להן צומת ב-knowledge-map.json: ${examSkillsWithoutNodeRequired.join(', ')}`);
