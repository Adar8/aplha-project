import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, productAudit, learnerAudit, formatReport } from '../../tools/audit.mjs';

const content = loadContent();
const NOW = new Date('2026-11-25T12:00').getTime();
const DAY = 864e5;
const key = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

test('audit: product coverage is computed from real content', () => {
  const P = productAudit(content, { targetGrade: 80, hoursPerWeek: 7, examDate: '2027-06-01' }, NOW);
  assert.equal(P.lessons.length, content.lessons.length);
  assert.ok(P.coverage.common.total > P.coverage.common.covered);
  const e = P.examCoverage.find(x => x.code === '35581');
  assert.ok(e && e.fullPct + e.partialPct <= 100);
  assert.equal(P.hoursAvailable, P.weeksLeft * 7);
});

test('audit: no progress file → evidence level 0', () => {
  assert.equal(learnerAudit(null, content, NOW), null);
  assert.match(formatReport(productAudit(content, undefined, NOW), null), /רמת ראיה: 0/);
});

test('audit: usage only → level 1; quiz improvement → 2; official exam success → 3', () => {
  const base = { profile: { hoursPerWeek: 7 }, daily: { [key(NOW - DAY)]: 3600, [key(NOW - 2 * DAY)]: 1800 }, attempts: [], lessons: {}, reviews: {}, exams: {} };
  const L1 = learnerAudit(base, content, NOW);
  assert.equal(L1.evidenceLevel, 1);
  assert.equal(L1.activeDays, 2);
  assert.equal(L1.totalHours, 1.5);
  const s2 = { ...base, lessons: { 'arithmetic-sequence': { quiz: { history: [{ score: 40, at: NOW - 9 * DAY }, { score: 85, at: NOW - DAY }] } } } };
  assert.equal(learnerAudit(s2, content, NOW).evidenceLevel, 2);
  const parts = Object.fromEntries(['1.a1', '1.a2', '2.c', '2.d', '3.a'].map(k => [k, { status: 'ok' }]));
  const s3 = { ...s2, exams: { '35581-2024-summer': { parts } } };
  const L3 = learnerAudit(s3, content, NOW);
  assert.equal(L3.evidenceLevel, 3);
  assert.equal(L3.exams[0].autoOk, 5);
});

test('audit: coverage is by skills – an arithmetic-sequence lesson does not cover a geometric-sequence question', () => {
  const P = productAudit(content, undefined, NOW);
  const q2 = P.examCoverage.find(x => x.code === '35581').questions.find(q => q.n === 2);
  assert.equal(q2.frac, 0);
  assert.ok(q2.missing.includes('geometric-sequence'));
});
