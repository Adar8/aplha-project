---
name: math5-plan
description: Updates the MATH 5 curriculum plan (ROADMAP.md's four study tracks and build order) by dispatching curriculum-architect against current coverage data. Use for "/math5-plan" or "update the study plan/curriculum".
---

# /math5-plan

1. Make sure coverage data is fresh (`/math5-coverage` if stale).
2. Dispatch `curriculum-architect` (or, if running as the top-level session, follow its agent file's workflow directly — see the nested-dispatch limitation noted in `supervisor.md`) to: re-read `docs/coverage-matrix.json` (all 4 metrics) and `learning-content/exams/blueprints/` + `eval-reserved/`, re-rank missing lessons by points-unlocked-per-hour with explicit 35582 priority, and update the four tracks (70+/80+/90+/מלא) in `math5/ROADMAP.md` plus `math5/TASKS.md`.
3. Relay the updated roadmap table and the reasoning for any re-ordering to the user in Hebrew.
4. Log the planning decision in `docs/decision-log.md` with its evidence (which coverage numbers, which date).
