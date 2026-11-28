// Patches /home/backend/assets/js/lolo-lapsed.js (the "المشتركين اللي ما جددوش" page):
//  1) expiry-age filter with ranges (last week … more than a year) + a custom "from X to Y days" range
//  2) its own button in the dashboard side menu ("اشتراكات منتهية"), so it opens from any page
// Safe to run twice (it skips if already patched). Makes a backup first.
const fs = require('fs');
const F = process.argv[2] || '/home/backend/assets/js/lolo-lapsed.js';
let s = fs.readFileSync(F, 'utf8');
if (s.includes('LOLO_LAPSED_AGE_2026')) { console.log('ALREADY PATCHED'); process.exit(0); }
const R = (a, b) => { if (!s.includes(a)) { console.log('NOT FOUND: ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, b); };
const inp = 'width:70px;height:40px;border:1.5px solid #e6ddf8;border-radius:12px;padding:0 8px;font:700 13.5px Cairo,sans-serif;color:#22184a;background:#fff';
R('<select id="llA"><option value="">من أي وقت</option><option value="30">خلص في آخر 30 يوم</option><option value="90">خلص في آخر 90 يوم</option></select>',
  '<select id="llA"><option value="">انتهى من أي وقت</option><option value="0-7">انتهى في آخر أسبوع</option><option value="0-30">انتهى في آخر شهر</option><option value="30-45">انتهى من شهر لـ 45 يوم</option><option value="45-60">انتهى من 45 يوم لشهرين</option><option value="60-90">انتهى من شهرين لـ 3 شهور</option><option value="90-180">انتهى من 3 لـ 6 شهور</option><option value="180-365">انتهى من 6 شهور لسنة</option><option value="365-">انتهى من أكتر من سنة</option><option value="custom">مدة أحددها بنفسي…</option></select>' +
  '<span id="llAc" style="display:none;align-items:center;gap:6px;font-weight:800;font-size:13.5px;color:#4b4170">انتهى من <input type="number" id="llA1" min="0" placeholder="45" style="' + inp + '"> لـ <input type="number" id="llA2" min="0" placeholder="60" style="' + inp + '"> يوم</span>');
R("if(F.age==='30'&&days>30)return false;if(F.age==='90'&&days>90)return false;",
  "if(F.age){/* LOLO_LAPSED_AGE_2026 */var rg=F.age==='custom'?[F.a1,F.a2]:F.age.split('-');var lo=(rg[0]===''||rg[0]==null)?NaN:+rg[0],hi=(rg[1]===''||rg[1]==null)?NaN:+rg[1];if(!isNaN(lo)&&days<lo)return false;if(!isNaN(hi)&&days>hi)return false}");
R("root.querySelector('#llA').onchange=function(){F.age=this.value;page=1;draw()};",
  "root.querySelector('#llA').onchange=function(){F.age=this.value;root.querySelector('#llAc').style.display=this.value==='custom'?'inline-flex':'none';page=1;draw()};root.querySelector('#llA1').oninput=function(){F.a1=this.value;page=1;draw()};root.querySelector('#llA2').oninput=function(){F.a2=this.value;page=1;draw()};");
R("setInterval(function(){if(/^\\/admin\\/resources\\/User\\/?$/.test(location.pathname))inject();else if(root&&root.classList.contains('on'))close()},700);",
  "function navBtn(){if(document.getElementById('llNav'))return;var sb=document.querySelector('#lj .sb')||document.getElementById('lj');if(!sb)return;var as=[].slice.call(sb.querySelectorAll('a'));var pick=function(t){return as.filter(function(a){return (a.textContent||'').indexOf(t)>-1})[0]};var ref=pick('المدفوعات غير المكتملة')||pick('المدفوعات')||as[as.length-1];if(!ref)return;var n=ref.cloneNode(true);n.id='llNav';n.setAttribute('href','#');n.removeAttribute('target');n.classList.remove('on');n.classList.remove('active');n.classList.remove('act');var w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT),t,set=false;while((t=w.nextNode())){if(/\\S/.test(t.nodeValue)){if(!set){t.nodeValue='اشتراكات منتهية';set=true}else t.nodeValue=''}}n.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();open()},true);ref.parentNode.insertBefore(n,ref.nextSibling)}\n" +
  "var lastP=location.pathname;window.loloLapsedOpen=function(){open()};setInterval(function(){if(/^\\/admin\\/resources\\/User\\/?$/.test(location.pathname))inject();if(location.pathname!==lastP){lastP=location.pathname;if(root&&root.classList.contains('on'))close()}try{navBtn()}catch(e){}},700);");
fs.copyFileSync(F, F + '.bak-age-' + Date.now());
fs.writeFileSync(F, s);
console.log('LAPSED PATCH OK');
