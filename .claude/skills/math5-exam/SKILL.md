---
name: math5-exam
description: Dispatches independent-examiner (zero-knowledge student, app-only learning) to sit a full or partial bagrut paper under exam conditions, then math-auditor to grade it independently. Use for "/math5-exam [paper-code] [full|partial]".
---

# /math5-exam [paper-code] [full|partial]

1. Dispatch `independent-examiner` for the given paper (default: the paper with the highest priority gap per `math5/ROADMAP.md`). `partial` = 1–2 questions, for a quick post-lesson check (e.g. after `/math5-build` integrates something new); `full` = the complete choice-rule-respecting exam, as a periodic ceiling measurement.
2. It must study only from the app and answer only from its own notebook, citing sources per its agent spec — never grade itself.
3. Once it hands in (`notebook.md`, `answers-*.md`, `examinee-report.md`), dispatch `math-auditor` (never the examiner itself) to grade: re-derive each part's correct answer independently, apply a stated rubric, flag undeclared leaks, and give a strict vs. lenient score.
4. Report in Hebrew: per-paper score (strict/lenient), what was newly solvable vs. the last run (diff against the previous `grading.md` if one exists), and the top gaps the app still leaves.
5. Append the result to `math5/docs/decision-log.md` and update the relevant `ROADMAP.md` point estimates if they turned out to be off.
