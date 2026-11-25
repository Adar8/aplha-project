# MATH 5 — לוח משימות

עמודות: עדיפות · תלות · סטטוס · סוכן אחראי · קריטריון הצלחה. עדכון אחרון: 25.11.2026 (ראו `docs/decision-log.md` להיסטוריה).

## פעיל / מוכן להתחלה

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
