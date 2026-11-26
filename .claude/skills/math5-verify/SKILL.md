---
name: math5-verify
description: "ביקורת מתמטית" — dispatches math-auditor for an independent correctness re-check of specific content (usually what changed recently), plus the fast deterministic suite. Use for "/math5-verify [lesson-id]" or "verify the math". For a full comprehensive app audit (coverage + math + pedagogy + system together), use /math5-audit instead.
---

# /math5-verify [lesson-id]

Targeted and fast — the everyday check after a content change. (`/math5-audit` is the heavier, periodic, comprehensive one that also pulls in `qa-regression` and `student-simulator`; don't conflate the two.)

1. From `math5/`: `npm test` (verify-math + validate-content + validate-content.test + unit tests). Capture exact pass/fail counts verbatim.
2. Dispatch `math-auditor` scoped to whatever changed (a `lesson-id` if given, otherwise infer from recent `git log`/`docs/decision-log.md`) for an independent re-derivation pass — not a rerun of the file's own stored checks.
3. Report both verbatim: the suite counts and math-auditor's PASS/FAIL/NOT_TESTED table with severities.
4. Do not fix anything here — a finding becomes a `TASKS.md` item for the owning agent, not something this command patches.
5. If you only need "is the repo currently green" with no fresh independent math re-check, the plain suite run in step 1 alone already answers that — you don't have to wait for step 2 for that narrower question.
