---
name: math5-resume
description: Resumes MATH 5 work from exactly where a prior session/cycle left off — reads TASKS.md/ROADMAP.md/decision-log.md/hook-log.md and git log to reconstruct state before doing anything, instead of re-asking the user to re-explain history. Use for "/math5-resume" or "continue from where we stopped".
---

# /math5-resume

1. Read, in order: `math5/CLAUDE.md`, `math5/TASKS.md`, `math5/ROADMAP.md`, `math5/docs/decision-log.md` (at least the last ~10 entries), `math5/docs/coverage-matrix.json` (`diffFromPrevious` and each metric's `checkedAt`), `math5/docs/reports/` sorted by mtime (newest few), `math5/docs/reports/hook-log.md` tail, and `git -C /home/user/aplha-project log --oneline -15` for the work branch.
2. Reconcile: is there any `IN_PROGRESS` task with no recent evidence (likely interrupted mid-cycle, e.g. by a rate limit)? Is there uncommitted work (`git status`)? Any background agent dispatch that might still be running (check via whatever the harness surfaces, e.g. recent task notifications)?
3. Produce a short Hebrew status: where things stand, what was last verified (with date/evidence), what's `IN_PROGRESS`/`BLOCKED`/`FAILED`, and the single next recommended action per `TASKS.md` priority.
4. Do not re-run checks that are still valid for the current content version just to "be sure" — that's `qa-regression`'s/`math-auditor`'s job on an actual change, not this command's. This command orients; it doesn't re-verify everything from scratch.
5. If asked to continue, proceed with that next action (usually via `/math5-cycle`, `/math5-build`, or `/math5-fix`) rather than just describing it.
