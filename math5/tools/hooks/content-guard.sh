#!/usr/bin/env bash
# PostToolUse hook (רשום ב-.claude/settings.json): אחרי כל Write/Edit על תוכן MATH5 או על ליבת
# הבדיקה (js/core/calc.js, answers.js, adapter.js) — מריץ אוטומטית אימות תוכן + בדיקת שיעור,
# רושם ל-docs/reports/hook-log.md, ואם נכשל — מחזיר קוד יציאה שגוי כך שההודעה חוזרת לשיחה.
#
# מגבלה חשובה (ראו docs/quality-standards.md §1 ו-CLAUDE.md): זהו מנגנון דטרמיניסטי בלבד.
# הוא מריץ סקריפטים קבועים (validate-content, check-lesson) — הוא אינו מפעיל סוכן AI
# (math-auditor / qa-regression / student-simulator) ואינו "מאשר" תוכן. ביקורת מתמטית עצמאית
# אמיתית, סימולציית תלמיד ובדיקת רגרסיה בדפדפן עדיין דורשות הפעלה מפורשת של הסוכנים המתאימים.
set -u
INPUT="$(cat)"
FILE="$(printf '%s' "$INPUT" | python3 -c 'import json,sys
try:
    d=json.load(sys.stdin)
    print(d.get("tool_input",{}).get("file_path",""))
except Exception:
    print("")' 2>/dev/null)"
[ -z "$FILE" ] && exit 0

case "$FILE" in
  */math5/learning-content/*.json|*/math5/js/core/calc.js|*/math5/js/core/answers.js|*/math5/js/core/adapter.js) ;;
  *) exit 0 ;;
esac

SELF_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SELF_DIR/../.." && pwd)"   # .../math5
cd "$ROOT" || exit 0

LOG="docs/reports/hook-log.md"
mkdir -p docs/reports
TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
REL="${FILE#*/math5/}"
FAIL=0
OUT=""

if ! VAL_OUT=$(node tests/validate-content.mjs 2>&1); then
  FAIL=1; OUT="$OUT
--- validate-content.mjs ---
$VAL_OUT"
fi

case "$REL" in
  learning-content/lessons/*.json|learning-content/toolbox/*.json)
    if ! CL_OUT=$(node tools/check-lesson.mjs "$REL" 2>&1); then
      FAIL=1; OUT="$OUT
--- check-lesson.mjs $REL ---
$CL_OUT"
    fi
    ;;
esac

{
  echo ""
  echo "## $TS — $REL"
  if [ $FAIL -eq 0 ]; then echo "✓ עבר (validate-content$( [ -n "${CL_OUT:-}" ] && echo ' + check-lesson' ))"; else echo "✗ נכשל"; fi
  if [ -n "$OUT" ]; then printf '```\n%s\n```\n' "$OUT"; fi
} >> "$LOG"

if [ $FAIL -ne 0 ]; then
  echo "[math5 content-guard] שער האיכות האוטומטי נכשל על $REL — פרטים ב-math5/$LOG.$OUT" >&2
  exit 2
fi
exit 0
