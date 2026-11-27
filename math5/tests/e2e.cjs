// בדיקות דפדפן מקצה לקצה (Playwright): ניווט, תרגול, מבחן, שמירת התקדמות, אבחון, חזרות, הגדרות, טלפון, מעבר גרסה.
// הרצה: node tests/e2e.cjs   (מפעיל שרת מקומי בעצמו)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8800 + Math.floor(Math.random() * 100);
const BASE = `http://localhost:${PORT}/`;
const KEY = 'math5.progress.v1';
let failures = 0, passed = 0;

async function step(name, fn) {
  try { await fn(); passed++; console.log(`✓ ${name}`); }
  catch (e) { failures++; console.error(`✗ ${name}\n   ${String(e.message).split('\n').slice(0, 4).join('\n   ')}`); }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };

(async () => {
  const server = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const browser = await chromium.launch();
  const errors = [];
  const newPage = async (opts = {}) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', ...opts });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts\.g/.test(m.text())) errors.push(m.text()); });
    return page;
  };
  const go = async (page, hash) => { await page.goto(BASE + hash); await page.waitForSelector('main h1', { timeout: 5000 }); };
  const storeOf = page => page.evaluate(k => JSON.parse(localStorage.getItem(k) || 'null'), KEY);

  try {
    const page = await newPage();

    await step('ניווט: כל המסכים נטענים עם כותרת, בלי שגיאות', async () => {
      const routes = { '#/': 'שלום', '#/plan': 'תוכנית הלימודים', '#/map': 'מפת ידע', '#/diagnostic': 'מבחן אבחון', '#/week': 'תוכנית שבועית',
        '#/review': 'חזרות', '#/practice': 'תרגול', '#/exams': 'מבחנים', '#/progress': 'ההתקדמות שלי', '#/sources': 'מקורות',
        '#/lesson/arithmetic-sequence/explain': 'סדרה חשבונית', '#/lesson/nope': 'השיעור לא נמצא',
        '#/toolbox': 'ארגז הכלים שלי', '#/tool/calculator': 'מחשבון מדעי', '#/tool/notebook': 'מחברת הטעויות שלי', '#/lesson/tb-axes/explain': 'מערכת הצירים' };
      for (const [h, title] of Object.entries(routes)) {
        await go(page, h);
        const t = (await page.locator('main h1').first().textContent()).trim();
        expect(t.includes(title), `${h}: כותרת "${t}"`);
      }
      expect(!errors.length, 'שגיאות: ' + errors.join(' | '));
    });

    await step('ניווט: סרגל הניווט מסמן את המסך הפעיל', async () => {
      await go(page, '#/exams');
      expect(await page.locator('[data-nav="exams"][aria-current]').count() === 1, 'מבחנים לא מסומן');
      await page.click('[data-nav="practice"]'); await page.waitForTimeout(200);
      expect((await page.locator('main h1').textContent()).includes('תרגול'), 'לא עבר לתרגול');
    });

    await step('שיעור: 8 שלבים, ומעבר לשלב הבא שומר שהשלב הושלם', async () => {
      await go(page, '#/lesson/derivative-extrema/explain');
      expect(await page.locator('#stepper li').count() === 8, 'לא 8 שלבים');
      await page.click('[data-done="explain"]'); await page.waitForTimeout(200);
      expect(page.url().endsWith('/video'), 'לא עבר לסרטון');
      const s = await storeOf(page);
      expect(s.lessons['derivative-extrema'].sections.explain === true, 'שלב ההסבר לא נשמר');
    });

    await step('דוגמאות פתורות: הפתרון לא נמצא ב-DOM (אפילו מוסתר) לפני לחיצה, בכל 4 השיעורים הקיימים', async () => {
      // בדיקת רגרסיה ל-CRITICAL שנמצא ב-26.11.2026 (qa-regression + student-simulator): examples[].steps/answer
      // היו מוטבעים ב-DOM עם hidden="" לפני לחיצה בכל 4 השיעורים (17/17 דוגמאות) — תוקן ב-js/app.js (sectionBody/bindLesson,
      // case 'examples'), באותה שיטת lazy-render הקיימת כבר ב-js/views/exams.js (.x-sol). ראו docs/reports/qa-solution-leak-2026-11-26.md.
      for (const id of ['derivative-extrema', 'geometric-sequence', 'arithmetic-sequence', 'sine-cosine-law']) {
        await go(page, `#/lesson/${id}/examples`);
        const exCount = await page.locator('.example').count();
        expect(exCount > 0, `${id}: אין דוגמאות בשלב`);
        for (let i = 0; i < exCount; i++) {
          const ex = page.locator('.example').nth(i);
          const stepsEmpty = await ex.locator('.steps').evaluate(el => el.childElementCount === 0);
          const answerEmpty = await ex.locator('.ex-answer').evaluate(el => el.hidden && el.innerHTML.trim() === '');
          expect(stepsEmpty, `${id} דוגמה ${i}: שלבי הפתרון נמצאים ב-DOM לפני לחיצה`);
          expect(answerEmpty, `${id} דוגמה ${i}: התשובה נמצאת ב-DOM לפני לחיצה`);
        }
        // מוודאים שהחשיפה בלחיצה עדיין עובדת (לא רק שהיא נעדרת לפני)
        const first = page.locator('.example').first();
        const total = await first.locator('.steps').evaluate(el => +el.dataset.count);
        await first.locator('[data-all]').click(); await page.waitForTimeout(150);
        expect(await first.locator('.steps li').count() === total, `${id}: הצגת כל הפתרון לא חשפה את כל השלבים`);
        expect(await first.locator('.ex-answer').evaluate(el => !el.hidden && el.innerHTML.trim().length > 0), `${id}: התשובה לא נחשפה בלחיצה`);
      }
    });

    await step('תרגול: תשובה שגויה מזהה סוג טעות, נכונה מסומנת ונשמרת אחרי טעינה מחדש', async () => {
      await go(page, '#/lesson/derivative-extrema/guided');
      const card = page.locator('.q[data-q="g1"]');
      await card.locator('input').fill('1'); await card.locator('[data-act=check]').click();
      expect((await card.locator('.feedback').textContent()).includes('מקסימום'), 'לא זוהתה טעות מקסימום/מינימום');
      await card.locator('[data-act=hint]').click();
      expect(await card.locator('.hints li').count() === 1, 'רמז לא הוצג');
      await card.locator('input').fill('-1'); await card.locator('[data-act=check]').click();
      expect(await card.evaluate(el => el.classList.contains('solved')), 'לא סומן כנפתר');
      await page.reload(); await page.waitForSelector('.q[data-q="g1"]', { state: 'attached' });
      expect(await page.locator('.q[data-q="g1"].solved').count() === 1, 'הפתרון לא נשמר אחרי טעינה מחדש');
      // שאלה אחת בכל פעם: אחרי טעינה מוצגת השאלה הבאה שלא נפתרה, ואפשר לחזור דרך הנקודות
      expect(await page.locator('.q[data-q="g2"]').isVisible(), 'לא עבר לשאלה הבאה שלא נפתרה');
      await page.click('.qdot[data-goto="0"]');
      expect(await page.locator('.q[data-q="g1"]').isVisible(), 'הנקודות לא מחזירות לשאלה הראשונה');
      const s = await storeOf(page);
      const atts = s.attempts.filter(a => a.qid === 'g1' && a.lessonId === 'derivative-extrema');
      expect(atts.length === 2 && !atts[0].ok && atts[1].ok && atts[1].hints === 1, 'יומן הניסיונות שגוי: ' + JSON.stringify(atts));
      // ניסיון נוסף על שאלה שכבר נפתרה לא נרשם שוב
      await page.locator('.q[data-q="g1"] [data-act=check]').click();
      expect((await storeOf(page)).attempts.filter(a => a.qid === 'g1').length === 2, 'שאלה שנפתרה נספרה שוב');
    });

    await step('תרגול: "המשך" בכרטיס המשוב עובר לשאלה הבאה בכל השלב, ולשלב הבא (לא לסוף השיעור) רק אחרי האחרונה', async () => {
      // בדיקת רגרסיה ל-development cycle 03: student-simulator דיווח שאחרי תשובה נכונה ראשונה
      // בתרגול מודרך, "המשך" מדלג לשלב האחרון (8/8) במקום לשאלה הבאה. ניסיון שחזור מקיף (דסקטופ+טלפון,
      // קליק+tap, עם/בלי תשובה שגויה קודם) לא שחזר את התקלה על הקוד הנוכחי — הבדיקה הזו נשארת קבועה
      // כרשת ביטחון, ומכסה בדיוק את מה שהתיאור ביקש: סדר, נכון/שגוי, מעבר מהאחרונה לשלב הבא, טעינה מחדש, חזרה אמצע.
      const t = await newPage();
      await go(t, '#/lesson/geometric-sequence/guided');
      const nextSectionHref = await t.evaluate(() => document.querySelector('.lesson-nav .btn.primary')?.getAttribute('href'));
      expect(nextSectionHref === '#/lesson/geometric-sequence/practice', 'href השלב הבא שגוי לפני תחילת התרגול: ' + nextSectionHref);
      // g4/g5 נוספו ב-26.11.2026 (Development Cycle 03, השלמת פער המונוטוניות) — העדכון הזה מרחיב את
      // הבדיקה בהתאם, כדי שלא תזהה בטעות שינוי תוכן לגיטימי (יותר שאלות מודרכות) כבאג ניווט.
      const order = ['g1', 'g2', 'g3', 'g4', 'g5'];
      const wrong = { g1: '1215', g2: '27', g3: '486', g5: '-0.25' };
      const right = { g1: '405', g2: '3', g3: '242', g5: '0.25' };
      for (let i = 0; i < order.length; i++) {
        const qid = order[i];
        expect(await t.locator(`.q[data-q="${qid}"]`).isVisible(), `שאלה ${qid} לא מוצגת בתורה (סדר שגוי)`);
        const card = t.locator(`.q[data-q="${qid}"]`);
        if (qid === 'g4') { // שאלת רב-ברירה: אפשרות שגויה (index 1) ואז הנכונה (index 0)
          await card.locator('input[type=radio]').nth(1).check(); await card.locator('[data-act=check]').click();
          expect(await card.locator('.feedback.bad').count() === 1, `${qid}: תשובה שגויה לא סומנה`);
          await card.locator('input[type=radio]').nth(0).check(); await card.locator('[data-act=check]').click();
        } else {
          await card.locator('.num-input input').fill(wrong[qid]); await card.locator('[data-act=check]').click();
          expect(await card.locator('.feedback.bad').count() === 1, `${qid}: תשובה שגויה לא סומנה`);
          await card.locator('.num-input input').fill(right[qid]); await card.locator('[data-act=check]').click();
        }
        expect(await t.locator('#fbSheet').count() === 1, `${qid}: כרטיס המשוב לא נפתח אחרי תשובה נכונה`);
        const label = await t.locator('#fbSheet [data-sheet="0"]').textContent();
        if (i < order.length - 1) expect(label.trim() === 'המשך', `${qid}: הכפתור אמור לומר "המשך" (עוד שאלות בשלב), נמצא "${label}"`);
        else expect(label.trim() === 'לשלב הבא', `${qid} (אחרונה): הכפתור אמור לומר "לשלב הבא", נמצא "${label}"`);
        await t.click('#fbSheet [data-sheet="0"]'); await t.waitForTimeout(250);
        if (i < order.length - 1) {
          expect(await t.evaluate(() => location.hash) === '#/lesson/geometric-sequence/guided', `${qid}: "המשך" ניווט החוצה מהשלב לפני הזמן`);
          expect(await t.locator(`.q[data-q="${order[i + 1]}"]`).isVisible(), `${qid}: לא עבר לשאלה הבאה (${order[i + 1]}) באותו שלב`);
        } else {
          expect(await t.evaluate(() => location.hash) === '#/lesson/geometric-sequence/practice', `אחרי השאלה האחרונה לא עבר לשלב "practice" — עבר ל-${await t.evaluate(() => location.hash)} (זה בדיוק התקלה המדווחת, אם תחזור)`);
        }
      }
      // טעינה מחדש אחרי סיום השלב: כל 3 השאלות עדיין מסומנות כפתורות
      await go(t, '#/lesson/geometric-sequence/guided'); await t.waitForSelector('.q[data-q="g1"]');
      for (const qid of order) expect(await t.locator(`.q[data-q="${qid}"].solved`).count() === 1, `${qid}: לא נשמר כפתור אחרי טעינה מחדש`);
      // חזרה לשיעור "באמצע" (אחרי שהשלב כבר הושלם) מציגה שוב את השאלה הראשונה דרך נקודות הניווט
      await t.click('.qdot[data-goto="0"]');
      expect(await t.locator('.q[data-q="g1"]').isVisible(), 'חזרה לאמצע השיעור לא מציגה שאלה קודמת שנפתרה');
      await t.context().close();
    });

    await step('תרגול: אותה התנהגות מעבר "המשך" נכונה בכל השיעורים הקיימים (לא רק geometric-sequence)', async () => {
      const t = await newPage();
      await go(t, '#/');
      const lessons = await t.evaluate(async () => {
        const idx = await (await fetch('learning-content/index.json')).json();
        return Promise.all(idx.lessons.map(async f => (await (await fetch('learning-content/' + f)).json()).id));
      });
      for (const id of lessons) {
        await go(t, `#/lesson/${id}/guided`);
        const qs = await t.locator('.q[data-mode="practice"]').evaluateAll(els => els.map(e => e.dataset.q));
        if (qs.length < 2) continue;  // הבדיקה רלוונטית רק כששלב ה"המשך" בין שאלות קיים
        const first = t.locator(`.q[data-q="${qs[0]}"]`);
        const isNum = await first.locator('.num-input input').count();
        if (isNum) await first.locator('.num-input input').fill('999999'); else await first.locator('.opt input').first().check();
        await first.locator('[data-act=check]').click(); await t.waitForTimeout(150);
        // לא בודקים אם התשובה "נכונה" (לא יודעים את הערך) — רק, אם המשוב "ok" נפתח, שהוא לא מדלג לשלב אחרון
        if (await t.locator('#fbSheet.ok').count()) {
          const label = (await t.locator('#fbSheet [data-sheet="0"]').textContent()).trim();
          await t.click('#fbSheet [data-sheet="0"]'); await t.waitForTimeout(200);
          const hash = await t.evaluate(() => location.hash);
          expect(label === 'המשך' ? hash.endsWith('/guided') : true, `${id}: "המשך" בין שאלות ניווט החוצה מהשלב (${hash})`);
        }
      }
      await t.context().close();
    });

    await step('מבחן: ציון מחושב נכון, נרשם לכל שאלה, ונכנס ללוח החזרות', async () => {
      await go(page, '#/lesson/arithmetic-sequence/quiz');
      const answers = { q1: '47', q2: '136', q3: '4.5', q5: '13' };   // q3 שגוי, q4 בלי תשובה
      for (const [id, v] of Object.entries(answers)) await page.locator(`.q[data-q="${id}"] input`).fill(v);
      await page.click('#quiz [type=submit]'); await page.waitForSelector('#quizResult .huge');
      expect((await page.locator('#quizResult .huge').textContent()).trim() === '60', 'ציון שגוי');
      const s = await storeOf(page);
      expect(s.lessons['arithmetic-sequence'].quiz.last === 60, 'ציון המבחן לא נשמר');
      expect(s.attempts.filter(a => a.ctx === 'quiz').length === 5, 'לא נרשם ניסיון לכל שאלה');
      expect(s.reviews['arithmetic-sequence'] && s.reviews['arithmetic-sequence'].box === 0, 'לא נכנס ללוח החזרות');
      await go(page, '#/lesson/arithmetic-sequence/review');
      expect((await page.locator('.check-list').textContent()).includes('60'), 'ניתוח השליטה לא מציג את המבחן האחרון');
    });

    await step('חזרות: חזרה שהגיע זמנה מופיעה, וביצוע שלה מקדם את לוח החזרות', async () => {
      await page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k)); s.reviews['arithmetic-sequence'].due = Date.now() - 86400000; localStorage.setItem(k, JSON.stringify(s)); }, KEY);
      await page.reload();   // הנתונים שונו מבחוץ – טוענים מחדש
      await go(page, '#/review');
      expect(await page.locator('a[href="#/review/arithmetic-sequence"]').count() === 1, 'החזרה לא מופיעה');
      await go(page, '#/review/arithmetic-sequence');
      const n = await page.locator('#reviewForm .q').count();
      expect(n === 4, `מספר שאלות בחזרה: ${n}`);
      await page.click('#reviewForm [type=submit]'); await page.waitForSelector('#reviewResult .huge');
      const s = await storeOf(page);
      const r = s.reviews['arithmetic-sequence'];
      expect(r.history.length === 1 && r.box === 0 && r.due > Date.now(), 'לוח החזרות לא עודכן: ' + JSON.stringify(r));
      expect(s.attempts.filter(a => a.ctx === 'review').length === 4, 'ניסיונות החזרה לא נרשמו');
    });

    await step('אבחון: טעות מורידה לידע מקדים, אפשר לעצור ולהמשיך, ובסוף מוצגת תוכנית התחלה', async () => {
      await go(page, '#/diagnostic');
      await page.click('#diagStart'); await page.waitForSelector('#diagForm');
      const first = (await page.locator('#diagForm .q-num').textContent()).trim();
      expect(first.includes('קיצון'), 'שאלת הבדיקה הראשונה: ' + first);
      await page.locator('#diagForm input').first().fill('999');
      await page.click('#diagForm [type=submit]'); await page.waitForTimeout(200);
      const second = (await page.locator('#diagForm .q-num').textContent()).trim();
      expect(['כללי גזירה', 'משוואה ריבועית'].some(t => second.includes(t)), 'לא ירד לידע מקדים: ' + second);
      await page.reload(); await page.waitForSelector('#diagForm');
      expect((await page.locator('#diagForm .q-num').textContent()).trim() === second, 'ההתקדמות באבחון לא נשמרה');
      for (let i = 0; i < 60 && await page.locator('#diagSkip').count(); i++) { await page.click('#diagSkip'); await page.waitForTimeout(60); }
      await page.waitForSelector('.start-list');
      expect((await page.locator('main h1').textContent()).includes('תוצאות'), 'לא הגיע לתוצאות');
      expect(await page.locator('.start-list li').count() > 0, 'אין המלצת התחלה');
      const s = await storeOf(page);
      expect(s.diagnostic.finishedAt && s.diagnostic.state.asked.length <= 35, 'האבחון לא נשמר כמסתיים');
      await go(page, '#/map');
      expect(await page.locator('.skill.st-missing').count() > 0, 'מפת הידע לא מציגה פערים');
    });

    await step('הגדרות: שינוי שעות ויעד משפיע על התוכנית השבועית ועל מסך הבית', async () => {
      await go(page, '#/progress');
      await page.fill('#s-hours', '8'); await page.fill('#s-target', '85');
      await page.click('#settingsForm [type=submit]'); await page.waitForTimeout(150);
      await go(page, '#/week');
      expect((await page.locator('.lead').first().textContent()).includes('8 שעות'), 'התוכנית לא התעדכנה');
      await go(page, '#/');
      expect((await page.locator('.stat-pill.goal').textContent()).includes('85'), 'היעד במסך הבית לא התעדכן');
    });

    await step('איפוס: דורש לחיצה שנייה, ואז מוחק', async () => {
      await go(page, '#/progress');
      await page.click('#rst');
      expect((await storeOf(page)).attempts.length > 0, 'נמחק כבר בלחיצה הראשונה');
      await page.click('#rst'); await page.waitForTimeout(200);
      expect((await storeOf(page)).attempts.length === 0, 'לא נמחק בלחיצה השנייה');
    });

    await step('מעבר גרסה: נתונים שמורים מגרסה 1 נטענים בלי לאבד התקדמות', async () => {
      const p2 = await newPage();
      await p2.goto(BASE);
      await p2.evaluate(k => localStorage.setItem(k, JSON.stringify({ version: 1, track: 'common', grades: { q81: 58, q82: 43 }, name: 'אדר',
        lessons: { 'sine-cosine-law': { sections: { explain: true }, answers: { g1: { tries: 1, correct: true, firstTry: true, hints: 0, revealed: false } }, quiz: { best: null, last: null, history: [] }, timeSec: 300, lastVisit: Date.now() } },
        mistakes: [], daily: {}, lastLesson: 'sine-cosine-law' })), KEY);
      await p2.reload();
      await go(p2, '#/lesson/sine-cosine-law/guided');
      expect(await p2.locator('.q[data-q="g1"].solved').count() === 1, 'התשובה הישנה אבדה');
      await go(p2, '#/');
      expect((await p2.locator('.home-greet h1').textContent()).includes('אדר'), 'השם אבד');
      const s2 = await storeOf(p2);
      expect(s2.profile.grades.q1 === 58 && s2.profile.grades.q2 === 43, 'ציוני העבר לא עברו לפרופיל');
      await p2.context().close();
    });

    await step('ארגז כלים: בדיקת בסיס מזהה פערים וממליצה על שיעור יסוד', async () => {
      const t = await newPage();
      await go(t, '#/');
      expect(await t.locator('#skipWelcome').count() === 1, 'אין הצעה לבדיקת בסיס בכניסה הראשונה');
      await go(t, '#/basecheck'); await t.click('#bcStart'); await t.waitForSelector('#bcForm');
      for (let i = 0; i < 20 && await t.locator('#bcSkip').count(); i++) { await t.click('#bcSkip'); await t.waitForTimeout(40); }
      await t.waitForSelector('.found-path, .tb-head');
      expect((await t.locator('main h1').first().textContent()).includes('תוצאות'), 'לא הגיע לתוצאות');
      const s = await storeOf(t);
      expect(s.baseCheck.finishedAt && Object.values(s.baseCheck.results).includes('missing'), 'הבדיקה לא שמרה פערים');
      await go(t, '#/toolbox');
      expect(await t.locator('.topic-row.st-gap').count() > 0, 'עמוד ארגז הכלים לא מסמן נושאים לחיזוק');
      await t.context().close();
    });

    await step('דרישות קדם: כפתור חיזוק בשיעור, ואחרי החיזוק חזרה בדיוק לאותו מקום', async () => {
      const t = await newPage();
      await go(t, '#/basecheck'); await t.click('#bcStart'); await t.waitForSelector('#bcForm');
      for (let i = 0; i < 20 && await t.locator('#bcSkip').count(); i++) { await t.click('#bcSkip'); await t.waitForTimeout(40); }
      await go(t, '#/lesson/arithmetic-sequence/guided');
      expect(await t.locator('.prereq-mini').count() === 1 && !(await t.locator('.prereq-mini').getAttribute('open')), 'מחוץ לשלב ההסבר החיזוק צריך להיות מקופל');
      await t.click('.prereq-mini summary');
      const btn = t.locator('.prereq-mini a.btn');
      expect(await btn.count() === 1, 'אין כפתור "צריך חיזוק"');
      const href = await btn.getAttribute('href');
      expect(href.startsWith('#/lesson/tb-'), 'הכפתור לא מוביל לשיעור יסוד: ' + href);
      await btn.click(); await t.waitForTimeout(300);
      expect((await t.locator('.return-bar').count()) === 1, 'אין פס "חזרה לשיעור" בשיעור היסוד');
      await t.click('.return-bar [data-go-back]'); await t.waitForTimeout(300);
      expect(t.url().endsWith('#/lesson/arithmetic-sequence/guided'), 'לא חזר בדיוק לאותו מקום: ' + t.url());
      expect((await storeOf(t)).returnTo === null, 'נקודת החזרה לא נוקתה');
      await t.context().close();
    });

    await step('שיעור יסוד: 5 שלבים, תרגול עם משוב, ומבחן קצר', async () => {
      const t = await newPage();
      await go(t, '#/lesson/tb-negatives/guided');
      expect(await t.locator('#stepper li').count() === 5, 'שיעור יסוד צריך 5 שלבים');
      const c = t.locator('.q[data-q="g1"]');
      await c.locator('input').fill('-14'); await c.locator('[data-act=check]').click();
      expect((await c.locator('.feedback').textContent()).includes('סימן'), 'לא זוהתה טעות סימן');
      await c.locator('input').fill('4'); await c.locator('[data-act=check]').click(); await t.waitForTimeout(200);
      expect(await t.locator('#fbSheet.ok').count() === 1, 'מגירת "נכון" לא נפתחה');
      await t.click('#fbSheet [data-sheet="0"]'); await t.waitForTimeout(150);
      expect(await t.locator('.q[data-q="g2"]').isVisible(), '"המשך" לא עבר לשאלה הבאה');
      await go(t, '#/lesson/tb-negatives/quiz');
      for (const [id, v] of [['q1', '-5'], ['q2', '9'], ['q3', '20'], ['q4', '-9']]) await t.locator(`.q[data-q="${id}"] input`).fill(v);
      await t.click('#quiz [type=submit]'); await t.waitForSelector('#quizResult .huge');
      expect((await t.locator('#quizResult .huge').textContent()).trim() === '100', 'ציון מבחן היסוד שגוי');
      await go(t, '#/toolbox');
      expect(await t.locator('a.topic-row.st-done[href="#/lesson/tb-negatives"]').count() >= 1, 'הנושא לא סומן כהושלם בארגז הכלים');
      await t.context().close();
    });

    await step('כל שיעורי היסוד נפתחים בכל השלבים, עם נוסחאות מרונדרות', async () => {
      const t = await newPage();
      const tb = JSON.parse(require('fs').readFileSync(path.join(ROOT, 'learning-content/toolbox.json'), 'utf8'));
      const ids = tb.lessons.map(f => path.basename(f, '.json'));
      expect(ids.length >= 11, 'פחות מ-11 שיעורי יסוד');
      for (const id of ids) for (const sec of ['explain', 'examples', 'guided', 'quiz', 'review']) {
        await go(t, `#/lesson/${id}/${sec}`);
        expect(await t.locator('#stepper li').count() === 5, `${id}/${sec}: אין 5 שלבים`);
        if (sec === 'explain' || sec === 'examples') expect(await t.locator('.section .katex').count() > 0, `${id}/${sec}: אין נוסחאות`);
        if (sec === 'guided' || sec === 'quiz') expect(await t.locator('.section .q').count() >= 4, `${id}/${sec}: חסרות שאלות`);
        expect(await t.locator('.katex-error').count() === 0, `${id}/${sec}: נוסחה שבורה`);
      }
      await t.context().close();
    });

    await step('מחשבון ומחברת טעויות עובדים', async () => {
      const t = await newPage();
      await go(t, '#/tool/calculator');
      await t.fill('#calcIn', '2^3 + sin(30)'); await t.press('#calcIn', 'Enter');
      expect((await t.locator('#calcOut').textContent()).includes('8.5'), 'חישוב שגוי במחשבון');
      await t.click('[data-deg="0"]');
      await t.fill('#calcIn', 'cos(pi)'); await t.press('#calcIn', 'Enter');
      expect((await t.locator('#calcOut').textContent()).includes('-1'), 'רדיאנים לא עובדים');
      await t.fill('#calcIn', '2+*'); await t.press('#calcIn', 'Enter');
      expect(await t.locator('#calcOut.err').count() === 1, 'אין הודעת שגיאה לביטוי שגוי');
      await go(t, '#/lesson/tb-axes/guided');
      await t.locator('.q[data-q="g1"] input[value="1"]').check(); await t.locator('.q[data-q="g1"] [data-act=check]').click();
      await go(t, '#/tool/notebook');
      expect((await t.locator('.nb-item').first().textContent()).includes('רביע'), 'הטעות לא הופיעה במחברת');
      await t.context().close();
    });

    await step('שאלון בגרות: נוסח רשמי, בדיקת תשובה, פתרון, הערכה עצמית ושמירה', async () => {
      const t = await newPage();
      await go(t, '#/exams');
      expect(await t.locator('.x-hub').count() >= 1, 'אין שאלון בגרות ברשימת המבחנים');
      await t.locator('.x-hub .btn').first().click(); await t.waitForSelector('.x-q');
      expect((await t.locator('.x-stem').textContent()).includes('הבית של אורי'), 'נוסח שאלה 1 חסר');
      expect(await t.locator('.x-stem .katex').count() > 0, 'אין נוסחאות מרונדרות');
      const c = t.locator('.x-part[data-pid="a1"]');
      await c.locator('input').fill('10'); await c.locator('[data-act=check]').click();
      expect(await c.locator('.feedback.bad').count() === 1, 'תשובה שגויה לא סומנה');
      await c.locator('input').fill('12'); await c.locator('[data-act=check]').click();
      expect(await c.locator('.feedback.ok').count() === 1, 'תשובה נכונה לא סומנה');
      await go(t, '#/exam/35581-2024-summer/2');
      expect(await t.locator('.x-skills a[href="#/lesson/geometric-sequence"]').count() >= 1, 'שאלה 2 לא מקשרת לשיעור סדרה הנדסית');
      await go(t, '#/exam/35581-2024-summer/3');
      const sk = await t.locator('.x-skills').innerText();
      expect(sk.includes('התפלגות בינומית') && sk.includes('עוד אין שיעור'), 'שאלה 3 לא מסמנת שהסתברות עוד לא נלמדת');
      await go(t, '#/exam/35581-2024-summer/5');
      expect(await t.locator('.x-skills a[href="#/lesson/sine-cosine-law"]').count() >= 1, 'שאלה 5 לא מקשרת לשיעור משפט הסינוסים');
      await go(t, '#/exam/35581-2024-summer/2');
      const a = t.locator('.x-part[data-pid="a"]');
      expect(await a.locator('.x-sol').isHidden(), 'הפתרון גלוי מראש');
      expect((await t.locator('.x-sol').evaluateAll(els => els.map(e => e.innerHTML.trim()).join(''))) === '', 'פתרונות נמצאים בדף (מוסתרים) לפני שביקשו אותם');
      await a.locator('[data-act=solution]').click();
      expect(await a.locator('.x-sol').isVisible(), 'הפתרון לא נפתח');
      await a.locator('[data-act=self-ok]').click();
      await go(t, '#/exam/35581-2024-summer/7');
      expect(await t.locator('img[src$="35581-2024-q7d.png"]').evaluate(i => i.complete && i.naturalWidth > 0), 'איור שאלה 7 לא נטען');
      await t.reload(); await t.waitForSelector('.x-q');
      const st = await t.evaluate(() => JSON.parse(localStorage.getItem('math5.progress.v1')).exams['35581-2024-summer']);
      expect(st.parts['1.a1'].status === 'ok' && st.parts['2.a'].status === 'self-ok', 'מצב הסעיפים לא נשמר');
      expect(await t.locator('.x-chip.part, .x-chip.done').count() >= 2, 'הניווט לא מסמן שאלות שהתחלתי');
      await t.context().close();
    });

    await step('טלפון: גם כשכל הפתרונות והדוגמאות פתוחים – הדף לא רחב מהמסך', async () => {
      const m = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      const routes = [1, 2, 3, 4, 5, 6, 7, 8].map(n => `#/exam/35581-2024-summer/${n}`)
        .concat(['#/lesson/derivative-extrema/examples', '#/lesson/sine-cosine-law/examples', '#/lesson/arithmetic-sequence/examples', '#/lesson/geometric-sequence/explain', '#/lesson/geometric-sequence/examples', '#/lesson/geometric-sequence/bagrut']);
      for (const h of routes) {
        await go(m, h);
        await m.$$eval('button', bs => bs.forEach(b => { if (/פתרון|הצג|שלב/.test(b.textContent)) b.click(); }));
        await m.waitForTimeout(150);
        const w = await m.evaluate(() => [innerWidth, document.documentElement.scrollWidth]);
        expect(w[0] <= 391 && w[1] <= 391, `${h}: רוחב הדף ${w[1]}px (חלון ${w[0]}px)`);
      }
      await m.context().close();
    });

    await step('טלפון: מסך הסיום של שיעור (ניתוח והמשך) לא רחב מהמסך, והמסלול בבית לחיץ', async () => {
      const m = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      await go(m, '#/lesson/arithmetic-sequence/quiz');
      for (const [id, v] of Object.entries({ q1: '47', q2: '136', q3: '5', q5: '13' })) await m.locator(`.q[data-q="${id}"] input`).fill(v);
      await m.click('#quiz [type=submit]'); await m.waitForSelector('#quizResult .huge');
      await go(m, '#/lesson/arithmetic-sequence/review');
      const w = await m.evaluate(() => [innerWidth, document.documentElement.scrollWidth]);
      expect(w[0] <= 391 && w[1] <= 391, `מסך הסיום רחב מהמסך: ${w[1]}px`);
      await go(m, '#/');
      const lab = m.locator('.path a.node-lab').first();
      expect(await lab.count() === 1, 'השם של שלב במסלול לא לחיץ');
      await lab.click(); await m.waitForTimeout(300);
      expect(/#\/(lesson|diagnostic)/.test(m.url()), 'לחיצה על שם במסלול לא פתחה כלום');
      await m.context().close();
    });

    await step('אחרי שגומרים שיעור – הבית ממליץ על השיעור הבא, לא על אותו שיעור', async () => {
      const t = await newPage();
      await go(t, '#/');
      await t.evaluate(() => {
        const s = JSON.parse(localStorage.getItem('math5.progress.v1') || '{}');
        const secs = ['explain', 'video', 'examples', 'guided', 'practice', 'bagrut', 'quiz', 'review'];
        s.version = 2; s.lessons = s.lessons || {};
        s.lessons['arithmetic-sequence'] = { sections: Object.fromEntries(secs.map(k => [k, true])), answers: {}, quiz: { best: 100, last: 100, history: [{ score: 100, at: Date.now() }] }, timeSec: 600, lastVisit: Date.now() };
        s.lastLesson = 'arithmetic-sequence';
        localStorage.setItem('math5.progress.v1', JSON.stringify(s));
      });
      await t.reload(); await t.waitForSelector('.hero');
      const hero = await t.locator('.hero').innerText();
      expect(!hero.includes('סדרה חשבונית'), 'הבית עדיין מציע את השיעור שגמרתי');
      expect(!hero.includes('להמשיך מאיפה שעצרת'), 'הבית עדיין כותב "להמשיך" לשיעור גמור');
      await go(t, '#/week');
      const week = await t.locator('#app').innerText();
      expect(!/שיעור: סדרה חשבונית/.test(week), 'התוכנית השבועית עדיין מציעה את השיעור שגמרתי');
      expect(await t.locator('#app a[href="#/diagnostic"]').count() === 0, 'התוכנית השבועית עדיין דוחפת את מבחן האבחון');
      await go(t, '#/');
      expect(!(await t.locator('#app').innerText()).includes('מומלץ להתחיל כאן'), 'הבית עדיין ממליץ להתחיל באבחון');
      await t.context().close();
    });

    await step('טלפון: ניווט תחתון, בלי גלילה אופקית', async () => {
      const m = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      for (const h of ['#/', '#/week', '#/map', '#/lesson/sine-cosine-law/bagrut', '#/progress', '#/exams', '#/exam/35581-2024-summer/4', '#/exam/35581-2024-summer/7']) {
        await go(m, h);
        const over = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over <= 1, `${h}: גלילה אופקית של ${over}px`);
      }
      const nav = await m.locator('.mainnav').boundingBox();
      expect(nav && nav.y > 700, 'הניווט לא בתחתית');
      await m.context().close();
    });

    await step('בלי שגיאות JavaScript בכל הריצה', async () => { expect(!errors.length, errors.join(' | ')); });
  } finally {
    await browser.close();
    server.kill();
  }
  console.log(failures ? `\n${failures} נכשלו, ${passed} עברו` : `\n✓ כל ${passed} בדיקות הדפדפן עברו`);
  process.exit(failures ? 1 : 0);
})();
