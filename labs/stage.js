/* =====================================================================
   «Наадам Студи» — тоглоом бүтээх, Scratch маягийн блок лаборатори (МН/EN)
   StageLab.mount(el, {lang, project, onChange, onSave, challenges})
   ===================================================================== */
(function () {
  const W = 480, H = 360;
  const T = (mn, en) => (L.lang === 'en' ? en : mn);
  let L = { lang: 'mn' };

  /* ---------------- Блокийн тодорхойлолт ----------------
     k: түлхүүр, c: ангилал, mn/en: бичвэр ({0},{1} — оролт), a: анхдагч утгууд, m: ам (C блок), m2: else ам, hat: эхлэл блок */
  const CAT = {
    ev: ['Үйл явдал', 'Events', '#f2b21b'], mo: ['Хөдөлгөөн', 'Motion', '#4c97ff'], lo: ['Харагдах', 'Looks', '#9966ff'],
    so: ['Дуу', 'Sound', '#cf63cf'], ct: ['Удирдлага', 'Control', '#ffab19'], se: ['Мэдрэх', 'Sensing', '#5cb1d6'],
    va: ['Хувьсагч', 'Variables', '#ff8c1a'], pe: ['Үзэг', 'Pen', '#0fbd8c']
  };
  const B = [
    { k: 'flag', c: 'ev', hat: 1, mn: '🚩 дарахад', en: 'when 🚩 clicked' },
    { k: 'click', c: 'ev', hat: 1, mn: 'энэ дүрийг дарахад', en: 'when this sprite clicked' },
    { k: 'key', c: 'ev', hat: 1, mn: '{0} товч дарахад', en: 'when {0} key pressed', a: ['space'], sel: [['space', 'up', 'down', 'left', 'right', 'a', 'b', 'c', 'd', 'w', 's']] },
    { k: 'recv', c: 'ev', hat: 1, mn: '{0} мэдээ ирэхэд', en: 'when I receive {0}', a: ['мэдээ1'] },
    { k: 'bcast', c: 'ev', mn: '{0} мэдээ илгээх', en: 'broadcast {0}', a: ['мэдээ1'] },
    { k: 'move', c: 'mo', mn: '{0} алхам явах', en: 'move {0} steps', a: ['10'] },
    { k: 'turnr', c: 'mo', mn: '↻ {0}° эргэх', en: 'turn ↻ {0} degrees', a: ['15'] },
    { k: 'turnl', c: 'mo', mn: '↺ {0}° эргэх', en: 'turn ↺ {0} degrees', a: ['15'] },
    { k: 'goto', c: 'mo', mn: 'x: {0} y: {1} руу очих', en: 'go to x: {0} y: {1}', a: ['0', '0'] },
    { k: 'glide', c: 'mo', mn: '{0} сек-д x: {1} y: {2} руу гулсах', en: 'glide {0} secs to x: {1} y: {2}', a: ['1', '100', '0'] },
    { k: 'rand', c: 'mo', mn: 'санамсаргүй байрлалд очих', en: 'go to random position' },
    { k: 'dir', c: 'mo', mn: '{0} чиглэлд харах', en: 'point in direction {0}', a: ['90'] },
    { k: 'chx', c: 'mo', mn: 'x-ийг {0}-аар өөрчлөх', en: 'change x by {0}', a: ['10'] },
    { k: 'setx', c: 'mo', mn: 'x-ийг {0} болгох', en: 'set x to {0}', a: ['0'] },
    { k: 'chy', c: 'mo', mn: 'y-ийг {0}-аар өөрчлөх', en: 'change y by {0}', a: ['10'] },
    { k: 'sety', c: 'mo', mn: 'y-ийг {0} болгох', en: 'set y to {0}', a: ['0'] },
    { k: 'bounce', c: 'mo', mn: 'захад хүрвэл ойх', en: 'if on edge, bounce' },
    { k: 'say', c: 'lo', mn: '{0} гэж {1} сек хэлэх', en: 'say {0} for {1} seconds', a: ['Сайн уу!', '2'] },
    { k: 'say0', c: 'lo', mn: '{0} гэж хэлэх', en: 'say {0}', a: ['Сайн уу!'] },
    { k: 'think', c: 'lo', mn: '{0} гэж бодох', en: 'think {0}', a: ['Хмм...'] },
    { k: 'next', c: 'lo', mn: 'дараагийн хувцас', en: 'next costume' },
    { k: 'size', c: 'lo', mn: 'хэмжээг {0}% болгох', en: 'set size to {0} %', a: ['100'] },
    { k: 'chsize', c: 'lo', mn: 'хэмжээг {0}-аар өөрчлөх', en: 'change size by {0}', a: ['10'] },
    { k: 'show', c: 'lo', mn: 'харагдах', en: 'show' },
    { k: 'hide', c: 'lo', mn: 'нуугдах', en: 'hide' },
    { k: 'bg', c: 'lo', mn: 'дэвсгэрийг {0} болгох', en: 'switch backdrop to {0}', a: ['steppe'], sel: [() => window.BACKDROPS.map(b => b.id)] },
    { k: 'note', c: 'so', mn: '{0} нот {1} цохилт тоглох', en: 'play note {0} for {1} beats', a: ['60', '0.5'] },
    { k: 'moo', c: 'so', mn: '{0} дуу гаргах', en: 'play sound {0}', a: ['мөөрөх'], sel: [['мөөрөх', 'майлах', 'янцгаах', 'хуцах', 'хонх']] },
    { k: 'wait', c: 'ct', mn: '{0} сек хүлээх', en: 'wait {0} seconds', a: ['1'] },
    { k: 'rep', c: 'ct', m: 1, mn: '{0} удаа давтах', en: 'repeat {0}', a: ['10'] },
    { k: 'forever', c: 'ct', m: 1, mn: 'үргэлж давтах', en: 'forever' },
    { k: 'if', c: 'ct', m: 1, mn: 'хэрэв {0} бол', en: 'if {0} then', a: ['x > 100'] },
    { k: 'ifelse', c: 'ct', m: 1, m2: 1, mn: 'хэрэв {0} бол', en: 'if {0} then', a: ['x > 100'] },
    { k: 'until', c: 'ct', m: 1, mn: '{0} болтол давтах', en: 'repeat until {0}', a: ['x > 200'] },
    { k: 'waitu', c: 'ct', mn: '{0} болтол хүлээх', en: 'wait until {0}', a: ['key("space")'] },
    { k: 'stop', c: 'ct', mn: 'бүгдийг зогсоох', en: 'stop all' },
    { k: 'ask', c: 'se', mn: '{0} гэж асуугаад хүлээх', en: 'ask {0} and wait', a: ['Таны нэр хэн бэ?'] },
    { k: 'reset', c: 'se', mn: 'хугацааг тэглэх', en: 'reset timer' },
    { k: 'set', c: 'va', mn: '{0}-ийг {1} болгох', en: 'set {0} to {1}', a: ['оноо', '0'] },
    { k: 'change', c: 'va', mn: '{0}-ийг {1}-аар өөрчлөх', en: 'change {0} by {1}', a: ['оноо', '1'] },
    { k: 'pdown', c: 'pe', mn: 'үзэг буулгах', en: 'pen down' },
    { k: 'pup', c: 'pe', mn: 'үзэг өргөх', en: 'pen up' },
    { k: 'pcol', c: 'pe', mn: 'үзгийн өнгийг {0} болгох', en: 'set pen color to {0}', a: ['#d6334a'], color: 1 },
    { k: 'psize', c: 'pe', mn: 'үзгийн зузааныг {0} болгох', en: 'set pen size to {0}', a: ['3'] },
    { k: 'clear', c: 'pe', mn: 'бүгдийг арилгах', en: 'erase all' },
  ];
  const BK = Object.fromEntries(B.map(b => [b.k, b]));
  const HELP = [
    ['x', 'x'], ['y', 'y'], ['чиглэл', 'direction'], ['хэмжээ', 'size'], ['хариулт', 'answer'], ['хугацаа', 'timer'],
    ['хулганы x', 'mousex'], ['хулганы y', 'mousey'], ['санамсаргүй 1–10', 'random(1, 10)'], ['хүрсэн үү: ирмэг', 'touching("edge")'],
    ['хүрсэн үү: дүр', 'touching("Тугал")'], ['товч дарсан уу', 'key("space")'], ['ба', ' and '], ['эсвэл', ' or '], ['биш', 'not '], ['нийлүүлэх', 'join("a", "b")']
  ];

  /* ---------------- Төсөл ---------------- */
  const svgUrl = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  const IMG = {};
  const img = (key, svg) => { if (!IMG[key]) { const i = new Image(); i.src = svgUrl(svg); IMG[key] = i } return IMG[key] };
  const lib = id => window.SPRITES.find(s => s.id === id) || window.SPRITES[0];
  let uid = 1;
  const newSprite = (lid, x = 0, y = 0) => { const l = lib(lid); return { id: 's' + Date.now().toString(36) + (uid++), lib: lid, name: T(l.mn, l.en), x, y, dir: 90, size: 100, cos: 0, show: true, scripts: [{ hat: { k: 'flag', a: [] }, body: [], x: 20, y: 20 }] } };
  const N = (k, a, b, e) => { const n = { k, a: a || [] }; if (b) n.b = b; if (e) n.e = e; return n };
  const SC = (k, a, body, x = 20, y = 20) => ({ hat: { k, a: a || [] }, body, x, y });
  const SPX = (lid, name, x, y, scripts, size = 100) => { const sp = newSprite(lid, x, y); sp.name = name; sp.size = size; sp.scripts = scripts; return sp };
  const arrows = (st = 8) => [N('if', ['key("right")'], [N('chx', [String(st)])]), N('if', ['key("left")'], [N('chx', [String(-st)])]), N('if', ['key("up")'], [N('chy', [String(st)])]), N('if', ['key("down")'], [N('chy', [String(-st)])])];
  const GAMES = [
    { mn: 'Хонь цуглуул (сумаар удирдана, 30 сек)', en: 'Catch the sheep (arrow keys, 30 s)', p: () => ({ v: 1, bg: 'ger', vars: { 'оноо': 0 }, sprites: [
      SPX('calf', 'Тугал', 0, -100, [SC('flag', [], [N('set', ['оноо', '0']), N('goto', ['0', '-100']), N('say', ['Хонь цуглуулъя!', '1']), N('forever', [], [...arrows(), N('bounce'), N('if', ['touching("Хонь")'], [N('change', ['оноо', '1']), N('moo', ['майлах']), N('bcast', ['барив'])])])]),
        SC('flag', [], [N('reset'), N('waitu', ['хугацаа > 30']), N('say0', ['join("Дууслаа! Оноо: ", оноо)']), N('stop')], 20, 820)], 80),
      SPX('sheep', 'Хонь', 120, 60, [SC('flag', [], [N('rand')]), SC('recv', ['барив'], [N('rand'), N('next')], 20, 140)], 70)] }) },
    { mn: 'Бүргэдээс зугт (сумаар зугтана)', en: 'Escape the eagle (arrow keys)', p: () => ({ v: 1, bg: 'mountain', vars: { 'оноо': 0 }, sprites: [
      SPX('marmot', 'Тарвага', 0, -100, [SC('flag', [], [N('set', ['оноо', '0']), N('goto', ['0', '-100']), N('forever', [], [...arrows(9), N('bounce')])]),
        SC('flag', [], [N('forever', [], [N('wait', ['1']), N('change', ['оноо', '1'])])], 20, 640)], 75),
      SPX('eagle', 'Бүргэд', -150, 120, [SC('flag', [], [N('goto', ['-150', '120']), N('dir', ['135']), N('wait', ['1']), N('forever', [], [N('move', ['6']), N('bounce'), N('next'), N('if', ['touching("Тарвага")'], [N('moo', ['хонх']), N('say0', ['join("Барьчихлаа! Оноо: ", оноо)']), N('stop')])])])], 75)] }) },
    { mn: 'Тэмээний уралдаан (A ба → товч)', en: 'Camel race (A and → keys)', p: () => ({ v: 1, bg: 'gobi', vars: {}, sprites: [
      SPX('camel', 'Цэнхэр тэмээ', -200, 40, [SC('flag', [], [N('goto', ['-200', '40']), N('say', ['A товч!', '1'])]), SC('key', ['a'], [N('chx', ['10']), N('next'), N('if', ['x > 200'], [N('say0', ['Би түрүүллээ!']), N('stop')])], 20, 140)], 70),
      SPX('camel', 'Улаан тэмээ', -200, -80, [SC('flag', [], [N('goto', ['-200', '-80']), N('say', ['→ товч!', '1'])]), SC('key', ['right'], [N('chx', ['10']), N('next'), N('if', ['x > 200'], [N('say0', ['Би түрүүллээ!']), N('stop')])], 20, 140)], 70)] }) },
  ];
  const defaultProject = () => ({ v: 1, bg: 'steppe', vars: { 'оноо': 0 }, sprites: [newSprite('calf', -80, -60)] });

  /* ---------------- Төлөв ---------------- */
  let P, cur, root, opts, ctx, pen, penCtx, run = null, keys = {}, mouse = { x: 0, y: 0 }, timer0 = performance.now(), answer = '', dirty = false;
  const spr = () => P.sprites.find(s => s.id === cur) || P.sprites[0];

  /* ---------------- Илэрхийлэл ---------------- */
  function evalExpr(src, sp, rt) {
    let s = String(src ?? '').trim();
    if (s === '') return '';
    if (/^-?\d+(\.\d+)?$/.test(s)) return +s;
    const env = {
      x: sp.x, y: sp.y, direction: sp.dir, чиглэл: sp.dir, size: sp.size, хэмжээ: sp.size, answer, хариулт: answer,
      timer: +((performance.now() - timer0) / 1000).toFixed(2), хугацаа: +((performance.now() - timer0) / 1000).toFixed(2),
      mousex: mouse.x, mousey: mouse.y,
      random: (a, b) => { a = +a; b = +b; if (a > b) [a, b] = [b, a]; return Number.isInteger(a) && Number.isInteger(b) ? a + Math.floor(Math.random() * (b - a + 1)) : a + Math.random() * (b - a) },
      санамсаргүй: (a, b) => env.random(a, b),
      touching: n => touching(sp, n), хүрсэн: n => touching(sp, n),
      key: k => !!keys[String(k).toLowerCase()], товч: k => !!keys[String(k).toLowerCase()],
      join: (...a) => a.join(''), нийлүүлэх: (...a) => a.join(''),
      round: Math.round, abs: Math.abs, sqrt: Math.sqrt, floor: Math.floor,
    };
    Object.entries(P.vars).forEach(([k, v]) => { env[k] = v });
    // үг орлуулах
    s = s.replace(/\bба\b/g, '&&').replace(/\bэсвэл\b/g, '||').replace(/\bбиш\b/g, '!').replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!')
      .replace(/(^|[^=!<>])=(?!=)/g, '$1==');
    const names = Object.keys(env).filter(k => /^[\p{L}_][\p{L}\p{N}_]*$/u.test(k));
    try {
      // эхлээд нэр хувьсагч мөн эсэхийг шалгана, үгүй бол бичвэр гэж үзнэ
      const f = new Function(...names, '"use strict";return (' + s + ')');
      return f(...names.map(n => env[n]));
    } catch (e) {
      return String(src); // илэрхийлэл биш бол энгийн бичвэр гэж үзнэ
    }
  }
  const num = (v, sp) => { const n = +evalExpr(v, sp); if (!isFinite(n)) throw new Error(T('Тоо биш: ', 'Not a number: ') + v); return n };

  /* ---------------- Мэдрэх ---------------- */
  function bbox(sp) { const s = 90 * sp.size / 100; return { l: sp.x - s / 2, r: sp.x + s / 2, b: sp.y - s / 2, t: sp.y + s / 2 } }
  function touching(sp, name) {
    const a = bbox(sp);
    if (name === 'edge' || name === 'ирмэг' || name === 'зах') return a.l < -W / 2 || a.r > W / 2 || a.b < -H / 2 || a.t > H / 2;
    if (name === 'mouse' || name === 'хулгана') return mouse.x > a.l && mouse.x < a.r && mouse.y > a.b && mouse.y < a.t;
    return P.sprites.some(o => o !== sp && o.show && (o.name === name || lib(o.lib).mn === name || lib(o.lib).en === name) && (() => { const b = bbox(o); const sh = 12; return a.l + sh < b.r && a.r - sh > b.l && a.b + sh < b.t && a.t - sh > b.b })());
  }

  /* ---------------- Дуу ---------------- */
  let AC = null;
  function tone(freq, dur, type = 'triangle', slide) {
    try {
      AC ??= new (window.AudioContext || window.webkitAudioContext)();
      const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = freq;
      if (slide) o.frequency.linearRampToValueAtTime(slide, AC.currentTime + dur);
      g.gain.setValueAtTime(.18, AC.currentTime); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + dur);
      o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + dur);
    } catch (e) { }
  }
  const SND = { 'мөөрөх': () => tone(140, .9, 'sawtooth', 110), 'майлах': () => { tone(420, .25, 'square', 380); setTimeout(() => tone(420, .3, 'square', 360), 260) }, 'янцгаах': () => tone(520, .7, 'sawtooth', 300), 'хуцах': () => { tone(300, .12, 'square'); setTimeout(() => tone(300, .12, 'square'), 180) }, 'хонх': () => tone(1320, 1.2, 'sine') };

  /* ---------------- Гүйцэтгэл ---------------- */
  function* exec(list, sp, th) {
    for (const n of list) {
      if (run?.stopped) return;
      if (++th.steps % 5000 === 0) yield;
      const a = n.a || [];
      switch (n.k) {
        case 'move': { const d = num(a[0], sp), r = (90 - sp.dir) * Math.PI / 180; moveTo(sp, sp.x + d * Math.cos(r), sp.y + d * Math.sin(r)); yield; break }
        case 'turnr': sp.dir = norm(sp.dir + num(a[0], sp)); yield; break;
        case 'turnl': sp.dir = norm(sp.dir - num(a[0], sp)); yield; break;
        case 'goto': moveTo(sp, num(a[0], sp), num(a[1], sp)); yield; break;
        case 'glide': { const t = num(a[0], sp) * 1000, x0 = sp.x, y0 = sp.y, x1 = num(a[1], sp), y1 = num(a[2], sp), st = performance.now(); let k = 0; while (k < 1) { k = Math.min(1, (performance.now() - st) / Math.max(1, t)); moveTo(sp, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k); yield } break }
        case 'rand': moveTo(sp, Math.round(Math.random() * 400 - 200), Math.round(Math.random() * 300 - 150)); yield; break;
        case 'dir': sp.dir = norm(num(a[0], sp)); yield; break;
        case 'chx': moveTo(sp, sp.x + num(a[0], sp), sp.y); yield; break;
        case 'setx': moveTo(sp, num(a[0], sp), sp.y); yield; break;
        case 'chy': moveTo(sp, sp.x, sp.y + num(a[0], sp)); yield; break;
        case 'sety': moveTo(sp, sp.x, num(a[0], sp)); yield; break;
        case 'bounce': { const b = bbox(sp); if (b.l < -W / 2 || b.r > W / 2) { sp.dir = norm(-sp.dir); sp.x = Math.max(-W / 2 + (b.r - b.l) / 2, Math.min(W / 2 - (b.r - b.l) / 2, sp.x)) } if (b.b < -H / 2 || b.t > H / 2) { sp.dir = norm(180 - sp.dir); sp.y = Math.max(-H / 2 + (b.t - b.b) / 2, Math.min(H / 2 - (b.t - b.b) / 2, sp.y)) } yield; break }
        case 'say': { sp.bubble = { t: String(evalExpr(a[0], sp)), think: 0 }; yield* waitMs(num(a[1], sp) * 1000); sp.bubble = null; break }
        case 'say0': sp.bubble = String(evalExpr(a[0], sp)) === '' ? null : { t: String(evalExpr(a[0], sp)), think: 0 }; yield; break;
        case 'think': sp.bubble = { t: String(evalExpr(a[0], sp)), think: 1 }; yield; break;
        case 'next': sp.cos = (sp.cos + 1) % 2; yield; break;
        case 'size': sp.size = Math.max(5, Math.min(500, num(a[0], sp))); yield; break;
        case 'chsize': sp.size = Math.max(5, Math.min(500, sp.size + num(a[0], sp))); yield; break;
        case 'show': sp.show = true; yield; break;
        case 'hide': sp.show = false; yield; break;
        case 'bg': P.bg = String(evalExpr(a[0], sp)); yield; break;
        case 'note': { const m = num(a[0], sp), d = num(a[1], sp) * 500; tone(440 * Math.pow(2, (m - 69) / 12), d / 1000); yield* waitMs(d); break }
        case 'moo': (SND[a[0]] || SND['хонх'])(); yield; break;
        case 'wait': yield* waitMs(num(a[0], sp) * 1000); break;
        case 'rep': { const k = num(a[0], sp); for (let i = 0; i < k; i++) { yield* exec(n.b || [], sp, th); yield } break }
        case 'forever': for (; ;) { yield* exec(n.b || [], sp, th); yield; if (run?.stopped) return }
        case 'if': if (evalExpr(a[0], sp)) yield* exec(n.b || [], sp, th); break;
        case 'ifelse': if (evalExpr(a[0], sp)) yield* exec(n.b || [], sp, th); else yield* exec(n.e || [], sp, th); break;
        case 'until': while (!evalExpr(a[0], sp)) { yield* exec(n.b || [], sp, th); yield } break;
        case 'waitu': while (!evalExpr(a[0], sp)) yield; break;
        case 'stop': stopAll(); return;
        case 'bcast': { const m = String(evalExpr(a[0], sp)); P.sprites.forEach(o => o.scripts.forEach(sc => { if (sc.hat.k === 'recv' && String(sc.hat.a?.[0]) === m) startThread(o, sc) })); yield; break }
        case 'ask': { answer = yield* askQ(String(evalExpr(a[0], sp)), sp); break }
        case 'reset': timer0 = performance.now(); break;
        case 'set': { const v = String(a[0]).trim(); P.vars[v] = coerce(evalExpr(a[1], sp)); showVars(); break }
        case 'change': { const v = String(a[0]).trim(); P.vars[v] = (+P.vars[v] || 0) + num(a[1], sp); showVars(); break }
        case 'pdown': sp.pen = true; dot(sp); break;
        case 'pup': sp.pen = false; break;
        case 'pcol': sp.pc = String(a[0]); break;
        case 'psize': sp.ps = num(a[0], sp); break;
        case 'clear': penCtx.clearRect(0, 0, W, H); break;
      }
    }
  }
  const coerce = v => (v !== '' && !isNaN(+v) ? +v : v);
  const norm = d => { d = ((d + 180) % 360 + 360) % 360 - 180; return d === -180 ? 180 : d };
  function moveTo(sp, x, y) { if (sp.pen) { penCtx.strokeStyle = sp.pc || '#d6334a'; penCtx.lineWidth = sp.ps || 3; penCtx.lineCap = 'round'; penCtx.beginPath(); penCtx.moveTo(sp.x + W / 2, H / 2 - sp.y); penCtx.lineTo(x + W / 2, H / 2 - y); penCtx.stroke() } sp.x = Math.round(x * 100) / 100; sp.y = Math.round(y * 100) / 100 }
  function dot(sp) { penCtx.fillStyle = sp.pc || '#d6334a'; penCtx.beginPath(); penCtx.arc(sp.x + W / 2, H / 2 - sp.y, (sp.ps || 3) / 2, 0, 7); penCtx.fill() }
  function* waitMs(ms) { const st = performance.now(); while (performance.now() - st < ms) { if (run?.stopped) return; yield } }
  function* askQ(q, sp) {
    sp.bubble = { t: q, think: 0 };
    const box = root.querySelector('.sl-ask'); box.hidden = false; const inp = box.querySelector('input'); inp.value = ''; setTimeout(() => inp.focus(), 30);
    let done = null; box.onsubmit = e => { e.preventDefault(); done = inp.value };
    while (done === null) { if (run?.stopped) { box.hidden = true; return '' } yield }
    box.hidden = true; sp.bubble = null; return done;
  }
  function startThread(sp, sc) {
    if (!run) return;
    run.threads = run.threads.filter(t => !(t.sp === sp && t.sc === sc));
    const th = { sp, sc, steps: 0 }; th.g = exec(sc.body, sp, th); run.threads.push(th);
  }
  function go() {
    stopAll(true);
    timer0 = performance.now(); answer = '';
    P.sprites.forEach(s => { s.bubble = null });
    run = { threads: [], stopped: false };
    P.sprites.forEach(sp => sp.scripts.forEach(sc => { if (sc.hat.k === 'flag') startThread(sp, sc) }));
    root.querySelector('.sl-go').classList.add('on');
    loop();
  }
  function stopAll(silent) {
    if (run) run.stopped = true; run = null;
    root?.querySelector('.sl-go')?.classList.remove('on');
    const box = root?.querySelector('.sl-ask'); if (box) box.hidden = true;
    if (!silent) P.sprites.forEach(s => { s.bubble = null }); draw(); syncProps();
  }
  function ensureRun() { if (!run) { run = { threads: [], stopped: false }; loop() } }
  function loop() {
    if (!run || run.stopped) return;
    if (!root?.isConnected) { stopAll(); return }
    const t0 = performance.now();
    for (const th of [...run.threads]) {
      try { const r = th.g.next(); if (r.done) run.threads = run.threads.filter(x => x !== th) }
      catch (e) { err(e.message); stopAll(); return }
      if (performance.now() - t0 > 40) break;
    }
    draw(); syncProps();
    if (run && !run.threads.length && !Object.keys(keys).length) { /* дууссан ч товч, дарах үйлдлийг сонсоно */ }
    requestAnimationFrame(loop);
  }
  function err(m) { const e = root.querySelector('.sl-err'); e.textContent = '⚠ ' + m; e.hidden = false; setTimeout(() => { e.hidden = true }, 5000) }

  /* ---------------- Зурах ---------------- */
  function draw() {
    if (!ctx) return;
    const bg = (window.BACKDROPS.find(b => b.id === P.bg) || window.BACKDROPS[0]);
    const bi = img('bg:' + bg.id, bg.svg);
    ctx.clearRect(0, 0, W, H);
    if (bi.complete) ctx.drawImage(bi, 0, 0, W, H); else bi.onload = draw;
    ctx.drawImage(pen, 0, 0);
    for (const sp of P.sprites) {
      if (!sp.show) continue;
      const l = lib(sp.lib), ci = img(sp.lib + ':' + (sp.cos % 2), l.costumes[sp.cos % 2]);
      const s = 96 * sp.size / 100, cx = sp.x + W / 2, cy = H / 2 - sp.y;
      ctx.save(); ctx.translate(cx, cy);
      const d = sp.dir;
      if (d < 0) ctx.scale(-1, 1); // зүүн тийш харвал толин тусгал (Scratch-ийн «зүүн-баруун» горим)
      if (ci.complete) ctx.drawImage(ci, -s / 2, -s / 2, s, s); else ci.onload = draw;
      ctx.restore();
      if (sp.bubble) bubble(cx, cy - s / 2, sp.bubble);
      if (sp.id === cur && !run) { ctx.strokeStyle = 'rgba(42,90,184,.55)'; ctx.setLineDash([5, 4]); ctx.strokeRect(cx - s / 2, cy - s / 2, s, s); ctx.setLineDash([]) }
    }
  }
  function bubble(x, y, b) {
    ctx.font = '600 14px Nunito, Arial'; const lines = wrapText(b.t, 150); const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 20, h = lines.length * 18 + 14;
    let bx = Math.min(W - w - 4, Math.max(4, x + 6)), by = Math.max(4, y - h - 12);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#3a2618'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(bx, by, w, h, 12); ctx.fill(); ctx.stroke();
    if (b.think) { [[x + 2, y - 4, 3], [x + 6, y - 10, 5]].forEach(([a, c, r]) => { ctx.beginPath(); ctx.arc(a, c, r, 0, 7); ctx.fill(); ctx.stroke() }) }
    else { ctx.beginPath(); ctx.moveTo(bx + 16, by + h); ctx.lineTo(x, y); ctx.lineTo(bx + 30, by + h); ctx.fill(); ctx.stroke(); ctx.fillRect(bx + 15, by + h - 3, 16, 4) }
    ctx.fillStyle = '#2a1a10'; lines.forEach((l, i) => ctx.fillText(l, bx + 10, by + 22 + i * 18));
  }
  function wrapText(t, mw) { const out = []; let line = ''; for (const w of String(t).split(' ')) { const tt = line ? line + ' ' + w : w; if (ctx.measureText(tt).width > mw && line) { out.push(line); line = w } else line = tt } out.push(line); return out.slice(0, 5) }
  function showVars() { const m = root.querySelector('.sl-vars'); if (!m) return; m.innerHTML = Object.entries(P.vars).map(([k, v]) => `<span><b>${esc(k)}</b> ${esc(v)}</span>`).join('') }

  /* ---------------- UI ---------------- */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let palCat = 'ev', target = null; // target: {list, i}
  function blockHTML(n, path, inPal) {
    const d = BK[n.k]; if (!d) return '';
    const col = CAT[d.c][2];
    let txt = esc(T(d.mn, d.en));
    txt = txt.replace(/\{(\d)\}/g, (_, i) => {
      const v = n.a?.[i] ?? d.a?.[i] ?? '';
      if (inPal) return `<span class="sl-in">${esc(v)}</span>`;
      const sel = d.sel?.[i]; const opts = typeof sel === 'function' ? sel() : sel;
      if (opts) return `<select data-p="${path}" data-i="${i}">${opts.map(o => `<option ${o == v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
      if (d.color) return `<input type="color" data-p="${path}" data-i="${i}" value="${esc(v)}">`;
      return `<input data-p="${path}" data-i="${i}" value="${esc(v)}" size="${Math.max(2, String(v).length)}">`;
    });
    const cls = `sl-b${d.hat ? ' hat' : ''}${d.m ? ' cb' : ''}`;
    if (inPal) return `<div class="${cls}" style="--c:${col}" data-new="${n.k}" title="${esc(T('Чирж оруул эсвэл дар', 'Drag or click'))}">${txt}</div>`;
    let h = `<div class="${cls}" style="--c:${col}" data-path="${path}"><div class="sl-row">${txt}<button class="sl-x" data-del="${path}" title="${T('Устгах', 'Delete')}">✕</button></div>`;
    if (d.m) {
      h += `<div class="sl-mouth" data-list="${path}/b">${listHTML(n.b || [], path + '/b')}</div>`;
      if (d.m2) h += `<div class="sl-row sl-else">${T('үгүй бол', 'else')}</div><div class="sl-mouth" data-list="${path}/e">${listHTML(n.e || [], path + '/e')}</div>`;
      h += `<div class="sl-foot"></div>`;
    }
    return h + '</div>';
  }
  const listHTML = (list, p) => list.map((n, i) => blockHTML(n, `${p}/${i}`)).join('') + `<div class="sl-drop" data-list="${p}" data-i="${list.length}"></div>`;
  function scriptsHTML() {
    const sp = spr();
    return sp.scripts.map((sc, si) => {
      const d = BK[sc.hat.k];
      return `<div class="sl-script" data-si="${si}" style="left:${sc.x}px;top:${sc.y}px">${blockHTML(sc.hat, `s${si}/h`).replace('<div class="sl-b hat"', `<div class="sl-b hat" data-grip="${si}"`)}<div class="sl-body" data-list="s${si}">${listHTML(sc.body, `s${si}`)}</div></div>`;
    }).join('');
  }
  function resolve(path) { // "s0/2/b/1" → {list, i, node}
    const parts = path.split('/'); const sp = spr();
    const sc = sp.scripts[+parts[0].slice(1)]; if (parts[1] === 'h') return { node: sc.hat, sc };
    let list = sc.body, node = null, parent = null;
    for (let k = 1; k < parts.length; k++) { const p = parts[k]; if (p === 'b' || p === 'e') { node[p] ??= []; list = node[p] } else { parent = list; node = list[+p] } }
    return { list: parent, node, sc, i: +parts[parts.length - 1] };
  }
  function listAt(lp) { const parts = lp.split('/'); const sp = spr(); const sc = sp.scripts[+parts[0].slice(1)]; let list = sc.body, node; for (let k = 1; k < parts.length; k++) { const p = parts[k]; if (p === 'b' || p === 'e') { node[p] ??= []; list = node[p] } else node = list[+p] } return list }
  const mk = k => { const d = BK[k]; const n = { k, a: [...(d.a || [])] }; if (d.m) n.b = []; if (d.m2) n.e = []; return n };

  function render() {
    if (opts.player) {
      root.innerHTML = `<div class="sl sl-player"><div class="sl-bar"><button class="sl-go" title="${T('Эхлүүлэх', 'Start')}">🚩 ${T('Тоглох', 'Play')}</button><button class="sl-stopb" title="${T('Зогсоох', 'Stop')}">⏹</button><span class="sl-vars"></span><button class="sl-full" title="${T('Том дэлгэц', 'Full screen')}">⛶</button></div>
        <div class="sl-stagewrap"><canvas width="${W}" height="${H}" class="sl-stage"></canvas><form class="sl-ask" hidden><input placeholder="${T('Хариултаа бич…', 'Type your answer…')}"><button>✔</button></form><div class="sl-err" hidden></div></div></div>`;
      pen = pen || Object.assign(document.createElement('canvas'), { width: W, height: H }); penCtx = pen.getContext('2d');
      ctx = root.querySelector('.sl-stage').getContext('2d'); bindPlayer(); draw(); showVars(); return;
    }
    root.innerHTML = `
    <div class="sl">
      <div class="sl-top"><div class="sl-tabs">${Object.entries(CAT).map(([k, c]) => `<button class="sl-cat ${palCat === k ? 'on' : ''}" data-cat="${k}" style="--c:${c[2]}"><i></i>${T(c[0], c[1])}</button>`).join('')}</div>
        <div class="sl-lang"><button data-lang="mn" class="${L.lang === 'mn' ? 'on' : ''}">МН</button><button data-lang="en" class="${L.lang === 'en' ? 'on' : ''}">EN</button></div></div>
      <div class="sl-main">
        <div class="sl-pal">${B.filter(b => b.c === palCat).map(b => blockHTML(mk(b.k), '', true)).join('')}
          ${palCat === 'va' || palCat === 'se' || palCat === 'ct' ? `<div class="sl-help"><b>${T('Утгууд, нөхцөлүүд', 'Values & conditions')}</b>${HELP.map(([m, e]) => `<button class="sl-chip" data-ins="${esc(e)}">${esc(T(m, e))}</button>`).join('')}<small>${T('Оролтын нүдийг дараад, энэ товчоор утга оруулна.', 'Click an input, then a chip to insert.')}</small></div>` : ''}
          ${palCat === 'va' ? `<div class="sl-help"><b>${T('Хувьсагчууд', 'Variables')}</b>${Object.keys(P.vars).map(v => `<button class="sl-chip" data-ins="${esc(v)}">${esc(v)}</button>`).join('')}<button class="sl-chip add" id="sl-newvar">+ ${T('Шинэ хувьсагч', 'New variable')}</button></div>` : ''}
        </div>
        <div class="sl-code" id="sl-code"><div class="sl-hint">${T('Блокоо зүүн талаас чирж энд залга. Шинэ скрипт эхлүүлэхдээ «Үйл явдал» блокийг хоосон зайд тавина.', 'Drag blocks here. Drop an Events block on empty space to start a new script.')}</div>${scriptsHTML()}</div>
        <div class="sl-right">
          <div class="sl-bar"><button class="sl-go" title="${T('Эхлүүлэх', 'Start')}">🚩</button><button class="sl-stopb" title="${T('Зогсоох', 'Stop')}">⏹</button><span class="sl-vars"></span><button class="sl-full" title="${T('Том дэлгэц', 'Full screen')}">⛶</button></div>
          <div class="sl-stagewrap"><canvas width="${W}" height="${H}" class="sl-stage"></canvas><form class="sl-ask" hidden><input placeholder="${T('Хариултаа бич…', 'Type your answer…')}"><button>✔</button></form><div class="sl-err" hidden></div></div>
          <div class="sl-props"></div>
          <div class="sl-sprites">${P.sprites.map(s => `<button class="sl-sp ${s.id === cur ? 'on' : ''}" data-sp="${s.id}"><img src="${svgUrl(lib(s.lib).costumes[0])}" alt=""><span>${esc(s.name)}</span></button>`).join('')}<button class="sl-sp add" id="sl-add"><b>+</b><span>${T('Дүр нэмэх', 'Add sprite')}</span></button></div>
          <div class="sl-bgs"><b>${T('Дэвсгэр', 'Backdrop')}:</b>${window.BACKDROPS.map(b => `<button class="sl-bgb ${P.bg === b.id ? 'on' : ''}" data-bg="${b.id}" title="${esc(T(b.mn, b.en))}"><img src="${svgUrl(b.svg)}" alt="${esc(T(b.mn, b.en))}"></button>`).join('')}</div>
          <div class="sl-files"><button class="ghost sm" id="sl-save">💾 ${T('Хадгалах', 'Save')}</button><button class="ghost sm" id="sl-export">⬇ ${T('Файлаар татах', 'Download')}</button><label class="ghost sm sl-imp">⬆ ${T('Файл нээх', 'Open file')}<input type="file" accept=".json,.tugal" hidden id="sl-import"></label><button class="ghost sm" id="sl-newp">🗋 ${T('Шинэ', 'New')}</button></div>
          <div class="sl-files sl-pub"><select id="sl-tpl"><option value="">🎮 ${T('Жишээ тоглоом ачаалах…', 'Load a sample game…')}</option>${GAMES.map((g, i) => `<option value="${i}">${esc(T(g.mn, g.en))}</option>`).join('')}</select>${opts.onPublish ? `<button class="sl-pubb" id="sl-pub">🏆 ${T('Тоглоомын талбайд нийтлэх', 'Publish to the arcade')}</button>` : ''}</div>
        </div>
      </div>
      <div class="sl-lib" hidden></div>
    </div>`;
    pen = pen || Object.assign(document.createElement('canvas'), { width: W, height: H }); penCtx = pen.getContext('2d');
    ctx = root.querySelector('.sl-stage').getContext('2d');
    bind(); draw(); syncProps(); showVars();
  }
  function syncProps() {
    const el = root?.querySelector('.sl-props'); if (!el) return; const sp = spr(); if (!sp) return;
    if (el.contains(document.activeElement)) return;
    el.innerHTML = `<label>${T('Нэр', 'Name')}<input data-pp="name" value="${esc(sp.name)}"></label><label>x<input data-pp="x" type="number" value="${Math.round(sp.x)}"></label><label>y<input data-pp="y" type="number" value="${Math.round(sp.y)}"></label><label>${T('Хэмжээ', 'Size')}<input data-pp="size" type="number" value="${Math.round(sp.size)}"></label><label>${T('Чиглэл', 'Direction')}<input data-pp="dir" type="number" value="${Math.round(sp.dir)}"></label><button class="ghost sm" id="sl-delsp" title="${T('Дүрийг устгах', 'Delete sprite')}">🗑</button>`;
    el.querySelectorAll('[data-pp]').forEach(i => i.onchange = () => { const k = i.dataset.pp; sp[k] = k === 'name' ? i.value.trim() || sp.name : +i.value; changed(); draw(); render() });
    el.querySelector('#sl-delsp').onclick = () => { if (P.sprites.length < 2) return; P.sprites = P.sprites.filter(s => s !== sp); cur = P.sprites[0].id; changed(); render() };
  }
  function changed() { dirty = true; opts.onChange?.(P) }

  /* ---------------- Чирэх ---------------- */
  let drag = null, lastInput = null;
  function bindPlayer() {
    root.querySelector('.sl-go').onclick = go; root.querySelector('.sl-stopb').onclick = () => stopAll();
    root.querySelector('.sl-full').onclick = () => { const el = root.querySelector('.sl'); if (document.fullscreenElement) document.exitFullscreen(); else (el.requestFullscreen ? el.requestFullscreen().catch(() => el.classList.toggle('big')) : el.classList.toggle('big')) };
    const st = root.querySelector('.sl-stage');
    const toStage = e => { const r = st.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W - W / 2, y: H / 2 - (e.clientY - r.top) / r.height * H } };
    st.onpointermove = e => { mouse = toStage(e) };
    st.onpointerdown = e => { const m = toStage(e); mouse = m; const hit = [...P.sprites].reverse().find(s => { if (!s.show) return false; const b = bbox(s); return m.x > b.l && m.x < b.r && m.y > b.b && m.y < b.t }); if (hit) hit.scripts.forEach(sc => { if (sc.hat.k === 'click') { ensureRun(); startThread(hit, sc) } }) };
  }
  function bind() {
    root.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { palCat = b.dataset.cat; render() });
    root.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { L.lang = b.dataset.lang; try { localStorage.setItem('n9_slang', L.lang) } catch (e) { } render() });
    root.querySelector('.sl-go').onclick = go;
    root.querySelector('.sl-stopb').onclick = () => stopAll();
    root.querySelector('.sl-full').onclick = () => root.querySelector('.sl').classList.toggle('big');
    root.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => { cur = b.dataset.sp; render() });
    root.querySelectorAll('[data-bg]').forEach(b => b.onclick = () => { P.bg = b.dataset.bg; changed(); render() });
    root.querySelector('#sl-add').onclick = openLib;
    root.querySelector('#sl-newvar')?.addEventListener('click', () => { const n = prompt(T('Хувьсагчийн нэр:', 'Variable name:')); if (n && /^[\p{L}_][\p{L}\p{N}_]*$/u.test(n.trim())) { P.vars[n.trim()] = 0; changed(); render() } else if (n) alert(T('Нэр үсгээр эхэлж, зайгүй байна.', 'Name must start with a letter, no spaces.')) });
    root.querySelectorAll('[data-ins]').forEach(b => b.onmousedown = e => e.preventDefault());
    root.querySelectorAll('[data-ins]').forEach(b => b.onclick = () => { if (!lastInput || !document.body.contains(lastInput)) { err(T('Эхлээд блокийн оролтын нүдийг дарна уу.', 'Click a block input first.')); return } const s = b.dataset.ins; const i = lastInput; const st = i.selectionStart ?? i.value.length; i.value = i.value.slice(0, st) + s + i.value.slice(i.selectionEnd ?? st); i.dispatchEvent(new Event('change')); i.focus() });
    // оролт
    root.querySelectorAll('.sl-code input, .sl-code select').forEach(i => {
      i.onfocus = () => { if (i.tagName === 'INPUT' && i.type !== 'color') lastInput = i };
      i.oninput = () => { if (i.tagName === 'INPUT' && i.type !== 'color') i.size = Math.max(2, i.value.length) };
      i.onchange = () => { const r = resolve(i.dataset.p); const n = r.node; n.a ??= []; n.a[+i.dataset.i] = i.value; changed() };
    });
    root.querySelectorAll('[data-del]').forEach(b => b.onclick = e => { e.stopPropagation(); const p = b.dataset.del; const sp = spr(); if (p.endsWith('/h')) { sp.scripts.splice(+p.split('/')[0].slice(1), 1) } else { const r = resolve(p); r.list.splice(r.i, 1) } changed(); render() });
    // палитр: дарж нэмэх
    root.querySelectorAll('.sl-pal [data-new]').forEach(el => {
      el.onpointerdown = e => startDrag(e, { neu: el.dataset.new }, el);
    });
    root.querySelectorAll('.sl-code .sl-b').forEach(el => {
      el.onpointerdown = e => { if (e.target.closest('input,select,button')) return; e.stopPropagation(); const p = el.dataset.path; if (p) startDrag(e, { path: p }, el); else if (el.dataset.grip != null) startDrag(e, { script: +el.dataset.grip }, el.closest('.sl-script')) };
    });
    const st = root.querySelector('.sl-stage');
    const toStage = e => { const r = st.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W - W / 2, y: H / 2 - (e.clientY - r.top) / r.height * H } };
    st.onpointermove = e => { mouse = toStage(e) };
    let sdrag = null;
    st.onpointerdown = e => {
      const m = toStage(e); mouse = m;
      const hit = [...P.sprites].reverse().find(s => { if (!s.show) return false; const b = bbox(s); return m.x > b.l && m.x < b.r && m.y > b.b && m.y < b.t });
      if (!hit) return;
      if (run) { hit.scripts.forEach(sc => { if (sc.hat.k === 'click') startThread(hit, sc) }); return }
      cur = hit.id; sdrag = { sp: hit, dx: hit.x - m.x, dy: hit.y - m.y }; st.setPointerCapture(e.pointerId);
      hit.scripts.forEach(sc => { if (sc.hat.k === 'click') { ensureRun(); startThread(hit, sc) } });
    };
    st.onpointerup = () => { if (sdrag) { sdrag = null; changed(); render() } };
    st.addEventListener('pointermove', e => { if (sdrag) { const m = toStage(e); sdrag.sp.x = Math.round(m.x + sdrag.dx); sdrag.sp.y = Math.round(m.y + sdrag.dy); draw() } });
    root.querySelector('#sl-save').onclick = () => { opts.onSave?.(P); flash(T('Хадгаллаа ✓', 'Saved ✓')) };
    root.querySelector('#sl-export').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(P)], { type: 'application/json' })); a.download = (spr().name || 'naadam') + '.tugal'; a.click() };
    root.querySelector('#sl-import').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const p = JSON.parse(t); if (!p.sprites) throw 0; load(p); changed() } catch (er) { err(T('Файл буруу байна.', 'Invalid file.')) } }) };
    root.querySelector('#sl-tpl').onchange = e => { const g = GAMES[+e.target.value]; e.target.value = ''; if (!g) return; if (confirm(T('Жишээ тоглоомыг ачаалах уу? Одоогийн төсөл солигдоно.', 'Load the sample game? It replaces the current project.'))) { load(g.p()); changed(); flash(T('🚩 дарж тоглоорой!', 'Press 🚩 to play!')) } };
    const pb = root.querySelector('#sl-pub'); if (pb) pb.onclick = () => { opts.onSave?.(P); opts.onPublish(JSON.parse(JSON.stringify(P))) };
    root.querySelector('#sl-newp').onclick = () => { if (confirm(T('Шинэ төсөл эхлүүлэх үү? Хадгалаагүй өөрчлөлт устана.', 'Start a new project? Unsaved changes will be lost.'))) { load(defaultProject()); changed() } };
  }
  function flash(t) { const e = root.querySelector('.sl-err'); e.textContent = t; e.hidden = false; e.classList.add('ok'); setTimeout(() => { e.hidden = true; e.classList.remove('ok') }, 1600) }
  function openLib() {
    const box = root.querySelector('.sl-lib'); box.hidden = false;
    box.innerHTML = `<div class="sl-libin"><div class="row" style="justify-content:space-between"><h3 style="margin:0">${T('Дүр сонгох', 'Choose a sprite')}</h3><button class="ghost sm" id="sl-libx">✕</button></div>
      ${Object.entries(window.SPRITE_GROUPS).map(([g, n]) => `<h4>${T(n[0], n[1])}</h4><div class="sl-libg">${window.SPRITES.filter(s => s.grp === g).map(s => `<button data-lib="${s.id}"><img src="${svgUrl(s.costumes[0])}" alt=""><span>${esc(T(s.mn, s.en))}</span></button>`).join('')}</div>`).join('')}</div>`;
    box.querySelector('#sl-libx').onclick = () => { box.hidden = true };
    box.querySelectorAll('[data-lib]').forEach(b => b.onclick = () => { const s = newSprite(b.dataset.lib, Math.round(Math.random() * 200 - 100), Math.round(Math.random() * 120 - 60)); P.sprites.push(s); cur = s.id; box.hidden = true; changed(); render() });
  }
  function startDrag(e, what, el) {
    if (e.button) return; e.preventDefault();
    const r = el.getBoundingClientRect();
    const ghost = el.cloneNode(true); ghost.classList.add('sl-ghost'); ghost.style.width = r.width + 'px';
    document.body.appendChild(ghost);
    drag = { what, ghost, ox: e.clientX - r.left, oy: e.clientY - r.top, sx: e.clientX, sy: e.clientY, moved: false, el };
    const mv = ev => {
      if (!drag) return;
      if (Math.abs(ev.clientX - drag.sx) + Math.abs(ev.clientY - drag.sy) > 4) drag.moved = true;
      ghost.style.left = ev.clientX - drag.ox + 'px'; ghost.style.top = ev.clientY - drag.oy + 'px';
      if (drag.what.script == null) markDrop(ev);
    };
    const up = ev => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); ghost.remove(); finishDrag(ev); drag = null; root.querySelectorAll('.sl-drop.on').forEach(d => d.classList.remove('on')) };
    document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
    ghost.style.left = r.left + 'px'; ghost.style.top = r.top + 'px';
  }
  function dropTarget(ev) {
    const code = root.querySelector('#sl-code'); const cr = code.getBoundingClientRect();
    if (ev.clientX < cr.left || ev.clientX > cr.right || ev.clientY < cr.top || ev.clientY > cr.bottom) return { outside: true, pal: ev.clientX < cr.left };
    // хамгийн ойрын байрлал: блок бүрийн доор, жагсаалтын эхэнд
    let best = null, bd = 36;
    const gy = ev.clientY - drag.oy + 10, gx = ev.clientX - drag.ox + 10;
    root.querySelectorAll('.sl-code [data-list]').forEach(L0 => {
      if (drag.what.path && L0.closest(`[data-path="${CSS.escape(drag.what.path)}"]`)) return; // өөрийн дотор оруулахгүй
      const lp = L0.dataset.list; const items = [...L0.children].filter(c => c.classList.contains('sl-b'));
      const lr = L0.getBoundingClientRect();
      const cand = [{ y: lr.top, i: 0 }].concat(items.map((c, i) => ({ y: c.getBoundingClientRect().bottom, i: i + 1 })));
      cand.forEach(c => { const d = Math.hypot((gx - lr.left) * .5, gy - c.y); if (d < bd && gx > lr.left - 40 && gx < lr.right + 60) { bd = d; best = { lp, i: c.i, el: L0, y: c.y, x: lr.left } } });
    });
    return best || { free: true, x: ev.clientX - cr.left + code.scrollLeft - drag.ox, y: ev.clientY - cr.top + code.scrollTop - drag.oy };
  }
  let dropLine = null;
  function markDrop(ev) {
    const t = dropTarget(ev);
    dropLine ??= Object.assign(document.createElement('div'), { className: 'sl-dropline' }); if (!dropLine.isConnected) document.body.appendChild(dropLine);
    if (t.lp != null && !(drag.what.neu && BK[drag.what.neu].hat)) { dropLine.style.display = 'block'; dropLine.style.left = t.x + 'px'; dropLine.style.top = t.y - 3 + 'px' } else dropLine.style.display = 'none';
  }
  function finishDrag(ev) {
    if (dropLine) dropLine.style.display = 'none';
    const w = drag.what, sp = spr();
    if (w.script != null) { // скриптийг зөөх
      const t = dropTarget(ev); if (t.outside) { if (t.pal) { sp.scripts.splice(w.script, 1); changed(); render() } return }
      const sc = sp.scripts[w.script]; const code = root.querySelector('#sl-code'), cr = code.getBoundingClientRect();
      sc.x = Math.max(0, Math.round(ev.clientX - cr.left + code.scrollLeft - drag.ox)); sc.y = Math.max(0, Math.round(ev.clientY - cr.top + code.scrollTop - drag.oy)); changed(); render(); return;
    }
    if (!drag.moved && w.neu) { // дарсан: сонгосон скриптийн төгсгөлд нэмэх
      const d = BK[w.neu];
      if (d.hat) sp.scripts.push({ hat: mk(w.neu), body: [], x: 20 + sp.scripts.length * 14, y: 20 + sp.scripts.reduce((a, s) => Math.max(a, s.y + 60 + s.body.length * 34), 0) });
      else { if (!sp.scripts.length) sp.scripts.push({ hat: mk('flag'), body: [], x: 20, y: 20 }); sp.scripts[sp.scripts.length - 1].body.push(mk(w.neu)) }
      changed(); render(); return;
    }
    if (!drag.moved) return;
    const t = dropTarget(ev);
    let node;
    if (w.neu) node = mk(w.neu);
    if (t.outside) { if (w.path && t.pal) { const r = resolve(w.path); r.list.splice(r.i, 1); changed(); render() } return }
    if (w.neu && BK[w.neu].hat) { sp.scripts.push({ hat: node, body: [], x: Math.max(0, Math.round(t.x ?? 20)), y: Math.max(0, Math.round(t.y ?? 20)) }); changed(); render(); return }
    if (w.path) { // байгаа блокийг зөөх (доорх бүх блоктой нь хамт биш, ганцаар)
      const r = resolve(w.path); node = r.list[r.i];
      if (t.lp == null) { r.list.splice(r.i, 1); sp.scripts.push({ hat: mk('flag'), body: [node], x: Math.max(0, Math.round(t.x)), y: Math.max(0, Math.round(t.y)) }); changed(); render(); return }
      const dest = listAt(t.lp); let i = t.i;
      if (dest === r.list && r.i < i) i--;
      r.list.splice(r.i, 1); dest.splice(i, 0, node); changed(); render(); return;
    }
    if (t.lp == null) { sp.scripts.push({ hat: mk('flag'), body: [node], x: Math.max(0, Math.round(t.x)), y: Math.max(0, Math.round(t.y)) }); changed(); render(); return }
    listAt(t.lp).splice(t.i, 0, node); changed(); render();
  }
  function load(p) { stopAll(true); P = p; P.vars ??= {}; P.sprites.forEach(s => { s.scripts ??= []; s.cos ??= 0 }); cur = P.sprites[0]?.id; penCtx?.clearRect(0, 0, W, H); render() }

  /* ---------------- Гар ---------------- */
  const keyName = e => ({ ' ': 'space', ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key] || e.key.toLowerCase());
  document.addEventListener('keydown', e => {
    if (!root?.isConnected || e.target.closest('input,textarea,select')) return;
    const k = keyName(e); if (['space', 'up', 'down', 'left', 'right'].includes(k)) e.preventDefault();
    if (keys[k]) return; keys[k] = true;
    if (P) { const hits = []; P.sprites.forEach(sp => sp.scripts.forEach(sc => { if (sc.hat.k === 'key' && (sc.hat.a?.[0] || 'space') === k) hits.push([sp, sc]) })); if (hits.length) { ensureRun(); hits.forEach(([sp, sc]) => startThread(sp, sc)) } }
  });
  document.addEventListener('keyup', e => { delete keys[keyName(e)] });

  /* ---------------- CSS ---------------- */
  const css = document.createElement('style');
  css.textContent = `
.sl{--ln:#e6d6b8;background:#fffaf0;color:#2a1a10;border-radius:18px;border:2px solid var(--ln);padding:10px;font-family:Nunito,Arial,sans-serif}
.sl.big{position:fixed;inset:8px;z-index:200;overflow:auto}
.sl-pub{margin-top:6px}.sl-pub select{font:inherit;font-weight:700;border:2px solid #e8a21a;border-radius:10px;padding:5px 8px;max-width:100%}.sl-pubb{background:linear-gradient(90deg,#e8a21a,#c8102e)!important;color:#fff!important;font-weight:900!important}
.sl-player{padding:8px}.sl-player .sl-stagewrap{max-width:none}.sl-player .sl-go{font-size:18px;padding:8px 18px}.sl-player:fullscreen{background:#14306a;display:flex;flex-direction:column;justify-content:center}.sl-player:fullscreen .sl-stage{max-height:88vh;width:auto;margin:auto;display:block}
.sl-top{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px}
.sl-tabs{display:flex;gap:4px;flex-wrap:wrap}.sl-cat{background:#fff;color:#2a1a10;border:2px solid var(--ln);box-shadow:none;padding:5px 10px;min-height:34px;font-size:14px;border-radius:12px}
.sl-cat i{width:12px;height:12px;border-radius:50%;background:var(--c);display:inline-block}.sl-cat.on{border-color:var(--c);background:color-mix(in srgb,var(--c) 18%,#fff)}
.sl-lang button{background:#fff;color:#2a1a10;border:2px solid var(--ln);box-shadow:none;padding:4px 10px;min-height:34px;font-size:14px}.sl-lang button.on{background:#2a5ab8;color:#fff;border-color:#2a5ab8}
.sl-main{display:grid;grid-template-columns:230px 1fr 500px;gap:10px;min-height:560px}
@media(max-width:1200px){.sl-main{grid-template-columns:200px 1fr}.sl-right{grid-column:1/-1}}
.sl-pal{background:#fff;border:2px solid var(--ln);border-radius:14px;padding:8px;overflow:auto;max-height:640px;display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.sl-b{background:var(--c);color:#fff;font-weight:800;font-size:14px;border-radius:9px;padding:6px 10px;cursor:grab;user-select:none;box-shadow:0 3px 0 color-mix(in srgb,var(--c) 70%,#000);position:relative;line-height:1.5}
.sl-b.hat{border-radius:18px 18px 9px 9px;padding-top:9px}
.sl-in{background:#fff;color:#2a1a10;border-radius:9px;padding:0 6px;margin:0 2px;font-weight:700}
.sl-b input,.sl-b select{font:inherit;font-weight:700;font-size:13px;border:0;border-radius:9px;padding:1px 6px;margin:0 2px;min-height:0;width:auto;color:#2a1a10;background:#fff}
.sl-b input[type=color]{width:34px;height:22px;padding:0;vertical-align:middle}
.sl-row{display:flex;align-items:center;flex-wrap:wrap;gap:2px}.sl-x{background:transparent!important;box-shadow:none!important;color:#fff;opacity:.55;padding:0 4px!important;min-height:0!important;font-size:12px;margin-left:6px}.sl-x:hover{opacity:1}
.sl-code{position:relative;background:#fff;border:2px dashed var(--ln);border-radius:14px;overflow:auto;min-height:560px;max-height:640px;background-image:radial-gradient(#eadfca 1.2px,transparent 1.2px);background-size:18px 18px}
.sl-hint{position:absolute;right:10px;bottom:8px;left:10px;font-size:12px;color:#8a7558;text-align:right;pointer-events:none}
.sl-script{position:absolute;min-width:180px}
.sl-body,.sl-mouth{display:flex;flex-direction:column;align-items:flex-start;gap:3px;min-height:6px}
.sl-body{padding-top:3px}
.sl-mouth{margin:4px 0 4px 14px;padding:4px 0 4px 6px;border-left:4px solid rgba(255,255,255,.55);min-height:24px;min-width:120px}
.sl-else{margin-top:2px}.sl-foot{height:6px}
.sl-drop{height:6px;width:100%}
.sl-dropline{position:fixed;z-index:300;height:5px;width:150px;border-radius:5px;background:#2a5ab8;box-shadow:0 0 0 2px #fff;pointer-events:none;display:none}
.sl-ghost{position:fixed;z-index:299;pointer-events:none;opacity:.88;transform:rotate(-2deg)}
.sl-help{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;border-top:2px dashed var(--ln);padding-top:8px;width:100%}.sl-help b{width:100%;font-size:13px}.sl-help small{color:#8a7558;font-size:11px}
.sl-chip{background:#f4ead6;color:#2a1a10;box-shadow:none;padding:3px 8px;min-height:28px;font-size:12px;border-radius:9px;border:1px solid var(--ln)}.sl-chip.add{background:#ff8c1a;color:#fff}
.sl-right{display:flex;flex-direction:column;gap:8px}
.sl-bar{display:flex;align-items:center;gap:6px}.sl-go,.sl-stopb,.sl-full{background:#fff;border:2px solid var(--ln);box-shadow:none;min-height:40px;font-size:20px;padding:2px 12px}.sl-go.on{background:#d8f5d0;border-color:#4fc45a}
.sl-vars{display:flex;gap:6px;flex-wrap:wrap;flex:1}.sl-vars span{background:#ff8c1a;color:#fff;border-radius:9px;padding:2px 8px;font-size:13px}.sl-vars b{margin-right:4px}
.sl-stagewrap{position:relative}.sl-stage{width:100%;aspect-ratio:4/3;border-radius:12px;border:2px solid var(--ln);background:#fff;touch-action:none;display:block}
.sl-ask[hidden],.sl-err[hidden]{display:none!important}
.sl-ask{position:absolute;left:10px;right:10px;bottom:10px;display:flex;gap:6px;background:#fff;border:2px solid #5cb1d6;border-radius:12px;padding:6px}.sl-ask input{flex:1;border:0;font:inherit;padding:4px 8px}
.sl-err{position:absolute;left:10px;top:10px;right:10px;background:#ffe2dd;color:#8a1c0c;border-radius:10px;padding:6px 10px;font-weight:700;font-size:14px}.sl-err.ok{background:#d8f5d0;color:#145c32}
.sl-props{display:flex;gap:6px;flex-wrap:wrap;align-items:end;font-size:12px}.sl-props label{display:flex;flex-direction:column;margin:0;font-weight:700}.sl-props input{width:64px;min-height:30px;padding:2px 6px;font-size:13px}.sl-props label:first-child input{width:110px}
.sl-sprites{display:flex;gap:6px;flex-wrap:wrap}.sl-sp{background:#fff;color:#2a1a10;border:2px solid var(--ln);box-shadow:none;flex-direction:column;padding:4px;min-height:0;width:76px;font-size:11px;gap:0}.sl-sp img{width:52px;height:52px}.sl-sp.on{border-color:#2a5ab8;background:#e8f0ff}.sl-sp.add b{font-size:30px;line-height:52px}
.sl-bgs{display:flex;gap:4px;align-items:center;flex-wrap:wrap;font-size:13px}.sl-bgb{padding:0;min-height:0;background:#fff;border:2px solid var(--ln);box-shadow:none;border-radius:8px;overflow:hidden}.sl-bgb img{width:52px;height:39px;display:block}.sl-bgb.on{border-color:#2a5ab8}
.sl-files{display:flex;gap:6px;flex-wrap:wrap}.sl-imp{cursor:pointer;display:inline-flex;align-items:center;border-radius:12px;font-weight:800}
.sl-lib{position:fixed;inset:0;z-index:250;background:rgba(20,10,0,.45);display:grid;place-items:center}.sl-lib[hidden]{display:none}.sl-libin{background:#fffaf0;border-radius:18px;padding:16px;max-width:720px;width:92vw;max-height:86vh;overflow:auto}
.sl-libg{display:flex;gap:8px;flex-wrap:wrap}.sl-libg button{background:#fff;color:#2a1a10;border:2px solid var(--ln);box-shadow:none;flex-direction:column;width:100px;padding:6px;font-size:13px}.sl-libg img{width:76px;height:76px}`;
  document.head.appendChild(css);

  window.StageLab = {
    mount(el, o = {}) { root = el; opts = o; try { L.lang = o.lang || localStorage.getItem('n9_slang') || 'mn' } catch (e) { } load(o.project ? JSON.parse(JSON.stringify(o.project)) : defaultProject()) },
    get project() { return P },
    stop() { stopAll(true) },
    BLOCKS: B, CAT, GAMES,
  };
})();
