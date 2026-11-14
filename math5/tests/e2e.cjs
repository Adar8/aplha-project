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
      const btn = t.locator('.prereq a.btn');
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

    await step('טלפון: ניווט תחתון, בלי גלילה אופקית', async () => {
      const m = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      for (const h of ['#/', '#/week', '#/map', '#/lesson/sine-cosine-law/bagrut', '#/progress']) {
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
