---
name: math5-qa
description: Dispatches qa-regression for a full agent-driven quality sweep — the deterministic test suite plus a live phone/overflow/console sweep and regression checks against named prior bug reports. Heavier than /math5-verify. Use for "/math5-qa [bug-report-path]".
---

# /math5-qa [bug-report-path]

1. Dispatch the `qa-regression` agent. If a prior bug report path is given (e.g. a `docs/reports/student-*.md` or `docs/reports/audit-*.md`), tell it to reproduce each named issue's exact repro steps and give a fixed/still-broken/not-reproducible verdict for each — not a general sweep only.
2. It always also runs `npm test` + `npm run test:e2e` and a phone-width sweep with every solution/example opened (this is how the exam-solution-leak and home-screen-stuck bugs were originally caught).
3. Report in Hebrew: suite counts, the phone-sweep issue table, and the per-prior-bug verdict table.
4. Any new issue found becomes a `math5/TASKS.md` row with an owner (usually `lesson-builder` for content, or flagged to the user for app-code UI issues qa-regression itself may not fix).
