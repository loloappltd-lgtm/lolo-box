// 1) WhatsApp numbers in lolo-pwa.js (users list / payments WhatsApp buttons): detect the number's own country
//    (Egypt 01x, KSA/UAE 05x, Gulf 8-digit) instead of always adding the user's country code.
// 2) Bump the dashboard script version so browsers load the new files.
// Safe to run twice; makes a backup.
const fs = require('fs'), F = '/home/backend/assets/js/lolo-pwa.js';
let s = fs.readFileSync(F, 'utf8'), o = s;
const OLD = "function intl(raw, code) {\n    var p = String(raw || '').replace(/[^0-9+]/g, ''); if (p.replace(/\\D/g, '').length < 7) return '';\n    if (p[0] === '+') return p.slice(1); if (p.indexOf('00') === 0) return p.slice(2);\n    if (code && p.indexOf(code) === 0 && p.length > 10) return p;\n    if (!code) return '';\n    return code + p.replace(/^0+/, '');\n  }";
const NEW = "function intl(raw, code) { /* LOLO_WA_FIX_2026 */\n    var p = String(raw || '').replace(/[^0-9+]/g, ''), d = p.replace(/\\D/g, ''); if (d.length < 7) return ''; code = String(code || '');\n    var fix = function (x) { if (/^2001[0125]\\d{8}$/.test(x)) return '20' + x.slice(3); if (/^9660\\d{9}$/.test(x)) return '966' + x.slice(4); if (/^9710\\d{9}$/.test(x)) return '971' + x.slice(4); return x; };\n    if (p[0] === '+') return fix(d); if (d.indexOf('00') === 0) return fix(d.slice(2));\n    if (/^01[0125]\\d{8}$/.test(d)) return '20' + d.slice(1); if (code === '20' && /^1[0125]\\d{8}$/.test(d)) return '20' + d;\n    if (/^05\\d{8}$/.test(d)) return (code === '971' ? '971' : '966') + d.slice(1); if (/^5\\d{8}$/.test(d) && (code === '966' || code === '971')) return code + d;\n    if (d.length === 8 && /^(965|974|973|968)$/.test(code)) return code + d;\n    if (code && d.indexOf(code) === 0 && d.length > 10) return fix(d);\n    if (!code) return '';\n    return fix(code + d.replace(/^0+/, ''));\n  }";
if (!s.includes('LOLO_WA_FIX_2026')) { if (!s.includes(OLD)) { console.log('intl NOT FOUND'); } else s = s.replace(OLD, NEW); }
s = s.replace(/var V='(\d+)',J='\/assets\/js\/';/, (m, v) => "var V='" + (Math.max(+v, 25) + 1) + "',J='/assets/js/';");
if (s !== o) { fs.copyFileSync(F, F + '.bak-wa2-' + Date.now()); fs.writeFileSync(F, s); }
console.log((s.includes('LOLO_WA_FIX_2026') ? 'PWA WA OK' : 'PWA WA MISSING') + ' · version ' + (/var V='(\d+)'/.exec(s) || [])[1]);
