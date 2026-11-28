/* LOLO_TV_SKIN_2026 v2 — calm light TV home (sidebar, LOLO TV header, rounded banner with muted preview,
   "استكشف المحتوى" tiles, soft rounded cards, purple focus). Built on /tv/index.html:
   window.loloTvRows (rows hook), window.loloTvApi (focus helpers), window.lolo_pv (preview player). */
(function () {
  if (window.__loloTvSkin) return; window.__loloTvSkin = 1;
  window.loloPvAll = 1; window.loloPvDelay = 900; window.loloPvMax = 8000; // preview on every show card: 0.9s wait, 8s, muted
  var OK = [13, 32], BACK = [8, 27, 461, 10009, 166];
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clean(n) { return String(n || '').replace(/^[\s\u{1F000}-\u{1FAFF}☀-➿️]+/u, '').replace(/-/g, ' ').trim(); }
  /* the parent's list, matched to the real sections (an entry only shows when a real section matches) */
  var KINDS = [
    { k: 'series', label: 'المسلسلات', tile: 'مسلسلات', ic: '📺', bg: '#c9f2e3', re: /مسلسل|كرتون/ },
    { k: 'movies', label: 'الأفلام', tile: 'أفلام', ic: '🎬', bg: '#cfe8ff', re: /فيلم|أفلام|افلام/ },
    { k: 'stories', label: 'القصص', tile: 'قصص', ic: '📚', bg: '#ffd6e4', re: /قص|حكاي|اقرأ/ },
    { k: 'learn', label: 'تعليمي', tile: 'تعليمي', ic: '🎓', bg: '#ffeab0', re: /تعل|تعليم|منهج|KG/i },
    { k: 'games', label: 'ألعاب', tile: 'ألعاب', ic: '🎮', bg: '#e4d7ff', re: /ألعاب|العاب|نلعب|🎮/ }
  ];
  var EXTRA_BG = ['#d9f99d', '#fde2c4', '#d4f1f9', '#f5d0fe', '#fef9c3', '#e0e7ff'];
  function extraIcon(n) { return /دين|قرآن|قران|إسلام/.test(n) ? '🕌' : /أصدقاء|اصدقاء/.test(n) ? '🧸' : /أنشطة|انشطة|منزل/.test(n) ? '🏠' : /صوت/.test(n) ? '🎧' : /قص/.test(n) ? '📖' : '⭐'; }

  /* ---------- styles ---------- */
  var INK = '#1e1b4b', PUR = '#7c3aed';
  var css = '' +
    '#home{background:radial-gradient(ellipse at 85% -10%,#e9e3ff 0%,rgba(233,227,255,0) 55%),radial-gradient(ellipse at 0% 100%,#dfeeff 0%,rgba(223,238,255,0) 50%),#f7f6fd;color:' + INK + '}' +
    /* top bar */
    '#home .top{height:6vw;padding:0 2.6vw 0 2vw;background:none;gap:1vw}' +
    '#home .top img{width:3.6vw;height:3.6vw;border-radius:50%;background:#efe9ff;box-shadow:0 .3vw .8vw rgba(124,58,237,.18);margin:0}' +
    '#home .top b{font-size:1.9vw;color:' + INK + ';flex:none}' +
    '#home .top .btn{font:700 1.25vw "Baloo Bhaijaan 2",Tahoma,sans-serif;border-radius:5vw;padding:.55vw 1.7vw;margin:0;background:#fff;color:' + INK + ';border:.15vw solid #e7e3f8;box-shadow:0 .3vw .9vw rgba(30,27,75,.07)}' +
    '#home .top .btn.focus{background:' + PUR + ';color:#fff;border-color:' + PUR + ';box-shadow:0 0 0 .3vw rgba(124,58,237,.25)}' +
    '#lsSp{flex:1}' +
    '#lsLogo{display:flex;align-items:center;gap:.5vw;direction:ltr}' +
    '#lsLogo .w{font:900 2.5vw/1 "Baloo Bhaijaan 2",Tahoma,sans-serif;color:#ffc61a;-webkit-text-stroke:.12vw #3b2a8f;text-shadow:0 .2vw 0 #3b2a8f}' +
    '#lsLogo .tv{font:900 1.5vw/1 "Baloo Bhaijaan 2",Tahoma,sans-serif;color:#fff;background:linear-gradient(135deg,#ec4899,' + PUR + ');padding:.25vw .7vw;border-radius:.6vw;border:.18vw solid #3b2a8f;transform:rotate(-6deg)}' +
    /* banner */
    '#home .hero{top:6.6vw;left:17vw;right:2.6vw;height:19vw;border-radius:1.8vw;background:#e9e3ff;box-shadow:0 .8vw 2.4vw rgba(30,27,75,.12)}' +
    '#home .hero .bg{background-color:#e9e3ff}' +
    '#home .hero .shade{background:linear-gradient(90deg,rgba(247,246,253,0) 28%,rgba(247,246,253,.82) 56%,rgba(247,246,253,.97) 78%)}' +
    '#home .hero .info{top:2.2vw;right:2.6vw;width:34vw}' +
    '#home .hero .tag{background:#ef4444;color:#fff;border-radius:5vw;padding:.15vw 1.1vw;font-size:1.15vw}' +
    '#home .hero h2{font-size:3.2vw;margin:.5vw 0 .2vw;color:' + INK + ';text-shadow:none}' +
    '#home .hero p{font-size:1.4vw;color:#4b4775}' +
    '#lsWatch{display:inline-flex;align-items:center;gap:.7vw;margin-top:1vw;font:800 1.45vw "Baloo Bhaijaan 2",Tahoma,sans-serif;color:#fff;background:' + PUR + ';padding:.45vw 2vw;border-radius:5vw;box-shadow:0 .5vw 1.2vw rgba(124,58,237,.3)}' +
    '#lsWatch small{font-size:1vw;opacity:.8;font-weight:600}' +
    /* rows */
    '#home .rows{top:26.8vw;left:16vw}' +
    '#home .row h3{font-size:1.75vw;color:' + INK + ';padding:0 2.6vw .2vw}' +
    '#home .row.toprow h3{color:' + PUR + '}' +
    '#home .track{padding:.9vw 2.6vw 1.2vw}' +
    '#home .card:not(.top){border-radius:1.2vw;border:.25vw solid #fff;background:#ece8fb;box-shadow:0 .5vw 1.3vw rgba(30,27,75,.12)}' +
    '#home .card:not(.top).focus{transform:scale(1.08);border-color:' + PUR + ';box-shadow:0 0 0 .35vw rgba(124,58,237,.25),0 1vw 2.2vw rgba(30,27,75,.22)}' +
    '#home .card .nm{font-size:1.3vw;padding:2vw .9vw .6vw}' +
    '#home .card .cnt{background:#fff;color:' + PUR + ';border-radius:5vw}' +
    '#home .card.top .pic{border-radius:1.2vw;border:.25vw solid #fff;background:#ece8fb;box-shadow:0 .5vw 1.3vw rgba(30,27,75,.12)}' +
    '#home .card.top.focus .pic{border-color:' + PUR + ';box-shadow:0 0 0 .35vw rgba(124,58,237,.25),0 1vw 2.2vw rgba(30,27,75,.22)}' +
    '#home .card.top .rk{font-size:9vw;line-height:1;font-weight:900;color:#ede9fe;-webkit-text-stroke:.25vw ' + PUR + ';text-shadow:none}' +
    '#home .skel{background:#ece8fb;border-radius:1.2vw}' +
    '#home .empty{color:#4b4775}' +
    /* explore tiles */
    '#home .row.lsCats h3:before{content:"🧩 "}' +
    '#home .row.lsCats .card{width:13.5vw;height:8.6vw;margin-left:1.2vw;border-radius:1.4vw}' +
    '#home .row.lsCats .card .ph,#home .row.lsCats .card img,#home .row.lsCats .card .cnt,#home .row.lsCats .card .lock,#home .row.lsCats .card .nm{display:none}' +
    '#home .row.lsCats .card .ti{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4vw;font:800 1.5vw "Baloo Bhaijaan 2",Tahoma,sans-serif;color:' + INK + ';white-space:normal;text-align:center;padding:0 .6vw}' +
    '#home .row.lsCats .card .ti i{font-style:normal;font-size:3vw;line-height:1}' +
    /* sidebar */
    '#lsSide{position:fixed;left:1.4vw;top:7vw;bottom:1.6vw;width:13.6vw;z-index:6;display:none;flex-direction:column;gap:.6vw;direction:rtl;font-family:"Baloo Bhaijaan 2",Tahoma,sans-serif}' +
    'body.lsHome #lsSide{display:flex}' +
    '#lsSide .si{display:flex;align-items:center;gap:.9vw;padding:.75vw 1.2vw;border-radius:1.2vw;background:#fff;box-shadow:0 .3vw .9vw rgba(30,27,75,.07);font-weight:800;font-size:1.35vw;color:' + INK + ';white-space:nowrap;overflow:hidden;cursor:pointer;border:.2vw solid transparent;transition:transform .15s}' +
    '#lsSide .si i{font-style:normal;font-size:1.7vw;width:2.2vw;text-align:center}' +
    '#lsSide .si.sel{background:' + PUR + ';color:#fff;box-shadow:0 .5vw 1.2vw rgba(124,58,237,.3)}' +
    '#lsSide .si.fx{border-color:' + PUR + ';transform:scale(1.05);box-shadow:0 0 0 .3vw rgba(124,58,237,.25)}' +
    '#lsSide .si.sel.fx{border-color:#c4b5fd}' +
    '#lsSide .hint{margin-top:auto;font-size:.95vw;color:#6b6795;text-align:center}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  /* ---------- rows hook: explore tiles ---------- */
  var prevHook = window.loloTvRows, MAP = [];
  window.loloTvRows = function (rows) {
    if (prevHook) { try { rows = prevHook(rows) || rows; } catch (e) {} }
    rows = (rows || []).filter(function (r) { return !r.lsCats; });
    var real = rows.filter(function (r) { return !r.top && r.shows && r.shows.length; });
    var used = {}; MAP = [];
    KINDS.forEach(function (K) {
      var hit = null;
      if (K.k === 'games') real.forEach(function (r) { if (!hit && r.id === 'games') hit = r; });
      real.forEach(function (r) { if (!hit && !used[r.id] && K.re.test(clean(r.name))) hit = r; });
      if (hit) { used[hit.id] = 1; MAP.push({ id: hit.id, label: K.label, tile: K.tile, ic: K.ic, bg: K.bg }); }
    });
    var j = 0; real.forEach(function (r) { if (!used[r.id]) { var n = clean(r.name); MAP.push({ id: r.id, label: n, tile: n, ic: extraIcon(n), bg: EXTRA_BG[j++ % EXTRA_BG.length], extra: 1 }); } });
    if (window.loloTvApi && MAP.length > 1) {
      var tiles = { id: 'ls-cats', name: 'استكشف المحتوى', lsCats: true, shows: MAP.map(function (m) { return { sub: { name_ar: m.tile }, items: [], lsTarget: m.id }; }) };
      var at = rows.length && rows[0].top ? 1 : 0;
      rows = rows.slice(0, at).concat([tiles], rows.slice(at));
    }
    setTimeout(decorate, 0); setTimeout(decorate, 300);
    return rows;
  };
  function rowsNow() { try { return (window.loloTvApi && window.loloTvApi.rows()) || []; } catch (e) { return []; } }
  function rowIndex(id) { var R = rowsNow(); for (var i = 0; i < R.length; i++) if (R[i].id === id) return i; return -1; }
  function decorate() {
    var R = rowsNow(), ci = -1; for (var i = 0; i < R.length; i++) if (R[i].lsCats) ci = i;
    if (ci > -1) {
      var row = document.querySelector('#rows .row[data-r="' + ci + '"]');
      if (row && !row.classList.contains('lsCats')) {
        row.classList.add('lsCats');
        [].forEach.call(row.querySelectorAll('.card'), function (el, c) {
          var m = MAP[c]; if (!m) return;
          el.style.background = m.bg;
          var t = document.createElement('div'); t.className = 'ti'; t.innerHTML = '<i>' + m.ic + '</i><span>' + esc(m.tile) + '</span>'; el.appendChild(t);
        });
      }
    }
    topBar(); addWatch(); buildSide();
  }
  function curCard() { try { return window.loloTvApi.cur(); } catch (e) { return null; } }
  function jumpTo(id) { var i = rowIndex(id); if (i < 0 || !window.loloTvApi) return false; try { window.loloTvApi.focus(window.loloTvApi.cardAt(i, 0)); } catch (e) { return false; } return true; }
  function tileTarget(el) {
    if (!el || !el.classList || !el.classList.contains('card')) return null;
    var R = rowsNow(), row = R[+el.getAttribute('data-r')]; if (!row || !row.lsCats) return null;
    var s = row.shows[+el.getAttribute('data-c')]; return s && s.lsTarget;
  }

  /* ---------- top bar + banner button ---------- */
  function topBar() {
    var top = document.querySelector('#home .top'); if (!top) return;
    if (!$('lsSp')) { var sp = document.createElement('div'); sp.id = 'lsSp'; top.appendChild(sp); }
    if (!$('lsLogo')) { var d = document.createElement('div'); d.id = 'lsLogo'; d.innerHTML = '<span class="w">LOLO</span><span class="tv">TV</span>'; top.appendChild(d); }
    // order (RTL): avatar + hello | account | kid sections | space | logo
    var sp2 = $('lsSp'), lg = $('lsLogo'), sec = $('lsBtn');
    if (top.lastChild !== lg || (sec && sec.nextSibling !== lg)) { top.appendChild(sp2); if (sec) top.appendChild(sec); top.appendChild(lg); }
  }
  function addWatch() {
    var info = document.querySelector('#home .hero .info'); if (!info || $('lsWatch')) return;
    var b = document.createElement('div'); b.id = 'lsWatch'; b.innerHTML = '▶ شاهد الآن <small>(OK)</small>'; info.appendChild(b);
  }

  /* ---------- sidebar ---------- */
  var side, sIt = [], sF = 0, sideOn = false;
  function buildSide() {
    if (!side) { side = document.createElement('div'); side.id = 'lsSide'; document.body.appendChild(side); }
    var list = [{ id: '#home', label: 'الرئيسية', ic: '🏠' }].concat(MAP.filter(function (m) { return !m.extra; }).map(function (m) { return { id: m.id, label: m.label, ic: m.ic }; }));
    if (window.loloTvSecOpen) list.push({ id: '#settings', label: 'الإعدادات', ic: '⚙️' });
    var html = list.map(function (x, i) { return '<div class="si' + (i === 0 ? ' sel' : '') + '" data-id="' + esc(x.id) + '"><i>' + x.ic + '</i>' + esc(x.label) + '</div>'; }).join('') + '<div class="hint">زرار الرجوع ⟵ القائمة</div>';
    if (side.__h === html) return; side.__h = html; side.innerHTML = html;
    sIt = [].slice.call(side.querySelectorAll('.si'));
    sIt.forEach(function (el, i) { el.onclick = function () { sideGo(i); }; });
  }
  function syncHome() { var h = $('home'); document.body.classList.toggle('lsHome', !!(h && h.classList.contains('on'))); }
  setInterval(syncHome, 300);
  function sideSet(i) { sIt.forEach(function (el) { el.classList.remove('fx'); }); sF = Math.max(0, Math.min(sIt.length - 1, i)); if (sIt[sF]) sIt[sF].classList.add('fx'); }
  function sideOpen() { if (!sIt.length) return; sideOn = true; if (window.lolo_pv) window.lolo_pv(''); var c = curCard(); if (c) c.classList.remove('focus'); sideSet(sF); }
  function sideClose() { sideOn = false; sIt.forEach(function (el) { el.classList.remove('fx'); }); var c = curCard(); if (c) c.classList.add('focus'); }
  function mark(i) { sIt.forEach(function (el) { el.classList.remove('sel'); }); if (sIt[i]) sIt[i].classList.add('sel'); }
  function sideGo(i) {
    var id = sIt[i] && sIt[i].getAttribute('data-id');
    sideOn = false; sIt.forEach(function (el) { el.classList.remove('fx'); });
    if (id === '#settings') { var c0 = curCard(); if (c0) c0.classList.add('focus'); if (window.loloTvSecOpen) window.loloTvSecOpen(); return; }
    mark(i);
    if (id === '#home') { if (rowsNow().length && window.loloTvApi) window.loloTvApi.focus(window.loloTvApi.cardAt(0, 0)); return; }
    if (!jumpTo(id)) { var c = curCard(); if (c) c.classList.add('focus'); }
  }
  function markFor(card) { // keep the sidebar highlight on the section being browsed
    if (!card || !sIt.length) return; var R = rowsNow(), row = R[+card.getAttribute('data-r')]; if (!row) return;
    var hit = 0; sIt.forEach(function (el, i) { if (el.getAttribute('data-id') === row.id) hit = i; }); mark(hit);
  }

  /* ---------- remote + mouse ---------- */
  function blocked() { var o = $('lsOv'), d = $('dlg'), h = $('home'); return (o && o.classList.contains('on')) || (d && d.classList.contains('on')) || !(h && h.classList.contains('on')); }
  window.addEventListener('keydown', function (e) {
    if (blocked()) { if (sideOn) sideClose(); return; }
    var k = e.keyCode;
    if (sideOn) {
      if (BACK.indexOf(k) > -1) { sideClose(); return; } // second back: the page's own back
      e.preventDefault(); e.stopImmediatePropagation();
      if (k === 38) sideSet(sF - 1); else if (k === 40) sideSet(sF + 1);
      else if (OK.indexOf(k) > -1) sideGo(sF);
      else if (k === 39) sideClose();
      return;
    }
    var c = curCard();
    if (OK.indexOf(k) > -1) { var t = tileTarget(c); if (t) { e.preventDefault(); e.stopImmediatePropagation(); if (window.lolo_pv) window.lolo_pv(''); jumpTo(t); } return; }
    if (BACK.indexOf(k) > -1 && c && c.classList.contains('card') && sIt.length) { e.preventDefault(); e.stopImmediatePropagation(); sideOpen(); return; }
    if (k === 37 && c && c.classList.contains('card')) { var R = rowsNow(), r = +c.getAttribute('data-r'), n = R[r] ? R[r].shows.length : 0; if (+c.getAttribute('data-c') >= n - 1 && sIt.length) { e.preventDefault(); e.stopImmediatePropagation(); sideOpen(); return; } }
    setTimeout(function () { var cc = curCard(); markFor(cc); var t2 = tileTarget(cc); if (t2 && window.lolo_pv) window.lolo_pv(''); }, 0);
  }, true);
  window.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('#rows .card') : null; var t = tileTarget(el);
    if (t) { e.preventDefault(); e.stopImmediatePropagation(); jumpTo(t); }
  }, true);
  document.addEventListener('visibilitychange', function () { if (document.hidden && window.lolo_pv) window.lolo_pv(''); });
})();
