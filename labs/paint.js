/* =====================================================================
   «Зургийн өргөө» — Paint.NET маягийн зураг засварлагч (МН/EN)
   PaintLab.mount(el, {lang, w, h})
   ===================================================================== */
(function () {
  let LANG = 'mn';
  const T = (mn, en) => (LANG === 'en' ? en : LANG === 'both' ? (mn === en ? mn : mn + ' · ' + en) : mn);
  const TL = (mn, en) => LANG === 'both' ? `<b>${mn}</b><small>${en}</small>` : `<b>${LANG === 'en' ? en : mn}</b>`;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TOOLS = [
    ['select', '⬚', 'Тэгш өнцөгт сонголт', 'Rectangle select', 'S'], ['move', '✥', 'Зөөх', 'Move', 'M'],
    ['pencil', '✎', 'Харандаа', 'Pencil', 'P'], ['brush', '🖌', 'Багс', 'Paintbrush', 'B'], ['eraser', '⌫', 'Баллуур', 'Eraser', 'E'],
    ['fill', '🪣', 'Будаг цутгах', 'Paint bucket', 'F'], ['line', '╱', 'Шугам', 'Line', 'L'], ['rect', '▭', 'Тэгш өнцөгт', 'Rectangle', 'R'],
    ['ellipse', '◯', 'Эллипс', 'Ellipse', 'O'], ['grad', '◐', 'Градиент', 'Gradient', 'G'], ['text', 'A', 'Бичвэр', 'Text', 'T'],
    ['pick', '💧', 'Өнгө авах', 'Color picker', 'K'], ['stamp', '🐮', 'Наалт (дүр)', 'Sticker', 'N'],
    ['spray', '💨', 'Шүршигч', 'Spray', 'Y'], ['star', '★', 'Од', 'Star', 'U'], ['tri', '▲', 'Гурвалжин', 'Triangle', 'I'], ['hee', '෴', 'Монгол хээ', 'Mongol pattern', 'H'],
  ];
  const PAL = ['#1b3a6b', '#c8102e', '#ffcf4a', '#2e8b57', '#ffffff', '#000000', '#ffffff', '#7f7f7f', '#c3c3c3', '#2a5ab8', '#1b3a6b', '#5ad1ff', '#d6334a', '#ff6b5b', '#ffcf4a', '#f08a24', '#4fc45a', '#2e8b57', '#7a4a2a', '#c98a55', '#a46bf0', '#ef6aa0', '#fff6e5'];
  let S, root, cv, cx, ov, oc;   // S: төлөв
  const MAXU = 30;

  function newDoc(w = 800, h = 560) {
    const L0 = mkLayer(w, h, T('Дэвсгэр', 'Background')); L0.ctx.fillStyle = '#fff'; L0.ctx.fillRect(0, 0, w, h);
    S = { w, h, layers: [L0], cur: 0, tool: 'brush', c1: '#2a5ab8', c2: '#ffffff', size: 8, opacity: 100, fillShape: 'outline', tol: 32, font: 32, zoom: 0, sel: null, undo: [], redo: [], stamp: 'calf', aa: true };
  }
  function mkLayer(w, h, name) { const c = document.createElement('canvas'); c.width = w; c.height = h; return { name, c, ctx: c.getContext('2d', { willReadFrequently: true }), vis: true, op: 100 } }
  const L = () => S.layers[S.cur];

  /* ---------- Буцаах ---------- */
  function snap(label) { const l = L(); S.undo.push({ i: S.cur, data: l.ctx.getImageData(0, 0, S.w, S.h), label }); if (S.undo.length > MAXU) S.undo.shift(); S.redo = [] }
  function snapAll() { S.undo.push({ all: S.layers.map(l => ({ name: l.name, vis: l.vis, op: l.op, data: l.ctx.getImageData(0, 0, S.w, S.h) })), cur: S.cur, w: S.w, h: S.h }); if (S.undo.length > MAXU) S.undo.shift(); S.redo = [] }
  function restore(u, push) {
    if (u.all) {
      const now = { all: S.layers.map(l => ({ name: l.name, vis: l.vis, op: l.op, data: l.ctx.getImageData(0, 0, S.w, S.h) })), cur: S.cur, w: S.w, h: S.h }; push.push(now);
      S.w = u.w; S.h = u.h; S.layers = u.all.map(x => { const l = mkLayer(S.w, S.h, x.name); l.vis = x.vis; l.op = x.op; l.ctx.putImageData(x.data, 0, 0); return l }); S.cur = Math.min(u.cur, S.layers.length - 1); resizeView();
    } else { const l = S.layers[u.i]; if (!l) return; push.push({ i: u.i, data: l.ctx.getImageData(0, 0, S.w, S.h) }); l.ctx.putImageData(u.data, 0, 0); S.cur = u.i }
    paint(); panel();
  }
  const undo = () => { const u = S.undo.pop(); if (u) restore(u, S.redo) };
  const redo = () => { const u = S.redo.pop(); if (u) restore(u, S.undo) };

  /* ---------- Харуулах ---------- */
  function paint() {
    cx.clearRect(0, 0, S.w, S.h);
    // шатрын нүд (тунгалаг)
    const p = cx.createPattern(checker(), 'repeat'); cx.fillStyle = p; cx.fillRect(0, 0, S.w, S.h);
    for (const l of S.layers) { if (!l.vis) continue; cx.globalAlpha = l.op / 100; cx.drawImage(l.c, 0, 0); cx.globalAlpha = 1 }
    over();
  }
  let CHK; function checker() { if (CHK) return CHK; CHK = document.createElement('canvas'); CHK.width = CHK.height = 16; const c = CHK.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#e4e4e4'; c.fillRect(0, 0, 8, 8); c.fillRect(8, 8, 8, 8); return CHK }
  function over(preview) {
    oc.clearRect(0, 0, S.w, S.h);
    if (preview) preview(oc);
    if (S.sel) { const { x, y, w, h } = S.sel; oc.save(); oc.setLineDash([6, 4]); oc.lineWidth = 1.5 / zf(); oc.strokeStyle = '#000'; oc.strokeRect(x + .5, y + .5, w, h); oc.lineDashOffset = 5; oc.strokeStyle = '#fff'; oc.strokeRect(x + .5, y + .5, w, h); oc.restore() }
  }
  function zf() { return S.zoom || fitZoom() }
  function fitZoom() { const host = root.querySelector('.pt-view'); if (!host) return 1; return Math.min(1, (host.clientWidth - 30) / S.w, (host.clientHeight - 30) / S.h) }
  function resizeView() {
    [cv, ov].forEach(c => { c.width = S.w; c.height = S.h });
    const z = zf(); const st = root.querySelector('.pt-stack'); st.style.width = S.w * z + 'px'; st.style.height = S.h * z + 'px';
    root.querySelector('.pt-zoom').textContent = Math.round(z * 100) + '%';
    root.querySelector('.pt-size').textContent = `${S.w} × ${S.h}`;
    cx.imageSmoothingEnabled = z < 1;
    paint();
  }

  /* ---------- Багажууд ---------- */
  const pos = e => { const r = ov.getBoundingClientRect(); return { x: Math.floor((e.clientX - r.left) / r.width * S.w), y: Math.floor((e.clientY - r.top) / r.height * S.h) } };
  let act = null;
  function withSel(ctx, f) { ctx.save(); if (S.sel) { ctx.beginPath(); ctx.rect(S.sel.x, S.sel.y, S.sel.w, S.sel.h); ctx.clip() } f(ctx); ctx.restore() }
  function down(e) {
    if (e.button === 1) return; e.preventDefault(); ov.setPointerCapture(e.pointerId);
    const p = pos(e), col = e.button === 2 ? S.c2 : S.c1, l = L();
    if (!l.vis && !['select', 'pick'].includes(S.tool)) { msg(T('Давхарга нуугдсан байна.', 'Layer is hidden.')); return }
    act = { p0: p, last: p, col };
    switch (S.tool) {
      case 'pencil': case 'brush': case 'eraser': snap(S.tool); stroke(p, p); break;
      case 'fill': snap('fill'); flood(p.x, p.y, col); paint(); act = null; break;
      case 'pick': { const d = composite().getImageData(p.x, p.y, 1, 1).data; const h = '#' + [0, 1, 2].map(i => d[i].toString(16).padStart(2, '0')).join(''); if (e.button === 2) S.c2 = h; else S.c1 = h; panel(); act = null; break }
      case 'text': act = null; textAt(p, col); break;
      case 'stamp': { snap('stamp'); const img = stampImg(); const s = S.size * 12; const draw = () => { withSel(l.ctx, c => { c.globalAlpha = S.opacity / 100; c.drawImage(img, p.x - s / 2, p.y - s / 2, s, s) }); paint() }; img.complete ? draw() : (img.onload = draw); act = null; break }
      case 'spray': snap('spray'); spray(p, col); break;
      case 'hee': { snap('hee'); const img = heeSVG(S.hee || 'olzii', col), s = S.size * 6 + 30; const draw = () => { withSel(l.ctx, c => { c.globalAlpha = S.opacity / 100; c.drawImage(img, p.x - s / 2, p.y - s / 2, s, s) }); paint() }; img.complete ? draw() : (img.onload = draw); act = null; break }
      case 'move': snap('move'); act.data = l.ctx.getImageData(0, 0, S.w, S.h); act.region = S.sel ? { ...S.sel } : null; break;
      case 'select': S.sel = null; break;
      default: break;
    }
  }
  function move(e) {
    const p = pos(e); root.querySelector('.pt-xy').textContent = `${p.x}, ${p.y}`;
    if (!act) return; const l = L(), a = act;
    switch (S.tool) {
      case 'pencil': case 'brush': case 'eraser': stroke(a.last, p); a.last = p; break;
      case 'spray': spray(p, a.col); break;
      case 'line': case 'rect': case 'ellipse': case 'grad': case 'star': case 'tri': over(c => shape(c, a.p0, p, a.col, e.shiftKey)); a.last = p; break;
      case 'select': { const x = Math.min(a.p0.x, p.x), y = Math.min(a.p0.y, p.y); S.sel = { x: Math.max(0, x), y: Math.max(0, y), w: Math.abs(p.x - a.p0.x), h: Math.abs(p.y - a.p0.y) }; over(); break }
      case 'move': { const dx = p.x - a.p0.x, dy = p.y - a.p0.y; l.ctx.putImageData(a.data, 0, 0);
        if (a.region) { const r = a.region; const piece = document.createElement('canvas'); piece.width = r.w; piece.height = r.h; piece.getContext('2d').putImageData(a.data, -r.x, -r.y); l.ctx.clearRect(r.x, r.y, r.w, r.h); l.ctx.drawImage(piece, r.x + dx, r.y + dy); S.sel = { ...r, x: r.x + dx, y: r.y + dy } }
        else { const tmp = document.createElement('canvas'); tmp.width = S.w; tmp.height = S.h; tmp.getContext('2d').putImageData(a.data, 0, 0); l.ctx.clearRect(0, 0, S.w, S.h); l.ctx.drawImage(tmp, dx, dy) }
        paint(); break }
    }
  }
  function up(e) {
    if (!act) return; const a = act, l = L(), p = pos(e); act = null;
    if (['line', 'rect', 'ellipse', 'grad', 'star', 'tri'].includes(S.tool)) { snap(S.tool); withSel(l.ctx, c => shape(c, a.p0, p, a.col, e.shiftKey)); over(); paint() }
    if (S.tool === 'select' && S.sel && (S.sel.w < 2 || S.sel.h < 2)) { S.sel = null; over() }
    panel();
  }
  function spray(p, col) { const l = L(), r = S.size * 2 + 4; withSel(l.ctx, c => { c.globalAlpha = S.opacity / 100; c.fillStyle = col; for (let i = 0; i < 26; i++) { const a = Math.random() * 6.283, d = Math.sqrt(Math.random()) * r; c.fillRect(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 1.6, 1.6) } }); paint() }
  function stroke(a, b) {
    const l = L(), c = l.ctx;
    withSel(c, c => {
      c.globalAlpha = S.opacity / 100; c.lineCap = c.lineJoin = 'round';
      if (S.tool === 'eraser') c.globalCompositeOperation = 'destination-out';
      if (S.tool === 'pencil') { // 1 пикселийн хурц шугам (растерийг ойлгоход)
        c.fillStyle = act.col; const dx = Math.abs(b.x - a.x), dy = Math.abs(b.y - a.y), n = Math.max(dx, dy, 1);
        for (let i = 0; i <= n; i++) { const x = Math.round(a.x + (b.x - a.x) * i / n), y = Math.round(a.y + (b.y - a.y) * i / n); c.fillRect(x, y, Math.max(1, Math.round(S.size / 4)), Math.max(1, Math.round(S.size / 4))) }
      } else { c.strokeStyle = S.tool === 'eraser' ? '#000' : act.col; c.lineWidth = S.size; c.beginPath(); c.moveTo(a.x + .01, a.y); c.lineTo(b.x, b.y); c.stroke() }
    });
    paint();
  }
  function shape(c, a, b, col, shift) {
    let x = Math.min(a.x, b.x), y = Math.min(a.y, b.y), w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
    if (shift && S.tool !== 'line') { const m = Math.max(w, h); w = h = m; if (b.x < a.x) x = a.x - m; if (b.y < a.y) y = a.y - m }
    c.save(); c.globalAlpha = S.opacity / 100; c.lineWidth = S.size; c.strokeStyle = col; c.fillStyle = S.fillShape === 'both' ? S.c2 : col; c.lineJoin = 'round';
    if (S.tool === 'line') { let bx = b.x, by = b.y; if (shift) { const ang = Math.round(Math.atan2(b.y - a.y, b.x - a.x) / (Math.PI / 4)) * Math.PI / 4, d = Math.hypot(b.x - a.x, b.y - a.y); bx = a.x + d * Math.cos(ang); by = a.y + d * Math.sin(ang) } c.lineCap = 'round'; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(bx, by); c.stroke() }
    else if (S.tool === 'grad') { const g = c.createLinearGradient(a.x, a.y, b.x, b.y); g.addColorStop(0, S.c1); g.addColorStop(1, S.c2); c.fillStyle = g; if (S.sel) c.fillRect(S.sel.x, S.sel.y, S.sel.w, S.sel.h); else c.fillRect(0, 0, S.w, S.h) }
    else { c.beginPath(); if (S.tool === 'rect') c.rect(x, y, w, h);
      else if (S.tool === 'tri') { c.moveTo(x + w / 2, y); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath() }
      else if (S.tool === 'star') { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? .42 : 1; const px = x + w / 2 + Math.cos(a) * w / 2 * rr, py = y + h / 2 + Math.sin(a) * h / 2 * rr; i ? c.lineTo(px, py) : c.moveTo(px, py) } c.closePath() }
      else c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 7); if (S.fillShape !== 'outline') c.fill(); if (S.fillShape !== 'fill') c.stroke() }
    c.restore();
  }
  function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255] }
  function flood(x0, y0, col) {
    const l = L(), id = l.ctx.getImageData(0, 0, S.w, S.h), d = id.data, W = S.w, H = S.h;
    const i0 = (y0 * W + x0) * 4, t = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]], [r, g, b] = hexRgb(col), al = Math.round(255 * S.opacity / 100);
    const tol = S.tol * 2.55 * 4, same = i => Math.abs(d[i] - t[0]) + Math.abs(d[i + 1] - t[1]) + Math.abs(d[i + 2] - t[2]) + Math.abs(d[i + 3] - t[3]) <= tol;
    if (t[0] === r && t[1] === g && t[2] === b && t[3] === al) return;
    const sel = S.sel, inSel = (x, y) => !sel || (x >= sel.x && y >= sel.y && x < sel.x + sel.w && y < sel.y + sel.h);
    const seen = new Uint8Array(W * H), st = [[x0, y0]];
    while (st.length) {
      let [x, y] = st.pop(); while (x >= 0 && same((y * W + x) * 4) && !seen[y * W + x] && inSel(x, y)) x--; x++;
      let up = false, dn = false;
      while (x < W && same((y * W + x) * 4) && !seen[y * W + x] && inSel(x, y)) {
        const i = (y * W + x) * 4; seen[y * W + x] = 1; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = al;
        if (y > 0) { const u = same(((y - 1) * W + x) * 4) && !seen[(y - 1) * W + x]; if (u && !up) { st.push([x, y - 1]); up = true } else if (!u) up = false }
        if (y < H - 1) { const v = same(((y + 1) * W + x) * 4) && !seen[(y + 1) * W + x]; if (v && !dn) { st.push([x, y + 1]); dn = true } else if (!v) dn = false }
        x++;
      }
    }
    l.ctx.putImageData(id, 0, 0);
  }
  function composite() { const c = document.createElement('canvas'); c.width = S.w; c.height = S.h; const x = c.getContext('2d', { willReadFrequently: true }); for (const l of S.layers) { if (!l.vis) continue; x.globalAlpha = l.op / 100; x.drawImage(l.c, 0, 0) } return x }
  function textAt(p, col) {
    const box = root.querySelector('.pt-text'); box.hidden = false; const inp = box.querySelector('input'); inp.value = ''; setTimeout(() => inp.focus(), 20);
    box.onsubmit = e => { e.preventDefault(); const t = inp.value; box.hidden = true; if (!t) return; snap('text'); const c = L().ctx; withSel(c, c => { c.globalAlpha = S.opacity / 100; c.fillStyle = col; c.font = `${box.querySelector('[name=b]').checked ? 'bold ' : ''}${box.querySelector('[name=i]').checked ? 'italic ' : ''}${S.font}px ${box.querySelector('select').value}`; c.textBaseline = 'top'; t.split('\n').forEach((ln, k) => c.fillText(ln, p.x, p.y + k * S.font * 1.2)) }); paint() };
    box.querySelector('.pt-tx').onclick = () => { box.hidden = true };
  }
  const HEE = [['olzii', 'Өлзий', 'Endless knot'], ['ugalz', 'Ухаа угалз', 'Ram horn'], ['tumen', 'Түмэн наслал', 'Meander'], ['tseg', 'Цэцэг', 'Flower'], ['bugui', 'Хаан бугуйвч', 'Kings bracelet']];
  function heeSVG(k, c) { const st = `fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`;
    const b = { olzii: `<path d="M30 30h40v40h-40z M20 50h60 M50 20v60 M30 30 q-14 -14 -14 6 q0 14 14 4 M70 30 q14 -14 14 6 q0 14 -14 4 M30 70 q-14 14 -14 -6 q0 -14 14 -4 M70 70 q14 14 14 -6 q0 -14 -14 -4" ${st}/>`,
      ugalz: `<path d="M50 80 v-20 q0 -14 -14 -14 q-12 0 -12 -12 q0 -12 12 -12 q10 0 10 9 q0 7 -7 7 M50 60 q0 -14 14 -14 q12 0 12 -12 q0 -12 -12 -12 q-10 0 -10 9 q0 7 7 7" ${st}/>`,
      tumen: `<path d="M10 80 V20 H70 V60 H30 V40 H50 M90 20 V80 H30" ${st}/>`,
      tseg: `<g ${st}>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="50" cy="28" rx="11" ry="20" transform="rotate(${a} 50 50)"/>`).join('')}<circle cx="50" cy="50" r="8"/></g>`,
      bugui: `<path d="M5 50 q10 -26 22 0 q11 26 22 0 q11 -26 22 0 q11 26 22 0" ${st}/><path d="M5 50 q10 26 22 0 q11 -26 22 0 q11 26 22 0 q11 -26 22 0" ${st}/>` }[k] || '';
    const i = new Image(); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${b}</svg>`); return i }
  const STAMPS = {}; function stampImg() { const sp = (window.SPRITES || []).find(s => s.id === S.stamp); if (!sp) return new Image(); if (!STAMPS[sp.id]) { const i = new Image(); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sp.costumes[0]); STAMPS[sp.id] = i } return STAMPS[sp.id] }

  /* ---------- Эффект, засвар ---------- */
  const FX = [
    ['bright', 'Гэрэлтүүлэг', 'Brightness', -100, 100, 20], ['contrast', 'Тодосгогч', 'Contrast', -100, 100, 25], ['gray', 'Хар цагаан', 'Black & white'],
    ['sepia', 'Хуучин зураг (сепиа)', 'Sepia'], ['invert', 'Сөрөг (инверс)', 'Invert'], ['blur', 'Бүдгэрүүлэх', 'Blur', 1, 20, 3], ['sharpen', 'Хурцлах', 'Sharpen'],
    ['pixel', 'Пикселжүүлэх', 'Pixelate', 2, 40, 8], ['hue', 'Өнгөний эргэлт', 'Hue rotate', -180, 180, 60], ['sat', 'Ханалт', 'Saturation', -100, 100, 40], ['noise', 'Шуугиан нэмэх', 'Add noise', 1, 100, 25], ['outline', 'Ирмэг тодруулах', 'Edge detect'], ['vignette', 'Бүдэг хүрээ (виньетка)', 'Vignette'], ['frame', 'Монгол хээтэй хүрээ', 'Mongol pattern frame'], ['poster', 'Постер (өнгө цөөлөх)', 'Posterize', 2, 8, 4],
  ];
  function applyFx(k, v) {
    const l = L(); snap('fx'); const r = S.sel || { x: 0, y: 0, w: S.w, h: S.h }; if (!r.w || !r.h) return;
    const id = l.ctx.getImageData(r.x, r.y, r.w, r.h), d = id.data;
    if (k === 'vignette') { const g = l.ctx.createRadialGradient(r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) * .3, r.x + r.w / 2, r.y + r.h / 2, Math.max(r.w, r.h) * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.6)'); l.ctx.fillStyle = g; l.ctx.fillRect(r.x, r.y, r.w, r.h); paint(); return }
    if (k === 'frame') { const c = l.ctx, b = Math.max(16, Math.round(Math.min(S.w, S.h) * .05)); c.save(); c.fillStyle = '#c8102e'; c.fillRect(0, 0, S.w, b); c.fillRect(0, S.h - b, S.w, b); c.fillRect(0, 0, b, S.h); c.fillRect(S.w - b, 0, b, S.h);
      c.strokeStyle = '#ffcf4a'; c.lineWidth = Math.max(2, b / 7); const u = b * .9; const meander = (x0, y0, len, horiz) => { c.beginPath(); for (let t = 0; t < len; t += u) { const X = horiz ? x0 + t : x0, Y = horiz ? y0 : y0 + t, q = u / 3; if (horiz) { c.moveTo(X, Y + q * 2); c.lineTo(X, Y + q * .5); c.lineTo(X + q * 2, Y + q * .5); c.lineTo(X + q * 2, Y + q * 1.6); c.lineTo(X + q, Y + q * 1.6) } else { c.moveTo(X + q * 2, Y); c.lineTo(X + q * .5, Y); c.lineTo(X + q * .5, Y + q * 2); c.lineTo(X + q * 1.6, Y + q * 2); c.lineTo(X + q * 1.6, Y + q) } } c.stroke() };
      meander(b * .2, b * .05, S.w, true); meander(b * .2, S.h - b * .95, S.w, true); meander(b * .05, b, S.h - 2 * b, false); meander(S.w - b * .95, b, S.h - 2 * b, false); c.strokeStyle = '#1b3a6b'; c.lineWidth = 3; c.strokeRect(b, b, S.w - 2 * b, S.h - 2 * b); c.restore(); paint(); return }
    if (k === 'poster') { const n = Math.max(2, +v), st = 255 / (n - 1); for (let i = 0; i < d.length; i += 4) for (let ch = 0; ch < 3; ch++) d[i + ch] = Math.round(Math.round(d[i + ch] / st) * st); l.ctx.putImageData(id, r.x, r.y); paint(); return }
    if (['blur', 'hue', 'sat'].includes(k)) {
      const tmp = document.createElement('canvas'); tmp.width = r.w; tmp.height = r.h; tmp.getContext('2d').putImageData(id, 0, 0);
      const o = document.createElement('canvas'); o.width = r.w; o.height = r.h; const oc2 = o.getContext('2d');
      oc2.filter = k === 'blur' ? `blur(${v}px)` : k === 'hue' ? `hue-rotate(${v}deg)` : `saturate(${100 + +v}%)`; oc2.drawImage(tmp, 0, 0);
      l.ctx.clearRect(r.x, r.y, r.w, r.h); l.ctx.drawImage(o, r.x, r.y); paint(); return;
    }
    if (k === 'sharpen' || k === 'outline') {
      const src = new Uint8ClampedArray(d), W = r.w, H = r.h, K = k === 'sharpen' ? [0, -1, 0, -1, 5, -1, 0, -1, 0] : [-1, -1, -1, -1, 8, -1, -1, -1, -1];
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) for (let ch = 0; ch < 3; ch++) { let s = 0, q = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) s += src[((y + j) * W + x + i) * 4 + ch] * K[q++]; d[(y * W + x) * 4 + ch] = k === 'outline' ? 255 - s : s }
    } else if (k === 'pixel') {
      const s = Math.max(2, +v), W = r.w;
      for (let y = 0; y < r.h; y += s) for (let x = 0; x < W; x += s) { const i0 = (y * W + x) * 4; for (let j = 0; j < s && y + j < r.h; j++) for (let i = 0; i < s && x + i < W; i++) { const q = ((y + j) * W + x + i) * 4; d[q] = d[i0]; d[q + 1] = d[i0 + 1]; d[q + 2] = d[i0 + 2]; d[q + 3] = d[i0 + 3] } }
    } else {
      const c = (100 + +v) / 100, cf = (259 * (+v + 255)) / (255 * (259 - +v));
      for (let i = 0; i < d.length; i += 4) {
        let R = d[i], G = d[i + 1], Bc = d[i + 2];
        if (k === 'bright') { R += v * 2.55; G += v * 2.55; Bc += v * 2.55 }
        else if (k === 'contrast') { R = cf * (R - 128) + 128; G = cf * (G - 128) + 128; Bc = cf * (Bc - 128) + 128 }
        else if (k === 'gray') { R = G = Bc = .299 * R + .587 * G + .114 * Bc }
        else if (k === 'sepia') { const r0 = R, g0 = G, b0 = Bc; R = .393 * r0 + .769 * g0 + .189 * b0; G = .349 * r0 + .686 * g0 + .168 * b0; Bc = .272 * r0 + .534 * g0 + .131 * b0 }
        else if (k === 'invert') { R = 255 - R; G = 255 - G; Bc = 255 - Bc }
        else if (k === 'noise') { const n = (Math.random() - .5) * v * 2.55; R += n; G += n; Bc += n }
        d[i] = R; d[i + 1] = G; d[i + 2] = Bc;
      }
    }
    l.ctx.putImageData(id, r.x, r.y); paint();
  }
  function crop() { if (!S.sel) { msg(T('Эхлээд хэсгээ сонгоно уу.', 'Select an area first.')); return } snapAll(); const r = S.sel; S.layers.forEach(l => { const d = l.ctx.getImageData(r.x, r.y, r.w, r.h); l.c.width = r.w; l.c.height = r.h; l.ctx.putImageData(d, 0, 0) }); S.w = r.w; S.h = r.h; S.sel = null; resizeView(); panel() }
  function flip(h) { snap('flip'); const l = L(), t = document.createElement('canvas'); t.width = S.w; t.height = S.h; t.getContext('2d').drawImage(l.c, 0, 0); l.ctx.clearRect(0, 0, S.w, S.h); l.ctx.save(); l.ctx.translate(h ? S.w : 0, h ? 0 : S.h); l.ctx.scale(h ? -1 : 1, h ? 1 : -1); l.ctx.drawImage(t, 0, 0); l.ctx.restore(); paint() }
  function rotate90() { snapAll(); S.layers.forEach(l => { const t = document.createElement('canvas'); t.width = S.w; t.height = S.h; t.getContext('2d').drawImage(l.c, 0, 0); l.c.width = S.h; l.c.height = S.w; l.ctx.translate(S.h, 0); l.ctx.rotate(Math.PI / 2); l.ctx.drawImage(t, 0, 0); l.ctx.setTransform(1, 0, 0, 1, 0, 0) }); [S.w, S.h] = [S.h, S.w]; S.sel = null; resizeView() }
  function resizeImg() {
    const nw = +prompt(T('Шинэ өргөн (пиксель):', 'New width (px):'), S.w); if (!nw || nw < 1 || nw > 4000) return;
    const nh = Math.round(S.h * nw / S.w); snapAll();
    S.layers.forEach(l => { const t = document.createElement('canvas'); t.width = S.w; t.height = S.h; t.getContext('2d').drawImage(l.c, 0, 0); l.c.width = nw; l.c.height = nh; l.ctx.imageSmoothingQuality = 'high'; l.ctx.drawImage(t, 0, 0, nw, nh) });
    S.w = nw; S.h = nh; S.sel = null; resizeView(); msg(`${T('Хэмжээ', 'Size')}: ${nw} × ${nh}`);
  }

  /* ---------- Файл ---------- */
  function exportImg(type) { const c = composite().canvas; const a = document.createElement('a'); a.download = (S.name || T('zurag', 'image')) + (type === 'jpeg' ? '.jpg' : '.png'); if (type === 'jpeg') { const t = document.createElement('canvas'); t.width = S.w; t.height = S.h; const x = t.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, S.w, S.h); x.drawImage(c, 0, 0); a.href = t.toDataURL('image/jpeg', .9) } else a.href = c.toDataURL('image/png'); a.click() }
  function saveProj() { const p = { v: 1, w: S.w, h: S.h, layers: S.layers.map(l => ({ name: l.name, vis: l.vis, op: l.op, src: l.c.toDataURL() })) }; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(p)], { type: 'application/json' })); a.download = (S.name || 'zurag') + '.orgoo'; a.click() }
  function openFile(f) {
    if (!f) return;
    if (/\.orgoo$|json/.test(f.name)) { f.text().then(t => { const p = JSON.parse(t); newDoc(p.w, p.h); S.layers = []; let n = 0; p.layers.forEach((x, k) => { const l = mkLayer(p.w, p.h, x.name); l.vis = x.vis; l.op = x.op; S.layers.push(l); const i = new Image(); i.onload = () => { l.ctx.drawImage(i, 0, 0); if (++n === p.layers.length) { render() } }; i.src = x.src }) }); return }
    const i = new Image(); i.onload = () => {
      if (S.layers.length === 1 && isBlank()) { let w = i.width, h = i.height; const m = Math.max(w, h); if (m > 1600) { w = Math.round(w * 1600 / m); h = Math.round(h * 1600 / m) } newDoc(w, h); L().ctx.drawImage(i, 0, 0, w, h); L().name = f.name.replace(/\.[^.]+$/, ''); render(); return }
      snapAll(); const l = mkLayer(S.w, S.h, f.name.replace(/\.[^.]+$/, '')); const k = Math.min(1, S.w / i.width, S.h / i.height); l.ctx.drawImage(i, (S.w - i.width * k) / 2, (S.h - i.height * k) / 2, i.width * k, i.height * k); S.layers.splice(S.cur + 1, 0, l); S.cur++; render();
    }; i.src = URL.createObjectURL(f);
  }
  function isBlank() { const d = S.layers[0].ctx.getImageData(0, 0, S.w, S.h).data; for (let i = 0; i < d.length; i += 4 * 97) if (d[i] !== 255 || d[i + 1] !== 255 || d[i + 2] !== 255) return false; return true }
  function msg(t) { const m = root.querySelector('.pt-msg'); m.textContent = t; m.hidden = false; clearTimeout(msg.t); msg.t = setTimeout(() => m.hidden = true, 2200) }

  /* ---------- Самбар ---------- */
  function panel() {
    const tp = root.querySelector('.pt-opts'); if (!tp) return;
    const t = S.tool;
    tp.innerHTML = `${['pencil', 'brush', 'eraser', 'line', 'rect', 'ellipse', 'stamp', 'spray', 'star', 'tri', 'hee'].includes(t) ? `<label>${['stamp', 'hee', 'spray'].includes(t) ? T('Хэмжээ', 'Size') : T('Зузаан', 'Width')}<input type="range" min="1" max="${t === 'pencil' ? 16 : 80}" value="${S.size}" data-o="size"><b>${S.size}</b></label>` : ''}
      ${t !== 'select' && t !== 'move' && t !== 'pick' ? `<label>${T('Тунгалаг бус', 'Opacity')}<input type="range" min="5" max="100" value="${S.opacity}" data-o="opacity"><b>${S.opacity}%</b></label>` : ''}
      ${['rect', 'ellipse', 'star', 'tri'].includes(t) ? `<label>${T('Дүүргэлт', 'Fill')}<select data-o="fillShape"><option value="outline" ${S.fillShape === 'outline' ? 'selected' : ''}>${T('Хүрээ', 'Outline')}</option><option value="fill" ${S.fillShape === 'fill' ? 'selected' : ''}>${T('Дүүргэсэн', 'Filled')}</option><option value="both" ${S.fillShape === 'both' ? 'selected' : ''}>${T('Хүрээ + 2-р өнгө', 'Outline + 2nd color')}</option></select></label>` : ''}
      ${t === 'fill' ? `<label>${T('Хүлцэл', 'Tolerance')}<input type="range" min="0" max="100" value="${S.tol}" data-o="tol"><b>${S.tol}%</b></label>` : ''}
      ${t === 'text' ? `<label>${T('Үсгийн хэмжээ', 'Font size')}<input type="number" min="8" max="200" value="${S.font}" data-o="font"></label>` : ''}
      ${t === 'stamp' ? `<span class="pt-stamps">${(window.SPRITES || []).map(s => `<button class="${S.stamp === s.id ? 'on' : ''}" data-st="${s.id}" title="${esc(T(s.mn, s.en))}"><img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(s.costumes[0])}" alt=""></button>`).join('')}</span>` : ''}
      ${t === 'hee' ? `<span class="pt-stamps pt-hees">${HEE.map(h => `<button class="${(S.hee || 'olzii') === h[0] ? 'on' : ''}" data-hee="${h[0]}" title="${esc(T(h[1], h[2]))}"><img src="${heeSVG(h[0], S.c1).src}" alt=""><small>${esc(T(h[1], h[2]))}</small></button>`).join('')}</span>` : ''}
      ${t === 'select' ? `<button class="g" data-a="selall">${T('Бүгдийг сонгох', 'Select all')}</button><button class="g" data-a="desel">${T('Сонголт цуцлах', 'Deselect')}</button><button class="g" data-a="crop">✂ ${T('Тайрах', 'Crop')}</button><button class="g" data-a="del">${T('Устгах', 'Delete')}</button>` : ''}
      <span class="pt-hint">${esc(hint(t))}</span>`;
    tp.querySelectorAll('[data-o]').forEach(i => i.oninput = () => { const k = i.dataset.o; S[k] = i.type === 'range' || i.type === 'number' ? +i.value : i.value; const b = i.nextElementSibling; if (b?.tagName === 'B') b.textContent = i.value + (k === 'opacity' || k === 'tol' ? '%' : '') });
    tp.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { S.stamp = b.dataset.st; panel() });
    tp.querySelectorAll('[data-hee]').forEach(b => b.onclick = () => { S.hee = b.dataset.hee; panel() });
    tp.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const a = b.dataset.a; if (a === 'selall') S.sel = { x: 0, y: 0, w: S.w, h: S.h }; if (a === 'desel') S.sel = null; if (a === 'crop') return crop(); if (a === 'del' && S.sel) { snap('del'); L().ctx.clearRect(S.sel.x, S.sel.y, S.sel.w, S.sel.h); paint() } over() });
    root.querySelector('.pt-c1').style.background = S.c1; root.querySelector('.pt-c2').style.background = S.c2;
    root.querySelector('#pt-c1').value = S.c1; root.querySelector('#pt-c2').value = S.c2;
    root.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
    const lp = root.querySelector('.pt-layers');
    lp.innerHTML = [...S.layers].map((l, i) => ({ l, i })).reverse().map(({ l, i }) => `<div class="pt-lay ${i === S.cur ? 'on' : ''}" data-li="${i}"><button class="pt-eye" data-vis="${i}" title="${T('Харуулах/нуух', 'Show/hide')}">${l.vis ? '👁' : '—'}</button><canvas width="48" height="34" data-th="${i}"></canvas><span>${esc(l.name)}</span></div>`).join('');
    lp.querySelectorAll('[data-th]').forEach(c => { const l = S.layers[+c.dataset.th]; const x = c.getContext('2d'); x.drawImage(checker(), 0, 0, 48, 34); x.drawImage(l.c, 0, 0, 48, 34) });
    lp.querySelectorAll('[data-li]').forEach(d => d.onclick = e => { if (e.target.closest('[data-vis]')) return; S.cur = +d.dataset.li; panel() });
    lp.querySelectorAll('[data-li]').forEach(d => d.ondblclick = () => { const l = S.layers[+d.dataset.li]; const n = prompt(T('Давхаргын нэр:', 'Layer name:'), l.name); if (n) { l.name = n; panel() } });
    lp.querySelectorAll('[data-vis]').forEach(b => b.onclick = () => { const l = S.layers[+b.dataset.vis]; l.vis = !l.vis; paint(); panel() });
    root.querySelector('#pt-lop').value = L().op; root.querySelector('#pt-lopv').textContent = L().op + '%';
    root.querySelector('.pt-undo').disabled = !S.undo.length; root.querySelector('.pt-redo').disabled = !S.redo.length;
  }
  function hint(t) {
    return {
      select: T('Чирж тэгш өнцөгт хэсэг сонгоно. Сонгосон хэсэгт л зурж, эффект хийнэ.', 'Drag to select. Painting and effects apply inside the selection.'),
      move: T('Давхаргыг (эсвэл сонгосон хэсгийг) чирж зөөнө.', 'Drag to move the layer (or selection).'),
      pencil: T('Пиксель бүрээр зурна — растер зургийг ажигла.', 'Draws hard pixels — notice the raster grid.'),
      brush: T('Зүүн товч — 1-р өнгө, баруун товч — 2-р өнгө.', 'Left button: primary, right: secondary color.'),
      eraser: T('Давхаргыг тунгалаг болгож арилгана.', 'Erases to transparency.'),
      fill: T('Ижил өнгөтэй хэсгийг дүүргэнэ. Хүлцлээр өнгөний ойролцоог тохируулна.', 'Fills similar colors. Tolerance controls similarity.'),
      spray: T('Чирж будгийн шүрших цэгүүд үүсгэнэ.', 'Drag to spray paint dots.'), star: T('Чирж од зурна. Shift — тэгш.', 'Drag to draw a star. Shift: even.'), tri: T('Чирж гурвалжин зурна.', 'Drag to draw a triangle.'), hee: T('Хээгээ сонгоод зурган дээр дарж тамгална. 1-р өнгөөр зурагдана.', 'Pick a pattern and click to stamp it in the primary colour.'),
      line: T('Shift дарвал 45°-аар.', 'Hold Shift to snap to 45°.'), rect: T('Shift дарвал квадрат.', 'Hold Shift for a square.'), ellipse: T('Shift дарвал тойрог.', 'Hold Shift for a circle.'),
      grad: T('1-р өнгөөс 2-р өнгө рүү чирнэ.', 'Drag from primary to secondary color.'), text: T('Бичих газраа дарна.', 'Click where to type.'),
      pick: T('Зурган дээрээс өнгө авна.', 'Pick a color from the image.'), stamp: T('Дүрээ сонгоод зурган дээр дарж наана.', 'Choose a sticker and click to place it.'),
    }[t] || '';
  }

  function render() {
    root.innerHTML = `<div class="pt">
      <div class="pt-menu">
        <div class="pt-grp"><button class="g" data-m="new">🗋 ${T('Шинэ', 'New')}</button><label class="g pt-file">📂 ${T('Нээх', 'Open')}<input type="file" accept="image/*,.orgoo" hidden></label><button class="g" data-m="png">💾 PNG</button><button class="g" data-m="jpg">JPG</button><button class="g" data-m="proj" title="${T('Давхаргатай нь хадгалах', 'Save with layers')}">📦 ${T('Төсөл', 'Project')}</button></div>
        <div class="pt-grp"><button class="g pt-undo" title="Ctrl+Z">↶</button><button class="g pt-redo" title="Ctrl+Y">↷</button></div>
        <div class="pt-grp"><select class="pt-fx"><option value="">✨ ${T('Эффект, засвар…', 'Effects & adjustments…')}</option><optgroup label="${T('Засвар', 'Adjustments')}">${FX.filter(f => ['bright', 'contrast', 'gray', 'sepia', 'invert', 'hue', 'sat', 'poster'].includes(f[0])).map(f => `<option value="${f[0]}">${T(f[1], f[2])}</option>`).join('')}</optgroup><optgroup label="${T('Эффект', 'Effects')}">${FX.filter(f => !['bright', 'contrast', 'gray', 'sepia', 'invert', 'hue', 'sat', 'poster'].includes(f[0])).map(f => `<option value="${f[0]}">${T(f[1], f[2])}</option>`).join('')}</optgroup></select></div>
        <div class="pt-grp"><button class="g" data-m="fliph" title="${T('Хэвтээ тусгал', 'Flip horizontal')}">⇋</button><button class="g" data-m="flipv" title="${T('Босоо тусгал', 'Flip vertical')}">⇵</button><button class="g" data-m="rot" title="${T('90° эргүүлэх', 'Rotate 90°')}">⟳</button><button class="g" data-m="resize">⤡ ${T('Хэмжээ', 'Resize')}</button></div>
        <div class="pt-grp"><button class="g" data-z="-">−</button><b class="pt-zoom">100%</b><button class="g" data-z="+">+</button><button class="g" data-z="fit">${T('Багтаах', 'Fit')}</button></div>
        <div class="pt-grp pt-lang"><button data-lang="mn" class="${LANG === 'mn' ? 'on' : ''}">МН</button><button data-lang="both" class="${LANG === 'both' ? 'on' : ''}">МН+EN</button><button data-lang="en" class="${LANG === 'en' ? 'on' : ''}">EN</button></div>
      </div>
      <div class="pt-opts"></div>
      <div class="pt-body">
        <div class="pt-tools">${TOOLS.map(t => `<button data-tool="${t[0]}" title="${esc(T(t[2], t[3]))} (${t[4]})"><span class="pt-ti">${t[1]}</span><span class="pt-tl">${TL(t[2], t[3])}</span></button>`).join('')}
          <div class="pt-cols"><div class="pt-c1" title="${T('1-р өнгө', 'Primary')}"><input type="color" id="pt-c1"></div><div class="pt-c2" title="${T('2-р өнгө', 'Secondary')}"><input type="color" id="pt-c2"></div><button class="pt-swap" title="X">⇄</button></div>
          <div class="pt-pal">${PAL.map(c => `<button style="background:${c}" data-pc="${c}" title="${c}"></button>`).join('')}</div></div>
        <div class="pt-view"><div class="pt-stack"><canvas class="pt-cv"></canvas><canvas class="pt-ov"></canvas></div><form class="pt-text" hidden><input placeholder="${T('Бичвэрээ бич…', 'Type text…')}"><select><option>Nunito</option><option>Arial</option><option>Times New Roman</option><option>Courier New</option><option>Georgia</option></select><label><input type="checkbox" name="b">B</label><label><input type="checkbox" name="i"><i>I</i></label><button>✔</button><button type="button" class="pt-tx">✕</button></form><div class="pt-msg" hidden></div></div>
        <div class="pt-side"><b>${T('Давхаргууд', 'Layers')}</b><div class="pt-layers"></div>
          <div class="pt-lbtn"><button class="g" data-l="add" title="${T('Шинэ давхарга', 'Add layer')}">＋</button><button class="g" data-l="dup" title="${T('Хувилах', 'Duplicate')}">⧉</button><button class="g" data-l="up" title="${T('Дээш', 'Move up')}">▲</button><button class="g" data-l="down" title="${T('Доош', 'Move down')}">▼</button><button class="g" data-l="merge" title="${T('Доорхтой нэгтгэх', 'Merge down')}">⤓</button><button class="g" data-l="del" title="${T('Устгах', 'Delete')}">🗑</button></div>
          <label class="pt-lop">${T('Давхаргын тунгалаг бус', 'Layer opacity')}<input type="range" min="0" max="100" id="pt-lop"><b id="pt-lopv"></b></label>
          <p class="pt-tip">${T('Давхаргыг давхар дарж нэрийг нь солино. Зураг нээвэл шинэ давхарга болно.', 'Double-click a layer to rename. Opening an image adds a new layer.')}</p></div>
      </div>
      <div class="pt-status"><span class="pt-xy">0, 0</span><span class="pt-size"></span><span>${T('Товчлол: Ctrl+Z буцаах, Ctrl+Y давтах, [ ] зузаан, X өнгө солих', 'Keys: Ctrl+Z undo, Ctrl+Y redo, [ ] width, X swap colors')}</span></div></div>`;
    cv = root.querySelector('.pt-cv'); ov = root.querySelector('.pt-ov'); cx = cv.getContext('2d'); oc = ov.getContext('2d');
    ov.onpointerdown = down; ov.onpointermove = move; ov.onpointerup = up; ov.oncontextmenu = e => e.preventDefault();
    root.querySelectorAll('[data-tool]').forEach(b => b.onclick = () => { S.tool = b.dataset.tool; panel() });
    root.querySelectorAll('[data-pc]').forEach(b => { b.onclick = () => { S.c1 = b.dataset.pc; panel() }; b.oncontextmenu = e => { e.preventDefault(); S.c2 = b.dataset.pc; panel() } });
    root.querySelector('#pt-c1').oninput = e => { S.c1 = e.target.value; panel() }; root.querySelector('#pt-c2').oninput = e => { S.c2 = e.target.value; panel() };
    root.querySelector('.pt-swap').onclick = () => { [S.c1, S.c2] = [S.c2, S.c1]; panel() };
    root.querySelector('.pt-undo').onclick = undo; root.querySelector('.pt-redo').onclick = redo;
    root.querySelector('.pt-file input').onchange = e => openFile(e.target.files[0]);
    root.querySelectorAll('[data-m]').forEach(b => b.onclick = () => ({
      new: () => { const w = +prompt(T('Өргөн (пиксель):', 'Width (px):'), 800), h = +prompt(T('Өндөр (пиксель):', 'Height (px):'), 560); if (w > 0 && h > 0 && w <= 4000 && h <= 4000) { newDoc(w, h); render() } },
      png: () => exportImg('png'), jpg: () => exportImg('jpeg'), proj: saveProj, fliph: () => flip(true), flipv: () => flip(false), rot: rotate90, resize: resizeImg
    }[b.dataset.m]()));
    root.querySelector('.pt-fx').onchange = e => { const k = e.target.value; e.target.value = ''; if (!k) return; const f = FX.find(x => x[0] === k); let v = 0; if (f.length > 3) { const r = prompt(`${T(f[1], f[2])} (${f[3]} … ${f[4]}):`, f[5]); if (r === null) return; v = Math.max(f[3], Math.min(f[4], +r || 0)) } applyFx(k, v); panel(); msg(T(f[1], f[2]) + ' ✓') };
    root.querySelectorAll('[data-z]').forEach(b => b.onclick = () => { const z = b.dataset.z; const c = zf(); S.zoom = z === 'fit' ? 0 : z === '+' ? Math.min(16, c * 1.5) : Math.max(.1, c / 1.5); resizeView() });
    root.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { LANG = b.dataset.lang; try { localStorage.setItem('n9_plang', LANG) } catch (e) { } render() });
    root.querySelectorAll('[data-l]').forEach(b => b.onclick = () => {
      const a = b.dataset.l; snapAll();
      if (a === 'add') { S.layers.splice(S.cur + 1, 0, mkLayer(S.w, S.h, T('Давхарга ', 'Layer ') + (S.layers.length + 1))); S.cur++ }
      if (a === 'dup') { const l = L(), n = mkLayer(S.w, S.h, l.name + ' 2'); n.ctx.drawImage(l.c, 0, 0); n.op = l.op; S.layers.splice(S.cur + 1, 0, n); S.cur++ }
      if (a === 'up' && S.cur < S.layers.length - 1) { [S.layers[S.cur], S.layers[S.cur + 1]] = [S.layers[S.cur + 1], S.layers[S.cur]]; S.cur++ }
      if (a === 'down' && S.cur > 0) { [S.layers[S.cur], S.layers[S.cur - 1]] = [S.layers[S.cur - 1], S.layers[S.cur]]; S.cur-- }
      if (a === 'merge' && S.cur > 0) { const top = L(), bot = S.layers[S.cur - 1]; bot.ctx.globalAlpha = top.op / 100; bot.ctx.drawImage(top.c, 0, 0); bot.ctx.globalAlpha = 1; S.layers.splice(S.cur, 1); S.cur-- }
      if (a === 'del') { if (S.layers.length < 2) { S.undo.pop(); msg(T('Сүүлийн давхаргыг устгах боломжгүй.', 'Cannot delete the last layer.')); return } S.layers.splice(S.cur, 1); S.cur = Math.max(0, S.cur - 1) }
      paint(); panel();
    });
    root.querySelector('#pt-lop').oninput = e => { L().op = +e.target.value; root.querySelector('#pt-lopv').textContent = e.target.value + '%'; paint() };
    resizeView(); panel();
  }
  document.addEventListener('keydown', e => {
    if (!root?.isConnected || e.target.closest('input,textarea,select')) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); return }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '[') { S.size = Math.max(1, S.size - 2); panel(); return } if (e.key === ']') { S.size = Math.min(80, S.size + 2); panel(); return }
    if (e.key.toLowerCase() === 'x') { [S.c1, S.c2] = [S.c2, S.c1]; panel(); return }
    if (e.key === 'Delete' && S.sel) { snap('del'); L().ctx.clearRect(S.sel.x, S.sel.y, S.sel.w, S.sel.h); paint(); return }
    const t = TOOLS.find(t => t[4].toLowerCase() === e.key.toLowerCase()); if (t) { S.tool = t[0]; panel() }
  });
  window.addEventListener('resize', () => { if (root?.isConnected && !S.zoom) resizeView() });

  const css = document.createElement('style');
  css.textContent = `
.pt{--ln:#d9cdb5;background:#f4efe4;color:#2a1a10;border:2px solid var(--ln);border-radius:16px;padding:8px;font-family:Nunito,Arial,sans-serif;user-select:none}
.pt button{font:inherit;font-weight:800;border:0;border-radius:9px;padding:5px 9px;cursor:pointer;box-shadow:none;min-height:32px;background:#2a5ab8;color:#fff}
.pt .g{background:#fff;color:#2a1a10;border:1.5px solid var(--ln)}.pt button:disabled{opacity:.4}
.pt-menu{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:6px}.pt-grp{display:flex;gap:3px;align-items:center;background:#fffaf0;border:1.5px solid var(--ln);border-radius:11px;padding:3px}
.pt-file{display:inline-flex;align-items:center;border-radius:9px;padding:5px 9px;cursor:pointer;font-weight:800}
.pt-fx{font:inherit;font-weight:700;border:0;background:transparent;padding:4px}.pt-zoom{min-width:48px;text-align:center;font-size:14px}
.pt-lang button{background:#fff;color:#2a1a10}.pt-lang button.on{background:#2a5ab8;color:#fff}
.pt-opts{display:flex;gap:12px;flex-wrap:wrap;align-items:center;background:#fffaf0;border:1.5px solid var(--ln);border-radius:11px;padding:4px 10px;min-height:42px;margin-bottom:6px;font-size:13px}
.pt-opts label{display:flex;gap:6px;align-items:center;margin:0;font-weight:700}.pt-opts input[type=range]{width:110px;min-height:0}.pt-opts input[type=number]{width:64px;min-height:0;padding:2px 6px}.pt-opts select{font:inherit;padding:2px;min-height:0}
.pt-hint{color:#8a7558;font-size:12px;margin-left:auto}
.pt-stamps{display:flex;gap:2px;flex-wrap:wrap}.pt-stamps button{background:#fff;border:1.5px solid var(--ln);padding:1px;min-height:0}.pt-stamps button.on{border-color:#2a5ab8;background:#e8f0ff}.pt-stamps img{width:30px;height:30px;display:block}
.pt-body{display:grid;grid-template-columns:172px 1fr 210px;gap:8px;height:720px}
.pt-tools{background:#fffaf0;border:1.5px solid var(--ln);border-radius:11px;padding:5px;display:grid;grid-template-columns:1fr 1fr;gap:3px;align-content:start;overflow:auto}
.pt-tools [data-tool]{background:#fff;color:#2a1a10;border:1.5px solid #eadcc0;padding:4px 3px;min-height:52px;display:flex;flex-direction:column;align-items:center;gap:1px;border-radius:10px;box-shadow:0 2px 0 #eadcc0}.pt-tools [data-tool].on{background:#1b3a6b;color:#fff;border-color:#1b3a6b;box-shadow:0 2px 0 #0e2350}
.pt-ti{font-size:19px;line-height:1.1}.pt-tl{display:flex;flex-direction:column;align-items:center;line-height:1.05}.pt-tl b{font-size:11px;font-weight:800}.pt-tl small{font-size:9.5px;opacity:.75}
.pt-hees button{display:inline-flex;flex-direction:column;align-items:center}.pt-hees img{width:34px;height:34px}.pt-hees small{font-size:10px}
.pt-cols{grid-column:1/-1;position:relative;height:62px;margin-top:6px}.pt-c1,.pt-c2{position:absolute;width:38px;height:38px;border:2px solid #fff;outline:1.5px solid #5a4a35;border-radius:6px}.pt-c1{left:6px;top:2px;z-index:2}.pt-c2{left:30px;top:22px}
.pt-cols input{opacity:0;width:100%;height:100%;cursor:pointer;padding:0;border:0}.pt-swap{position:absolute;right:0;top:0;background:transparent!important;color:#2a1a10!important;font-size:14px;padding:0!important;min-height:0!important}
.pt-pal{grid-column:1/-1;display:grid;grid-template-columns:repeat(6,1fr);gap:3px;margin-top:4px}.pt-pal button{height:18px;min-height:0;padding:0;border:1px solid #9a8a70;border-radius:4px}
.pt-view{position:relative;background:#cfc6b4;border-radius:11px;overflow:auto;display:flex;align-items:center;justify-content:center;padding:14px}
.pt-stack{position:relative;flex:none;box-shadow:0 4px 18px rgba(0,0,0,.25);margin:auto}.pt-stack canvas{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated}.pt-ov{cursor:crosshair;touch-action:none}
.pt-text[hidden],.pt-msg[hidden]{display:none}.pt-text{position:absolute;left:10px;right:10px;top:10px;display:flex;gap:6px;align-items:center;background:#fff;border-radius:11px;padding:6px;box-shadow:0 4px 14px rgba(0,0,0,.2)}.pt-text input:not([type]){flex:1;font:inherit;padding:5px 8px;border:1.5px solid var(--ln);border-radius:8px}.pt-text label{margin:0;display:flex;gap:2px;align-items:center}
.pt-msg{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);background:#2a1a10;color:#fff;border-radius:10px;padding:6px 14px;font-weight:700}
.pt-side{background:#fffaf0;border:1.5px solid var(--ln);border-radius:11px;padding:6px;display:flex;flex-direction:column;gap:6px;overflow:auto}
.pt-layers{display:flex;flex-direction:column;gap:3px}.pt-lay{display:flex;align-items:center;gap:5px;background:#fff;border:1.5px solid var(--ln);border-radius:8px;padding:3px;cursor:pointer;font-size:13px;font-weight:700}.pt-lay.on{border-color:#2a5ab8;background:#e8f0ff}
.pt-lay canvas{border:1px solid #ccc;flex:none}.pt-lay span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pt-eye{background:transparent!important;color:#2a1a10!important;padding:0 2px!important;min-height:0!important;width:22px}
.pt-lbtn{display:flex;gap:2px;flex-wrap:wrap}.pt-lbtn button{padding:3px 7px;min-height:28px}.pt-lop{display:flex;flex-direction:column;font-size:12px;font-weight:700;margin:0}.pt-lop input{min-height:0}.pt-tip{font-size:11px;color:#8a7558;margin:0}
.pt-status{display:flex;gap:16px;font-size:12px;color:#5a4a35;padding:4px 6px 0;flex-wrap:wrap}
@media(max-width:900px){.pt-body{grid-template-columns:80px 1fr;height:auto}.pt-view{height:460px}.pt-side{grid-column:1/-1}}`;
  document.head.appendChild(css);

  window.PaintLab = {
    mount(el, o = {}) { root = el; try { LANG = o.lang || localStorage.getItem('n9_plang') || 'both' } catch (e) { } newDoc(o.w || 800, o.h || 560); render() },
    get state() { return S }, _fx: applyFx,
  };
})();
