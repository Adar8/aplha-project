---
name: math5-report
description: Writes a consolidated Hebrew progress report (status, coverage, what changed since the last report, open gaps) to math5/docs/reports/. Use for "/math5-report" or "give me a report I can read/share".
---

# /math5-report

1. Run `/math5-status` and `/math5-coverage` first (or their underlying steps directly) to get fresh numbers — never reuse stale numbers from memory.
2. Gather: `docs/coverage-matrix.json` (with `diffFromPrevious`), `docs/exam-catalog.json`, `TASKS.md`, `ROADMAP.md`, the last 2 weeks of `docs/decision-log.md`, and the most recent `docs/reports/student-*.md` / `examinee/grading.md` if any are newer than the last report of this kind.
3. Write `math5/docs/reports/progress-YYYY-MM-DD.md` (Hebrew) with: מצב נוכחי, מה השתנה מאז הדוח הקודם (עם מספרים, לא רק מילים), פערים פתוחים, חסמים, המשימה הבאה.
4. If the user wants a shareable file (PDF), follow the same HTML→PDF pattern used for `docs/reports/bagrut-report-*.html/.pdf` rather than inventing a new format.
5. Never adjust a number to make the trend look better than the data shows — if coverage dropped (e.g. because a measurement bug was fixed), say so and explain why.
