---
name: math5-exams
description: Dispatches exam-analyst to collect/blueprint official MATH 5 bagrut papers and updates docs/exam-catalog.json. Use for "/math5-exams [paper-code]" or "collect more exams".
---

# /math5-exams [paper-code]

1. Read `math5/docs/exam-catalog.json` → `notYetCollected` and the per-paper `status` field to see what's `catalogued_only` (has a verified source link but no blueprint yet) versus genuinely missing (no verified link at all).
2. If `paper-code` given and it's `catalogued_only`: dispatch `exam-analyst` to build its blueprint.
3. If no argument: dispatch `exam-analyst` for the next `catalogued_only` paper in the catalog (official papers first).
4. For a genuinely missing session (winter / moed bet / older years) exam-analyst must find and confirm a real `meyda.education.gov.il` URL before anything else — if it can't verify one, it must report that explicitly and add nothing to the catalog. Never let it invent a URL.
5. After exam-analyst finishes: run `cd math5 && node tools/gen-exam-catalog.mjs` to refresh the catalog from the new blueprint file, then `node tests/validate-content.mjs` to confirm skill ids resolve.
6. Report in Hebrew: which paper(s) processed, question/skill counts, any `missingSkills`, and the updated catalog status table.
