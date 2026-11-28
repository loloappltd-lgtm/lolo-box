// Installs the new TV home look. Usage: node patch-tv-skin.js /home/backend/public/tv   (run after patch-tv-sections.js)
// Undo: node patch-tv-skin.js /home/backend/public/tv off
const fs = require('fs'), path = require('path');
const dir = process.argv[2] || '/home/backend/public/tv', off = process.argv[3] === 'off';
const idx = path.join(dir, 'index.html');
let s = fs.readFileSync(idx, 'utf8');
s = s.replace(/<script src="\/tv\/tv-skin\.js\?v=\d+"><\/script>\n?/, '');
if (off) { fs.writeFileSync(idx, s); console.log('TV SKIN OFF'); process.exit(0); }
if (!s.includes('LOLO_TV_SECTIONS_HOOK')) { console.log('RUN patch-tv-sections.js FIRST'); process.exit(1); }
if (!s.includes('window.loloTvApi')) {
  const a = 'window.loloTvGoHome = goHome;';
  if (s.split(a).length !== 2) { console.log('API HOOK NOT FOUND'); process.exit(1); }
  s = s.replace(a, a + ' window.loloTvApi = { focus: focus, cardAt: cardAt, rows: function () { return ROWS; }, cur: function () { return cur; } };');
}
fs.copyFileSync(path.join(__dirname, 'tv-skin.js'), path.join(dir, 'tv-skin.js'));
const tag = '<script src="/tv/tv-skin.js?v=' + Date.now() + '"></script>\n';
const m = s.match(/<script src="\/tv\/tv-sections\.js\?v=\d+"><\/script>\n?/);
if (m) s = s.replace(m[0], m[0] + (m[0].endsWith('\n') ? '' : '\n') + tag);
else { const i = s.lastIndexOf('</body>'); s = s.slice(0, i) + tag + s.slice(i); }
fs.writeFileSync(idx, s);
console.log('TV SKIN OK');
