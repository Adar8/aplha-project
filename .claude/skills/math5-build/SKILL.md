---
name: math5-build
description: Runs one full build cycle for the next (or a named) roadmap lesson — lesson-builder writes it, math-auditor and qa-regression check it independently, curriculum-architect integrates only if both pass. Use for "/math5-build [lesson-id]" or "build the next lesson".
---

# /math5-build [lesson-id]

This is the only path by which new lesson content should be added — it enforces the mandatory gate in `math5/docs/quality-standards.md` §1 end to end, so no step gets skipped.

1. Read `math5/ROADMAP.md` and `math5/TASKS.md`. If `lesson-id` not given, pick the top `P0`/`P1` item whose dependencies are met.
2. Dispatch `lesson-builder` with a concrete spec: topic, exact `covers` skill ids (from `exam-skills.json`), level, and example question shapes (copy from the roadmap entry / the relevant exam blueprint's `skills`+`summary`).
3. When it reports `node tools/check-lesson.mjs` passing, dispatch BOTH, not either:
   - `math-auditor` — independent re-derivation of every answer, not a rerun of the builder's own `tests/verify/<id>.mjs`.
   - `qa-regression` — after a dry-run integration (or once `curriculum-architect` has wired it in), the phone/overflow/console sweep and full `npm run test:e2e`.
4. Only if BOTH come back clean: dispatch `curriculum-architect` to run `tools/integrate-lesson.mjs <id>` and re-run `npm test`.
5. If either check fails: do not integrate. Update `math5/TASKS.md` with the exact failure, assign back to `lesson-builder`, and stop — don't retry silently in a loop within this one cycle.
6. On success: `node tools/gen-coverage-matrix.mjs` + `node tools/gen-curriculum-map.mjs`, one line in `docs/decision-log.md`, mark the `TASKS.md` row done with the evidence (test output), and report in Hebrew what the lesson now unlocks (cite the roadmap's point estimate).
