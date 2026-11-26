---
name: math5-status
description: Prints a consolidated Hebrew status of the MATH 5 project — TASKS.md, ROADMAP.md, coverage, recent decisions, recent reports. Use for "/math5-status" or "what's the state of MATH 5 right now".
---

# /math5-status

Read-only. Does not run tests, does not dispatch agents, does not change any file.

1. Read `math5/TASKS.md`, `math5/ROADMAP.md`, the last 10 lines of `math5/docs/decision-log.md`, and `math5/docs/coverage-matrix.json` (its `diffFromPrevious` field especially).
2. List files in `math5/docs/reports/` sorted by mtime, newest first — name the 3 most recent.
3. Run `git -C math5 log --oneline -8` for recent commits touching math5.
4. Report in Hebrew, short and scannable:
   - כיסוי נוכחי (מיומנויות לכל שאלון, נושאים, שעות תוכן) + ההפרש מהריצה הקודמת אם יש.
   - משימות פתוחות מ-TASKS.md לפי עדיפות (P0 קודם), עם סוכן אחראי וסטטוס.
   - החלטה אחרונה אחת-שתיים מה-decision-log.
   - 3 הדוחות האחרונים (שם + תאריך).
   - המלצה חד-משמעית: מה הצעד הבא (מצטט TASKS.md/ROADMAP.md, לא ממציא).
