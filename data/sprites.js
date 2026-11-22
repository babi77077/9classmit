/* «Цахим нүүдэлчин» — хөөрхөн (chibi) дүрүүд, SVG 120×120.
   Хувцас бүр: 0 — энгийн, 1 — алхах/далавчаа дэвэх, 2 — нүдээ анивчих. */
(function () {
  const O = '#4a2e1f';
  const S = `stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const S2 = `stroke="${O}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
  const wrap = b => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><ellipse cx="58" cy="110" rx="34" ry="5" fill="#000" opacity=".12"/>${b}</svg>`;
  /* том гялалзсан нүд */
  const eye = (x, y, bl, s = 1) => bl
    ? `<path d="M${x - 6 * s} ${y + 1} q${6 * s} ${5 * s} ${12 * s} 0" fill="none" stroke="${O}" stroke-width="3" stroke-linecap="round"/>`
    : `<ellipse cx="${x}" cy="${y}" rx="${5.8 * s}" ry="${7.2 * s}" fill="${O}"/><ellipse cx="${x}" cy="${y + 3 * s}" rx="${3.6 * s}" ry="${2.6 * s}" fill="#7a4a2e"/><circle cx="${x + 2 * s}" cy="${y - 2.6 * s}" r="${2.5 * s}" fill="#fff"/><circle cx="${x - 2.2 * s}" cy="${y + 2.4 * s}" r="${1.2 * s}" fill="#fff"/>`;
  const blush = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="5.5" ry="3.4" fill="#ff8fa3" opacity=".7"/>`;
  const smile = (x, y, w = 4) => `<path d="M${x - w} ${y} q${w / 2} ${w * .8} ${w} 0 q${w / 2} ${w * .8} ${w} 0" fill="none" ${S2}/>`;
  /* богинохон бөөрөнхий хөл */
  const legs = (xs, y, h, c, st, hoof = '#5a3a28') => xs.map((x, i) => {
    const dx = st ? (i % 2 ? 3 : -3) : 0, dy = st && i % 2 === 0 ? -2 : 0;
    return `<rect x="${x - 5.5 + dx}" y="${y + dy}" width="11" height="${h}" rx="5.5" fill="${c}" ${S}/><path d="M${x - 5 + dx} ${y + h - 4 + dy} h10 v1.5 a3 3 0 0 1 -3 3 h-4 a3 3 0 0 1 -3 -3z" fill="${hoof}"/>`;
  }).join('');
  /* дөрвөн хөлт амьтны ерөнхий загвар */
  function quad(o, st, bl) {
    const hb = st ? -2 : 0, hx = o.hx || 82, hy = (o.hy || 47) + hb;
    return wrap(`<g transform="translate(-5 0)">
      ${o.tail || ''}
      ${legs(o.lx || [34, 46, 60, 72], 84, o.lh || 20, o.leg || o.c, st, o.hoof)}
      ${o.body ? o.body(st) : `<ellipse cx="53" cy="${78 + (st ? -1 : 0)}" rx="31" ry="19" fill="${o.c}" ${S}/>`}
      ${o.belly !== false ? `<ellipse cx="54" cy="${87 + (st ? -1 : 0)}" rx="18" ry="7" fill="${o.belly || '#fff4e2'}" opacity=".9"/>` : ''}
      ${o.spots || ''}
      ${o.neck || ''}
      <g transform="translate(0 ${hb})">
        ${o.earsBack || ''}
        ${o.head ? o.head : `<ellipse cx="${hx}" cy="${o.hy || 47}" rx="${o.hr || 27}" ry="${(o.hr || 27) - 2}" fill="${o.hc || o.c}" ${S}/>`}
        ${o.face || ''}
        <ellipse cx="${hx + 3}" cy="${(o.hy || 47) + 13}" rx="${o.mw || 14}" ry="${o.mh || 9.5}" fill="${o.mz || '#ffc9b5'}" ${S2}/>
        ${o.nose !== false ? `<ellipse cx="${hx - 2}" cy="${(o.hy || 47) + 12}" rx="2" ry="2.6" fill="${O}"/><ellipse cx="${hx + 8}" cy="${(o.hy || 47) + 12}" rx="2" ry="2.6" fill="${O}"/>` : ''}
        ${smile(hx + 3, (o.hy || 47) + 17, 3.2)}
        ${eye(hx - 10, (o.hy || 47) - 3, bl)}${eye(hx + 12, (o.hy || 47) - 3, bl)}
        ${blush(hx - 19, (o.hy || 47) + 7)}${blush(hx + 22, (o.hy || 47) + 7)}
        ${o.top || ''}
      </g></g>`);
  }
  const ear = (x, y, rot, c, inner = '#ffb3a7', l = 15, w = 8) => `<g transform="translate(${x} ${y}) rotate(${rot})"><ellipse cx="0" cy="0" rx="${l}" ry="${w}" fill="${c}" ${S}/><ellipse cx="${l * .15}" cy="0" rx="${l * .6}" ry="${w * .5}" fill="${inner}"/></g>`;

  /* ---------- ТУГАЛ ---------- */
  const calf = (st, bl) => quad({
    c: '#dda06a', belly: '#fff3dd', mz: '#ffcbb8',
    tail: `<path d="M24 74 q-12 -4 -12 -16" fill="none" ${S}/><path d="M12 58 q-6 -4 -2 -9 q6 1 5 8z" fill="#8a5530" ${S2}/>`,
    spots: `<path d="M40 64 q10 -4 16 4 q-2 10 -12 10 q-8 -4 -4 -14z" fill="#fff8ee"/><path d="M66 74 q7 -4 11 2 q-2 7 -8 7 q-5 -3 -3 -9z" fill="#fff8ee"/>`,
    earsBack: ear(57, 40, -25, '#dda06a') + ear(108, 40, 25, '#dda06a'),
    face: `<path d="M74 24 q8 6 16 0 q-1 9 -8 11 q-7 -2 -8 -11z" fill="#fff8ee"/>`,
    top: `<path d="M70 24 q-3 -7 2 -10" fill="none" stroke="#fff1c8" stroke-width="6" stroke-linecap="round"/><path d="M95 24 q3 -7 -2 -10" fill="none" stroke="#fff1c8" stroke-width="6" stroke-linecap="round"/><path d="M78 21 q4 -8 8 0 q3 -6 6 1" fill="#b77a45" ${S2}/>`,
  }, st, bl);

  /* ---------- АДУУ ---------- */
  const horse = (st, bl) => quad({
    c: '#b8733f', leg: '#b8733f', hoof: '#3a2418', belly: '#e9b98f', mz: '#f0c9a0', lh: 22,
    tail: `<path d="M24 70 q-16 2 -14 24 q8 -2 10 -10 q2 8 8 10 q-2 -16 4 -22z" fill="#5b3420" ${S}/>`,
    earsBack: `<path d="M64 30 l-2 -16 l11 10z" fill="#b8733f" ${S}/><path d="M98 28 l4 -16 l-12 9z" fill="#b8733f" ${S}/>`,
    face: `<path d="M83 33 q-3 6 0 12 q3 -6 0 -12z" fill="#fff4e2"/>`,
    top: `<path d="M72 24 q4 -10 12 -8 q8 -4 12 6 q-6 -2 -9 3 q-4 -5 -8 -1 q-4 -3 -7 0z" fill="#5b3420" ${S2}/>`,
    neck: `<path d="M64 70 q2 -20 12 -30 l16 8 q-4 16 -14 26z" fill="#b8733f" ${S}/><path d="M62 66 q-2 -16 8 -30 q2 6 6 6 q-8 10 -8 24z" fill="#5b3420" ${S2}/>`,
  }, st, bl);

  /* ---------- ҮХЭР ---------- */
  const cow = (st, bl) => quad({
    c: '#fbf6ec', belly: '#ffffff', mz: '#ffb8c4', hoof: '#3b2f2f',
    tail: `<path d="M24 72 q-12 -2 -12 -16" fill="none" ${S}/><path d="M12 56 q-6 -4 -2 -9 q6 1 5 8z" fill="#3b2f2f" ${S2}/>`,
    spots: `<path d="M34 66 q8 -8 18 -2 q2 10 -8 14 q-10 -2 -10 -12z" fill="#3b2f2f"/><path d="M62 80 q8 -6 14 0 q0 8 -8 9 q-6 -2 -6 -9z" fill="#3b2f2f"/>`,
    earsBack: ear(56, 42, -20, '#fbf6ec') + ear(109, 42, 20, '#fbf6ec'),
    face: `<path d="M90 24 q10 2 10 14 q-8 4 -14 -2 q-2 -8 4 -12z" fill="#3b2f2f"/>`,
    top: `<path d="M66 26 q-10 -6 -8 -16 q6 4 12 10z" fill="#fff1c8" ${S2}/><path d="M98 26 q10 -6 8 -16 q-6 4 -12 10z" fill="#fff1c8" ${S2}/><circle cx="86" cy="79" r="5" fill="#ffcf4a" ${S2}/>`,
  }, st, bl);

  /* ---------- ХОНЬ ---------- */
  const fluff = (cx, cy, rx, ry, n, c) => { let o = ''; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; o += `<circle cx="${(cx + Math.cos(a) * rx).toFixed(1)}" cy="${(cy + Math.sin(a) * ry).toFixed(1)}" r="${(Math.min(rx, ry) * .55).toFixed(1)}" fill="${c}" ${S}/>`; } return o + `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}"/>`; };
  const sheep = (st, bl) => quad({
    c: '#fffaf0', leg: '#5a463a', hoof: '#2b1f18', belly: false, mz: '#f6d2bd', hc: '#f3d4b8',
    tail: `<ellipse cx="22" cy="80" rx="9" ry="11" fill="#fffaf0" ${S}/>`,
    body: s => fluff(52, 76 + (s ? -1 : 0), 26, 15, 12, '#fffaf0'),
    earsBack: ear(57, 50, 30, '#e9c4a0', '#ffc2b8', 14, 7) + ear(107, 50, -30, '#e9c4a0', '#ffc2b8', 14, 7),
    top: `<circle cx="74" cy="25" r="7" fill="#fffaf0" ${S2}/><circle cx="83" cy="21" r="8" fill="#fffaf0" ${S2}/><circle cx="92" cy="25" r="7" fill="#fffaf0" ${S2}/>`,
  }, st, bl);

  /* ---------- ЯМАА ---------- */
  const goat = (st, bl) => quad({
    c: '#f1ece3', belly: '#ffffff', mz: '#f7d6c7', leg: '#e2d9cb', hoof: '#4a3a2e', hr: 25,
    tail: `<path d="M24 70 q-8 -8 -4 -14 q6 4 6 12z" fill="#f1ece3" ${S}/>`,
    earsBack: ear(58, 46, 15, '#e2d9cb') + ear(106, 46, -15, '#e2d9cb'),
    top: `<path d="M72 26 q-8 -14 -20 -12 q10 2 14 14z" fill="#b99a74" ${S2}/><path d="M92 26 q8 -14 20 -12 q-10 2 -14 14z" fill="#b99a74" ${S2}/><path d="M80 68 q5 12 10 0z" fill="#e2d9cb" ${S2}/>`,
  }, st, bl);

  /* ---------- ТЭМЭЭ ---------- */
  const camel = (st, bl) => quad({
    c: '#dcae6c', belly: '#f3d8aa', mz: '#f1cfa0', hy: 34, hx: 88, hr: 23, lh: 22,
    tail: `<path d="M23 74 q-8 4 -8 16" fill="none" ${S}/><path d="M15 90 l-3 6 l6 0z" fill="#8a5a30" ${S2}/>`,
    body: s => `<path d="M22 82 q0 -14 10 -18 q4 -18 14 -18 q10 0 12 14 q4 -14 14 -14 q10 0 12 18 q10 6 8 18 q-2 10 -18 12 h-36 q-16 -2 -16 -12z" transform="translate(0 ${s ? -1 : 0})" fill="#dcae6c" ${S}/><path d="M38 52 q6 -6 12 0 M64 52 q6 -6 12 0" fill="none" stroke="#b07f42" stroke-width="5" stroke-linecap="round"/>`,
    neck: `<path d="M76 76 q0 -20 6 -32 h14 q2 18 -4 32z" fill="#dcae6c" ${S}/><path d="M78 74 q0 -18 5 -28 h12" fill="#dcae6c"/>`,
    earsBack: ear(66, 26, -30, '#dcae6c', '#f6c9b0', 10, 6) + ear(110, 26, 30, '#dcae6c', '#f6c9b0', 10, 6),
    top: `<path d="M76 14 q6 -8 12 -2 q6 -8 12 2 q-12 4 -24 0z" fill="#b07f42" ${S2}/>`,
  }, st, bl);

  /* ---------- БАНХАР ---------- */
  const dog = (st, bl) => quad({
    c: '#33302e', leg: '#33302e', hoof: '#d18b47', belly: '#d18b47', mz: '#e3a565', hc: '#33302e',
    tail: `<path d="M24 70 q-14 -4 -10 -18 q8 -6 10 4 q-6 2 0 14z" fill="#33302e" ${S}/>`,
    earsBack: `<path d="M60 32 q-10 8 -6 26 q8 -4 12 -14z" fill="#33302e" ${S}/><path d="M104 32 q10 8 6 26 q-8 -4 -12 -14z" fill="#33302e" ${S}/>`,
    face: `<ellipse cx="72" cy="36" rx="4.5" ry="3" fill="#d18b47"/><ellipse cx="94" cy="36" rx="4.5" ry="3" fill="#d18b47"/>`,
    nose: false,
    top: `<ellipse cx="85" cy="56" rx="5" ry="3.6" fill="#1b1918"/><circle cx="83.5" cy="55" r="1.3" fill="#fff"/><path d="M58 72 q24 10 46 0" fill="none" stroke="#d6334a" stroke-width="5" stroke-linecap="round"/><circle cx="82" cy="78" r="4" fill="#ffcf4a" ${S2}/>`,
  }, st, bl);

  /* ---------- ТАРВАГА (босоо) ---------- */
  const marmot = (st, bl) => wrap(`
    <path d="M36 94 q-14 0 -14 -12" fill="none" stroke="#8a5a30" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="${st ? 47 : 49}" cy="104" rx="9" ry="5" fill="#8a5a30" ${S}/><ellipse cx="${st ? 73 : 71}" cy="104" rx="9" ry="5" fill="#8a5a30" ${S}/>
    <ellipse cx="60" cy="82" rx="27" ry="24" fill="#c99a62" ${S}/>
    <ellipse cx="60" cy="88" rx="16" ry="15" fill="#f6dcb2"/>
    <g transform="translate(0 ${st ? -2 : 0})">
      <circle cx="40" cy="26" r="7" fill="#c99a62" ${S}/><circle cx="40" cy="26" r="3" fill="#ffb3a7"/><circle cx="80" cy="26" r="7" fill="#c99a62" ${S}/><circle cx="80" cy="26" r="3" fill="#ffb3a7"/>
      <ellipse cx="60" cy="42" rx="26" ry="22" fill="#c99a62" ${S}/>
      <ellipse cx="60" cy="52" rx="13" ry="9" fill="#f6dcb2" ${S2}/>
      <ellipse cx="60" cy="47" rx="4" ry="3" fill="${O}"/>
      <rect x="56" y="55" width="8" height="7" rx="2" fill="#fff" ${S2}/><path d="M60 55 v7" stroke="${O}" stroke-width="1.5"/>
      ${eye(49, 38, bl, .85)}${eye(71, 38, bl, .85)}${blush(41, 49)}${blush(79, 49)}
    </g>
    <ellipse cx="${st ? 48 : 50}" cy="${st ? 66 : 70}" rx="6" ry="5" fill="#b07f42" ${S2}/><ellipse cx="${st ? 72 : 70}" cy="${st ? 70 : 70}" rx="6" ry="5" fill="#b07f42" ${S2}/>`);

  /* ---------- БҮРГЭД ---------- */
  const eagle = (st, bl) => wrap(`
    <path d="M50 96 v8 M44 106 h12 M70 96 v8 M64 106 h12" stroke="#e8a21a" stroke-width="5" stroke-linecap="round"/>
    ${st
      ? `<path d="M36 66 q-26 -30 -32 -50 q16 6 22 14 q2 -12 8 -16 q4 14 12 30z" fill="#7a5232" ${S}/><path d="M84 66 q26 -30 32 -50 q-16 6 -22 14 q-2 -12 -8 -16 q-4 14 -12 30z" fill="#7a5232" ${S}/>`
      : `<path d="M36 60 q-30 6 -32 32 q12 -6 18 -6 q-6 8 -4 14 q14 -6 24 -20z" fill="#7a5232" ${S}/><path d="M84 60 q30 6 32 32 q-12 -6 -18 -6 q6 8 4 14 q-14 -6 -24 -20z" fill="#7a5232" ${S}/>`}
    <ellipse cx="60" cy="74" rx="25" ry="24" fill="#8a5c36" ${S}/>
    <path d="M48 70 q12 8 24 0 M48 80 q12 8 24 0" fill="none" stroke="#b0835a" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="60" cy="40" rx="24" ry="22" fill="#d9a85a" ${S}/>
    <path d="M40 30 q20 -14 40 0 q-20 -6 -40 0z" fill="#b8843e"/>
    ${eye(50, 38, bl, .85)}${eye(70, 38, bl, .85)}
    <path d="M54 48 q6 -3 12 0 q0 8 -6 14 q-6 -6 -6 -14z" fill="#ffc531" ${S2}/><path d="M57 56 q3 3 6 0" fill="#4a3a2e"/>
    ${blush(41, 48)}${blush(79, 48)}`);

  /* ---------- ҮНЭГ ---------- */
  const fox = (st, bl) => quad({
    c: '#f08a3a', leg: '#3a2a22', hoof: '#3a2a22', belly: '#fff4e8', mz: '#fff4e8', hr: 25,
    tail: `<path d="M24 76 q-22 -2 -18 -26 q10 -4 18 6 q4 8 6 18z" fill="#f08a3a" ${S}/><path d="M7 52 q4 -6 11 -2 q-4 6 -10 8z" fill="#fff4e8"/>`,
    earsBack: `<path d="M62 36 l-4 -24 l18 12z" fill="#f08a3a" ${S}/><path d="M61 20 l-2 -7 l6 4z" fill="#3a2a22"/><path d="M102 36 l4 -24 l-18 12z" fill="#f08a3a" ${S}/><path d="M103 20 l2 -7 l-6 4z" fill="#3a2a22"/>`,
    face: `<path d="M60 52 q10 -6 22 4 q12 -10 22 -4 q-6 16 -22 18 q-16 -2 -22 -18z" fill="#fff4e8"/>`,
  }, st, bl);

  /* ---------- ДЭЭЛТЭЙ ХҮҮХДҮҮД ---------- */
  function kid(girl, st, bl) {
    const deel = girl ? '#e2456a' : '#2f6fd0', trim = girl ? '#ffcf4a' : '#ffcf4a', sash = girl ? '#ffcf4a' : '#f08a24', skin = '#ffd9b8', hair = '#2b1d16';
    const lx = st ? 3 : 0;
    return wrap(`
      <rect x="${44 - lx}" y="92" width="12" height="15" rx="4" fill="#3a2418" ${S}/><rect x="${64 + lx}" y="92" width="12" height="15" rx="4" fill="#3a2418" ${S}/>
      <path d="M36 98 q0 -26 8 -36 h32 q8 10 8 36z" fill="${deel}" ${S}/>
      <path d="M60 62 q-8 12 -20 14" fill="none" stroke="${trim}" stroke-width="4"/>
      <path d="M38 80 h44" stroke="${sash}" stroke-width="7"/><path d="M76 80 l6 10 l-8 -2z" fill="${sash}" ${S2}/>
      <path d="M36 66 q-10 ${st ? 4 : 10} -6 ${st ? 18 : 22}" fill="none" stroke="${deel}" stroke-width="11" stroke-linecap="round"/><circle cx="30" cy="${st ? 84 : 88}" r="5" fill="${skin}" ${S2}/>
      <path d="M84 66 q10 ${st ? -6 : 10} 6 ${st ? 4 : 22}" fill="none" stroke="${deel}" stroke-width="11" stroke-linecap="round"/><circle cx="90" cy="${st ? 70 : 88}" r="5" fill="${skin}" ${S2}/>
      <rect x="52" y="54" width="16" height="10" fill="${skin}"/>
      ${girl ? `<path d="M34 40 q-6 20 -2 40 q4 4 8 0 q-4 -20 0 -36z M86 40 q6 20 2 40 q-4 4 -8 0 q4 -20 0 -36z" fill="${hair}" ${S2}/><circle cx="36" cy="82" r="3.5" fill="#d6334a"/><circle cx="84" cy="82" r="3.5" fill="#d6334a"/>` : ''}
      <ellipse cx="60" cy="38" rx="27" ry="25" fill="${skin}" ${S}/>
      <path d="M33 36 q2 -24 27 -24 q25 0 27 24 q-10 -10 -27 -10 q-17 0 -27 10z" fill="${hair}" ${S2}/>
      ${girl
        ? `<path d="M36 22 q24 -14 48 0" fill="none" stroke="#ffcf4a" stroke-width="5" stroke-linecap="round"/><circle cx="74" cy="17" r="5" fill="#ff8fa3" ${S2}/><circle cx="74" cy="17" r="1.8" fill="#ffcf4a"/>`
        : `<path d="M34 24 q26 -12 52 0 q-4 -16 -26 -18 q-22 2 -26 18z" fill="#d6334a" ${S}/><path d="M34 24 q26 -6 52 0" fill="none" stroke="#ffcf4a" stroke-width="4"/><circle cx="60" cy="4" r="4" fill="#ffcf4a" ${S2}/><path d="M60 8 v-0" ${S2}/>`}
      ${eye(49, 40, bl, .9)}${eye(71, 40, bl, .9)}${blush(41, 50)}${blush(79, 50)}
      <path d="M55 52 q5 5 10 0" fill="#ff8fa3" ${S2}/>`);
  }

  const mk = (id, mn, en, f, grp) => ({ id, mn, en, grp, costumes: [f(false, false), f(true, false), f(false, true)] });
  window.SPRITES = [
    mk('calf', 'Тугал', 'Calf', calf, 'mal'),
    mk('horse', 'Адуу', 'Horse', horse, 'mal'),
    mk('cow', 'Үхэр', 'Cow', cow, 'mal'),
    mk('sheep', 'Хонь', 'Sheep', sheep, 'mal'),
    mk('goat', 'Ямаа', 'Goat', goat, 'mal'),
    mk('camel', 'Тэмээ', 'Camel', camel, 'mal'),
    mk('dog', 'Банхар', 'Dog', dog, 'an'),
    mk('marmot', 'Тарвага', 'Marmot', marmot, 'an'),
    mk('eagle', 'Бүргэд', 'Eagle', eagle, 'an'),
    mk('fox', 'Үнэг', 'Fox', fox, 'an'),
    mk('boy', 'Тэмүүжин', 'Temuujin', (s, b) => kid(false, s, b), 'kid'),
    mk('girl', 'Сарнай', 'Sarnai', (s, b) => kid(true, s, b), 'kid'),
  ];
  window.SPRITE_GROUPS = { mal: ['Таван хошуу мал', 'Five livestock'], an: ['Бусад амьтад', 'Other animals'], kid: ['Хүүхдүүд', 'Kids'] };

/* ---------- ДЭВСГЭРҮҮД (480×360) ---------- */
  const bg = b => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360">${b}</svg>`;
  const hills = (c1, c2) => `<path d="M0 230 q80 -60 160 -20 q90 -50 170 0 q80 -40 150 -10 V360 H0z" fill="${c1}"/><path d="M0 270 q120 -30 240 0 t240 -10 V360 H0z" fill="${c2}"/>`;
  const ger = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 40 q0 -8 6 -10 l34 -20 l34 20 q6 2 6 10 v34 h-80z" fill="#fffaf0" stroke="#7a5a3a" stroke-width="2"/><path d="M6 30 l34 -20 l34 20" fill="#e8dcc4" stroke="#7a5a3a" stroke-width="2"/><rect x="30" y="46" width="20" height="28" fill="#d6334a" stroke="#7a5a3a" stroke-width="2"/><path d="M0 44 h80" stroke="#2a5ab8" stroke-width="4"/><path d="M36 6 h8" stroke="#7a5a3a" stroke-width="3"/></g>`;
  window.BACKDROPS = [
    { id: 'steppe', mn: 'Тал нутаг', en: 'Steppe', svg: bg(`<rect width="480" height="360" fill="#9fd7ff"/><circle cx="400" cy="70" r="34" fill="#ffd34a"/><g fill="#fff" opacity=".9"><ellipse cx="90" cy="70" rx="40" ry="14"/><ellipse cx="120" cy="60" rx="30" ry="14"/><ellipse cx="270" cy="96" rx="34" ry="11"/></g>${hills('#7cc36b', '#5aa84e')}`) },
    { id: 'ger', mn: 'Гэр хороо', en: 'Ger camp', svg: bg(`<rect width="480" height="360" fill="#bfe6ff"/><circle cx="70" cy="60" r="28" fill="#ffd34a"/>${hills('#8ccf74', '#6bb85c')}${ger(250, 170, 1.3)}${ger(360, 190, .9)}<path d="M40 300 h120" stroke="#c9a46a" stroke-width="5"/>`) },
    { id: 'mountain', mn: 'Уул', en: 'Mountains', svg: bg(`<rect width="480" height="360" fill="#a7d3f5"/><path d="M0 250 L90 110 L170 230 L260 80 L360 230 L430 140 L480 200 V360 H0z" fill="#6f86a8"/><path d="M90 110 l22 34 l-14 -6 l-12 12 l-14 -10z M260 80 l26 40 l-16 -6 l-12 14 l-14 -12z" fill="#fff"/>${hills('#78b866', '#5e9e52')}`) },
    { id: 'night', mn: 'Шөнийн тэнгэр', en: 'Night sky', svg: bg(`<rect width="480" height="360" fill="#16214d"/><circle cx="390" cy="70" r="26" fill="#fff6c8"/><circle cx="402" cy="62" r="22" fill="#16214d"/>${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 97) % 480}" cy="${(i * 53) % 200}" r="${i % 3 ? 1.2 : 2}" fill="#fff"/>`).join('')}${hills('#24405a', '#1b3246')}${ger(200, 210, 1.1).replace('#fffaf0', '#e8e0cc')}<rect x="226" y="262" width="18" height="12" fill="#ffd34a"/>`) },
    { id: 'gobi', mn: 'Говь', en: 'Gobi', svg: bg(`<rect width="480" height="360" fill="#ffe2a8"/><circle cx="240" cy="80" r="40" fill="#ffb347"/><path d="M0 230 q120 -50 240 -10 q120 -40 240 10 V360 H0z" fill="#e8b46a"/><path d="M0 280 q160 -30 300 0 t180 -6 V360 H0z" fill="#d89a4a"/>`) },
    { id: 'blank', mn: 'Цагаан', en: 'White', svg: bg(`<rect width="480" height="360" fill="#fff"/>`) },
  ];
})();
