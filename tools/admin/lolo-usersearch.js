/* LOLO_USERSEARCH_2026: a quick search bar on top of the Users list in the admin dashboard.
   Type a name, an email (or part of it), or a phone number; it opens the Users list filtered by that field. */
(function () {
  if (window.__luSearch) return; window.__luSearch = 1;
  var RX = /\/admin\/resources\/(User|users)(\/actions\/list)?\/?$/;
  var CSS = '#luS{direction:rtl;display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:#fff;border-radius:18px;padding:12px 14px;margin:6px 0 14px;box-shadow:0 8px 24px rgba(90,60,170,.10);font-family:Cairo,Tahoma,sans-serif}' +
    '#luS b{color:#4c1d95;font-weight:900;font-size:15px;white-space:nowrap}' +
    '#luS input{flex:1 1 220px;min-width:160px;height:42px;border:1.5px solid #e6ddf8;border-radius:12px;padding:0 12px;font:700 15px Cairo,Tahoma,sans-serif;color:#22184a;background:#fff;outline:0}' +
    '#luS input:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.15)}' +
    '#luS select{height:42px;border:1.5px solid #e6ddf8;border-radius:12px;padding:0 8px;font:700 14px Cairo,Tahoma,sans-serif;color:#22184a;background:#fff}' +
    '#luS button{height:42px;border:0;border-radius:12px;padding:0 18px;font:800 15px Cairo,Tahoma,sans-serif;cursor:pointer}' +
    '#luS .go{background:linear-gradient(90deg,#7c3aed,#6d28d9);color:#fff}#luS .clr{background:#f3edff;color:#4c1d95}' +
    '#luS .hint{flex-basis:100%;font-size:12px;color:#6e6596;font-weight:700}';
  function q(name) { var m = new RegExp('[?&]' + name.replace(/\./g, '\\.') + '=([^&]*)').exec(location.search); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; }
  function detect(v) {
    if (/^[0-9a-f]{24}$/i.test(v)) return 'id';
    if (v.indexOf('@') >= 0 || /^[^\s]+\.[a-z]{2,}$/i.test(v)) return 'email';
    var d = v.replace(/[\s()+\-]/g, '');
    if (/^\d{6,}$/.test(d)) return 'phoneNumber';
    return 'name';
  }
  function go(v, mode) {
    v = String(v || '').trim(); var res = (RX.exec(location.pathname) || [])[1] || 'User';
    if (!v) { location.href = '/admin/resources/' + res; return; }
    var f = mode === 'auto' ? detect(v) : mode;
    if (f === 'phoneNumber') { var d = v.replace(/\D/g, ''); v = d.length > 9 ? d.slice(-9) : d; }
    if (f === 'id') { location.href = '/admin/resources/' + res + '/records/' + v + '/show'; return; }
    location.href = '/admin/resources/' + res + '?filters.' + f + '=' + encodeURIComponent(v) + '&page=1';
  }
  function build() {
    var bar = document.createElement('div'); bar.id = 'luS';
    var cur = q('filters.email') || q('filters.name') || q('filters.phoneNumber');
    var curF = q('filters.email') ? 'email' : q('filters.name') ? 'name' : q('filters.phoneNumber') ? 'phoneNumber' : 'auto';
    bar.innerHTML = '<b>\ud83d\udd0e \u062f\u0648\u0651\u0631 \u0639\u0644\u0649 \u0645\u0633\u062a\u062e\u062f\u0645</b><input type="search" placeholder="\u0627\u0643\u062a\u0628 \u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0625\u064a\u0645\u064a\u0644 \u0623\u0648 \u0631\u0642\u0645 \u0627\u0644\u0645\u0648\u0628\u0627\u064a\u0644\u2026" autocomplete="off">' +
      '<select><option value="auto">\u062a\u0644\u0642\u0627\u0626\u064a</option><option value="name">\u0628\u0627\u0644\u0627\u0633\u0645</option><option value="email">\u0628\u0627\u0644\u0625\u064a\u0645\u064a\u0644</option><option value="phoneNumber">\u0628\u0627\u0644\u0645\u0648\u0628\u0627\u064a\u0644</option></select>' +
      '<button class="go" type="button">\u0628\u062d\u062b</button><button class="clr" type="button">\u0645\u0633\u062d</button>' +
      '<div class="hint">' + (cur ? '\u0628\u062a\u0639\u0631\u0636 \u062f\u0644\u0648\u0642\u062a\u064a \u0646\u062a\u0627\u064a\u062c: \u00ab' + cur.replace(/[<>&]/g, '') + '\u00bb \u2014 \u062f\u0648\u0633 \u00ab\u0645\u0633\u062d\u00bb \u0639\u0644\u0634\u0627\u0646 \u062a\u0631\u062c\u0639 \u0644\u0643\u0644 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646.' : '\u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646 \u0627\u0644\u062c\u062f\u0627\u062f \u0645\u0633\u062c\u0644\u064a\u0646 \u0628\u0627\u0644\u0625\u064a\u0645\u064a\u0644 \u063a\u0627\u0644\u0628\u064b\u0627\u060c \u0641\u0627\u0644\u0623\u0633\u0647\u0644 \u062a\u062f\u0648\u0651\u0631 \u0628\u0627\u0644\u0625\u064a\u0645\u064a\u0644 \u0623\u0648 \u062c\u0632\u0621 \u0645\u0646\u0647.') + '</div>';
    var inp = bar.querySelector('input'), sel = bar.querySelector('select');
    inp.value = cur; sel.value = 'auto';
    bar.querySelector('.go').onclick = function () { go(inp.value, sel.value); };
    bar.querySelector('.clr').onclick = function () { go('', 'auto'); };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(inp.value, sel.value); } });
    return bar;
  }
  function tick() {
    var on = RX.test(location.pathname), bar = document.getElementById('luS');
    if (!on) { if (bar) bar.remove(); return; }
    if (bar && document.body.contains(bar)) return;
    var table = document.querySelector('#app .adminjs_Table') || document.querySelector('#app table');
    if (!table) return;
    var host = table.parentNode; while (host && host.parentNode && host.parentNode.id !== 'app' && host.parentNode.querySelectorAll('table').length === 1 && host.parentNode.tagName !== 'SECTION') host = host.parentNode;
    if (!host || !host.parentNode) return;
    if (!document.getElementById('luSCss')) { var st = document.createElement('style'); st.id = 'luSCss'; st.textContent = CSS; document.head.appendChild(st); }
    host.parentNode.insertBefore(build(), host);
  }
  setInterval(tick, 600); document.addEventListener('DOMContentLoaded', tick);
})();
