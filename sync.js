/* =====================================================================
   SYNC — бүх төхөөрөмжийг нэг өгөгдлийн сантай холбох модуль
   Firebase Realtime Database (REST + шууд урсгал), нэргүй нэвтрэлт.
   firebase-config.js хоосон бол сайт өмнөх шигээ зөвхөн тухайн
   компьютер дээр (localStorage) ажиллана.
   ===================================================================== */
(function () {
  const CFG = window.FIREBASE_CONFIG || {};
  const ROOT = window.SYNC_ROOT || 'site';           // сайт бүр өөрийн салбартай
  const PREFIX = window.SYNC_PREFIX || '';           // localStorage-ийн угтвар
  const KEYS = window.SYNC_KEYS || [];               // хуваалцах түлхүүрүүд
  const EMPTY = window.SYNC_EMPTY || {};             // өгөгдөл байхгүй үеийн анхны утга
  const ON = !!(CFG.apiKey && CFG.databaseURL);
  const DB = ON ? CFG.databaseURL.replace(/\/+$/, '') : '';
  const AUTH = (CFG.authHost || 'https://identitytoolkit.googleapis.com').replace(/\/+$/, '');
  const TOKEN = (CFG.tokenHost || 'https://securetoken.googleapis.com').replace(/\/+$/, '');

  const S = window.SYNC = {
    on: ON, online: false, live: {}, last: {}, listeners: [], status: ON ? 'connecting' : 'local',
    pending: {}, ready: false
  };

  /* ----- түлхүүрийг Firebase-д зөвшөөрөгдөх хэлбэрт ----- */
  const enc = k => String(k).replace(/[.#$\[\]\/%]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  const dec = k => String(k).replace(/%([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const lsGet = k => { try { const v = localStorage.getItem(PREFIX + k); return v ? JSON.parse(v) : undefined } catch (e) { return undefined } };
  const lsSet = (k, v) => { try { localStorage.setItem(PREFIX + k, JSON.stringify(v)) } catch (e) {} };

  /* ----- нэвтрэлт (нэргүй) ----- */
  let idToken = null, tokenExp = 0, refreshing = null;
  async function signIn() {
    const rt = lsGet('__rt');
    if (rt) {
      try {
        const r = await fetch(`${TOKEN}/v1/token?key=${CFG.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(rt) });
        if (r.ok) { const j = await r.json(); idToken = j.id_token; tokenExp = Date.now() + (+j.expires_in - 120) * 1000; lsSet('__rt', j.refresh_token); return }
      } catch (e) {}
    }
    const r = await fetch(`${AUTH}/v1/accounts:signUp?key=${CFG.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) });
    if (!r.ok) throw new Error('auth ' + r.status);
    const j = await r.json(); idToken = j.idToken; tokenExp = Date.now() + (+j.expiresIn - 120) * 1000; lsSet('__rt', j.refreshToken);
  }
  async function token() {
    if (idToken && Date.now() < tokenExp) return idToken;
    if (!refreshing) refreshing = signIn().finally(() => refreshing = null);
    await refreshing; return idToken;
  }
  const url = async (path) => `${DB}/${ROOT}/${path}.json?auth=${encodeURIComponent(await token())}`;

  /* ----- төлөв ----- */
  function setStatus(st) {
    if (S.status === st) return; S.status = st; S.online = st === 'online';
    document.documentElement.dataset.sync = st;
    const el = document.getElementById('syncdot');
    if (el) el.dataset.st = st;
    S.listeners.forEach(f => { try { f('__status', st) } catch (e) {} });
  }

  /* ----- орон нутгийн объектыг байрнаас нь шинэчлэх (лавлагаа хадгална) ----- */
  function replaceInPlace(target, src) {
    if (!isObj(target) || !isObj(src)) return src;
    for (const k of Object.keys(target)) if (!(k in src)) delete target[k];
    Object.assign(target, src); return target;
  }
  function applyChild(key, child, json) {
    const live = S.live[key];
    S.last[key] ??= {};
    if (json === null || json === undefined) {
      const had = child in S.last[key] || (isObj(live) && child in live);
      delete S.last[key][child]; if (isObj(live)) delete live[child]; return had;
    }
    if (S.last[key][child] === json) return false;           // өөрийн илгээснийг буцаж авсан
    S.last[key][child] = json;
    let v; try { v = JSON.parse(json) } catch (e) { return false }
    if (child === '_v') { if (Array.isArray(live) && Array.isArray(v)) live.splice(0, live.length, ...v); else S.live[key] = v; return true }
    if (isObj(live)) { if (isObj(live[child]) && isObj(v)) replaceInPlace(live[child], v); else live[child] = v }
    return true;
  }
  function snapshotToLive(key, data) {
    S.last[key] = {};
    if (!data) { const e = EMPTY[key]; return e === undefined ? undefined : JSON.parse(JSON.stringify(e)) }
    if ('_v' in data) { S.last[key]._v = data._v; return JSON.parse(data._v) }
    const o = {};
    for (const [ck, json] of Object.entries(data)) { const c = dec(ck); S.last[key][c] = json; try { o[c] = JSON.parse(json) } catch (e) {} }
    return o;
  }

  /* ----- илгээх: зөвхөн өөрчлөгдсөн хэсгийг ----- */
  let flushTimer = null;
  const synced = {}, base = {}, dirty = {};
  const childJson = v => { const m = {}; if (isObj(v)) for (const [c, x] of Object.entries(v)) m[c] = JSON.stringify(x); else m._v = JSON.stringify(v ?? null); return m };
  S.push = function (key, value) {
    if (!ON || !KEYS.includes(key)) return;
    S.live[key] = value;
    if (!synced[key]) {                                       // офлайнаар эхэлсэн: өөрчилсөн хэсгийг тэмдэглэнэ
      if (S.initing) { base[key] = childJson(value); return }  // эхлэх үеийн анхдагч өгөгдлийг илгээхгүй
      base[key] ??= {}; dirty[key] ??= new Set();
      const now = childJson(value);
      for (const c of new Set([...Object.keys(now), ...Object.keys(base[key])])) if (now[c] !== base[key][c]) dirty[key].add(c);
      return;
    }
    S.last[key] ??= {};
    const patch = {};
    if (!isObj(value)) {
      const j = JSON.stringify(value ?? null);
      if (S.last[key]._v !== j) { patch._v = j; S.last[key]._v = j }
    } else {
      for (const [c, v] of Object.entries(value)) {
        const j = JSON.stringify(v);
        if (S.last[key][c] !== j) { patch[enc(c)] = j; S.last[key][c] = j }
      }
      for (const c of Object.keys(S.last[key])) if (!(c in value) && c !== '_v') { patch[enc(c)] = null; delete S.last[key][c] }
    }
    if (!Object.keys(patch).length) return;
    S.pending[key] = Object.assign(S.pending[key] || {}, patch);
    clearTimeout(flushTimer); flushTimer = setTimeout(flush, 150);
  };
  async function flush() {
    const keys = Object.keys(S.pending);
    for (const key of keys) {
      const body = S.pending[key]; delete S.pending[key];
      try {
        const r = await fetch(await url(key), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!r.ok) throw new Error(r.status);
      } catch (e) {
        S.pending[key] = Object.assign(body, S.pending[key] || {});
        setStatus('offline'); clearTimeout(flushTimer); flushTimer = setTimeout(flush, 4000); return;
      }
    }
    if (S.status !== 'online' && streamsOpen === KEYS.length) setStatus('online');
  }
  window.addEventListener('online', () => { clearTimeout(flushTimer); flushTimer = setTimeout(flush, 300) });

  /* ----- шууд урсгал (EventSource) ----- */
  let streamsOpen = 0;
  function stream(key, onFirst) {
    let first = true, es = null, retry = 1000;
    const open = async () => {
      try { es = new EventSource(await url(key)) } catch (e) { setTimeout(open, retry); return }
      let counted = false;
      const handle = (type, ev) => {
        let m; try { m = JSON.parse(ev.data) } catch (e) { return }
        if (!m) return;
        retry = 1000;
        if (!counted) { counted = true; streamsOpen++; if (streamsOpen >= KEYS.length && !Object.keys(S.pending).length) setStatus('online') }
        const path = m.path || '/';
        let changed = false;
        if (path === '/') {
          if (first) { first = false; onFirst(m.data); return }
          if (type === 'put') {
            const data = m.data || {};
            const live = S.live[key];
            if ('_v' in data) changed = applyChild(key, '_v', data._v);
            else {
              const seen = new Set();
              for (const [ck, json] of Object.entries(data)) { const c = dec(ck); seen.add(c); if (applyChild(key, c, json)) changed = true }
              if (isObj(live)) for (const c of Object.keys(live)) if (!seen.has(c)) { applyChild(key, c, null); changed = true }
            }
          } else for (const [ck, json] of Object.entries(m.data || {})) { if (applyChild(key, dec(ck), json)) changed = true }
        } else {
          const c = dec(path.split('/')[1]);
          if (path.split('/').length === 2 && applyChild(key, c, m.data)) changed = true;
        }
        if (changed) {
          if (S.live[key] !== undefined) lsSet(key, S.live[key]);
          S.listeners.forEach(f => { try { f(key) } catch (e) { console.error(e) } });
        }
      };
      es.addEventListener('put', e => handle('put', e));
      es.addEventListener('patch', e => handle('patch', e));
      es.addEventListener('auth_revoked', () => { es.close(); if (counted) streamsOpen--; idToken = null; setTimeout(open, 200) });
      es.addEventListener('cancel', () => { es.close(); if (counted) streamsOpen--; idToken = null; setTimeout(open, 2000) });
      es.onerror = () => {
        if (es.readyState === 2) { if (counted) streamsOpen--; counted = false; setStatus('offline'); setTimeout(open, retry); retry = Math.min(retry * 2, 15000) }
        else setStatus('connecting');
      };
    };
    open();
  }

  S.onChange = f => S.listeners.push(f);
  S.bind = (key, obj) => {
    if (!KEYS.includes(key)) return;
    S.live[key] = obj;
    if (ON && !synced[key] && !base[key]) base[key] = childJson(obj);
  };

  /* ----- эхлүүлэх: өгөгдлийг аваад дараа нь апп-ыг ажиллуулна ----- */
  S.start = function (app) {
    const run = () => {
      if (S.ready) return; S.ready = true; hideLoader();
      if (ON) for (const k of KEYS) if (!synced[k] && lsGet(k) === undefined && EMPTY[k] !== undefined) lsSet(k, JSON.parse(JSON.stringify(EMPTY[k])));
      S.initing = true; try { app() } finally { S.initing = false }
    };
    if (!ON) { run(); return }
    showLoader();
    let got = 0, connected = false;
    const fallback = setTimeout(() => { setStatus('offline'); showOfflineNote(); run() }, navigator.onLine === false ? 300 : 8000);
    const connect = () => token().then(() => {
      if (connected) return; connected = true;
      KEYS.forEach(key => stream(key, data => {
        const remote = snapshotToLive(key, data);
        if (!S.ready) {
          synced[key] = true;
          if (remote === undefined) { try { localStorage.removeItem(PREFIX + key) } catch (e) {} } else lsSet(key, remote);
          if (++got === KEYS.length) { clearTimeout(fallback); setStatus('online'); run() }
          return;
        }
        // Апп офлайнаар эхэлсэн байсан: алсын өгөгдлийг авч, энд өөрчилсөн хэсгийг хадгална
        const live = S.live[key], d = dirty[key] || new Set();
        synced[key] = true;
        if (isObj(live)) {
          const merged = isObj(remote) ? { ...remote } : {};
          for (const c of d) { if (c in live) merged[c] = live[c]; else delete merged[c] }
          replaceInPlace(live, merged);
          lsSet(key, live); S.push(key, live);
        } else if (remote !== undefined && !d.size) { S.live[key] = remote; lsSet(key, remote) }
        else if (live !== undefined) S.push(key, live);
        S.listeners.forEach(f => { try { f(key) } catch (e) {} });
      }));
    }).catch(() => { setStatus('offline'); setTimeout(connect, 5000) });
    connect();
  };

  /* ----- харагдах хэсэг ----- */
  function showLoader() {
    const d = document.createElement('div'); d.id = 'syncload';
    d.innerHTML = '<div><div class="sl-spin"></div><b>Холбогдож байна…</b><small>Ангийн өгөгдлийг татаж байна</small></div>';
    document.body.appendChild(d);
  }
  function hideLoader() { document.getElementById('syncload')?.remove() }
  function showOfflineNote() {
    const n = document.createElement('div'); n.className = 'syncnote';
    n.textContent = 'Интернэт холболт алга байна. Таны ажил энэ компьютерт түр хадгалагдаж, холболт сэргэмэгц автоматаар илгээгдэнэ.';
    document.body.appendChild(n); setTimeout(() => n.remove(), 9000);
  }
  const css = document.createElement('style');
  css.textContent = `#syncload{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(15,20,50,.92);color:#fff;font:600 18px system-ui,sans-serif;text-align:center}
#syncload>div{display:grid;gap:8px;justify-items:center}#syncload small{opacity:.75;font-weight:400;font-size:14px}
.sl-spin{width:42px;height:42px;border-radius:50%;border:5px solid rgba(255,255,255,.25);border-top-color:#ffd54f;animation:slspin 1s linear infinite}@keyframes slspin{to{transform:rotate(360deg)}}
.syncnote{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9998;background:#fff3cd;color:#5c4400;border:1px solid #e0b100;border-radius:12px;padding:10px 16px;font:500 14px system-ui,sans-serif;max-width:90vw;box-shadow:0 6px 20px rgba(0,0,0,.25)}
#syncdot{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;background:rgba(127,127,127,.18);white-space:nowrap}
#syncdot::before{content:"";width:9px;height:9px;border-radius:50%;background:#9aa0b4}
#syncdot[data-st=online]::before{background:#2ecc71;box-shadow:0 0 0 3px rgba(46,204,113,.25)}#syncdot[data-st=online]::after{content:"Шууд холбогдсон"}
#syncdot[data-st=connecting]::before{background:#f0b21a}#syncdot[data-st=connecting]::after{content:"Холбогдож байна"}
#syncdot[data-st=offline]::before{background:#e74c3c}#syncdot[data-st=offline]::after{content:"Офлайн — дараа илгээнэ"}
#syncdot[data-st=local]::after{content:"Зөвхөн энэ компьютерт"}`;
  document.head.appendChild(css);
})();
