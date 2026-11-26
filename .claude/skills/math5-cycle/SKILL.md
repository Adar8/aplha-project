---
name: math5-cycle
description: Runs one full supervisor-orchestrated development cycle against TASKS.md/ROADMAP.md — pick top task, build/collect, verify independently, integrate only on green, update all state files. Use for "/math5-cycle" or "advance the project one step".
---

# /math5-cycle

Dispatches the `supervisor` agent for one orchestration cycle (its own agent file defines the exact workflow: orient → pick top unblocked task → dispatch the right specialist → never let an agent grade itself → update state on pass, open a task on fail → report).

1. Before dispatching, make sure `TASKS.md`/`ROADMAP.md` are current (`/math5-coverage` if coverage looks stale).
2. Dispatch `supervisor` with the current top-of-`TASKS.md` item as context, and remind it of the hard rule: it may edit only `TASKS.md`, `ROADMAP.md`, `docs/decision-log.md`, `docs/coverage-matrix.json` directly — everything else goes through the owning specialist agent.
3. Relay its report to the user in Hebrew as-is (it already follows the project's reporting format).
4. This is heavier than `/math5-build` (which only runs the build-lesson pipeline) — `/math5-cycle` can pick ANY top task, including exam collection, audits, or QA, per current priority.
