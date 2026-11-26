/* Concept A — two-pane function chart (price pane + indicator pane), plain SVG, no dependencies.
   Main pane: y = f(x). Indicator pane: f'(x) (line, or green/red histogram = sign of f').
   Math axes are always LTR (x grows to the right) even inside the RTL page. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const fmt = (v, d = 2) => {
    if (Math.abs(v) < 1e-9) v = 0;
    const s = (Math.round(v * 100) / 100).toFixed(d).replace(/\.?0+$/, '');
    return s.replace('-', '−');
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function Chart(host, opts) {
    this.host = host;
    this.o = Object.assign({ mainRatio: 0.62, indicator: true, interactive: true, xTick: 1, yTick: 2, pTick: 5, compact: false }, opts);
    this.L = {};
    this.x = null;
    this.svg = document.createElementNS(NS, 'svg');
    this.svg.setAttribute('role', 'img');
    this.svg.setAttribute('direction', 'ltr');
    host.appendChild(this.svg);
    this.ro = new ResizeObserver(() => this.render());
    this.ro.observe(host);
    if (this.o.interactive) this._bind();
  }

  Chart.prototype.destroy = function () { this.ro.disconnect(); };
  Chart.prototype.set = function (layers) { this.L = layers || {}; this.render(); };

  Chart.prototype._geom = function () {
    const W = Math.max(200, this.host.clientWidth), H = Math.max(140, this.host.clientHeight);
    const c = this.o.compact;
    const m = { l: c ? 30 : 40, r: c ? 8 : 12, t: c ? 8 : 12, b: c ? 18 : 22 };
    const gap = this.o.indicator ? (c ? 14 : 20) : 0;
    const inner = H - m.t - m.b - gap;
    const hm = this.o.indicator ? Math.round(inner * this.o.mainRatio) : inner;
    const hi = this.o.indicator ? inner - hm : 0;
    const o = this.o;
    const w = W - m.l - m.r;
    const X = (x) => m.l + (x - o.xMin) / (o.xMax - o.xMin) * w;
    const invX = (px) => o.xMin + (px - m.l) / w * (o.xMax - o.xMin);
    const Y = (y) => m.t + (o.yMax - y) / (o.yMax - o.yMin) * hm;
    const it = m.t + hm + gap;
    const P = (y) => it + (o.pMax - y) / (o.pMax - o.pMin) * hi;
    return { W, H, m, w, hm, hi, it, X, invX, Y, P };
  };

  Chart.prototype._path = function (fn, A, B, X, Yf, lo, hi) {
    const n = 220; let d = '';
    for (let i = 0; i <= n; i++) {
      const x = A + (B - A) * i / n;
      let y = fn(x);
      y = Math.max(lo - 50, Math.min(hi + 50, y));
      d += (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Yf(y).toFixed(1);
    }
    return d;
  };

  Chart.prototype.render = function () {
    const g = this._geom(), o = this.o, L = this.L;
    const C = { line: css('--line'), line2: css('--line-2'), t3: css('--text-3'), t2: css('--text-2'), t: css('--text'), f: css('--f'), fp: css('--fp'), up: css('--up'), down: css('--down'), mark: css('--mark'), bg: css('--bg') };
    const fs = o.compact ? 10 : 11;
    const { X, Y, P, m, w, hm, hi, it } = g;
    let s = '';
    this.svg.setAttribute('viewBox', `0 0 ${g.W} ${g.H}`);
    this.svg.setAttribute('aria-label', o.ariaLabel || 'גרף');
    s += `<defs><clipPath id="${o.id}-cm"><rect x="${m.l}" y="${m.t}" width="${w}" height="${hm}"/></clipPath><clipPath id="${o.id}-ci"><rect x="${m.l}" y="${it}" width="${w}" height="${hi}"/></clipPath>
      <marker id="${o.id}-ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.t2}"/></marker></defs>`;

    // pane frames + focus
    const focusMain = L.focus === 'main', focusInd = L.focus === 'ind';
    s += `<rect x="${m.l}" y="${m.t}" width="${w}" height="${hm}" fill="none" stroke="${focusMain ? C.f : C.line}" stroke-opacity="${focusMain ? .7 : 1}"/>`;
    if (o.indicator) s += `<rect x="${m.l}" y="${it}" width="${w}" height="${hi}" fill="none" stroke="${focusInd ? C.fp : C.line}" stroke-opacity="${focusInd ? .8 : 1}"/>`;

    // grid + ticks
    for (let x = Math.ceil(o.xMin / o.xTick) * o.xTick; x <= o.xMax + 1e-9; x += o.xTick) {
      const px = X(x).toFixed(1);
      s += `<line x1="${px}" x2="${px}" y1="${m.t}" y2="${m.t + hm}" stroke="${C.line}" stroke-width="1"/>`;
      if (o.indicator) s += `<line x1="${px}" x2="${px}" y1="${it}" y2="${it + hi}" stroke="${C.line}"/>`;
      s += `<text x="${px}" y="${g.H - m.b + (o.compact ? 12 : 15)}" fill="${C.t3}" font-size="${fs}" text-anchor="middle" class="mn">${fmt(x)}</text>`;
    }
    for (let y = Math.ceil(o.yMin / o.yTick) * o.yTick; y <= o.yMax + 1e-9; y += o.yTick) {
      const py = Y(y).toFixed(1);
      s += `<line x1="${m.l}" x2="${m.l + w}" y1="${py}" y2="${py}" stroke="${C.line}"/>`;
      s += `<text x="${m.l - 5}" y="${+py + 4}" fill="${C.t3}" font-size="${fs}" text-anchor="end" class="mn">${fmt(y)}</text>`;
    }
    if (o.indicator) for (let y = Math.ceil(o.pMin / o.pTick) * o.pTick; y <= o.pMax + 1e-9; y += o.pTick) {
      const py = P(y).toFixed(1);
      s += `<line x1="${m.l}" x2="${m.l + w}" y1="${py}" y2="${py}" stroke="${C.line}"/>`;
      s += `<text x="${m.l - 5}" y="${+py + 4}" fill="${C.t3}" font-size="${fs}" text-anchor="end" class="mn">${fmt(y)}</text>`;
    }
    // zero axes (emphasised)
    const x0 = X(0), y0 = Y(0), p0 = P(0);
    s += `<line x1="${m.l}" x2="${m.l + w}" y1="${y0}" y2="${y0}" stroke="${C.t3}" stroke-width="1.2"/>`;
    s += `<line x1="${x0}" x2="${x0}" y1="${m.t}" y2="${m.t + hm}" stroke="${C.t3}" stroke-width="1.2"/>`;
    s += `<text x="${m.l + w - 4}" y="${y0 - 5}" fill="${C.t2}" font-size="${fs + 1}" text-anchor="end" font-style="italic" font-family="serif">x</text>`;
    s += `<text x="${x0 + 5}" y="${m.t + 13}" fill="${C.t2}" font-size="${fs + 1}" font-style="italic" font-family="serif">y</text>`;
    if (o.indicator) {
      s += `<line x1="${m.l}" x2="${m.l + w}" y1="${p0}" y2="${p0}" stroke="${C.t3}" stroke-width="1.2"/>`;
      s += `<line x1="${x0}" x2="${x0}" y1="${it}" y2="${it + hi}" stroke="${C.t3}" stroke-width="1.2"/>`;
    }
    // pane titles (LTR math labels)
    if (o.indicator && !(L.showFp || L.hist)) s += `<text x="${m.l + w / 2}" y="${it + hi / 2 + 4}" fill="${C.t3}" font-size="${fs + 1}" text-anchor="middle" direction="rtl">פאנל הנגזרת ייפתח בשלב הראשון</text>`;

    // ---- indicator pane content
    let ind = '';
    if (o.indicator && L.hist) {
      const step = (o.xMax - o.xMin) / Math.max(40, Math.round(w / 7));
      const bw = Math.max(1, X(o.xMin + step) - X(o.xMin) - 1.5);
      for (let x = o.xMin + step / 2; x < o.xMax; x += step) {
        const v = o.fp(x); const py = P(v);
        ind += `<rect x="${(X(x) - bw / 2).toFixed(1)}" y="${Math.min(py, p0).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.abs(py - p0).toFixed(1)}" fill="${v >= 0 ? C.up : C.down}" fill-opacity=".38"/>`;
      }
      // sign letters per interval
      (L.signs || []).forEach((sg) => {
        const cx = X((Math.max(o.xMin, sg.a) + Math.min(o.xMax, sg.b)) / 2);
        ind += `<text x="${cx}" y="${sg.s > 0 ? p0 + 18 : p0 - 7}" fill="${sg.s > 0 ? C.up : C.down}" font-size="${fs + 5}" font-weight="700" text-anchor="middle" class="mn">${sg.s > 0 ? '+' : '−'}</text>`;
      });
    }
    if (o.indicator && L.showFp) {
      ind += `<path d="${this._path(o.fp, o.xMin, o.xMax, X, P, o.pMin, o.pMax)}" fill="none" stroke="${C.fp}" stroke-width="${L.fpBold ? 3 : 2}"/>`;
    }
    if (o.indicator && L.concave) {
      const c = L.concave; const px = X(c.x), py = P(c.y);
      ind += `<text x="${px}" y="${py - 10}" fill="${C.fp}" font-size="${fs + 1}" text-anchor="middle" direction="rtl" font-weight="600">${esc(c.text)}</text>`;
    }
    (L.testPts || []).forEach((t) => {
      const v = o.fp(t.x), px = X(t.x), py = P(v);
      ind += `<line x1="${px}" x2="${px}" y1="${p0}" y2="${py}" stroke="${v >= 0 ? C.up : C.down}" stroke-dasharray="3 3"/>`;
      ind += `<circle cx="${px}" cy="${py}" r="4.5" fill="${C.bg}" stroke="${v >= 0 ? C.up : C.down}" stroke-width="2"/>`;
      if (o.compact) return;
      const lab = `f'(${fmt(t.x)}) = ${fmt(v)}`;
      const lw = lab.length * 6.6 + 10; let lx = px - lw / 2; lx = Math.max(m.l + 2, Math.min(m.l + w - lw - 2, lx));
      let ly = v >= 0 ? py - 24 : py + 8; ly = Math.max(it + 2, Math.min(it + hi - 19, ly));
      ind += `<rect x="${lx}" y="${ly}" width="${lw}" height="17" rx="3" fill="${C.bg}" stroke="${v >= 0 ? C.up : C.down}" stroke-opacity=".7"/><text x="${lx + lw / 2}" y="${ly + 12.5}" fill="${C.t}" font-size="${fs}" text-anchor="middle" class="mn">${esc(lab.replace(/-/g, '−'))}</text>`;
    });
    s += `<g clip-path="url(#${o.id}-ci)">${ind}</g>`;

    // ---- roots: dashed verticals across both panes
    (L.roots || []).forEach((r) => {
      const px = X(r);
      s += `<line x1="${px}" x2="${px}" y1="${m.t}" y2="${o.indicator ? it + hi : m.t + hm}" stroke="${C.mark}" stroke-dasharray="5 4" stroke-width="1.3"/>`;
      if (o.indicator) s += `<circle cx="${px}" cy="${p0}" r="4" fill="${C.mark}"/>`;
      s += `<rect x="${px - 22}" y="${g.H - m.b + 1}" width="44" height="17" rx="3" fill="${C.mark}"/><text x="${px}" y="${g.H - m.b + 13.5}" fill="#160A2A" font-size="${fs}" font-weight="700" text-anchor="middle" class="mn">x=${fmt(r)}</text>`;
    });

    // ---- main pane content
    let mn = '';
    if (L.showF !== false) {
      if (L.trend && L.trend.length) {
        mn += `<path d="${this._path(o.f, o.xMin, o.xMax, X, Y, o.yMin, o.yMax)}" fill="none" stroke="${C.f}" stroke-opacity=".25" stroke-width="2"/>`;
        L.trend.forEach((tr) => {
          const a = Math.max(o.xMin, tr.a), b = Math.min(o.xMax, tr.b);
          mn += `<path d="${this._path(o.f, a, b, X, Y, o.yMin, o.yMax)}" fill="none" stroke="${tr.dir > 0 ? C.up : C.down}" stroke-width="3" stroke-linecap="round"/>`;
        });
      } else {
        mn += `<path d="${this._path(o.f, o.xMin, o.xMax, X, Y, o.yMin, o.yMax)}" fill="none" stroke="${C.f}" stroke-width="${L.fDim ? 1.5 : 2.5}" stroke-opacity="${L.fDim ? .45 : 1}"/>`;
      }
    }
    (L.endArrows || []).forEach((e) => {
      // arrow travels along the curve from e.from to e.to (reading left to right)
      const y1 = o.f(e.from), y2 = o.f(e.to);
      mn += `<line x1="${X(e.from)}" y1="${Y(y1)}" x2="${X(e.to)}" y2="${Y(y2)}" stroke="${C.t}" stroke-width="1.8" marker-end="url(#${o.id}-ah)"/>`;
      const tx = Math.max(m.l + 50, Math.min(m.l + w - 50, X(e.lx)));
      mn += `<rect x="${tx - 50}" y="${Y(e.ly) - 13}" width="100" height="19" rx="3" fill="${C.bg}" stroke="${C.line2}"/><text x="${tx}" y="${Y(e.ly) + 1}" fill="${C.t}" font-size="${fs + 1}" text-anchor="middle" direction="rtl">${esc(e.text)}</text>`;
    });
    s += `<g clip-path="url(#${o.id}-cm)">${mn}</g>`;
    (L.extrema || []).forEach((p) => {
      const px = X(p.x), py = Y(p.y), col = p.type === 'max' ? C.up : C.down;
      s += `<line x1="${px - 26}" x2="${px + 26}" y1="${py}" y2="${py}" stroke="${C.mark}" stroke-width="1.5"/>`; // horizontal tangent: f'=0
      s += `<circle cx="${px}" cy="${py}" r="6" fill="${C.bg}" stroke="${col}" stroke-width="2.5"/>`;
      const name = p.type === 'max' ? 'מקסימום' : 'מינימום';
      const coord = `(${fmt(p.x)}, ${fmt(p.y)})`;
      const bw = 86, bh = 36; let bx = px - bw / 2; bx = Math.max(m.l + 2, Math.min(m.l + w - bw - 2, bx));
      let by = p.type === 'max' ? py - bh - 12 : py + 12;
      if (by < m.t + 2) by = py + 12; if (by + bh > m.t + hm - 2) by = py - bh - 12;
      s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="3" fill="${C.bg}" stroke="${col}"/>`;
      s += `<text x="${bx + bw / 2}" y="${by + 14}" fill="${col}" font-size="${fs + 1}" font-weight="700" text-anchor="middle" direction="rtl">${name}</text>`;
      s += `<text x="${bx + bw / 2}" y="${by + 29}" fill="${C.t}" font-size="${fs + 1}" text-anchor="middle" class="mn">${esc(coord)}</text>`;
    });

    // pane titles on a backing plate, drawn last so curves never cross the text
    const plate = (x, y, txt, col) => `<rect x="${x - 3}" y="${y - 11}" width="${txt.length * ((fs + 1) * 0.66) + 10}" height="15" rx="2" fill="${C.bg}" fill-opacity=".88"/><text x="${x}" y="${y}" fill="${col}" font-size="${fs + 1}" class="mn" font-weight="600">${esc(txt)}</text>`;
    s += plate(m.l + 6, m.t + 14, o.fLabel || 'f(x)', C.f);
    if (o.indicator && (L.showFp || L.hist)) s += plate(m.l + 6, it + 14, o.fpLabel || "f'(x)", C.fp);
    s += `<g class="xh"></g>`;
    this.svg.innerHTML = s;
    this.g = g;
    this.xh = this.svg.querySelector('.xh');
    if (this.x != null) this._drawX();
  };

  Chart.prototype.setX = function (x, silent) {
    const o = this.o;
    x = Math.max(o.xMin, Math.min(o.xMax, x));
    (this.L.snap || []).forEach((sx) => { if (Math.abs(sx - x) < (o.xMax - o.xMin) * 0.018) x = sx; });
    this.x = x;
    this._drawX();
    if (!silent && o.onMove) o.onMove(x);
  };

  Chart.prototype._drawX = function () {
    if (!this.g || !this.xh) return;
    const { X, Y, P, m, w, hm, hi, it, H } = this.g, o = this.o, x = this.x;
    const C = { t: css('--text'), t2: css('--text-2'), f: css('--f'), fp: css('--fp'), bg: css('--bg'), line2: css('--line-2') };
    const px = X(x), fy = o.f(x), py = Y(fy);
    let s = `<line x1="${px}" x2="${px}" y1="${m.t}" y2="${o.indicator ? it + hi : m.t + hm}" stroke="${C.t2}" stroke-dasharray="2 3"/>`;
    if (py >= m.t && py <= m.t + hm) {
      s += `<line x1="${m.l}" x2="${m.l + w}" y1="${py}" y2="${py}" stroke="${C.t2}" stroke-dasharray="2 3" stroke-opacity=".6"/>`;
      s += `<circle cx="${px}" cy="${py}" r="4" fill="${C.f}"/>`;
      s += `<rect x="0" y="${py - 9}" width="${m.l - 1}" height="18" rx="2" fill="${C.f}"/><text x="${(m.l - 1) / 2}" y="${py + 4}" fill="#04121D" font-size="10.5" font-weight="700" text-anchor="middle" class="mn">${fmt(fy, 1)}</text>`;
    }
    if (o.indicator && (this.L.showFp || this.L.hist)) {
      const v = o.fp(x), qy = P(v);
      if (qy >= it && qy <= it + hi) s += `<circle cx="${px}" cy="${qy}" r="4" fill="${C.fp}"/>`;
    }
    const lab = fmt(x, 2);
    s += `<rect x="${px - 22}" y="${H - m.b + 1}" width="44" height="17" rx="2" fill="${C.t}"/><text x="${px}" y="${H - m.b + 13.5}" fill="#0A0D13" font-size="10.5" font-weight="700" text-anchor="middle" class="mn">${lab}</text>`;
    this.xh.innerHTML = s;
  };

  Chart.prototype._bind = function () {
    const h = this.host;
    const toX = (e) => { const r = h.getBoundingClientRect(); return this.g ? this.g.invX((e.clientX - r.left) * (this.g.W / r.width)) : 0; };
    let down = false;
    h.addEventListener('pointerdown', (e) => { down = true; try { h.setPointerCapture(e.pointerId); } catch (_) {} this.setX(toX(e)); });
    h.addEventListener('pointermove', (e) => { if (down || e.pointerType === 'mouse') this.setX(toX(e)); });
    h.addEventListener('pointerup', () => { down = false; });
    h.addEventListener('pointercancel', () => { down = false; });
  };

  window.WSChart = Chart;
  window.WSfmt = fmt;
})();
