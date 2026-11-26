---
name: math5-cycle
description: Runs one full supervisor-orchestrated development cycle against TASKS.md/ROADMAP.md — pick top task, build/collect, verify independently, integrate only on green, update all state files. Use for "/math5-cycle" or "advance the project one step".
---

# /math5-cycle

**Confirmed limitation (26.11.2026):** a sub-agent cannot itself dispatch further sub-agents in this environment. A `supervisor` instance launched as a background sub-agent has no working `Agent` tool and cannot spawn `exam-analyst`/`lesson-builder`/etc. — this was empirically confirmed when a dispatched `supervisor` correctly reported the blocker instead of faking success. See `.claude/agents/supervisor.md` for the full note.

**Therefore: do not implement this skill as "dispatch a supervisor sub-agent."** Instead, the session that is currently running this skill (normally the main/top-level session, which does have a live `Agent` tool) follows `supervisor`'s documented workflow **directly, itself**:

1. Before anything, make sure `TASKS.md`/`ROADMAP.md` are current (`/math5-coverage` if coverage looks stale).
2. Read `.claude/agents/supervisor.md`'s "Fixed workflow" section and execute it yourself, step by step: orient (read TASKS/ROADMAP/decision-log/reports, run `node math5/tools/audit.mjs --json`), pick the top open unblocked task, dispatch the correct specialist agent directly via your own `Agent` tool with a concrete bounded spec, never let an agent grade its own output, update state on pass / open a `TASKS.md` entry on fail, report.
3. You may still ask a `supervisor` sub-agent to do the *non-dispatch* parts (reconciling state files, drafting the decision-log entry, recommending the next action) if that's useful, but the actual specialist dispatch must be a call you make yourself.
4. Relay the outcome to the user in Hebrew, in the project's reporting format.
5. This is heavier than `/math5-build` (which only runs the build-lesson pipeline) — `/math5-cycle` can pick ANY top task, including exam collection, audits, or QA, per current priority.
