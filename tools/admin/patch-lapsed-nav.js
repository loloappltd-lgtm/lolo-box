// Adds "اشتراكات منتهية" to the dashboard side menu (lolo-skin.js and, if it has its own copy, lolo-users.js).
// The item opens /admin/resources/User?lapsed=1 and lolo-lapsed.js opens the expired-subscriptions page there.
// Safe to run twice; makes backups.
const fs = require('fs'), D = '/home/backend/assets/js/';
const ITEM_OLD = "['المدفوعات غير المكتملة','clock','/admin/pages/Unfinished%20payments',1],";
const ITEM_NEW = ITEM_OLD + "['اشتراكات منتهية','clock',R+'User?lapsed=1',1],";
let changed = 0;
function patch(f, fn) { const p = D + f; let s; try { s = fs.readFileSync(p, 'utf8'); } catch (e) { console.log('skip ' + f); return; } const t = fn(s); if (t === s) { console.log('no change ' + f); return; } fs.copyFileSync(p, p + '.bak-lapnav-' + Date.now()); fs.writeFileSync(p, t); changed++; console.log('patched ' + f); }
const nav = (s) => (s.includes("'اشتراكات منتهية'") || !s.includes(ITEM_OLD)) ? s : s.replace(ITEM_OLD, ITEM_NEW);
patch('lolo-skin.js', nav);
patch('lolo-users.js', nav);
patch('lolo-lapsed.js', (s) => s.includes('LOLO_LAPSED_URL') ? s : s.replace('try{navBtn()}catch(e){}', "/* LOLO_LAPSED_URL */if(/[?&]lapsed=1/.test(location.search)&&/^\\/admin\\/resources\\/User\\/?$/.test(location.pathname)&&!(root&&root.classList.contains('on'))&&!window.__llAuto){window.__llAuto=1;open();try{history.replaceState(null,'',location.pathname)}catch(e){}}if(!/[?&]lapsed=1/.test(location.search))window.__llAuto=0;"));
const lp = fs.readFileSync(D + 'lolo-lapsed.js', 'utf8'), sk = fs.readFileSync(D + 'lolo-skin.js', 'utf8');
console.log(sk.includes("'اشتراكات منتهية'") && lp.includes('LOLO_LAPSED_URL') ? 'LAPNAV OK' : 'LAPNAV CHECK FAILED');
