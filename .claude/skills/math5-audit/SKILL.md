---
name: math5-audit
description: Dispatches math-auditor to independently re-verify the mathematical correctness of MATH 5 content (one lesson, or all of it). Use for "/math5-audit [lesson-id]" or "run a math audit".
---

# /math5-audit [lesson-id]

1. If `lesson-id` given: dispatch the `math-auditor` agent to independently re-derive every numeric answer in `math5/learning-content/lessons/<id>.json` or `math5/learning-content/toolbox/<id>.json` (whichever exists), from scratch — not by trusting the stored `check`/`tests/verify/<id>.mjs`.
2. If no argument: dispatch `math-auditor` for a full-repo pass — `node tests/validate-content.mjs` + `npm test`, plus an independent spot-check of every main lesson's quiz answers (at minimum).
3. `math-auditor` must never be the agent that wrote the content under audit — if the content was written in this same session by `lesson-builder` moments ago, that's fine (different agent type); refuse only if you'd literally be asking the same agent to check its own prior output.
4. Wait for the report, then:
   - append one line to `math5/docs/decision-log.md` (date, scope, verdict, evidence path),
   - surface the ✓/✗ table to the user in Hebrew, verbatim where it matters,
   - if any ✗, open/update a `math5/TASKS.md` entry and do NOT mark anything "done".
