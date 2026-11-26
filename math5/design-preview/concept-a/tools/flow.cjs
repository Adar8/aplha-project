// Concept A: click-through flow check (real clicks, both viewports) + extra state screenshots.
const { chromium } = require('playwright');
const path = require('path');
const base = 'file://' + path.resolve(__dirname, '..', 'index.html');
const out = path.resolve(__dirname, '..', 'screenshots');
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch();
  for (const [vn, opt] of [['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }], ['desktop', { viewport: { width: 1280, height: 800 } }]]) {
    const ctx = await b.newContext(opt); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    await p.goto(base);
    for (const r of ['path', 'lesson', 'practice', 'home']) {
      await p.click(`.nav a[data-route="${r}"]`); await p.waitForTimeout(150);
      ok((await p.getAttribute(`.nav a[data-route="${r}"]`, 'aria-current')) === 'page' && (await p.evaluate(() => location.hash)).startsWith('#' + r), `${vn}: nav to ${r}`);
    }
    await p.click('.resume a.btn.primary'); await p.waitForTimeout(150);
    ok((await p.textContent('#pos')).replace(/\s+/g, ' ').includes('שלב 5 מתוך 8'), `${vn}: home primary -> lesson step 5`);
    const order = await p.evaluate(() => { const b = [...document.querySelectorAll('#pos bdi')].map((e) => e.getBoundingClientRect().left); return b[0] > b[1]; });
    ok(order, `${vn}: "שלב 5 מתוך 8" renders in RTL order (5 to the right of 8)`);
    for (let i = 0; i < 3; i++) { await p.click('#next'); await p.waitForTimeout(80); }
    ok(!!(await p.$('.answer-box')), `${vn}: step 8 shows the lesson answer`);
    await p.screenshot({ path: `${out}/05-lesson-answer-${vn}.png` });
    if (vn === 'phone') {
      await p.click('.seg button[data-p="table"]'); await p.waitForTimeout(100);
      ok(await p.isVisible('.signtbl'), 'phone: segmented control -> sign table visible');
      await p.screenshot({ path: `${out}/06-lesson-table-phone.png` });
      await p.click('.seg button[data-p="step"]');
    }
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(80);
    ok((await p.textContent('#pos')).includes('7'), `${vn}: ArrowRight goes back one step (RTL)`);
    await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(80);
    await p.click('#next'); await p.waitForTimeout(150);
    ok((await p.evaluate(() => location.hash)) === '#practice', `${vn}: last step -> practice`);
    await p.fill('#ans', '20'); await p.click('#chk'); await p.waitForTimeout(100);
    ok((await p.textContent('#fb')).includes('השמאלית'), `${vn}: wrong 20 -> left-is-max feedback from commonMistakes`);
    ok(!(await p.$('#pchart')), `${vn}: chart still locked after wrong answer`);
    ok(!(await p.$('.sol')), `${vn}: solution not in DOM before click`);
    await p.click('#hintBtn'); await p.waitForTimeout(80);
    ok((await p.$$('#hints li')).length === 1, `${vn}: hint 1 revealed`);
    await p.fill('#ans', '7'); await p.click('#pm'); await p.click('#chk'); await p.waitForTimeout(250);
    ok((await p.inputValue('#ans')) === '-7' && (await p.textContent('#fb')).includes('נכון'), `${vn}: ± then check -7 -> correct`);
    ok(!!(await p.$('#pchart svg')), `${vn}: chart unlocked after correct answer`);
    await p.fill('#cx', '2'); await p.click('#cgo'); await p.waitForTimeout(80);
    ok((await p.textContent('#cout')).includes('20'), `${vn}: substitution tool f(2) = 20`);
    if (vn === 'phone') await p.evaluate(() => document.querySelector('.prac').scrollTo(0, document.querySelector('.prac-chart').offsetTop - 120));
    await p.screenshot({ path: `${out}/07-practice-solved-${vn}.png` });
    await p.click('.nav a[data-route="path"]'); await p.waitForTimeout(150);
    await p.click('.blk[data-id="geometric-sequence"]'); await p.waitForTimeout(150);
    ok((await p.getAttribute('.blk[data-id="geometric-sequence"]', 'aria-pressed')) === 'true', `${vn}: path - select another lesson`);
    await p.screenshot({ path: `${out}/08-path-selected-${vn}.png` });
    await p.goto(base + '#lesson/5'); await p.waitForTimeout(200);
    const box = await (await p.$('#chartHost')).boundingBox();
    await p.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.3); await p.mouse.down(); await p.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.3); await p.mouse.up();
    const ro = (await p.textContent('#readout')).replace(/\s+/g, ' ').trim();
    ok(!ro.startsWith('x −1 ') , `${vn}: crosshair drag updates readout (${ro})`);
    ok(errs.length === 0, `${vn}: no console errors ${errs.join(';')}`);
    await ctx.close();
  }
  await b.close();
})();
