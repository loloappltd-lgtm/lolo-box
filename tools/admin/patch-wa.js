// Fixes WhatsApp numbers in the dashboard pages (wrong country code -> WhatsApp says the number is not valid).
// Replaces the intl() phone formatter in every dashboard script that has the old one. Safe to run twice; backups.
const fs = require('fs'), D = '/home/backend/assets/js/';
const OLD = "function intl(ph,dial){var s=String(ph||'').trim();if(!s)return '';var d=s.replace(/\\D/g,'');if(!d)return '';if(/^\\+/.test(s))return d;if(/^00/.test(d))return d.slice(2);if(dial&&d.indexOf(dial)===0&&d.length>dial.length+7)return d;if(dial&&/^0/.test(d))return dial+d.replace(/^0+/,'');if(dial&&d.length<=10)return dial+d;return d}";
const NEW = "function intl(ph,dial){var s=String(ph||'').trim();if(!s)return '';var d=s.replace(/\\D/g,'');if(!d)return '';dial=String(dial||'');var plus=/^\\+/.test(s);if(!plus&&/^00/.test(d)){d=d.slice(2);plus=true}if(!plus){if(/^01[0125]\\d{8}$/.test(d))return '20'+d.slice(1);if(dial==='20'&&/^1[0125]\\d{8}$/.test(d))return '20'+d;if(/^05\\d{8}$/.test(d))return (dial==='971'?'971':'966')+d.slice(1);if(/^5\\d{8}$/.test(d)&&(dial==='966'||dial==='971'))return dial+d;if(d.length===8&&/^(965|974|973|968)$/.test(dial))return dial+d;if(dial&&d.indexOf(dial)===0&&d.length>dial.length+7)return fix(d);if(dial&&/^0/.test(d))return fix(dial+d.replace(/^0+/,''));if(dial&&d.length<=10)return fix(dial+d);}return fix(d);function fix(x){if(/^2001[0125]\\d{8}$/.test(x))return '20'+x.slice(3);if(/^9660\\d{9}$/.test(x))return '966'+x.slice(4);if(/^9710\\d{9}$/.test(x))return '971'+x.slice(4);return x}}" + ' /* LOLO_WA_FIX_2026 */';
let n = 0;
for (const f of fs.readdirSync(D).filter((x) => /\.js$/.test(x))) {
  const p = D + f; const s = fs.readFileSync(p, 'utf8');
  if (s.includes('LOLO_WA_FIX_2026')) { console.log('already ' + f); n++; continue; }
  if (s.includes(OLD)) { fs.copyFileSync(p, p + '.bak-wafix-' + Date.now()); fs.writeFileSync(p, s.split(OLD).join(NEW)); console.log('fixed ' + f); n++; }
  else if (/function intl\(/.test(s)) console.log('OTHER intl() in ' + f + ' (not changed)');
}
console.log(n ? 'WAFIX OK (' + n + ' file)' : 'WAFIX: nothing matched');
