/* =====================================================================
   Блок схемийн лаборатори — Flowgorithm маягийн (МН/EN)
   FlowLab.mount(el, {lang, program, onSave, onChange})
   ===================================================================== */
(function () {
  let LANG = 'mn';
  const T = (mn, en) => (LANG === 'en' ? en : mn);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TYPES = { int: ['Бүхэл', 'Integer'], real: ['Бодит', 'Real'], str: ['Тэмдэгт мөр', 'String'], bool: ['Логик', 'Boolean'] };
  const SH = {
    decl: { c: '#ffe58a', mn: 'Зарлах', en: 'Declare' }, assign: { c: '#ffc98a', mn: 'Утга олгох', en: 'Assign' },
    input: { c: '#a8d4ff', mn: 'Оролт', en: 'Input' }, output: { c: '#9fe3bd', mn: 'Гаралт', en: 'Output' },
    if: { c: '#ffb3c4', mn: 'Нөхцөл (Хэрэв)', en: 'If' }, while: { c: '#d3c2ff', mn: 'Давталт (While)', en: 'While' },
    for: { c: '#d3c2ff', mn: 'Давталт (For)', en: 'For' }, do: { c: '#d3c2ff', mn: 'Давталт (Do)', en: 'Do' },
    comment: { c: '#d9d2c3', mn: 'Тайлбар', en: 'Comment' }
  };
  const EX = [
    { mn: 'Шугаман: тэгш өнцөгтийн талбай', en: 'Linear: rectangle area', p: [
      { t: 'decl', v: 'a, b, S', ty: 'real' }, { t: 'output', e: '"Урт, өргөнөө оруул:"' }, { t: 'input', v: 'a' }, { t: 'input', v: 'b' },
      { t: 'assign', v: 'S', e: 'a * b' }, { t: 'output', e: '"Талбай = " & S' }] },
    { mn: 'Салаалсан: тэгш, сондгой', en: 'Branching: even or odd', p: [
      { t: 'decl', v: 'n', ty: 'int' }, { t: 'output', e: '"Тоо оруул:"' }, { t: 'input', v: 'n' },
      { t: 'if', e: 'n % 2 == 0', y: [{ t: 'output', e: 'n & " тэгш тоо"' }], n: [{ t: 'output', e: 'n & " сондгой тоо"' }] }] },
    { mn: 'Параметртэй давталт: 1-ээс n хүртэлх нийлбэр', en: 'For loop: sum 1..n', p: [
      { t: 'decl', v: 'n, i, s', ty: 'int' }, { t: 'input', v: 'n' }, { t: 'assign', v: 's', e: '0' },
      { t: 'for', v: 'i', a: '1', b: 'n', s: '1', body: [{ t: 'assign', v: 's', e: 's + i' }] }, { t: 'output', e: '"Нийлбэр = " & s' }] },
    { mn: 'Нөхцөлт давталт: тоо таах тоглоом', en: 'While loop: guess the number', p: [
      { t: 'decl', v: 'nuuts, taah, oroldlogo', ty: 'int' }, { t: 'assign', v: 'nuuts', e: 'random(20) + 1' }, { t: 'assign', v: 'oroldlogo', e: '1' },
      { t: 'output', e: '"1-20 хооронд тоо таа:"' }, { t: 'input', v: 'taah' },
      { t: 'while', e: 'taah != nuuts', body: [{ t: 'if', e: 'taah < nuuts', y: [{ t: 'output', e: '"Их тоо оруул"' }], n: [{ t: 'output', e: '"Бага тоо оруул"' }] }, { t: 'input', v: 'taah' }, { t: 'assign', v: 'oroldlogo', e: 'oroldlogo + 1' }] },
      { t: 'output', e: '"Зөв! " & oroldlogo & " оролдлогоор таалаа."' }] },
    { mn: 'Мал тоолох: 5 хошуу малын нийлбэр', en: 'Count livestock', p: [
      { t: 'decl', v: 'i, too, niit', ty: 'int' }, { t: 'assign', v: 'niit', e: '0' },
      { t: 'for', v: 'i', a: '1', b: '5', s: '1', body: [{ t: 'output', e: 'i & "-р төрлийн малын тоо:"' }, { t: 'input', v: 'too' }, { t: 'assign', v: 'niit', e: 'niit + too' }] },
      { t: 'output', e: '"Нийт мал: " & niit' }, { t: 'if', e: 'niit >= 1000', y: [{ t: 'output', e: '"Мянгат малчин!"' }], n: [] }] },
  ];

  let P, root, opts, run = null, sel = null, speed = 5, view = 'chart';
  const newProg = () => ({ v: 1, name: T('Миний программ', 'My program'), main: [] });

  /* ---------- Илэрхийлэл ---------- */
  function jsExpr(src) {
    let s = String(src ?? '');
    let out = '', i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === '"' || c === "'") { let j = i + 1; while (j < s.length && s[j] !== c) j++; out += JSON.stringify(s.slice(i + 1, j)); i = j + 1; continue }
      out += c; i++;
    }
    // тэмдэгт мөрийг түр нууж, оператор солих
    const strs = []; out = out.replace(/"(?:[^"\\]|\\.)*"/g, m => { strs.push(m); return `\u0001${strs.length - 1}\u0001` });
    out = out.replace(/<>/g, '!=').replace(/&&/g, '§AND§').replace(/\|\|/g, '§OR§').replace(/&/g, '+').replace(/§AND§/g, '&&').replace(/§OR§/g, '||')
      .replace(/\band\b|\bба\b/gi, '&&').replace(/\bor\b|\bэсвэл\b/gi, '||').replace(/\bnot\b|\bбиш\b/gi, '!').replace(/\bmod\b/gi, '%').replace(/\^/g, '**')
      .replace(/(^|[^=!<>])=(?!=)/g, '$1==').replace(/\btrue\b|\bүнэн\b/gi, 'true').replace(/\bfalse\b|\bхудал\b/gi, 'false');
    return out.replace(/\u0001(\d+)\u0001/g, (_, k) => strs[+k]);
  }
  const FN = {
    sqrt: Math.sqrt, abs: Math.abs, int: x => Math.trunc(x), round: Math.round, random: n => Math.floor(Math.random() * n),
    len: s => String(s).length, sin: Math.sin, cos: Math.cos, pi: Math.PI, tostring: String, tointeger: x => Math.trunc(+x), toreal: x => +x,
  };
  function ev(src, V) {
    const js = jsExpr(src);
    const ids = (js.replace(/"(?:[^"\\]|\\.)*"/g, '').match(/[\p{L}_][\p{L}\p{N}_]*/gu) || []).filter(w => !['true', 'false', 'Math'].includes(w));
    for (const w of ids) if (!(w in V) && !(w.toLowerCase() in FN)) throw new Error(T(`«${w}» хувьсагч зарлагдаагүй байна.`, `Variable "${w}" is not declared.`));
    for (const w of ids) if (w in V && V[w].v === undefined && !(w.toLowerCase() in FN)) throw new Error(T(`«${w}» хувьсагчид утга олгоогүй байна.`, `Variable "${w}" has no value.`));
    const names = Object.keys(V), fnn = Object.keys(FN);
    const lowerJs = js.replace(/\b(sqrt|abs|int|round|random|len|sin|cos|pi|tostring|tointeger|toreal)\b/gi, m => m.toLowerCase());
    try { return new Function(...names, ...fnn, '"use strict";return (' + lowerJs + ')')(...names.map(n => V[n].v), ...fnn.map(f => FN[f])) }
    catch (e) { throw new Error(T('Илэрхийлэл буруу: ', 'Bad expression: ') + src) }
  }
  function cast(val, ty, raw) {
    if (ty === 'int') { const n = Number(val); if (raw && (val === '' || isNaN(n))) throw new Error(T(`«${val}» бүхэл тоо биш.`, `"${val}" is not an integer.`)); return Math.trunc(n) }
    if (ty === 'real') { const n = Number(val); if (raw && (val === '' || isNaN(n))) throw new Error(T(`«${val}» тоо биш.`, `"${val}" is not a number.`)); return n }
    if (ty === 'bool') return raw ? /^(true|үнэн|1|тийм)$/i.test(String(val).trim()) : !!val;
    return String(val);
  }
  const fmt = v => typeof v === 'number' && !Number.isInteger(v) ? String(+v.toFixed(6)) : typeof v === 'boolean' ? (v ? T('Үнэн', 'true') : T('Худал', 'false')) : String(v);

  /* ---------- Гүйцэтгэл (генератор: алхам бүр зангилаа) ---------- */
  function* exec(list, V, path) {
    for (let i = 0; i < list.length; i++) {
      const n = list[i], p = `${path}/${i}`;
      yield p;
      switch (n.t) {
        case 'decl': n.v.split(',').map(s => s.trim()).filter(Boolean).forEach(nm => { if (!/^[\p{L}_][\p{L}\p{N}_]*$/u.test(nm)) throw new Error(T(`«${nm}» нэр буруу.`, `Bad name "${nm}".`)); V[nm] = { ty: n.ty || 'int', v: undefined } }); break;
        case 'assign': { const nm = n.v.trim(); if (!(nm in V)) throw new Error(T(`«${nm}» хувьсагч зарлагдаагүй байна.`, `Variable "${nm}" is not declared.`)); V[nm].v = cast(ev(n.e, V), V[nm].ty); break }
        case 'input': { const nm = n.v.trim(); if (!(nm in V)) throw new Error(T(`«${nm}» хувьсагч зарлагдаагүй байна.`, `Variable "${nm}" is not declared.`)); const val = yield { input: nm }; V[nm].v = cast(val, V[nm].ty, true); break }
        case 'output': yield { output: fmt(ev(n.e, V)) }; break;
        case 'if': if (ev(n.e, V)) yield* exec(n.y || [], V, p + '/y'); else yield* exec(n.n || [], V, p + '/n'); break;
        case 'while': { let g = 0; while (ev(n.e, V)) { if (++g > 100000) throw new Error(T('Төгсгөлгүй давталт байж магадгүй.', 'Possible infinite loop.')); yield* exec(n.body || [], V, p + '/body'); yield p } break }
        case 'do': { let g = 0; do { if (++g > 100000) throw new Error(T('Төгсгөлгүй давталт байж магадгүй.', 'Possible infinite loop.')); yield* exec(n.body || [], V, p + '/body'); yield p } while (ev(n.e, V)); break }
        case 'for': { const nm = n.v.trim(); if (!(nm in V)) throw new Error(T(`«${nm}» хувьсагч зарлагдаагүй байна.`, `Variable "${nm}" is not declared.`)); const a = +ev(n.a, V), b = +ev(n.b, V), s = +ev(n.s || '1', V) || 1; let g = 0;
          for (V[nm].v = a; s > 0 ? V[nm].v <= b : V[nm].v >= b; V[nm].v += s) { if (++g > 100000) throw new Error(T('Хэт олон давталт.', 'Too many iterations.')); yield* exec(n.body || [], V, p + '/body'); yield p } break }
      }
    }
  }
  function start(stepMode) {
    stop(true);
    const V = {}; run = { V, g: exec(P.main, V, 'm'), cur: null, wait: null, step: stepMode, done: false };
    con('', 'clear'); con(T('— Программ эхэллээ —', '— Program started —'), 'sys');
    tick();
  }
  function tick(inputVal) {
    if (!run || run.done) return;
    let r;
    try { r = inputVal !== undefined ? run.g.next(inputVal) : run.g.next() } catch (e) { con('⚠ ' + e.message, 'err'); finish(); return }
    if (r.done) { con(T('— Программ дууслаа —', '— Program ended —'), 'sys'); finish(); return }
    const v = r.value;
    if (typeof v === 'string') { run.cur = v; paintCur(); vars(); if (run.step) return; setTimeout(() => tick(), speed >= 10 ? 0 : 900 / speed); return }
    if (v.output != null) { con(v.output, 'out'); setTimeout(() => tick(), speed >= 10 ? 0 : 120); return }
    if (v.input) { run.wait = v.input; askInput(v.input); return }
  }
  function finish() { if (run) run.done = true; run && (run.cur = null); paintCur(); vars(); root.querySelector('.fl-in').hidden = true; setBtns() }
  function stop(silent) { if (run) { run.done = true; run = null } if (!silent) con(T('— Зогсоосон —', '— Stopped —'), 'sys'); paintCur(); root?.querySelector('.fl-in') && (root.querySelector('.fl-in').hidden = true); setBtns() }
  function askInput(nm) { const f = root.querySelector('.fl-in'); f.hidden = false; f.querySelector('b').textContent = nm + ' = '; const i = f.querySelector('input'); i.value = ''; setTimeout(() => i.focus(), 20); setBtns() }
  function con(t, cls) { const c = root.querySelector('.fl-con'); if (cls === 'clear') { c.innerHTML = ''; return } const d = document.createElement('div'); d.className = 'fl-' + cls; d.textContent = t; c.appendChild(d); c.scrollTop = c.scrollHeight }
  function vars() { const w = root.querySelector('.fl-vars'); const V = run?.V || {}; w.innerHTML = Object.keys(V).length ? `<table><tr><th>${T('Нэр', 'Name')}</th><th>${T('Төрөл', 'Type')}</th><th>${T('Утга', 'Value')}</th></tr>${Object.entries(V).map(([k, x]) => `<tr><td>${esc(k)}</td><td>${T(...TYPES[x.ty])}</td><td><b>${x.v === undefined ? '—' : esc(fmt(x.v))}</b></td></tr>`).join('')}</table>` : `<p class="fl-mut">${T('Хувьсагч алга.', 'No variables yet.')}</p>` }
  function paintCur() { root?.querySelectorAll('.fl-node.cur').forEach(n => n.classList.remove('cur')); if (run?.cur) { const n = root.querySelector(`.fl-node[data-p="${run.cur}"]`); n?.classList.add('cur'); n?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }) } }
  function setBtns() { const b = root?.querySelector('.fl-bar'); if (!b) return; b.querySelector('#fl-run').disabled = !!run && !run.done && !run.step; b.querySelector('#fl-stop').disabled = !run || run.done }

  /* ---------- Блок схем зурах (SVG) ---------- */
  const NW = 168, NH = 46, GAP = 30;
  const lbl = n => {
    switch (n.t) {
      case 'decl': return `${T(...TYPES[n.ty || 'int'])} ${n.v}`;
      case 'assign': return `${n.v} = ${n.e}`;
      case 'input': return `${T('Оролт', 'Input')} ${n.v}`;
      case 'output': return `${T('Гаралт', 'Output')} ${n.e}`;
      case 'if': case 'while': return n.e;
      case 'do': return n.e;
      case 'for': return `${n.v} = ${n.a} ${T('-аас', 'to')} ${n.b}${n.s && n.s !== '1' ? ` (${T('алхам', 'step')} ${n.s})` : ''}`;
      case 'comment': return n.e;
    }
  };
  const short = (s, m = 24) => { s = String(s); return s.length > m ? s.slice(0, m - 1) + '…' : s };
  function tw(s) { return Math.max(NW, String(s).length * 8.8 + 44) }
  function lay(list, path) { // {w,h,d:(cx,y)=>svg}
    const items = list.map((n, i) => node(n, `${path}/${i}`));
    const plus = (cx, y, i) => `<g class="fl-plus" data-l="${path}" data-i="${i}" transform="translate(${cx} ${y})"><circle r="9"/><path d="M-4 0h8M0 -4v8"/></g>`;
    let h = GAP, w = 60; items.forEach(it => { h += it.h + GAP; w = Math.max(w, it.w) });
    return { w, h, d: (cx, y) => { let s = '', yy = y; s += line(cx, yy, cx, yy + GAP) + plus(cx, yy + GAP / 2, 0); yy += GAP; items.forEach((it, i) => { s += it.d(cx, yy); yy += it.h; s += line(cx, yy, cx, yy + GAP, true) + plus(cx, yy + GAP / 2, i + 1); yy += GAP }); return s } };
  }
  const line = (x1, y1, x2, y2, ar) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="fl-ln" ${ar ? 'marker-end="url(#fla)"' : ''}/>`;
  const poly = pts => `<polyline points="${pts.map(p => p.join(',')).join(' ')}" class="fl-ln" fill="none"/>`;
  const txt = (x, y, s, col = '#1a1208') => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="fl-t" fill="${col}">${esc(short(s, 30))}</text>`;
  function node(n, p) {
    const c = SH[n.t].c, s = lbl(n), w = tw(short(s, 30));
    const g = (inner) => `<g class="fl-node ${sel === p ? 'sel' : ''}" data-p="${p}">${inner}</g>`;
    if (n.t === 'if') {
      const Y = lay(n.y || [], p + '/y'), N = lay(n.n || [], p + '/n'), dw = Math.max(w, 150), dh = 54;
      const lw = Math.max(Y.w, 100), rw = Math.max(N.w, 100), offL = Math.max(dw / 2 + 12, lw / 2 + 16), offR = Math.max(dw / 2 + 12, rw / 2 + 16), bh = Math.max(Y.h, N.h);
      const W = 2 * Math.max(offL + lw / 2, offR + rw / 2);
      return { w: W, h: dh + bh + 20, d: (cx, y) => { const lx = cx - offL, rx = cx + offR, m = y + dh / 2, bot = y + dh + bh + 10;
        return g(`<polygon points="${cx},${y} ${cx + dw / 2},${m} ${cx},${y + dh} ${cx - dw / 2},${m}" fill="${c}" class="fl-sh"/>${txt(cx, m, s)}`) +
          poly([[cx - dw / 2, m], [lx, m], [lx, y + dh]]) + poly([[cx + dw / 2, m], [rx, m], [rx, y + dh]]) +
          `<text x="${cx - dw / 2 - 6}" y="${m - 7}" text-anchor="end" class="fl-yn">${T('Тийм', 'True')}</text><text x="${cx + dw / 2 + 6}" y="${m - 7}" class="fl-yn" fill="#c8102e" style="fill:#c8102e">${T('Үгүй', 'False')}</text>` +
          Y.d(lx, y + dh) + N.d(rx, y + dh) + poly([[lx, y + dh + Y.h], [lx, bot], [rx, bot], [rx, y + dh + N.h]]) + `<circle cx="${cx}" cy="${bot}" r="4" fill="#7a6a55"/>` + line(cx, bot, cx, y + dh + bh + 20) } };
    }
    if (n.t === 'while' || n.t === 'for') {
      const Bd = lay(n.body || [], p + '/body'), dw = Math.max(w + 20, 170), dh = 54, half = Math.max(Bd.w / 2, dw / 2, 60) + 30, W = 2 * half + 10;
      return { w: W, h: dh + Bd.h + 26, d: (cx, y) => { const m = y + dh / 2, bx = cx, lxL = cx - half, rxR = cx + half, end = y + dh + Bd.h;
        const shape = `<polygon points="${cx - dw / 2 + 16},${y} ${cx + dw / 2 - 16},${y} ${cx + dw / 2},${m} ${cx + dw / 2 - 16},${y + dh} ${cx - dw / 2 + 16},${y + dh} ${cx - dw / 2},${m}" fill="${c}" class="fl-sh"/>`;
        return g(shape + txt(cx, m, s)) + `<text x="${cx + 6}" y="${y + dh + 12}" class="fl-yn">${T('Тийм', 'True')}</text>` + Bd.d(bx, y + dh) +
          poly([[bx, end], [bx, end + 10], [lxL, end + 10], [lxL, m], [cx - dw / 2, m]]) + `<text x="${cx + dw / 2 + 6}" y="${m - 7}" class="fl-yn" fill="#c8102e" style="fill:#c8102e">${T('Үгүй', 'False')}</text>` +
          poly([[cx + dw / 2, m], [rxR, m], [rxR, end + 20], [cx, end + 20]]) + line(cx, end + 20, cx, end + 26) } };
    }
    if (n.t === 'do') {
      const Bd = lay(n.body || [], p + '/body'), dw = Math.max(w + 20, 170), dh = 54;
      return { w: Math.max(Bd.w, 120) + 80, h: Bd.h + dh + 10, d: (cx, y) => { const m = y + Bd.h + dh / 2, lxL = cx - Math.max(Bd.w, 120) / 2 - 30;
        return Bd.d(cx, y) + g(`<polygon points="${cx - dw / 2 + 16},${y + Bd.h} ${cx + dw / 2 - 16},${y + Bd.h} ${cx + dw / 2},${m} ${cx + dw / 2 - 16},${y + Bd.h + dh} ${cx - dw / 2 + 16},${y + Bd.h + dh} ${cx - dw / 2},${m}" fill="${c}" class="fl-sh"/>${txt(cx, m, s)}`) +
          poly([[cx - dw / 2, m], [lxL, m], [lxL, y + 6], [cx, y + 6]]) + `<text x="${cx - dw / 2 - 6}" y="${m - 7}" text-anchor="end" class="fl-yn">${T('Тийм', 'True')}</text>` + line(cx, y + Bd.h + dh, cx, y + Bd.h + dh + 10) } };
    }
    let shape;
    if (n.t === 'input' || n.t === 'output') shape = (cx, y) => `<polygon points="${cx - w / 2 + 12},${y} ${cx + w / 2 + 12},${y} ${cx + w / 2 - 12},${y + NH} ${cx - w / 2 - 12},${y + NH}" fill="${c}" class="fl-sh"/>`;
    else if (n.t === 'decl') shape = (cx, y) => `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="${NH}" fill="${c}" class="fl-sh"/><line x1="${cx - w / 2 + 8}" y1="${y}" x2="${cx - w / 2 + 8}" y2="${y + NH}" class="fl-in-l"/><line x1="${cx - w / 2}" y1="${y + 8}" x2="${cx + w / 2}" y2="${y + 8}" class="fl-in-l"/>`;
    else if (n.t === 'comment') shape = (cx, y) => `<path d="M${cx - w / 2} ${y} h${w} v${NH} h-${w}" fill="${c}" class="fl-sh" stroke-dasharray="5 4"/>`;
    else shape = (cx, y) => `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="${NH}" rx="3" fill="${c}" class="fl-sh"/>`;
    return { w: w + 30, h: NH, d: (cx, y) => g(shape(cx, y) + txt(cx, y + NH / 2, s)) };
  }
  function chartSVG() {
    const M = lay(P.main, 'm'), W = Math.max(M.w + 120, 320), cx = W / 2, H = 46 + M.h + 46 + 10;
    const oval = (y, t) => `<rect x="${cx - 60}" y="${y}" width="120" height="40" rx="20" class="fl-term"/>${txt(cx, y + 20, t, '#fff')}`;
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="fl-svg"><defs><marker id="fla" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7a6a55"/></marker></defs>
      ${oval(4, T('Эхлэл', 'Main'))}${M.d(cx, 44)}${oval(44 + M.h + 2, T('Төгсгөл', 'End'))}</svg>`;
  }

  /* ---------- Код үүсгэх ---------- */
  function pyExpr(e) { return jsExpr(e).replace(/&&/g, ' and ').replace(/\|\|/g, ' or ').replace(/!(?!=)/g, 'not ').replace(/\+/g, ' + ') }
  function toPy(list, ind = '') {
    return list.map(n => {
      switch (n.t) {
        case 'decl': return n.v.split(',').map(v => `${ind}${v.trim()} = ${n.ty === 'str' ? '""' : n.ty === 'bool' ? 'False' : n.ty === 'real' ? '0.0' : '0'}`).join('\n');
        case 'assign': return `${ind}${n.v} = ${pyExpr(n.e)}`;
        case 'input': return `${ind}${n.v} = input()`;
        case 'output': { const pe = pyExpr(n.e); return /\"/.test(n.e) && / \+ /.test(pe) ? `${ind}print(${pe.replace(/ \+ /g, ', ')}, sep="")` : `${ind}print(${pe})` }
        case 'if': return `${ind}if ${pyExpr(n.e)}:\n${toPy(n.y || [], ind + '    ') || ind + '    pass'}${(n.n || []).length ? `\n${ind}else:\n${toPy(n.n, ind + '    ')}` : ''}`;
        case 'while': return `${ind}while ${pyExpr(n.e)}:\n${toPy(n.body || [], ind + '    ') || ind + '    pass'}`;
        case 'do': return `${ind}while True:\n${toPy(n.body || [], ind + '    ')}\n${ind}    if not (${pyExpr(n.e)}):\n${ind}        break`;
        case 'for': return `${ind}for ${n.v} in range(${n.a}, ${n.b} + 1${n.s && n.s !== '1' ? ', ' + n.s : ''}):\n${toPy(n.body || [], ind + '    ') || ind + '    pass'}`;
        case 'comment': return `${ind}# ${n.e}`;
      }
    }).join('\n');
  }
  function toMn(list, ind = '') {
    return list.map(n => {
      switch (n.t) {
        case 'decl': return `${ind}ЗАРЛА ${n.v} : ${T(...TYPES[n.ty || 'int'])}`;
        case 'assign': return `${ind}${n.v} ← ${n.e}`;
        case 'input': return `${ind}УНШ ${n.v}`;
        case 'output': return `${ind}ХЭВЛЭ ${n.e}`;
        case 'if': return `${ind}ХЭРЭВ ${n.e} БОЛ\n${toMn(n.y || [], ind + '   ')}${(n.n || []).length ? `\n${ind}ҮГҮЙ БОЛ\n${toMn(n.n, ind + '   ')}` : ''}\n${ind}ТӨГС`;
        case 'while': return `${ind}${n.e} ҮЕД ДАВТ\n${toMn(n.body || [], ind + '   ')}\n${ind}ТӨГС`;
        case 'do': return `${ind}ДАВТ\n${toMn(n.body || [], ind + '   ')}\n${ind}${n.e} ҮЕД`;
        case 'for': return `${ind}${n.v} = ${n.a}-ААС ${n.b} ХҮРТЭЛ${n.s && n.s !== '1' ? ` (АЛХАМ ${n.s})` : ''} ДАВТ\n${toMn(n.body || [], ind + '   ')}\n${ind}ТӨГС`;
        case 'comment': return `${ind}// ${n.e}`;
      }
    }).join('\n');
  }

  /* ---------- Засварлах цонх ---------- */
  function listAt(lp) { const parts = lp.split('/'); let list = P.main, node = null; for (let k = 1; k < parts.length; k++) { const p = parts[k]; if (/^\d+$/.test(p)) node = list[+p]; else { node[p] ??= []; list = node[p] } } return list }
  function nodeAt(p) { const k = p.lastIndexOf('/'); return { list: listAt(p.slice(0, k)), i: +p.slice(k + 1) } }
  function editor(n, onOk, isNew) {
    const f = (lab, k, ph = '', type = 'text') => `<label>${lab}<input data-k="${k}" value="${esc(n[k] ?? '')}" placeholder="${esc(ph)}" ${type === 'num' ? 'inputmode="decimal"' : ''}></label>`;
    const fields = {
      decl: f(T('Хувьсагчийн нэр (таслалаар)', 'Variable names (comma separated)'), 'v', 'a, b, S') + `<label>${T('Төрөл', 'Type')}<select data-k="ty">${Object.entries(TYPES).map(([k, t]) => `<option value="${k}" ${n.ty === k ? 'selected' : ''}>${T(...t)}</option>`).join('')}</select></label>`,
      assign: f(T('Хувьсагч', 'Variable'), 'v', 'S') + f(T('Илэрхийлэл', 'Expression'), 'e', 'a * b'),
      input: f(T('Хувьсагч', 'Variable'), 'v', 'a'),
      output: f(T('Илэрхийлэл', 'Expression'), 'e', '"Хариу: " & S'),
      if: f(T('Нөхцөл', 'Condition'), 'e', 'n % 2 == 0'), while: f(T('Нөхцөл', 'Condition'), 'e', 'i <= 10'), do: f(T('Нөхцөл (үнэн бол давтана)', 'Condition (loop while true)'), 'e', 'x < 10'),
      for: f(T('Хувьсагч', 'Variable'), 'v', 'i') + f(T('Эхлэх утга', 'Start'), 'a', '1') + f(T('Төгсгөлийн утга', 'End'), 'b', '10') + f(T('Алхам', 'Step'), 's', '1'),
      comment: f(T('Тайлбар', 'Comment'), 'e', ''),
    }[n.t];
    const box = root.querySelector('.fl-dlg'); box.hidden = false;
    box.innerHTML = `<form class="fl-dlgin"><h3 style="margin:0 0 6px"><i style="background:${SH[n.t].c}"></i>${T(SH[n.t].mn, SH[n.t].en)}</h3>${fields}
      <p class="fl-mut">${T('Тэмдэгт мөрийг "..." хашилтад бичнэ. Холбох: &amp;. Тэнцүү: ==, Тэнцүү биш: !=. Үйлдэл: + - * / % (үлдэгдэл). Функц: sqrt(), abs(), int(), random(n), len().', 'Strings in "...". Join: &amp;. Equal: ==, not equal: !=. Ops: + - * / % (mod). Functions: sqrt(), abs(), int(), random(n), len().')}</p>
      <p class="fl-err2"></p><div class="fl-row">${isNew ? '' : `<button type="button" class="fl-del">🗑 ${T('Устгах', 'Delete')}</button>`}<span style="flex:1"></span><button type="button" class="fl-cancel">${T('Болих', 'Cancel')}</button><button class="fl-ok">${T('Хадгалах', 'OK')}</button></div></form>`;
    const fm = box.querySelector('form'); setTimeout(() => fm.querySelector('input')?.focus(), 20);
    fm.onsubmit = e => { e.preventDefault(); fm.querySelectorAll('[data-k]').forEach(i => { n[i.dataset.k] = i.value.trim() }); const need = { decl: ['v'], assign: ['v', 'e'], input: ['v'], output: ['e'], if: ['e'], while: ['e'], do: ['e'], for: ['v', 'a', 'b'], comment: [] }[n.t]; if (need.some(k => !n[k])) { fm.querySelector('.fl-err2').textContent = T('Бүх талбарыг бөглөнө үү.', 'Please fill all fields.'); return } box.hidden = true; onOk(n) };
    fm.querySelector('.fl-cancel').onclick = () => { box.hidden = true };
    fm.querySelector('.fl-del')?.addEventListener('click', () => { box.hidden = true; onOk(null) });
  }
  function pick(lp, i) {
    const box = root.querySelector('.fl-dlg'); box.hidden = false;
    box.innerHTML = `<div class="fl-dlgin"><h3 style="margin:0 0 8px">${T('Ямар хэлбэр нэмэх вэ?', 'Which shape?')}</h3><div class="fl-pick">${Object.entries(SH).map(([k, s]) => `<button data-sh="${k}"><i style="background:${s.c}"></i>${T(s.mn, s.en)}</button>`).join('')}</div><div class="fl-row"><span style="flex:1"></span><button class="fl-cancel">${T('Болих', 'Cancel')}</button></div></div>`;
    box.querySelector('.fl-cancel').onclick = () => { box.hidden = true };
    box.querySelectorAll('[data-sh]').forEach(b => b.onclick = () => { const t = b.dataset.sh; const n = { t }; if (t === 'decl') n.ty = 'int'; if (t === 'if') { n.y = []; n.n = [] } if (['while', 'for', 'do'].includes(t)) n.body = []; if (t === 'for') n.s = '1'; editor(n, nn => { if (nn) { listAt(lp).splice(i, 0, nn); changed(); draw() } }, true) });
  }
  function changed() { opts.onChange?.(P) }

  /* ---------- UI ---------- */
  function draw() {
    const ch = root.querySelector('.fl-chart'); if (!ch) return;
    if (view === 'chart') ch.innerHTML = chartSVG();
    else ch.innerHTML = `<pre class="fl-code">${esc(view === 'py' ? (toPy(P.main) || '# ' + T('хоосон', 'empty')) : (toMn(P.main) || T('// хоосон', '// empty')))}</pre>`;
    ch.querySelectorAll('.fl-plus').forEach(g => g.onclick = e => { e.stopPropagation(); pick(g.dataset.l, +g.dataset.i) });
    ch.querySelectorAll('.fl-node').forEach(g => g.onclick = e => { e.stopPropagation(); const p = g.dataset.p; sel = p; const { list, i } = nodeAt(p); editor(JSON.parse(JSON.stringify(list[i])), nn => { if (nn) list[i] = Object.assign(list[i], nn); else list.splice(i, 1); sel = null; changed(); draw() }) });
    paintCur();
  }
  function render() {
    root.innerHTML = `<div class="fl">
      <div class="fl-top"><input class="fl-name" value="${esc(P.name)}" aria-label="${T('Программын нэр', 'Program name')}">
        <div class="fl-tabs">${[['chart', T('Блок схем', 'Flowchart')], ['mn', T('Псевдокод', 'Pseudocode')], ['py', 'Python']].map(([k, l]) => `<button data-v="${k}" class="${view === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <select class="fl-ex"><option value="">${T('Жишээ ачаалах…', 'Load example…')}</option>${EX.map((e, i) => `<option value="${i}">${esc(T(e.mn, e.en))}</option>`).join('')}</select>
        <div class="fl-lang"><button data-lang="mn" class="${LANG === 'mn' ? 'on' : ''}">МН</button><button data-lang="en" class="${LANG === 'en' ? 'on' : ''}">EN</button></div></div>
      <div class="fl-main">
        <div class="fl-chart"></div>
        <div class="fl-side">
          <div class="fl-bar"><button id="fl-run">▶ ${T('Ажиллуулах', 'Run')}</button><button id="fl-step" class="g">⏭ ${T('Алхамчлах', 'Step')}</button><button id="fl-stop" class="g">⏹</button>
            <label class="fl-spd">${T('Хурд', 'Speed')}<input type="range" min="1" max="10" value="${speed}" id="fl-speed"></label></div>
          <div class="fl-cbox"><b>${T('Консол', 'Console')}</b><div class="fl-con"></div><form class="fl-in" hidden><b></b><input autocomplete="off"><button>↵</button></form></div>
          <div class="fl-vbox"><b>${T('Хувьсагчид', 'Variables')}</b><div class="fl-vars"></div></div>
          <div class="fl-files"><button class="g" id="fl-save">💾 ${T('Хадгалах', 'Save')}</button><button class="g" id="fl-exp">⬇ ${T('Татах', 'Download')}</button><label class="g fl-imp">⬆ ${T('Нээх', 'Open')}<input type="file" accept=".json,.flow" hidden></label><button class="g" id="fl-new">🗋 ${T('Шинэ', 'New')}</button></div>
          <p class="fl-mut">${T('Сумны дээрх ⊕ тэмдгийг дарж хэлбэр нэмнэ. Хэлбэрийг дарж засна.', 'Click ⊕ on an arrow to add a shape. Click a shape to edit it.')}</p>
        </div>
      </div><div class="fl-dlg" hidden></div></div>`;
    draw(); vars(); setBtns();
    root.querySelector('.fl-name').onchange = e => { P.name = e.target.value; changed() };
    root.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { view = b.dataset.v; render() });
    root.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { LANG = b.dataset.lang; try { localStorage.setItem('n9_flang', LANG) } catch (e) { } render() });
    root.querySelector('.fl-ex').onchange = e => { const x = EX[+e.target.value]; if (!x) return; if (P.main.length && !confirm(T('Одоогийн программыг солих уу?', 'Replace the current program?'))) { e.target.value = ''; return } P = { v: 1, name: T(x.mn, x.en), main: JSON.parse(JSON.stringify(x.p)) }; stop(true); changed(); render() };
    root.querySelector('#fl-run').onclick = () => { if (run && !run.done && run.step) { run.step = false; tick(); setBtns(); return } start(false) };
    root.querySelector('#fl-step').onclick = () => { if (!run || run.done) start(true); else if (!run.wait) tick() };
    root.querySelector('#fl-stop').onclick = () => stop();
    root.querySelector('#fl-speed').oninput = e => { speed = +e.target.value };
    const fin = root.querySelector('.fl-in');
    fin.onsubmit = e => { e.preventDefault(); if (!run?.wait) return; const v = fin.querySelector('input').value; con('› ' + v, 'inp'); run.wait = null; fin.hidden = true; tick(v) };
    root.querySelector('#fl-save').onclick = () => { opts.onSave?.(P); con(T('Хадгаллаа ✓', 'Saved ✓'), 'sys') };
    root.querySelector('#fl-exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(P, null, 1)], { type: 'application/json' })); a.download = (P.name || 'program') + '.flow'; a.click() };
    root.querySelector('.fl-imp input').onchange = e => { const f = e.target.files[0]; f && f.text().then(t => { try { const p = JSON.parse(t); if (!Array.isArray(p.main)) throw 0; P = p; changed(); render() } catch (er) { alert(T('Файл буруу.', 'Invalid file.')) } }) };
    root.querySelector('#fl-new').onclick = () => { if (P.main.length && !confirm(T('Шинэ программ эхлүүлэх үү?', 'Start a new program?'))) return; P = newProg(); stop(true); changed(); render() };
  }

  const css = document.createElement('style');
  css.textContent = `
.fl{--ln:#e6d6b8;background:#fffaf0;color:#2a1a10;border:2px solid var(--ln);border-radius:18px;padding:10px;font-family:Nunito,Arial,sans-serif}
.fl button{font:inherit;font-weight:800;border:0;border-radius:11px;padding:7px 12px;cursor:pointer;background:#2a5ab8;color:#fff;box-shadow:none;min-height:36px}
.fl button.g,.fl .g{background:#fff;color:#2a1a10;border:2px solid var(--ln)}
.fl button:disabled{opacity:.45}
.fl-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.fl-name{font:inherit;font-weight:800;font-size:17px;border:2px solid var(--ln);border-radius:10px;padding:5px 10px;min-width:200px;flex:1;max-width:340px}
.fl-tabs,.fl-lang{display:flex;gap:4px}.fl-tabs button,.fl-lang button{background:#fff;color:#2a1a10;border:2px solid var(--ln)}.fl-tabs button.on,.fl-lang button.on{background:#2a5ab8;color:#fff;border-color:#2a5ab8}
.fl-ex{font:inherit;border:2px solid var(--ln);border-radius:10px;padding:6px;max-width:260px}
.fl-main{display:grid;grid-template-columns:1fr 380px;gap:10px}@media(max-width:1000px){.fl-main{grid-template-columns:1fr}}
.fl-chart{background:#fff;border:2px solid var(--ln);border-radius:14px;overflow:auto;min-height:520px;max-height:720px;display:flex;justify-content:center;align-items:flex-start;padding:8px;background-image:radial-gradient(#eadfca 1.2px,transparent 1.2px);background-size:18px 18px}
.fl-svg{font-family:Nunito,Arial,sans-serif}.fl-ln{stroke:#4a3a28;stroke-width:2.4}.fl-sh{stroke:#3a2a18;stroke-width:2.6}.fl-in-l{stroke:#5a4a35;stroke-width:1.2}
.fl-term{fill:#2e8b57;stroke:#1e5a38;stroke-width:2}.fl-t{font-size:15.5px;font-weight:900}.fl-yn{font-size:14px;font-weight:900;fill:#2e8b57}
.fl-node{cursor:pointer}.fl-node:hover .fl-sh{filter:brightness(1.08);stroke-width:3}.fl-node.cur .fl-sh{stroke:#d6334a;stroke-width:5}.fl-node.sel .fl-sh{stroke:#2a5ab8;stroke-width:3}
.fl-plus{cursor:pointer;opacity:.35}.fl-plus circle{fill:#fff;stroke:#2a5ab8;stroke-width:2}.fl-plus path{stroke:#2a5ab8;stroke-width:2.4}.fl-plus:hover{opacity:1}
.fl-code{margin:0;padding:14px;font:14px/1.6 "PT Mono",Consolas,monospace;align-self:stretch;width:100%;white-space:pre-wrap}
.fl-side{display:flex;flex-direction:column;gap:8px}.fl-bar{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.fl-spd{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:700;margin:0}.fl-spd input{width:90px;min-height:0}
.fl-cbox,.fl-vbox{background:#fff;border:2px solid var(--ln);border-radius:14px;padding:8px}.fl-con{height:220px;overflow:auto;background:#1e2433;color:#e8ffe8;border-radius:10px;padding:8px;font:14px/1.5 "PT Mono",Consolas,monospace;margin-top:4px}
.fl-sys{color:#9fb0d0;font-style:italic}.fl-err{color:#ff9a8a}.fl-inp{color:#ffd36b}.fl-out{color:#e8ffe8}
.fl-in[hidden]{display:none}.fl-in{display:flex;gap:6px;align-items:center;margin-top:6px}.fl-in input{flex:1;font:inherit;border:2px solid #5aa7f0;border-radius:9px;padding:5px 8px}
.fl-vars table{width:100%;border-collapse:collapse;font-size:14px}.fl-vars th,.fl-vars td{border-bottom:1px solid var(--ln);padding:3px 6px;text-align:left}
.fl-files{display:flex;gap:6px;flex-wrap:wrap}.fl-imp{display:inline-flex;align-items:center;border-radius:11px;padding:7px 12px;cursor:pointer;font-weight:800}
.fl-mut{color:#8a7558;font-size:12px;margin:2px 0}
.fl-dlg[hidden]{display:none}.fl-dlg{position:fixed;inset:0;z-index:260;background:rgba(20,10,0,.4);display:grid;place-items:center}
.fl-dlgin{background:#fffaf0;border-radius:16px;padding:16px;width:min(460px,92vw);display:flex;flex-direction:column;gap:6px}.fl-dlgin label{display:flex;flex-direction:column;font-weight:700;font-size:14px}
.fl-dlgin input,.fl-dlgin select{font:inherit;border:2px solid var(--ln);border-radius:9px;padding:6px 8px;margin-top:2px}.fl-dlgin h3 i,.fl-pick i{display:inline-block;width:14px;height:14px;border-radius:4px;margin-right:6px;vertical-align:-1px;border:1px solid #5a4a35}
.fl-row{display:flex;gap:6px;margin-top:6px}.fl-del{background:#c0392b!important}.fl-cancel{background:#fff!important;color:#2a1a10!important;border:2px solid var(--ln)!important}.fl-err2{color:#c0392b;font-size:13px;margin:0}
.fl-pick{display:grid;grid-template-columns:1fr 1fr;gap:6px}.fl-pick button{background:#fff;color:#2a1a10;border:2px solid var(--ln);justify-content:flex-start;text-align:left}`;
  document.head.appendChild(css);

  window.FlowLab = {
    mount(el, o = {}) { root = el; opts = o; try { LANG = o.lang || localStorage.getItem('n9_flang') || 'mn' } catch (e) { } P = o.program ? JSON.parse(JSON.stringify(o.program)) : newProg(); run = null; render() },
    get program() { return P }, EXAMPLES: EX, run: () => start(false), stop: () => stop(true),
    _test: { ev, jsExpr, toPy, toMn }
  };
})();
