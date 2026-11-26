---
name: math5-fix
description: Works through FAILED/BLOCKED items in TASKS.md — reproduces the failure, dispatches the right owning agent to fix it, then re-runs exactly the check that failed before marking it done. Use for "/math5-fix [task-id]" or "deal with failed/blocked tasks".
---

# /math5-fix [task-id]

1. Read `math5/TASKS.md`. If `task-id` given, work that one; otherwise take the highest-priority `FAILED` item, then the highest-priority `BLOCKED` one if no `FAILED` items exist.
2. Reproduce the failure yourself first (run the exact check that failed) — don't fix based on the old report alone, state might have changed.
3. Dispatch the task's owning agent with the concrete failure (not a vague "fix it"): exact error text, file, repro steps.
4. Once it reports a fix, re-run the **same check that originally failed** (not a different, easier one) — this is what moves the status to `DONE`, never the fix agent's own say-so.
5. If the item is `BLOCKED` on something outside any agent's control (missing verified source, rate limit, missing user approval), say so plainly and don't force a fake fix.
6. Update `TASKS.md` status and append the outcome to `docs/decision-log.md`.
