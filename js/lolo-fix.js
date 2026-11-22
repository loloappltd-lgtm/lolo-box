/* LOLO WORLD - tablet + video fix (loads before main.js)
   1) Tablets: render at 1x so big screens don't run the GPU out of memory, recover if WebGL is lost.
   2) Taps: if a tablet WebView swallows the click on a menu button, deliver it ourselves.
   3) Leaving the game: stop drawing, mute audio and free the GPU so the app's videos aren't black.
   4) Add #debug to the game link to see any error on the device screen. */
(function () {
  'use strict';
  var DEBUG = /debug/i.test(location.hash + location.search);
  var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  var minSide = Math.min(screen.width || 0, screen.height || 0);
  var TABLET = coarse && minSide >= 600;

  /* ---------- on-screen error box (debug only) ---------- */
  function report(msg) {
    try { localStorage.setItem('loloWorld.lastError', String(msg).slice(0, 500)); } catch (e) {}
    if (!DEBUG) return;
    var b = document.getElementById('lwErr');
    if (!b) {
      b = document.createElement('div'); b.id = 'lwErr';
      b.style.cssText = 'position:fixed;left:8px;bottom:8px;max-width:70vw;max-height:40vh;overflow:auto;z-index:2147483647;background:#c0172b;color:#fff;font:12px/1.4 monospace;padding:8px 10px;border-radius:8px;direction:ltr;text-align:left;white-space:pre-wrap';
      b.onclick = function () { b.remove(); };
      (document.body || document.documentElement).appendChild(b);
    }
    b.textContent += (b.textContent ? '\n' : '') + String(msg).slice(0, 400);
  }
  window.addEventListener('error', function (e) { report('ERR: ' + (e.message || e) + ' @' + (e.filename || '').split('/').pop() + ':' + (e.lineno || '')); });
  window.addEventListener('unhandledrejection', function (e) { report('PROMISE: ' + ((e.reason && (e.reason.stack || e.reason.message)) || e.reason)); });
  if (DEBUG) {
    document.addEventListener('DOMContentLoaded', function () {
      report('debug on fix-v5 | ' + innerWidth + 'x' + innerHeight + ' dpr ' + (window.__realDPR || devicePixelRatio) + ' | tablet ' + TABLET + ' | ' + navigator.userAgent);
    });
  }

  /* ---------- tablets start on light graphics (once; the kid can switch back in settings) ---------- */
  if (TABLET) {
    try {
      if (!localStorage.getItem('loloWorld.tabletLow')) {
        var st = JSON.parse(localStorage.getItem('loloWorld.v1') || '{}') || {};
        st.q = 'low';
        localStorage.setItem('loloWorld.v1', JSON.stringify(st));
        localStorage.setItem('loloWorld.tabletLow', '1');
      }
    } catch (e) {}
  }

  /* ---------- debug: heartbeat + frame rate + every kind of touch ---------- */
  if (DEBUG) {
    var frames = 0, beat = 0;
    var _r = window.requestAnimationFrame;
    (function count() { frames++; _r.call(window, count); })();
    setInterval(function () {
      beat++;
      var hb = document.getElementById('lwBeat');
      if (!hb) {
        hb = document.createElement('div'); hb.id = 'lwBeat';
        hb.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:2147483647;background:#111;color:#0f0;font:13px monospace;padding:6px 10px;border-radius:8px;direction:ltr;pointer-events:none';
        (document.body || document.documentElement).appendChild(hb);
      }
      hb.textContent = 'alive ' + beat + 's | fps ' + frames;
      frames = 0;
    }, 1000);
    ['touchstart', 'mousedown'].forEach(function (t) {
      window.addEventListener(t, function (e) { report(t + ': ' + desc(e.target)); }, true);
    });
  }

  /* ---------- 1) tablets: 1x rendering ---------- */
  window.__realDPR = window.devicePixelRatio;
  if (TABLET) {
    try { Object.defineProperty(window, 'devicePixelRatio', { get: function () { return 1; }, configurable: true }); } catch (e) {}
  }

  /* ---------- WebGL tracking: normal power, recover from context loss ---------- */
  var gls = [], leaving = false;
  var _getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    if (/webgl/i.test(type)) {
      var a = {}; if (attrs) for (var k in attrs) a[k] = attrs[k];
      a.powerPreference = 'default';
      var gl = _getContext.call(this, type, a);
      if (gl && gls.indexOf(gl) < 0) {
        gls.push(gl);
        if (!this.__lwWatch) {
          this.__lwWatch = 1;
          this.addEventListener('webglcontextlost', function (e) {
            e.preventDefault();
            if (leaving) return;
            report('webglcontextlost');
            var n = 0; try { n = +sessionStorage.getItem('lwLost') || 0; sessionStorage.setItem('lwLost', n + 1); } catch (x) {}
            if (n < 2) setTimeout(function () { location.reload(); }, 300);
          });
        }
      }
      return gl;
    }
    return _getContext.apply(this, arguments);
  };

  /* ---------- audio tracking ---------- */
  var ctxs = [], medias = [];
  var AC = window.AudioContext || window.webkitAudioContext;
  if (AC) {
    var Tracked = function () {
      var c = new (Function.prototype.bind.apply(AC, [null].concat([].slice.call(arguments))))();
      ctxs.push(c); return c;
    };
    Tracked.prototype = AC.prototype;
    window.AudioContext = Tracked;
    if (window.webkitAudioContext) window.webkitAudioContext = Tracked;
  }
  var _play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (medias.indexOf(this) < 0) medias.push(this);
    if (leaving) { try { return Promise.resolve(); } catch (e) { return; } }
    return _play.apply(this, arguments);
  };

  /* ---------- 3) leaving the game: free everything ---------- */
  function release() {
    if (leaving) return;
    leaving = true;
    ctxs.forEach(function (c) { try { c.suspend(); } catch (e) {} });
    medias.forEach(function (m) { try { m.pause(); } catch (e) {} });
    gls.forEach(function (gl) { try { var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); } catch (e) {} });
  }
  function comeBack() {
    if (!leaving) return;
    try { sessionStorage.setItem('lwLost', '0'); } catch (e) {}
    location.reload(); /* progress is saved by the game itself */
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) release(); else comeBack(); });
  window.addEventListener('pagehide', release);
  window.addEventListener('pageshow', function (e) { if (e.persisted) comeBack(); });
  /* the game's exit button: release before navigating away */
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('[data-a="exit"]');
    if (b) release();
  }, true);

  /* ---------- 2) tap rescue for menu buttons ----------
     A tap inside a visible menu button's box always reaches that button,
     even when an invisible layer sits on top of it. */
  var SEL = '[data-a],[data-ch],[data-map],#pPlay';
  function desc(el) { return el ? (el.tagName + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 3).join('.') : '')) : 'none'; }
  function shown(el) {
    for (var n = el; n && n !== document.documentElement; n = n.parentElement) {
      var cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
    }
    return true;
  }
  function buttonAt(x, y) {
    var best = null, area = 1e12, list = document.querySelectorAll(SEL);
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      if (b.disabled || b.closest('#ctl')) continue;
      var r = b.getBoundingClientRect();
      if (!r.width || x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
      if (r.width * r.height < area && shown(b)) { best = b; area = r.width * r.height; }
    }
    return best;
  }
  if (DEBUG) {
    document.addEventListener('pointerdown', function (e) {
      var b = buttonAt(e.clientX, e.clientY);
      report('down: ' + desc(e.target) + (b && !b.contains(e.target) ? '  (covers ' + (b.dataset.a || b.dataset.ch || b.id) + ')' : ''));
    }, true);
  }
  var pend = null;
  document.addEventListener('pointerup', function (e) {
    if (e.pointerType === 'mouse' || !e.target || !e.target.closest) return;
    if (e.target.closest('input,textarea,select,[contenteditable]')) return;   // typing a name: never 'rescue' a button behind it
    var t = e.target.closest(SEL);
    var under = buttonAt(e.clientX, e.clientY);
    var box = e.target.closest('.panel,.wpanel,.invite,.emo');                   // a tap inside an open window only rescues buttons of that window
    if (under && box && !box.contains(under)) under = null;
    if (under && (!t || !under.contains(e.target))) t = under;
    if (!t || t.disabled || t.closest('#ctl')) return;
    if (pend) clearTimeout(pend.tm);
    pend = { el: t, tm: setTimeout(function () {
      if (pend && pend.el === t) { pend = null; report('tap fallback: ' + (t.dataset.a || t.dataset.ch || t.dataset.map || t.id)); t.click(); }
    }, 450) };
  }, true);
  document.addEventListener('pointercancel', function () { if (pend) { clearTimeout(pend.tm); pend = null; } }, true);
  /* only a real click on the same button cancels the rescue (a click on the covering layer does not) */
  document.addEventListener('click', function (e) {
    if (pend && e.isTrusted && pend.el.contains(e.target)) { clearTimeout(pend.tm); pend = null; }
  }, true);
})();
