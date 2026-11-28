/* LOLO_TV_SKIN_2026 — new TV home look (sidebar, LOLO TV logo, rounded hero, gold top-10, category tiles).
   Works on top of /tv/index.html: uses window.loloTvRows (rows hook) and window.loloTvApi (focus helpers). */
(function () {
  if (window.__loloTvSkin) return; window.__loloTvSkin = 1;
  var OK = [13, 32], BACK = [8, 27, 461, 10009, 166];
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var ICONS = [[/مسلسل/, '📺'], [/قص|حكاي|حكاو/, '📖'], [/فيلم|أفلام|افلام/, '🎬'], [/قرآن|قران|دين|إسلام|اسلام|أذكار/, '🕌'], [/أغان|اغان|أناشيد|اناشيد|غنا/, '🎵'], [/علوم|تجارب/, '🧪'], [/رحل|اكتشاف/, '🌍'], [/مهارات|حياة/, '💡'], [/رسم|تلوين|فن/, '🎨'], [/ألعاب|العاب|🎮/, '🎮'], [/إنجليز|انجليز|English/i, '🔤'], [/عرب|حروف/, '✏️'], [/رياض|حساب|أرقام/, '🔢'], [/تعل|تعليم|منهج|KG/i, '🎓'], [/أفضل|🏆/, '🏆']];
  var COLORS = ['#7c3aed,#5b21b6', '#f59e0b,#d97706', '#2563eb,#1e40af', '#ef4444,#b91c1c', '#8b5cf6,#6d28d9', '#0ea5e9,#0369a1', '#d946ef,#a21caf', '#10b981,#047857'];
  function clean(n) { return String(n || '').replace(/^[\s\u{1F000}-\u{1FAFF}☀-➿️]+/u, '').trim(); }
  function icon(n) { for (var i = 0; i < ICONS.length; i++) if (ICONS[i][0].test(n)) return ICONS[i][1]; return '⭐'; }

  /* ---------- styles ---------- */
  var css = '' +
    'body{background:radial-gradient(ellipse at 70% 0%,#3b1d8f 0%,#22126b 35%,#140a45 70%,#0c0630 100%) fixed}' +
    '#home{background:transparent}' +
    '#home .top{height:5.2vw;padding:0 2.5vw 0 2vw;background:none}' +
    '#home .top b{font-size:1.9vw}' +
    '#home .top .btn{border-radius:5vw;padding:.5vw 1.6vw;background:rgba(255,255,255,.1);border:.15vw solid rgba(255,255,255,.14);color:#fff}' +
    '#home .top .btn.focus{background:#ffd23f;color:#2b1a5e;border-color:#ffd23f;transform:scale(1.06)}' +
    '#lsLogo{display:flex;align-items:center;gap:.6vw;margin-right:auto;direction:ltr}' +
    '#lsLogo img{width:3.4vw!important;height:3.4vw!important;margin:0!important}' +
    '#lsLogo .w{font:900 2.3vw/1 "Baloo Bhaijaan 2",Tahoma,sans-serif;color:#ffd23f;text-shadow:0 .25vw 0 #c2410c,0 .5vw 1vw rgba(0,0,0,.4);letter-spacing:.05vw}' +
    '#lsLogo .tv{font:900 1.5vw/1 "Baloo Bhaijaan 2",Tahoma,sans-serif;color:#fff;background:linear-gradient(135deg,#ec4899,#8b5cf6);padding:.25vw .7vw;border-radius:.6vw;border:.18vw solid #fff;transform:rotate(-6deg)}' +
    /* hero as a rounded banner */
    '#home .hero{top:5.6vw;left:15.5vw;right:2.5vw;height:20.5vw;border-radius:1.6vw;box-shadow:0 1.2vw 3vw rgba(0,0,0,.45);border:.15vw solid rgba(255,255,255,.08)}' +
    '#home .hero .shade{background:linear-gradient(90deg,rgba(20,10,69,0) 25%,rgba(20,10,69,.78) 55%,rgba(20,10,69,.95) 100%)}' +
    '#home .hero .info{top:2.4vw;right:2.6vw;width:36vw}' +
    '#home .hero .tag{background:linear-gradient(135deg,#ef4444,#be123c);color:#fff;border-radius:.6vw;padding:.2vw 1vw;font-size:1.05vw}' +
    '#home .hero h2{font-size:3.3vw;margin:.6vw 0 .3vw;color:#fff;text-shadow:0 .3vw 0 rgba(0,0,0,.25)}' +
    '#home .hero p{font-size:1.35vw}' +
    '#lsWatch{display:inline-flex;align-items:center;gap:.6vw;margin-top:1.1vw;font:800 1.45vw "Baloo Bhaijaan 2",Tahoma,sans-serif;color:#2b1a5e;background:#ffd23f;padding:.45vw 1.9vw;border-radius:5vw;box-shadow:0 .4vw 0 #c99a00}' +
    /* rows */
    '#home .rows{top:27vw;left:14.5vw}' +
    '#home .row h3{font-size:1.6vw;padding:0 2.5vw .2vw}' +
    '#home .track{padding:.8vw 2.5vw 1vw}' +
    '#home .card:not(.top){border-radius:1vw;border-width:.22vw;box-shadow:0 .5vw 1.2vw rgba(0,0,0,.35)}' +
    '#home .card.focus:not(.top){border-color:#ffd23f;box-shadow:0 0 0 .3vw rgba(255,210,63,.35),0 1vw 2.5vw rgba(0,0,0,.6)}' +
    '#home .card.top .pic{border-radius:1vw}' +
    '#home .card.top .rk{font-size:9vw;line-height:1;font-weight:900;color:#ffc928;-webkit-text-stroke:.12vw #b45309;text-shadow:0 .35vw 0 #b45309,0 .6vw 1.2vw rgba(0,0,0,.5)}' +
    '#home .card.top.focus .pic{border-color:#ffd23f;box-shadow:0 0 0 .3vw rgba(255,210,63,.35),0 1vw 2.5vw rgba(0,0,0,.6)}' +
    '#home .row.toprow h3{color:#ffd23f}' +
    /* category tiles */
    '#home .row.lsCats h3{display:none}' +
    '#home .row.lsCats .card{width:11.5vw;height:7.4vw;margin-left:1vw;border:.22vw solid rgba(255,255,255,.18)}' +
    '#home .row.lsCats .card .ph,#home .row.lsCats .card img,#home .row.lsCats .card .cnt,#home .row.lsCats .card .lock,#home .row.lsCats .card .nm{display:none}' +
    '#home .row.lsCats .card .ti{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.3vw;font:800 1.3vw "Baloo Bhaijaan 2",Tahoma,sans-serif;color:#fff;text-shadow:0 .15vw .3vw rgba(0,0,0,.35);white-space:normal;text-align:center;padding:0 .5vw}' +
    '#home .row.lsCats .card .ti i{font-style:normal;font-size:2.6vw;line-height:1}' +
    '#home .row.lsCats .card.focus{transform:scale(1.1);border-color:#ffd23f}' +
    /* sidebar */
    '#lsSide{position:fixed;left:1vw;top:6vw;bottom:2vw;width:12.5vw;z-index:6;display:none;flex-direction:column;gap:.35vw;padding:1vw .7vw;border-radius:1.4vw;background:rgba(17,9,58,.72);border:.12vw solid rgba(255,255,255,.08);direction:rtl;overflow:hidden}' +
    '#home.on~#lsSide,body.lsHome #lsSide{display:flex}' +
    '#lsSide .mas{width:8vw;align-self:center;margin:-.5vw 0 .6vw;filter:drop-shadow(0 .6vw 1vw rgba(0,0,0,.4))}' +
    '#lsSide .si{display:flex;align-items:center;gap:.7vw;padding:.55vw .9vw;border-radius:5vw;font:700 1.15vw "Baloo Bhaijaan 2",Tahoma,sans-serif;color:#e9e4ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;border:.15vw solid transparent}' +
    '#lsSide .si i{font-style:normal;font-size:1.4vw;width:1.8vw;text-align:center}' +
    '#lsSide .si.sel{background:rgba(255,210,63,.16);color:#ffd23f}' +
    '#lsSide .si.fx{background:#ffd23f;color:#2b1a5e;transform:scale(1.05)}' +
    '#lsSide .hint{margin-top:auto;font-size:.85vw;opacity:.55;text-align:center;line-height:1.4}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  /* ---------- rows hook: add the category tiles row ---------- */
  var prevHook = window.loloTvRows;
  var CATS = [];
  window.loloTvRows = function (rows) {
    if (prevHook) { try { rows = prevHook(rows) || rows; } catch (e) {} }
    rows = (rows || []).filter(function (r) { return !r.lsCats; });
    CATS = rows.filter(function (r) { return !r.top && r.shows && r.shows.length; }).map(function (r) { return { id: r.id, name: clean(r.name || (r.shows[0] && r.shows[0].catName)) }; });
    if (window.loloTvApi && CATS.length > 2) {
      var tiles = { id: 'ls-cats', name: 'الأقسام', lsCats: true, shows: CATS.map(function (c) { return { sub: { name_ar: c.name }, items: [], lsTarget: c.id }; }) };
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
          var s = R[ci].shows[c]; if (!s) return; var n = s.sub.name_ar;
          el.style.background = 'linear-gradient(135deg,' + COLORS[c % COLORS.length] + ')';
          var t = document.createElement('div'); t.className = 'ti'; t.innerHTML = '<i>' + icon(n) + '</i><span>' + esc(n) + '</span>'; el.appendChild(t);
        });
      }
    }
    buildSide(); addLogo(); addWatch();
  }
  function curCard() { try { return window.loloTvApi.cur(); } catch (e) { return null; } }
  function jumpTo(id) {
    var i = rowIndex(id); if (i < 0 || !window.loloTvApi) return false;
    try { window.loloTvApi.focus(window.loloTvApi.cardAt(i, 0)); } catch (e) { return false; }
    return true;
  }
  function tileTarget(el) {
    if (!el || !el.classList || !el.classList.contains('card')) return null;
    var R = rowsNow(), r = +el.getAttribute('data-r'), c = +el.getAttribute('data-c');
    var row = R[r]; if (!row || !row.lsCats) return null; return row.shows[c] && row.shows[c].lsTarget;
  }

  /* ---------- header logo + hero button ---------- */
  function addLogo() {
    var top = document.querySelector('#home .top'); if (!top || $('lsLogo')) return;
    var d = document.createElement('div'); d.id = 'lsLogo'; d.innerHTML = '<img src="/site/lolo-sm.webp" alt=""><span class="w">LOLO</span><span class="tv">TV</span>';
    top.appendChild(d);
  }
  function addWatch() {
    var info = document.querySelector('#home .hero .info'); if (!info || $('lsWatch')) return;
    var b = document.createElement('div'); b.id = 'lsWatch'; b.innerHTML = 'شاهد الآن <span>▶</span>'; info.appendChild(b);
  }

  /* ---------- sidebar ---------- */
  var side, sIt = [], sF = 0, sideOn = false;
  function buildSide() {
    if (!side) { side = document.createElement('div'); side.id = 'lsSide'; document.body.appendChild(side); }
    var list = [{ id: '', name: 'الرئيسية', ic: '🏠' }].concat(CATS.slice(0, 7).map(function (c) { return { id: c.id, name: c.name, ic: icon(c.name) }; }));
    side.innerHTML = '<img class="mas" src="/site/lolo.webp" alt="">' + list.map(function (x, i) { return '<div class="si' + (i === 0 ? ' sel' : '') + '" data-id="' + esc(x.id) + '"><i>' + x.ic + '</i>' + esc(x.name) + '</div>'; }).join('') + '<div class="hint">زرار الرجوع يفتح القائمة</div>';
    sIt = [].slice.call(side.querySelectorAll('.si'));
    sIt.forEach(function (el, i) { el.onclick = function () { sideGo(i); }; });
    syncHome();
  }
  function syncHome() { var h = $('home'); document.body.classList.toggle('lsHome', !!(h && h.classList.contains('on'))); }
  setInterval(syncHome, 500);
  function sideSet(i) { sIt.forEach(function (el) { el.classList.remove('fx'); }); sF = Math.max(0, Math.min(sIt.length - 1, i)); if (sIt[sF]) sIt[sF].classList.add('fx'); }
  function sideOpen() { if (!sIt.length) return; sideOn = true; var c = curCard(); if (c) c.classList.remove('focus'); sideSet(sF); }
  function sideClose() { sideOn = false; sIt.forEach(function (el) { el.classList.remove('fx'); }); var c = curCard(); if (c) c.classList.add('focus'); }
  function sideGo(i) {
    var id = sIt[i] && sIt[i].getAttribute('data-id');
    sIt.forEach(function (el) { el.classList.remove('sel'); }); if (sIt[i]) sIt[i].classList.add('sel');
    sideOn = false; sIt.forEach(function (el) { el.classList.remove('fx'); });
    if (!id) { var R = rowsNow(); if (R.length && window.loloTvApi) window.loloTvApi.focus(window.loloTvApi.cardAt(0, 0)); return; }
    if (!jumpTo(id)) { var c = curCard(); if (c) c.classList.add('focus'); }
  }

  /* ---------- remote keys ---------- */
  function blocked() { var o = $('lsOv'), d = $('dlg'), h = $('home'); return (o && o.classList.contains('on')) || (d && d.classList.contains('on')) || !(h && h.classList.contains('on')); }
  window.addEventListener('keydown', function (e) {
    if (blocked()) { if (sideOn) sideClose(); return; }
    var k = e.keyCode;
    if (sideOn) {
      if (BACK.indexOf(k) > -1) { sideClose(); return; } // second back: the page's own back (exit etc.)
      e.preventDefault(); e.stopImmediatePropagation();
      if (k === 38) sideSet(sF - 1); else if (k === 40) sideSet(sF + 1);
      else if (OK.indexOf(k) > -1) sideGo(sF);
      else if (k === 39 || BACK.indexOf(k) > -1) sideClose();
      return;
    }
    var c = curCard();
    if (OK.indexOf(k) > -1) { var t = tileTarget(c); if (t) { e.preventDefault(); e.stopImmediatePropagation(); jumpTo(t); } return; }
    if (BACK.indexOf(k) > -1 && c && c.classList.contains('card') && sIt.length) { e.preventDefault(); e.stopImmediatePropagation(); sideOpen(); return; }
    if (k === 37 && c && c.classList.contains('card')) { var R = rowsNow(), r = +c.getAttribute('data-r'), n = R[r] ? R[r].shows.length : 0; if (+c.getAttribute('data-c') >= n - 1 && sIt.length) { e.preventDefault(); e.stopImmediatePropagation(); sideOpen(); } }
  }, true);
  window.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('#rows .card') : null; var t = tileTarget(el);
    if (t) { e.preventDefault(); e.stopImmediatePropagation(); jumpTo(t); }
  }, true);
})();
