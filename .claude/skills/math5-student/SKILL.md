---
name: math5-student
description: Dispatches student-simulator (a weak student who only sees the screen) to test a lesson or flow and report a first-person UX/learning verdict. Use for "/math5-student [lesson-id or flow]".
---

# /math5-student [lesson-id or flow]

1. Dispatch the `student-simulator` agent with a concrete target (a lesson id, or a flow like "base check then first recommended lesson"). If none given, pick the most recently integrated/changed lesson from `math5/docs/decision-log.md`.
2. Remind it explicitly in the dispatch prompt: screen only, no source/content reads, report any accidental leak.
3. Wait for the report (Hebrew, first person, with screenshots per its own agent spec).
4. Relay the headline (overall score, would-return-tomorrow, top complaints) to the user, and file any concrete bug it found as a new row in `math5/TASKS.md`.
