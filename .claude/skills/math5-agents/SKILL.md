---
name: math5-agents
description: Lists the MATH 5 agent roster and their roles/status — not a dispatch command. Use for "/math5-agents" or "which agents exist and what do they do".
---

# /math5-agents

Read-only. Does not dispatch anyone.

List, for each of the 8 standing agents (`.claude/agents/{exam-analyst,curriculum-architect,lesson-builder,math-auditor,student-simulator,independent-examiner,qa-regression,supervisor}.md`): its one-line role, its model (opus/sonnet, from frontmatter), whether it has been smoke-tested with real evidence (check `docs/decision-log.md`/`docs/reports/` for its name), and the date of its last real run if findable.

Also note the 4 legacy agents (`math5-builder`, `math5-evaluator`, `math5-student`, `math5-examinee`) as superseded-but-kept-for-compatibility — the 8-agent set above is the current flow.

Format as a short Hebrew table: סוכן → תפקיד → מודל → נבדק בפועל? → הרצה אחרונה.
