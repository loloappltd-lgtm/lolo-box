// Installs "أقسام طفلي" on the TV page. Usage: node patch-tv-sections.js /home/backend/public/tv
const fs = require('fs'), path = require('path');
const dir = process.argv[2] || '/home/backend/public/tv';
const idx = path.join(dir, 'index.html');
let s = fs.readFileSync(idx, 'utf8');
fs.copyFileSync(path.join(__dirname, 'tv-sections.js'), path.join(dir, 'tv-sections.js'));
const v = Date.now();
if (!s.includes('LOLO_TV_SECTIONS_HOOK')) {
  const a = 'rows = rows.concat(loloGamesRow()); ROWS = rows;';
  if (s.split(a).length !== 2) { console.log('HOOK NOT FOUND'); process.exit(1); }
  s = s.replace(a, 'rows = rows.concat(loloGamesRow()); /* LOLO_TV_SECTIONS_HOOK */ window.loloTvGoHome = goHome; if (window.loloTvRows) { try { rows = window.loloTvRows(rows); } catch (e) {} } ROWS = rows;');
}
s = s.replace(/<script src="\/tv\/tv-sections\.js\?v=\d+"><\/script>\n?/, '');
const tag = '<script src="/tv/tv-sections.js?v=' + v + '"></script>\n';
const i = s.lastIndexOf('</body>');
s = i > -1 ? s.slice(0, i) + tag + s.slice(i) : s + tag;
fs.writeFileSync(idx, s);
console.log('TV SECTIONS OK v' + v);
