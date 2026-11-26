# MATH 5 — לוח משימות

עמודות: עדיפות · תלות · סטטוס · סוכן אחראי · קריטריון הצלחה. עדכון אחרון: 26.11.2026 (ראו `docs/decision-log.md` להיסטוריה).

**הנחיית המשתמש (26.11.2026):** לפני בניית שיעורים חדשים — להשלים את תשתית הבקרה (P0 למטה). אחרי זה: עדיפות לשאלון 35582 ולידע המוקדם הנדרש לו.

## P0 — תשתית בקרה (הנחיה 26.11.2026) — חוסמת בנייה חדשה עד להשלמה

| # | משימה | סטטוס | ראיה |
|---|---|---|---|
| 1 | Smoke Test אמיתי לכל אחד מ-8 הסוכנים (לא רק frontmatter) | **בתהליך** — סבב ראשון הופעל | דוחות סוכנים יתווספו ל-`docs/reports/` |
| 2 | אימות הפרדת תפקידים בפועל (לא רק בתיאוריה) | **בתהליך** — חלק מ-#1 | ראו תוצאות הסבב |
| 3 | אימות שה-student-simulator וה-independent-examiner לא יכולים לגשת לפתרונות/קוד בזמן "מבחן" | **בתהליך** — חלק מ-#1, כולל בדיקת DOM לפני לחיצה | ראו תוצאות הסבב |
| 4 | מנגנון אוטומטי שמזהה שינוי בקובץ תוכן ומריץ בדיקות | **הושלם (עם הסתייגות מתועדת)** | `.claude/settings.json` (PostToolUse hook) + `math5/tools/hooks/content-guard.sh`. נבדק חי: גרסה תקינה עברה, גרסה שבורה (תשובה שגויה בכוונה) נתפסה על ידי **שתי** שיטות עצמאיות (`validate-content.mjs` וגם `check-lesson.mjs`/`tests/verify`) והחזירה קוד יציאה 2; הקובץ שוחזר, `git status` נקי. **הסתייגות:** זהו מנגנון דטרמיניסטי (סקריפטים קבועים) ולא הפעלה אוטונומית של סוכן AI — ביקורת מתמטית/פדגוגית אמיתית עדיין דורשת הפעלה מפורשת (`/math5-audit`, `/math5-qa` וכו'). ראו `content-guard.sh` לפירוט המגבלה. |
| 5 | שער CI ברמת המאגר (לא תלוי בסשן חי) | **נוצר, לא אומת בפועל** | `.github/workflows/math5-ci.yml` (מריץ `npm test` על push/PR שנוגע ב-`math5/**`, לא ב-`main`). **לא הייתה לי גישה ל-API/CLI של GitHub בסשן הזה כדי לאשר שהריצה בפועל הצליחה ב-Actions** — יש לבדוק בלשונית Actions של המאגר אחרי ה-push, או לבקש בדיקה עם `gh`/MCP כשיהיה זמין. |
| 6 | בדיקת מודלים מחדש (Opus/Sonnet) | **הושלם** | `exam-analyst`/`lesson-builder`/`math-auditor`/`independent-examiner` → opus (חשיבה מתמטית/נכונות קריטית); `curriculum-architect`/`student-simulator`/`qa-regression`/`supervisor` → sonnet (שגרתי/תיאום). שורה ב-`docs/decision-log.md`. |
| 7 | הרחבת מאגר הבגרויות (כל המועדים הרלוונטיים, בלי המצאת קישורים) | **בתהליך** — blueprint ל-35571 ישירות, ו-35582 דרך supervisor | `docs/exam-catalog.json`, `docs/exam-catalog.json → notYetCollected` |
| 8 | ביקורת רלוונטיות של כל 4 השיעורים הקיימים (9 קריטריונים: מיומנויות, כיסוי אמיתי, פתרון עצמאי, הסברים, גיוון וכו') | **מתוכנן לסבב הבא** אחרי שה-blueprints של 571/582 יהיו זמינים | `math-auditor` + `independent-examiner` |
| 9 | 11 פקודות ניהול (`/math5-*`) | **הושלם ואומת חי** | `.claude/skills/math5-{status,audit,exams,coverage,build,verify,student,exam,qa,report,cycle}/SKILL.md` — כל 11 הופיעו ברשימת ה-Skills הזמינים בסשן זה מיד אחרי היצירה |
| 10 | מדדי התקדמות לאורך זמן (היסטוריה, לא רק תמונה אחת) | **הושלם** | `docs/coverage-history.jsonl` (append-only) + שדה `diffFromPrevious` ב-`docs/coverage-matrix.json`; נבדק: הרצה ראשונה דיווחה בכנות "אין ריצה קודמת להשוואה" במקום להמציא מגמה |

## פעיל / מוכן להתחלה (שיעורי תוכן — ממתינים לסיום P0 למעלה)

| עדיפות | משימה | תלות | סטטוס | סוכן | קריטריון הצלחה |
|---|---|---|---|---|---|
| P0 | בניית שיעור יסוד: גאומטריה בסיסית (`tb-geometry-basics`) — זוויות, משולשים, מרובעים, תיכון | אין | **לא התחיל.** ניסיון קודם היום נכשל (מגבלת קצב API, 2:50pm UTC) לפני שנכתב קובץ | `lesson-builder` | `node tools/check-lesson.mjs` עובר נקי; `math-auditor` מאשר באופן עצמאי; `curriculum-architect` משלב; `npm test`+`npm run test:e2e` ירוקים |
| P0 | שיעור ראשי: חדו"א פונקציות רציונליות ושורש (`calc-rational-root`) | אין | **לא התחיל** (אותה סיבה) | `lesson-builder` | כנ"ל |
| P1 | שיעור ראשי: $e^x$ ו-$\ln$ (`exp-log`) | אין | **לא התחיל** (אותה סיבה) | `lesson-builder` | כנ"ל |
| P1 | שיעור ראשי: גאומטריה אנליטית ישר-מעגל (`analytic-line-circle`) | אין | **לא התחיל** (אותה סיבה) | `lesson-builder` | כנ"ל |
| P1 | שיעור ראשי: הסתברות (`probability`) | אין | **לא התחיל** (אותה סיבה) | `lesson-builder` | כנ"ל |
| P1 | Blueprint ל-35582 (קיץ 2025) | אין | **לא התחיל.** ניסיון קודם היום נכשל (מגבלת קצב API) | `exam-analyst` | קובץ תקין ב-`learning-content/exams/blueprints/35582-2025-summer.json`, כל `skills` קיימים ב-`exam-skills.json` או ב-`missingSkills` |
| P1 | Blueprint ל-35571 ול-35572 (קיץ 2025) | אין | **לא התחיל** | `exam-analyst` | כנ"ל, שני קבצים |
| P2 | חיפוש קישורים רשמיים נוספים (מועד חורף / מועד ב׳ / שנים קודמות) | אין | **לא התחיל** — ראו `docs/exam-catalog.json` → `notYetCollected` | `exam-analyst` | קישור נבדק בפועל (לא מומצא) נוסף ל-`SOURCES` ב-`curriculum.js` דרך `curriculum-architect` |
| P2 | הרצת `npm run test:e2e` מלאה בסבב הנוכחי (לא הורץ בסבב הזה — רק `npm test`) | אין | **ממתין** | `qa-regression` | פלט מילולי מלא, pass/fail לכל בדיקה |

## נעול (תלוי במשימה אחרת)

| עדיפות | משימה | תלות | סטטוס | סוכן |
|---|---|---|---|---|
| P1 | שילוב כל שיעור חדש לאפליקציה (`index.json`/`toolbox.json`/`curriculum.js`/`knowledge-map.json`) | השיעור המתאים ממשימות ה-P0/P1 למעלה עובר `check-lesson.mjs` | נעול | `curriculum-architect` |
| P1 | סימולציית תלמיד על כל שיעור חדש | השיעור משולב | נעול | `student-simulator` |
| P1 | הרצת "הנבחן" מחדש (אפס→בגרות) אחרי שלב 1 של המפה | פריטים 1–4 ב-`ROADMAP.md` משולבים | נעול | `independent-examiner` + `math-auditor` לניקוד |

## הושלם (עם ראיה)

| תאריך | משימה | ראיה |
|---|---|---|
| 25.11.2026 | שיעור סדרה הנדסית (`geometric-sequence`) | `node tools/check-lesson.mjs` עבר; `npm test` 72/72 בדיקות מתמטיות עצמאיות; שולב ב-`curriculum.js`/`knowledge-map.json`/`toolbox.json` |
| 25.11.2026 | תיקון: פתרון בגרות לא נטען ל-DOM לפני לחיצה | `tests/e2e.cjs` בדיקה ייעודית; אומת על ידי "הנבחן" שדיווח על הדליפה המקורית |
| 25.11.2026 | תיקון: מסך הבית לא תוקע על שיעור שהושלם | `tests/e2e.cjs` בדיקה ייעודית |
| 25.11.2026 | תשתית בנייה מקבילית (`tests/verify/`, `tools/check-lesson.mjs`, `tools/integrate-lesson.mjs`, `learning-content/integration/`) | `npm test` ירוק (72 בדיקות), `node tools/check-lesson.mjs` רץ בהצלחה על `geometric-sequence` |
| 25.11.2026 | מילון מיומנויות משותף לארבעת השאלונים (96 מיומנויות, `exam-skills.json`) | `node tests/validate-content.mjs` מאמת שכל `skills`/`covers` קיימים במילון |
| 25.11.2026 | מערך 8 סוכנים קבוע + `CLAUDE.md`/`ROADMAP.md`/`TASKS.md`/`docs/quality-standards.md`/`docs/decision-log.md`/3 קבצי `docs/*.json` אוטומטיים | הקבצים קיימים ב-`.claude/agents/`; `npm run gen:all` רץ ויצר שלושה קבצים תקינים |

## חסם ידוע כרגע
מגבלת קצב (rate limit) ב-API חסמה 6 הרצות סוכן מקבילות היום סביב 2:50pm UTC, לפני שנכתב אף קובץ תוכן על ידן. המשימות שהוקצו להן (למעלה) חוזרות ל"לא התחיל", לא "בתהליך" — אין הנחה ששהוצאו בוצעו חלקית.
