/* LOLO_USERSEARCH_2026 v3: makes the Users page search ("\u0627\u0628\u062d\u062b \u0639\u0646 \u0645\u0633\u062a\u062e\u062f\u0645") find people by name OR email OR phone.
   The page asks the server for one field only (email when the text has "@", otherwise name), so typing part of an
   email, an Apple/Google address without "@", or a phone number found nothing. This widens that one request into
   name + email (+ phone when the text has digits) and merges the answers. Nothing else on the page changes. */
(function () {
  if (window.__luSearch3) return; window.__luSearch3 = 1;
  var of = window.fetch; if (!of) return;
  var LIST = /\/api\/resources\/User\/actions\/list(\?|$)/;
  var F = /([?&])filters\.(name|email)=([^&]*)/;
  function enc(v) { return encodeURIComponent(v); }
  window.fetch = function (u, o) {
    try {
      var s = typeof u === 'string' ? u : (u && u.url) || '';
      var m = LIST.test(s) && F.exec(s);
      if (m) {
        var val = decodeURIComponent(m[3].replace(/\+/g, ' ')).trim();
        if (val) {
          var base = s.replace(F, '$1').replace(/&&+/g, '&').replace(/\?&/, '?').replace(/[?&]$/, '');
          var sep = base.indexOf('?') > -1 ? '&' : '?';
          var urls = [base + sep + 'filters.name=' + enc(val), base + sep + 'filters.email=' + enc(val)];
          var d = val.replace(/[\s()+\-]/g, '');
          if (/^\d{6,}$/.test(d)) { d = d.length > 9 ? d.slice(-9) : d; urls.push(base + sep + 'filters.phoneNumber=' + enc(d)); }
          var desc = !/sortBy=/.test(s) || /sortBy=_id/.test(s) && !/direction=asc/.test(s);
          var asc = /sortBy=_id/.test(s) && /direction=asc/.test(s);
          var self = this;
          return Promise.all(urls.map(function (x) { return of.call(self, x, o).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }))
            .then(function (arr) {
              var tpl = null, seen = {}, recs = [], total = 0;
              arr.forEach(function (j) {
                if (!j || !j.records) return; if (!tpl) tpl = j;
                total += (j.meta && j.meta.total) || 0;
                j.records.forEach(function (r) { var id = r && (r.id || (r.params && r.params._id)); if (!id || seen[id]) { if (id) total--; return; } seen[id] = 1; recs.push(r); });
              });
              if (!tpl) return of.call(self, u, o);
              if (desc || asc) recs.sort(function (a, b) { var x = String(a.id), y = String(b.id); return desc ? (x < y ? 1 : x > y ? -1 : 0) : (x < y ? -1 : x > y ? 1 : 0); });
              var out = {}; for (var k in tpl) out[k] = tpl[k];
              out.records = recs; out.meta = {}; for (var k2 in (tpl.meta || {})) out.meta[k2] = tpl.meta[k2];
              out.meta.total = Math.max(total, recs.length);
              return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } });
            });
        }
      }
    } catch (e) {}
    return of.apply(this, arguments);
  };
})();
