/* LOLO_TV_SECTIONS_2026 — "أقسام طفلي": the parent picks which home rows the child sees on this TV.
   - Right after an account is linked on a TV with no choice saved yet, the chooser opens once (Skip keeps everything).
   - Later, the "أقسام طفلي" button next to the account button opens it again, behind a simple grown-up question.
   - The choice is saved on this TV per account. index.html calls window.loloTvRows(rows) before drawing the rows. */
(function () {
  if (window.loloTvRows) return;
  var OK = [13, 32], BACK = [8, 27, 461, 10009, 166];
  function $(id) { return document.getElementById(id); }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function tok() { var t = ls('lolo_tv_token'); if (!t) { var m = document.cookie.match(/(?:^|; )lolo_tv_token=([^;]+)/); t = m ? decodeURIComponent(m[1]) : ''; } return t || ''; }
  function uid() { var t = tok(); if (!t) return ''; try { var p = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); var j = JSON.parse(decodeURIComponent(escape(atob(p)))); return String(j._id || j.id || j.user || j.sub || 'acct'); } catch (e) { return 'acct'; } }
  function key() { return 'lolo_tv_sec_' + uid(); }
  function load() { try { return JSON.parse(ls(key()) || 'null'); } catch (e) { return null; } }
  function save(p) { ls(key(), JSON.stringify(p)); }
  function rk(r) { if (!r) return ''; if (r.top || /^top-/.test(String(r.id || ''))) return 'top'; return String(r.id || r.name || ((r.shows && r.shows[0] && r.shows[0].cat) || '')); }
  function rn(r) { if (rk(r) === 'top') return '🏆 الأكثر مشاهدة'; var n = r.name || (r.shows && r.shows[0] && r.shows[0].catName) || 'قسم'; return String(n); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var ALL = [], askedOnce = false;
  window.loloTvRows = function (rows) {
    var seen = {}; ALL = [];
    (rows || []).forEach(function (r) { var k = rk(r); if (k && !seen[k]) { seen[k] = 1; ALL.push({ k: k, n: rn(r) }); } });
    addBtn();
    var p = tok() ? load() : null;
    if (tok() && !p && !askedOnce) { askedOnce = true; setTimeout(function () { openChooser(true); }, 700); }
    if (!p || !p.hidden || !p.hidden.length) return rows;
    var h = {}; p.hidden.forEach(function (k) { h[k] = 1; });
    var out = rows.filter(function (r) { return !h[rk(r)]; });
    return out.length ? out : rows;
  };

  /* ---------- styles ---------- */
  var css = '' +
    '#lsBtn{margin-inline-start:1vw}' +
    '#lsOv{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 30%,rgba(124,58,237,.55),rgba(10,10,40,.94) 70%);font-family:"Baloo Bhaijaan 2",Tahoma,sans-serif;direction:rtl;color:#fff}' +
    '#lsOv.on{display:flex}' +
    '#lsOv .box{width:78vw;max-height:86vh;background:linear-gradient(160deg,#2b1a5e,#171036);border:.25vw solid rgba(255,255,255,.12);border-radius:2vw;padding:2.4vw 3vw;box-shadow:0 2vw 6vw rgba(0,0,0,.5);text-align:center;overflow:hidden}' +
    '#lsOv h2{margin:0 0 .4vw;font-size:2.8vw;color:#ffd23f}' +
    '#lsOv p{margin:0 0 1.6vw;font-size:1.5vw;opacity:.85}' +
    '#lsOv .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1vw;max-height:48vh;overflow:hidden;padding:.4vw}' +
    '#lsOv .it{position:relative;color:#fff;font-family:inherit;display:flex;align-items:center;justify-content:center;min-height:5.6vw;padding:.8vw 1vw;border-radius:1.2vw;background:rgba(255,255,255,.08);border:.25vw solid transparent;font-size:1.55vw;font-weight:700;transition:transform .15s,background .15s}' +
    '#lsOv .it .ck{position:absolute;top:.5vw;inset-inline-start:.6vw;width:2vw;height:2vw;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3vw;background:#22c55e}' +
    '#lsOv .it.off{opacity:.45;background:rgba(255,255,255,.03);text-decoration:line-through}' +
    '#lsOv .it.off .ck{background:#ef4444}' +
    '#lsOv .acts{display:flex;justify-content:center;gap:1.4vw;margin-top:1.8vw}' +
    '#lsOv .b{font:700 1.7vw "Baloo Bhaijaan 2",Tahoma,sans-serif;padding:.7vw 2.8vw;border-radius:5vw;border:.25vw solid transparent;background:rgba(255,255,255,.12);color:#fff}' +
    '#lsOv .b.main{background:#ffd23f;color:#2b1a5e}' +
    '#lsOv .q{direction:ltr;font-size:3.6vw;margin:1vw 0 1.8vw;letter-spacing:.2vw}' +
    '#lsOv .msg{min-height:2vw;font-size:1.4vw;color:#fca5a5}' +
    '#lsOv .fx{transform:scale(1.07);border-color:#ffd23f!important;box-shadow:0 0 0 .3vw rgba(255,210,63,.35)}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  /* ---------- header button ---------- */
  function addBtn() {
    if ($('lsBtn') || !$('bAcct') || !tok()) return;
    var b = document.createElement('button'); b.className = 'btn'; b.id = 'lsBtn'; b.textContent = '⚙️ أقسام طفلي';
    b.onclick = function () { openGate(); };
    $('bAcct').parentNode.insertBefore(b, $('bAcct').nextSibling);
  }
  var onHdr = false;
  function hdrOn(v) { onHdr = v; var a = $('bAcct'), b = $('lsBtn'); if (!a || !b) return; b.classList.toggle('focus', v); a.classList.toggle('focus', !v); }

  /* ---------- overlay ---------- */
  var ov, items = [], fi = 0, mode = '', cols = 4, ans = 0;
  function ensureOv() { if (ov) return ov; ov = document.createElement('div'); ov.id = 'lsOv'; document.body.appendChild(ov); return ov; }
  function setF(i) { items.forEach(function (el) { el.classList.remove('fx'); }); fi = Math.max(0, Math.min(items.length - 1, i)); if (items[fi]) { items[fi].classList.add('fx'); if (items[fi].scrollIntoView) try { items[fi].scrollIntoView({ block: 'nearest' }); } catch (e) {} } }
  function close() { if (ov) ov.classList.remove('on'); mode = ''; }
  window.loloTvSecOpen = function () { if (tok()) openGate(); };

  function openGate() {
    ensureOv(); mode = 'gate';
    var a = 3 + Math.floor(Math.random() * 6), b = 4 + Math.floor(Math.random() * 6); ans = a + b;
    var opts = [ans, ans + 1 + Math.floor(Math.random() * 3), ans - 1 - Math.floor(Math.random() * 2)].sort(function () { return Math.random() - .5; });
    ov.innerHTML = '<div class="box"><h2>🔒 لولي الأمر</h2><p>علشان تغيّر الأقسام، اختار الإجابة الصح</p><div class="q">' + a + ' + ' + b + ' = ؟</div>' +
      '<div class="acts">' + opts.map(function (o) { return '<button class="b it2" data-v="' + o + '">' + o + '</button>'; }).join('') + '</div><div class="msg"></div>' +
      '<div class="acts"><button class="b" data-x="1">رجوع</button></div></div>';
    items = [].slice.call(ov.querySelectorAll('button'));
    items.forEach(function (el) { el.onclick = function () { act(el); }; });
    ov.classList.add('on'); setF(0);
  }
  function openChooser(first) {
    if (!ALL.length) return;
    ensureOv(); mode = first ? 'first' : 'set';
    var p = load() || { hidden: [] }, h = {}; (p.hidden || []).forEach(function (k) { h[k] = 1; });
    ov.innerHTML = '<div class="box"><h2>👨‍👩‍👧 أقسام طفلي</h2><p>' + (first ? 'اختار الأقسام اللي تظهر لطفلك على التلفزيون. تقدر تغيّرها بعدين من زرار "أقسام طفلي".' : 'اضغط OK على أي قسم علشان تظهره أو تخفيه.') + '</p>' +
      '<div class="grid">' + ALL.map(function (c) { return '<button class="it' + (h[c.k] ? ' off' : '') + '" data-k="' + esc(c.k) + '"><span class="ck">' + (h[c.k] ? '✕' : '✓') + '</span>' + esc(c.n) + '</button>'; }).join('') + '</div>' +
      '<div class="msg"></div><div class="acts"><button class="b main" data-s="1">حفظ</button><button class="b" data-x="1">' + (first ? 'تخطي · إظهار الكل' : 'إلغاء') + '</button></div></div>';
    items = [].slice.call(ov.querySelectorAll('button'));
    items.forEach(function (el) { el.onclick = function () { act(el); }; });
    ov.classList.add('on'); setF(0);
  }
  function act(el) {
    if (el.getAttribute('data-x')) { if (mode === 'first') save({ hidden: [] }); close(); return; }
    if (mode === 'gate') { if (+el.getAttribute('data-v') === ans) openChooser(false); else { ov.querySelector('.msg').textContent = 'إجابة غلط، جرّب تاني'; } return; }
    if (el.getAttribute('data-k')) { var off = el.classList.toggle('off'); el.querySelector('.ck').textContent = off ? '✕' : '✓'; return; }
    if (el.getAttribute('data-s')) {
      var hid = [].slice.call(ov.querySelectorAll('.it.off')).map(function (x) { return x.getAttribute('data-k'); });
      if (hid.length >= ALL.length) { ov.querySelector('.msg').textContent = 'لازم يفضل قسم واحد على الأقل ظاهر'; return; }
      save({ hidden: hid, t: Date.now() }); close();
      if (window.loloTvGoHome) window.loloTvGoHome(); else location.reload();
    }
  }
  function grid() { return [].slice.call(ov.querySelectorAll('.grid .it')); }
  function move(k) {
    var g = mode === 'gate' ? [] : grid(), inG = fi < g.length;
    if (k === 37) setF(fi + 1); else if (k === 39) setF(fi - 1);
    else if (k === 40) setF(inG ? (fi + cols < g.length ? fi + cols : g.length) : fi);
    else if (k === 38) setF(inG ? (fi - cols >= 0 ? fi - cols : fi) : (g.length ? Math.max(0, g.length - 1) : fi - 1));
  }

  window.addEventListener('keydown', function (e) {
    var k = e.keyCode;
    if (ov && ov.classList.contains('on')) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (OK.indexOf(k) > -1) { if (items[fi]) act(items[fi]); }
      else if (BACK.indexOf(k) > -1) { if (mode === 'first') save({ hidden: [] }); close(); }
      else move(k);
      return;
    }
    var b = $('lsBtn'), a = $('bAcct'), home = $('home');
    if (!b || !a || !home || !home.classList.contains('on')) { onHdr = false; return; }
    if (onHdr) {
      if (OK.indexOf(k) > -1) { e.preventDefault(); e.stopImmediatePropagation(); hdrOn(false); openGate(); return; }
      if (k === 37 || k === 39) { e.preventDefault(); e.stopImmediatePropagation(); hdrOn(false); return; }
      hdrOn(false); return; // let the page handle down / back from the account button
    }
    if (a.classList.contains('focus') && (k === 37 || k === 39)) { e.preventDefault(); e.stopImmediatePropagation(); hdrOn(true); }
  }, true);
})();
