---
name: math5-audit
description: "ביקורת מלאה של האפליקציה" — the comprehensive periodic audit, combining exam coverage, math correctness (math-auditor), pedagogy (student-simulator) and system QA (qa-regression) into one report. Use for "/math5-audit" (weekly cadence per docs/quality-standards.md §9) or "full app audit". For a quick targeted math re-check after one change, use /math5-verify instead.
---

# /math5-audit

The heavy, periodic one — don't run this reflexively on every small edit (see `supervisor.md`'s resource-management rules); use `/math5-verify` or `/math5-qa` for a targeted check and save this for the weekly cadence or a genuine "how healthy is the whole project" question.

1. Refresh coverage: `/math5-coverage` (or its underlying `npm run gen:all`).
2. Dispatch `math-auditor` for a full-repo correctness pass: `node tests/validate-content.mjs` + `npm test`, plus an independent re-derivation of every main lesson's quiz/bagrut answers (not a sample).
3. Dispatch `student-simulator` (profile B, the project's real student level, unless told otherwise) on the most recently changed or highest-priority lesson, for a pedagogy check.
4. Dispatch `qa-regression` for the full system checklist (see its agent file) including the solution-leak-channel check.
5. `math-auditor` must never audit content it wrote itself in this same session — a different agent type having written it is fine.
6. Consolidate into one Hebrew report (you can reuse `/math5-report`'s format): coverage (all 4 separate metrics), math findings by severity, pedagogy findings, QA checklist, and an overall verdict per `docs/quality-standards.md` §7 (the 100-point rubric plus its hard-fail gates — a high score never overrides an open CRITICAL finding).
7. Append to `docs/decision-log.md`; update `TASKS.md` for anything that failed. Never mark anything "done" without this cycle's own evidence.
