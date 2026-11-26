// Concept A: Playwright check — 4 screens x (phone, desktop), console errors, overflow, screenshots.
const { chromium } = require('playwright');
const path = require('path');
const base = 'file://' + path.resolve(__dirname, '..', 'index.html');
const out = path.resolve(__dirname, '..', 'screenshots');
const shots = [['01-home', '#home'], ['02-path', '#path'], ['03-lesson', '#lesson/4'], ['04-practice', '#practice']];
(async () => {
  const b = await chromium.launch();
  const vps = { phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, desktop: { viewport: { width: 1280, height: 800 } } };
  const extra = process.argv.slice(2);
  for (const [vn, opt] of Object.entries(vps)) {
    const ctx = await b.newContext(opt); const p = await ctx.newPage();
    const errs = []; p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', (e) => errs.push(String(e)));
    for (const [name, hash] of shots) {
      await p.goto(base + hash); await p.waitForTimeout(350);
      const ov = await p.evaluate(() => {
        const W = document.documentElement.clientWidth; const bad = [];
        document.querySelectorAll('body *').forEach((el) => { const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1) && !el.closest('.katex-display') && getComputedStyle(el).position !== 'absolute') bad.push(el.tagName + '.' + el.className + ' ' + Math.round(r.left) + '..' + Math.round(r.right)); });
        return { sw: document.documentElement.scrollWidth, W, bad: bad.slice(0, 6) };
      });
      await p.screenshot({ path: `${out}/${name}-${vn}.png` });
      console.log(vn, name, 'scrollW', ov.sw, 'W', ov.W, ov.bad.length ? 'OVERFLOW ' + ov.bad.join(' | ') : 'ok');
    }
    console.log(vn, 'console errors:', errs.length ? errs : 'none');
    await ctx.close();
  }
  await b.close();
})();
