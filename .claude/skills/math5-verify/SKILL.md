---
name: math5-verify
description: Runs the full deterministic test suite (content validator, independent math checks, unit tests, Playwright e2e) and reports pass/fail verbatim — no agent dispatch, fastest way to check "is the repo currently green". Use for "/math5-verify" or "run the tests".
---

# /math5-verify

Deterministic only. This is a thinner, faster check than `/math5-qa` (which dispatches the full `qa-regression` agent with a phone sweep and regression-report cross-check) — use this when you just need to know if the suite passes right now.

1. From `math5/`: `npm test` (verify-math + validate-content + validate-content.test + unit tests). Capture exact pass/fail counts.
2. `npm run test:e2e` (Playwright). Capture exact pass/fail counts and any failing step names.
3. Report both verbatim, in Hebrew framing around the numbers (not translating the test names). If anything failed, show the failing lines, don't summarize them away.
4. Do not fix anything here — if something fails, that's a `math5-audit` or `TASKS.md` item, not something this command patches.
