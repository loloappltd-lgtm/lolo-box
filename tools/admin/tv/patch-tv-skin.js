// Installs the new TV home look + Netflix-style preview on every show card.
// Usage: node patch-tv-skin.js /home/backend/public/tv        (needs patch-tv-sections.js first; it re-copies tv-sections.js too)
// Undo:  node patch-tv-skin.js /home/backend/public/tv off     (old look; preview goes back to the Top 10 row only)
const fs = require('fs'), path = require('path');
const dir = process.argv[2] || '/home/backend/public/tv', off = process.argv[3] === 'off';
const idx = path.join(dir, 'index.html'), pvf = path.join(dir, 'tv-preview.js');
let s = fs.readFileSync(idx, 'utf8');
s = s.replace(/<script src="\/tv\/tv-skin\.js\?v=\d+"><\/script>\n?/, '');
if (off) { fs.writeFileSync(idx, s); console.log('TV SKIN OFF'); process.exit(0); }
if (!s.includes('LOLO_TV_SECTIONS_HOOK')) { console.log('RUN patch-tv-sections.js FIRST'); process.exit(1); }
const need = (a) => { if (s.split(a).length !== 2) { console.log('NOT FOUND: ' + a.slice(0, 50)); process.exit(1); } };
// 1) focus helpers for the sidebar / tiles
if (!s.includes('window.loloTvApi')) {
  const a = 'window.loloTvGoHome = goHome;'; need(a);
  s = s.replace(a, a + ' window.loloTvApi = { focus: focus, cardAt: cardAt, rows: function () { return ROWS; }, cur: function () { return cur; } };');
}
// 2) preview on every show card (only while the skin sets window.loloPvAll)
if (!s.includes('LOLO_PV_ALL')) {
  const a = "if (String(ROWS[r].id || '').indexOf('top-') === 0) {"; need(a);
  s = s.replace(a, "if (/*LOLO_PV_ALL*/ (window.loloPvAll && !ROWS[r].lsCats && !s.game) || String(ROWS[r].id || '').indexOf('top-') === 0) {");
}
// 3) preview timing can be set from the skin (wait before start, max length)
let p = fs.readFileSync(pvf, 'utf8');
if (!p.includes('loloPvDelay')) {
  const a = 'timer = setTimeout(function () { start(url); }, DELAY);', b = 'stopTimer = setTimeout(stop, MAX_MS);';
  if (p.split(a).length !== 2 || p.split(b).length !== 2) { console.log('PREVIEW TIMING NOT FOUND (skipped)'); }
  else { fs.copyFileSync(pvf, pvf + '.bak-' + Date.now()); p = p.replace(a, 'timer = setTimeout(function () { start(url); }, window.loloPvDelay || DELAY);').replace(b, 'stopTimer = setTimeout(stop, window.loloPvMax || MAX_MS);'); fs.writeFileSync(pvf, p); }
}
fs.copyFileSync(path.join(__dirname, 'tv-sections.js'), path.join(dir, 'tv-sections.js'));
fs.copyFileSync(path.join(__dirname, 'tv-skin.js'), path.join(dir, 'tv-skin.js'));
const v = Date.now();
s = s.replace(/<script src="\/tv\/tv-sections\.js\?v=\d+"><\/script>\n?/, '');
s = s.replace(/<script src="\/tv\/tv-preview\.js\?v=[^"]*"><\/script>/, '<script src="/tv/tv-preview.js?v=' + v + '"></script>');
const tag = '<script src="/tv/tv-sections.js?v=' + v + '"></script>\n<script src="/tv/tv-skin.js?v=' + v + '"></script>\n';
const i = s.lastIndexOf('</body>'); s = s.slice(0, i) + tag + s.slice(i);
fs.writeFileSync(idx, s);
console.log('TV SKIN OK');
