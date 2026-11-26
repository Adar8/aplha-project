---
name: math5-coverage
description: Refreshes and prints MATH 5's coverage numbers (skill-based exam coverage per paper, curriculum topic coverage, toolbox coverage) with the diff vs. the previous run. Use for "/math5-coverage" or "what's our coverage right now".
---

# /math5-coverage

Deterministic only — no agent dispatch, no content changes.

1. From `math5/`: `npm run gen:all` (regenerates `docs/coverage-matrix.json`, `docs/curriculum-map.json`, `docs/exam-catalog.json`; appends one line to `docs/coverage-history.jsonl`).
2. Read the fresh `docs/coverage-matrix.json`, especially `diffFromPrevious`.
3. Report in Hebrew, with the numbers exactly as printed (never rounded up or softened):
   - per paper: % מיומנויות מכוסות, % נקודות מכוסות במלואן, שאלות בלי אף מיומנות שנלמדת — ומה ההפרש מהריצה הקודמת.
   - נושאי תוכנית הלימודים: X/Y עם שיעור.
   - ארגז כלים: X/Y נושאים עם שיעור.
   - אם `diffFromPrevious` is `null` (first run today), say so plainly instead of inventing a trend.
4. Never change the measurement method to make a number look better — if something looks off, say so and flag it for `curriculum-architect`/`exam-analyst`, don't silently adjust the script.
