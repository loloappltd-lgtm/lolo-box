// LOLO BOX — Character Selection Screen (LOLO_CHARSEL_2026)
// The first screen of the game: the chosen kid stands large on a glowing platform inside a blocky (voxel) world,
// with the character list on the left, the character card on the right and the big yellow "choose" button.
// It reuses the game's own renderer, toon materials and avatar builder (avatar.js); it only adds a small scene of its own.
import * as THREE from 'three';
import { mergeGeometries } from './jsm/utils/BufferGeometryUtils.js';

// order of the list (indices into the game's character table — old saves keep their numbers)
export const CS_ORDER = [10, 11, 7, 2, 3, 12, 9, 13, 0, 1, 4, 5, 6, 8];

// card text for every character (Modern Standard Arabic), the platform colour and the thumbnail tile colours
export const CS_INFO = {
  10: { role: 'المستكشف الشجاع', desc: 'مستكشف شجاع يحب المغامرات، يطير بين الجزر العائمة ويبحث عن الكنوز المخبأة.', attrs: [['🧭', 'محب للمغامرات'], ['⚡', 'سريع وشجاع'], ['🗺️', 'خبير في الخرائط']], theme: '#2fb8ff', tile: ['#4cc3ff', '#2b6fff'] },
  11: { role: 'المستكشفة المبدعة', desc: 'فتاة مغامرة ومبدعة، تحب الاستكشاف وبناء العوالم واكتشاف الأسرار.', attrs: [['🎮', 'مبدعة في التصميم'], ['🧭', 'محبة للمغامرات'], ['🧱', 'تحب بناء العوالم']], theme: '#ff4fc8', tile: ['#ffd15c', '#ff9a1f'] },
  7: { role: 'ابن الخليج', desc: 'فتى كريم ومهذب، يحب الصحراء والخيل، ويحكي لأصدقائه أجمل الحكايات.', attrs: [['🤝', 'كريم ومحب للأصدقاء'], ['🐎', 'فارس شجاع'], ['📖', 'راوي الحكايات']], theme: '#ffc21a', tile: ['#f4f6ff', '#b9c6ff'] },
  2: { role: 'الفنانة الصغيرة', desc: 'فتاة لطيفة وذكية، تحب القراءة والرسم ومساعدة أصدقائها دائمًا.', attrs: [['🎨', 'فنانة موهوبة'], ['📚', 'تحب القراءة'], ['💜', 'تساعد الجميع']], theme: '#c05cff', tile: ['#e7a6ff', '#b25cff'] },
  3: { role: 'المخترع الصغير', desc: 'مخترع صغير لا يتوقف عن التفكير، يصنع الآلات والروبوتات من أي شيء.', attrs: [['🔧', 'يصنع الاختراعات'], ['🧠', 'ذكي جدًا'], ['🤖', 'يحب الروبوتات']], theme: '#14d6c4', tile: ['#7ad8ff', '#3a8dff'] },
  12: { role: 'الأميرة', desc: 'أميرة طيبة القلب، تحمي مملكتها وتنشر السعادة في كل مكان.', attrs: [['👑', 'قائدة حكيمة'], ['✨', 'تحب السحر'], ['🌸', 'طيبة القلب']], theme: '#ffb3e0', tile: ['#ff9ee0', '#c46cff'] },
  9: { role: 'مستكشف الغابة', desc: 'يعرف أسرار الغابة، يصادق الحيوانات ويجد طريقه في كل مكان.', attrs: [['🌴', 'خبير في الغابات'], ['🦁', 'صديق الحيوانات'], ['🔍', 'يكتشف الأسرار']], theme: '#18c95a', tile: ['#9ef07a', '#2fb44a'] },
  13: { role: 'النينجا', desc: 'نينجا سريع وهادئ، يقفز فوق الأسطح ويساعد أصدقاءه في الخفاء.', attrs: [['🥷', 'خفيف الحركة'], ['🎯', 'دقيق التركيز'], ['🛡️', 'يحمي أصدقاءه']], theme: '#7a4dff', tile: ['#8b8fb0', '#3c3f5c'] },
  0: { role: 'صديقة الزهور', desc: 'فتاة مرحة تحب الزهور والألوان، وتصنع الابتسامة لكل من حولها.', attrs: [['🌸', 'تحب الزهور'], ['😄', 'مرحة دائمًا'], ['🎨', 'تحب الألوان']], theme: '#ff4fc8', tile: ['#ffb3d9', '#ff5fa8'] },
  1: { role: 'البطل الرياضي', desc: 'فتى نشيط يحب الرياضة والسباقات، ولا يمل من اللعب مع أصدقائه.', attrs: [['⚽', 'رياضي نشيط'], ['🏎️', 'يحب السباقات'], ['🤝', 'صديق وفيّ']], theme: '#ffc21a', tile: ['#ffe36b', '#ffb31a'] },
  4: { role: 'العالِمة الصغيرة', desc: 'عالمة صغيرة تجري التجارب، وتحب أن تكتشف كيف تعمل الأشياء.', attrs: [['🔬', 'تحب التجارب'], ['💡', 'أفكارها مبتكرة'], ['📐', 'دقيقة ومنظمة']], theme: '#1fb8ff', tile: ['#b8f1ff', '#4fc3ff'] },
  5: { role: 'رائد الفضاء', desc: 'يحلم بالسفر إلى النجوم واكتشاف الكواكب البعيدة.', attrs: [['🚀', 'يحب الفضاء'], ['🌟', 'يحلم بالنجوم'], ['🧑‍🚀', 'شجاع ومغامر']], theme: '#7a4dff', tile: ['#7f8bff', '#3b2fa8'] },
  6: { role: 'الطاهية الماهرة', desc: 'طاهية ماهرة تحضّر أشهى الأطباق، وتحب مشاركتها مع أصدقائها.', attrs: [['🍰', 'طاهية ماهرة'], ['🍎', 'تحب الأكل الصحي'], ['🎉', 'تحب المشاركة']], theme: '#ff2d55', tile: ['#ffc2c2', '#ff6f7f'] },
  8: { role: 'البطلة الرياضية', desc: 'بطلة سريعة لا تستسلم أبدًا، وتشجع أصدقاءها على الفوز.', attrs: [['🏃‍♀️', 'سريعة جدًا'], ['🏆', 'لا تستسلم'], ['💪', 'قوية ونشيطة']], theme: '#18c95a', tile: ['#a8f5b8', '#26c264'] },
};

const CSS = `
@font-face{font-family:LoloBaloo;src:url(assets/fonts/baloo-extrabold.woff) format('woff');font-weight:800;font-display:swap}
@font-face{font-family:LoloBaloo;src:url(assets/fonts/baloo-bold.woff) format('woff');font-weight:700;font-display:swap}
#csel{position:fixed;inset:0;z-index:9;display:none;font-family:LoloBaloo,Cairo,Tajawal,"Segoe UI",sans-serif;color:#3b1d78;pointer-events:none}
#csel.on{display:block}
#csel>*{pointer-events:auto}
#csel button{font-family:inherit}
#csel .cs-stage{position:absolute;inset:0;pointer-events:auto;touch-action:none;cursor:grab}
#csel .cs-stage:active{cursor:grabbing}
/* top */
#csel .cs-logo{position:absolute;top:calc(6px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:clamp(4px,1vw,12px);pointer-events:none;animation:csBob 3.2s ease-in-out infinite}
#csel .cs-logo img{height:clamp(46px,11vh,96px);filter:drop-shadow(0 6px 10px rgba(50,0,120,.35))}
#csel .cs-title{display:flex;flex-direction:column;align-items:center;line-height:.95}
#csel .cs-title b{font-size:clamp(26px,6.4vh,58px);font-weight:800;color:#fff;-webkit-text-stroke:clamp(5px,1.1vh,9px) #5b22c9;paint-order:stroke fill;text-shadow:0 5px 0 #3a118f,0 10px 18px rgba(40,0,110,.35)}
#csel .cs-title i{font-style:normal;font-size:clamp(24px,6vh,54px);font-weight:800;letter-spacing:.02em;color:#ffd23f;-webkit-text-stroke:clamp(5px,1.1vh,9px) #5b22c9;paint-order:stroke fill;text-shadow:0 5px 0 #3a118f,0 10px 18px rgba(40,0,110,.35);direction:ltr}
#csel .cs-cube{width:clamp(40px,9vh,82px);height:clamp(40px,9vh,82px);filter:drop-shadow(0 6px 8px rgba(50,0,120,.35));animation:csSpin 6s ease-in-out infinite}
#csel .cs-tools{position:absolute;top:calc(10px + env(safe-area-inset-top));left:calc(12px + env(safe-area-inset-left));display:flex;gap:10px}
#csel .cs-rb{width:clamp(42px,9vh,58px);height:clamp(42px,9vh,58px);border-radius:16px;border:3px solid #fff;background:linear-gradient(#b884ff,#7a3cf0);box-shadow:0 5px 0 #4f1bb0,0 8px 16px rgba(40,0,110,.3);color:#fff;font-size:clamp(20px,4.2vh,28px);display:grid;place-items:center;cursor:pointer;transition:transform .12s}
#csel .cs-rb:active{transform:translateY(3px);box-shadow:0 2px 0 #4f1bb0}
#csel .cs-rb.off{background:linear-gradient(#c9c2dc,#8f86ad);box-shadow:0 5px 0 #625a80}
/* left: character list */
#csel .cs-list{position:absolute;left:calc(14px + env(safe-area-inset-left));top:calc(clamp(60px,15vh,124px) + env(safe-area-inset-top));bottom:clamp(14px,4vh,34px);width:clamp(150px,20vw,236px);display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 10px;border-radius:26px;background:linear-gradient(160deg,rgba(146,92,255,.92),rgba(98,52,214,.92));border:4px solid rgba(255,255,255,.75);box-shadow:inset 0 0 0 3px rgba(130,70,255,.6),0 10px 30px rgba(40,0,110,.35)}
#csel .cs-ar{width:58px;height:clamp(20px,4.4vh,30px);border-radius:12px;background:rgba(255,255,255,.18);color:#fff;font-size:clamp(16px,3vh,22px);font-weight:800;border:0;cursor:pointer;flex:none;line-height:1}
#csel .cs-ar:disabled{opacity:.25;cursor:default}
#csel .cs-grid{flex:1;min-height:0;width:100%;overflow-y:auto;overscroll-behavior:contain;display:grid;grid-template-columns:1fr 1fr;gap:clamp(6px,1.4vh,12px);padding:6px 4px;scrollbar-width:none;scroll-behavior:smooth;align-content:start}
#csel .cs-grid::-webkit-scrollbar{display:none}
#csel .cs-t{position:relative;aspect-ratio:1;border-radius:18px;border:3px solid rgba(255,255,255,.85);background:var(--g);box-shadow:0 4px 0 rgba(40,0,110,.35);cursor:pointer;padding:0;overflow:visible;transition:transform .15s,box-shadow .15s}
#csel .cs-t img{position:absolute;inset:0;width:100%;height:100%;border-radius:15px;object-fit:cover}
#csel .cs-t:active{transform:scale(.94)}
#csel .cs-t.sel{border-color:#ffe066;box-shadow:0 0 0 3px #ffb31a,0 0 18px 4px rgba(255,214,70,.9),0 4px 0 rgba(40,0,110,.35);transform:scale(1.04);z-index:2}
#csel .cs-t.sel::after{content:'✓';position:absolute;top:-8px;right:-8px;width:clamp(22px,4.6vh,30px);height:clamp(22px,4.6vh,30px);border-radius:50%;background:linear-gradient(#b884ff,#7a3cf0);color:#fff;border:3px solid #fff;display:grid;place-items:center;font-size:clamp(12px,2.4vh,16px);font-weight:900;box-shadow:0 3px 6px rgba(40,0,110,.4)}
#csel .cs-t .nw{position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);background:#ff4fa8;color:#fff;font-size:10px;font-weight:800;padding:0 7px;border-radius:99px;border:2px solid #fff;white-space:nowrap}
/* right: character card */
#csel .cs-card{position:absolute;right:calc(14px + env(safe-area-inset-right));top:calc(clamp(60px,15vh,124px) + env(safe-area-inset-top));bottom:clamp(14px,4vh,34px);width:clamp(210px,27vw,330px);display:flex;flex-direction:column;gap:clamp(5px,1.2vh,10px);padding:clamp(8px,1.6vh,14px);border-radius:26px;background:linear-gradient(160deg,rgba(150,96,255,.94),rgba(106,58,224,.94));border:4px solid rgba(255,255,255,.75);box-shadow:inset 0 0 0 3px rgba(130,70,255,.6),0 10px 30px rgba(40,0,110,.35);overflow:hidden}
#csel .cs-head{display:flex;align-items:center;gap:10px;flex:none}
#csel .cs-av{width:clamp(54px,13vh,96px);aspect-ratio:1;border-radius:16px;border:3px solid #fff;background:var(--g);flex:none;box-shadow:0 4px 0 rgba(40,0,110,.35);object-fit:cover}
#csel .cs-nm{flex:1;min-width:0;text-align:center}
#csel .cs-nm b{display:block;font-size:clamp(24px,6vh,44px);font-weight:800;color:#fff;-webkit-text-stroke:5px #4a14b0;paint-order:stroke fill;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#csel .cs-nm small{display:inline-block;margin-top:2px;font-size:clamp(11px,2.3vh,15px);font-weight:800;color:#ffe066}
#csel .cs-box{background:linear-gradient(#f7f2ff,#e8dcff);border-radius:18px;padding:clamp(6px,1.4vh,12px);box-shadow:inset 0 -3px 0 rgba(120,70,220,.18)}
#csel .cs-desc{margin:0;font-size:clamp(12px,2.6vh,17px);font-weight:700;line-height:1.55;text-align:center;color:#3b1d78}
#csel .cs-pill{align-self:center;margin:2px 0 -2px;padding:2px 26px;border-radius:99px;background:linear-gradient(#b884ff,#7a3cf0);color:#fff;font-size:clamp(13px,2.8vh,19px);font-weight:800;box-shadow:0 4px 0 #4f1bb0;border:2px solid #fff;flex:none}
#csel .cs-attrs{display:flex;flex-direction:column;gap:clamp(4px,1vh,8px)}
#csel .cs-attr{display:flex;align-items:center;gap:10px;background:#fff;border-radius:14px;padding:clamp(3px,.8vh,6px) 10px;font-size:clamp(12px,2.6vh,17px);font-weight:800;box-shadow:0 3px 0 rgba(120,70,220,.18)}
#csel .cs-attr i{font-style:normal;width:clamp(26px,5.6vh,38px);height:clamp(26px,5.6vh,38px);border-radius:10px;display:grid;place-items:center;font-size:clamp(15px,3.2vh,22px);background:var(--c);flex:none}
#csel .cs-fit{display:flex;flex-wrap:wrap;gap:5px;justify-content:center}
#csel .cs-fit span{background:rgba(255,255,255,.2);color:#fff;border:2px solid rgba(255,255,255,.5);border-radius:99px;padding:0 8px;font-size:clamp(10px,2.1vh,13px);font-weight:700;white-space:nowrap}
#csel .cs-mini{display:flex;gap:6px;margin-top:auto;flex:none}
#csel .cs-mini button{flex:1;border:2px solid #fff;border-radius:14px;padding:clamp(3px,.9vh,7px) 4px;font-size:clamp(12px,2.5vh,16px);font-weight:800;color:#fff;background:linear-gradient(#ff8ac4,#ef4e98);box-shadow:0 4px 0 #b32466;cursor:pointer}
#csel .cs-mini button+button{background:linear-gradient(#6ee3ff,#2f9bff);box-shadow:0 4px 0 #1f64b8}
#csel .cs-mini button:active{transform:translateY(3px);box-shadow:none}
/* bottom: choose */
#csel .cs-go{position:absolute;left:50%;bottom:calc(clamp(10px,3.4vh,28px) + env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;align-items:center;gap:14px;padding:clamp(6px,1.6vh,14px) clamp(28px,5vw,58px);border-radius:999px;border:4px solid #fff7c2;background:linear-gradient(#ffe46b,#ffc21a 55%,#ffab0f);box-shadow:0 8px 0 #d07a00,0 0 0 4px rgba(122,60,240,.55),0 14px 30px rgba(60,20,0,.35);color:#4a14b0;font-size:clamp(22px,5.4vh,40px);font-weight:800;cursor:pointer;white-space:nowrap;animation:csPulse 2.2s ease-in-out infinite}
#csel .cs-go .pl{width:0;height:0;border-style:solid;border-width:clamp(11px,2.6vh,19px) 0 clamp(11px,2.6vh,19px) clamp(18px,4.2vh,30px);border-color:transparent transparent transparent #6a2fd6;filter:drop-shadow(0 2px 0 rgba(255,255,255,.6))}
#csel .cs-go:active{transform:translateX(-50%) translateY(5px);box-shadow:0 3px 0 #d07a00,0 0 0 4px rgba(122,60,240,.55)}
#csel .cs-go:disabled{filter:saturate(.6);pointer-events:none}
#csel .cs-hint{position:absolute;left:50%;bottom:calc(clamp(74px,17vh,140px) + env(safe-area-inset-bottom));transform:translateX(-50%);background:rgba(40,10,100,.45);color:#fff;font-size:clamp(11px,2.3vh,15px);font-weight:700;padding:3px 14px;border-radius:99px;pointer-events:none;transition:opacity .6s}
#csel .cs-hint.hide{opacity:0}
#csel .cs-flash{position:absolute;inset:0;background:radial-gradient(circle at 50% 55%,rgba(255,255,255,.9),rgba(255,255,255,0) 60%);opacity:0;pointer-events:none;transition:opacity .35s}
#csel .cs-flash.on{opacity:1}
@keyframes csBob{0%,100%{translate:0 0}50%{translate:0 -5px}}
@keyframes csSpin{0%,100%{rotate:-8deg}50%{rotate:8deg}}
@keyframes csPulse{0%,100%{scale:1}50%{scale:1.05}}
/* short landscape phones */
@media (max-height:430px){#csel .cs-attr{padding:1px 8px}#csel .cs-fit{display:none}#csel .cs-pill{display:none}}
/* portrait / narrow screens: list becomes a strip, the card gets compact */
@media (max-aspect-ratio:1/1){
  #csel .cs-list{top:auto;bottom:calc(clamp(74px,10vh,96px) + env(safe-area-inset-bottom));left:10px;right:10px;width:auto;height:clamp(86px,12vh,110px);flex-direction:row;padding:6px}
  #csel .cs-ar{width:26px;height:100%;writing-mode:vertical-lr}
  #csel .cs-grid{grid-template-columns:none;grid-auto-flow:column;grid-auto-columns:clamp(66px,10vh,90px);overflow-x:auto;overflow-y:hidden;height:100%}
  #csel .cs-card{top:auto;bottom:calc(clamp(170px,23vh,214px) + env(safe-area-inset-bottom));left:10px;right:10px;width:auto;max-height:30vh}
  #csel .cs-attrs{flex-direction:row;flex-wrap:wrap;justify-content:center}#csel .cs-fit,#csel .cs-pill{display:none}
  #csel .cs-logo{flex-wrap:wrap;justify-content:center}
}
`;

export function initCharSel(o) {
  const { renderer, toon, ctex, AV, WARD } = o;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const root = document.createElement('div'); root.id = 'csel'; root.setAttribute('dir', 'rtl');
  root.innerHTML = `
    <div class="cs-stage" aria-hidden="true"></div>
    <div class="cs-logo">${cubeSVG()}<div class="cs-title"><b>لولو بوكس</b><i>LOLO BOX</i></div><img src="assets/ui/fish.webp?v=vx1" alt=""></div>
    <div class="cs-tools"><button class="cs-rb" data-cs="home" title="الرئيسية" aria-label="الرئيسية">🏠</button><button class="cs-rb" data-cs="settings" title="الإعدادات" aria-label="الإعدادات">⚙️</button><button class="cs-rb" data-cs="sound" title="الصوت" aria-label="الصوت">🔊</button></div>
    <aside class="cs-list" aria-label="الشخصيات"><button class="cs-ar up" data-cs="up" aria-label="لأعلى">▲</button><div class="cs-grid" role="listbox"></div><button class="cs-ar dn" data-cs="dn" aria-label="لأسفل">▼</button></aside>
    <aside class="cs-card" aria-live="polite">
      <div class="cs-head"><div class="cs-nm"><b></b><small></small></div><img class="cs-av" alt=""></div>
      <div class="cs-box"><p class="cs-desc"></p></div>
      <div class="cs-pill"></div>
      <div class="cs-attrs"></div>
      <div class="cs-fit"></div>
      <div class="cs-mini"><button data-cs="name">✏️ اسمي</button><button data-cs="ward">🎨 غيّر لبسي</button></div>
    </aside>
    <div class="cs-hint">👆 اسحب لتدوير الشخصية</div>
    <button class="cs-go" data-cs="go">اختيار الشخصية<span class="pl"></span></button>
    <div class="cs-flash"></div>`;
  document.body.appendChild(root);
  const $ = (s) => root.querySelector(s);
  const grid = $('.cs-grid'), stage = $('.cs-stage');

  // ===================== 3D world =====================
  const scene = new THREE.Scene();
  scene.background = ctex(4, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2f7dff'); gr.addColorStop(0.35, '#63b8ff'); gr.addColorStop(0.62, '#b9a8ff'); gr.addColorStop(1, '#f1b8ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog('#b7a6ff', 26, 64);
  scene.add(new THREE.HemisphereLight('#ffffff', '#a37cff', 1.55));
  const sun = new THREE.DirectionalLight('#fff2dc', 2.3); sun.position.set(4, 9, 7); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 30 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
  scene.add(sun); const rim = new THREE.DirectionalLight('#9fd8ff', 1.1); rim.position.set(-4, 5, -6); scene.add(rim);
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 160);

  // pixel textures (16x16, nearest) for a crisp voxel look
  const rnd = mulberry(11);
  function pix(base, spots, extra) {
    const t = ctex(16, 16, (g) => {
      g.fillStyle = base; g.fillRect(0, 0, 16, 16);
      for (let i = 0; i < 70; i++) { g.fillStyle = spots[(rnd() * spots.length) | 0]; g.fillRect((rnd() * 16) | 0, (rnd() * 16) | 0, 1 + ((rnd() * 2) | 0), 1); }
      if (extra) extra(g);
    });
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapLinearFilter; t.anisotropy = 1; return t;
  }
  const TEX = {
    grass: pix('#5fd34a', ['#7ae65c', '#49b83a', '#8ff06a']),
    side: pix('#9a6a3e', ['#835632', '#b07b4a', '#6e4527'], (g) => { g.fillStyle = '#5fd34a'; g.fillRect(0, 0, 16, 4); g.fillStyle = '#49b83a'; for (let x = 0; x < 16; x += 2) g.fillRect(x, 4, 1, 1 + ((x * 7) % 3)); }),
    tile: pix('#b48cff', ['#a77aff', '#c4a2ff', '#9b6cf5'], (g) => { g.strokeStyle = '#8d5ff0'; g.lineWidth = 1; g.strokeRect(0.5, 0.5, 15, 15); }),
    tile2: pix('#d7c2ff', ['#cbb2ff', '#e2d3ff', '#bfa1ff'], (g) => { g.strokeStyle = '#a985ff'; g.lineWidth = 1; g.strokeRect(0.5, 0.5, 15, 15); }),
    stone: pix('#9b7be0', ['#8a69d4', '#ad90ec', '#7c5bc6'], (g) => { g.fillStyle = '#6f4fbd'; g.fillRect(0, 7, 16, 1); g.fillRect(7, 0, 1, 7); g.fillRect(3, 8, 1, 8); }),
    roof: pix('#ff6fb8', ['#ff86c6', '#f055a6', '#ffa0d4']),
    bark: pix('#8a5a34', ['#734826', '#a06a3d', '#5f3a1e']),
    leaf: pix('#3ec95a', ['#56dd6e', '#2fb04a', '#7ae68a', '#269640']),
    leaf2: pix('#7bd640', ['#94e85a', '#64bb32', '#a8f07a']),
    gold: pix('#ffd23f', ['#ffe27a', '#ffbf1a', '#fff0a8']),
    chest: pix('#a8693a', ['#8d5530', '#bd7c48', '#7a4826'], (g) => { g.fillStyle = '#5a3418'; g.fillRect(0, 7, 16, 2); }),
  };
  const MATS = {};
  const tm = (k, extra) => MATS[k + (extra ? JSON.stringify(extra) : '')] || (MATS[k + (extra ? JSON.stringify(extra) : '')] = new THREE.MeshToonMaterial(Object.assign({ map: TEX[k] }, extra || {})));
  // merge many boxes per material into one mesh: boxes = [x, y, z, w, h, d, materialKey]
  function vox(boxes, parent) {
    const by = {};
    for (const [x, y, z, w, h, d, k] of boxes) { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); (by[k] = by[k] || []).push(g); }
    const grp = new THREE.Group();
    for (const k in by) { const m = new THREE.Mesh(mergeGeometries(by[k]), k[0] === '#' ? toon(k) : tm(k)); m.receiveShadow = true; grp.add(m); }
    (parent || scene).add(grp); return grp;
  }
  const world = new THREE.Group(); scene.add(world);

  // floor: purple tiles around the platform, grass blocks further out
  const F = [];
  for (let x = -20; x <= 20; x++) for (let z = -22; z <= 7; z++) {
    const r = Math.hypot(x * 0.75, z); if (r > 22) continue;
    const path = Math.abs(x) <= 4 && z >= -6 || r < 4.6;
    const water = x <= -6 && x >= -11 && z <= -11 && z >= -15;
    if (water) { F.push([x, -0.75, z, 1, 0.5, 1, 'side']); continue; }
    if (path) F.push([x, -0.2, z, 1, 0.4, 1, (x + z) & 1 ? 'tile' : 'tile2']);
    else { const h = 0.4 + ((x * 3 + z * 5) % 3 === 0 ? 0.5 : 0); F.push([x, -0.4 + h / 2, z, 1, h, 1, 'side']); F.push([x, h - 0.38, z, 1.001, 0.04, 1.001, 'grass']); }
  }
  vox(F, world);
  // water pool + waterfall from the castle cliff
  const waterTex = ctex(32, 64, (g, w, h) => { g.fillStyle = '#4cc9ff'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = i % 3 ? 'rgba(255,255,255,.55)' : '#9fe8ff'; g.fillRect((i * 7) % w, (i * 13) % h, 2, 6 + (i % 5) * 2); } }, true);
  waterTex.magFilter = THREE.NearestFilter;
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshToonMaterial({ color: '#5fd2ff', map: waterTex, transparent: true, opacity: 0.88 }));
  pool.rotation.x = -Math.PI / 2; pool.scale.set(1, 5 / 6, 1); pool.position.set(-8.5, -0.32, -13); world.add(pool);
  const fallTex = waterTex.clone(); fallTex.needsUpdate = true; fallTex.repeat.set(1, 2);
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 7.4), new THREE.MeshBasicMaterial({ map: fallTex, transparent: true, opacity: 0.92 })); fall.position.set(-8.2, 3.1, -16.45); fall.scale.set(0.52, 0.52, 1); fall.position.set(-8.2 * 0.52 - 3.4, 3.1 * 0.52, -16.45 * 0.52 - 9); world.add(fall);

  // castle (left, back) with a LOLO sign
  const C = [];
  const tower = (x, z, h, w) => { for (let y = 0; y < h; y++) C.push([x, y + 0.5, z, w, 1, w, 'stone']); for (let i = -1; i <= 1; i += 2) for (let j = -1; j <= 1; j += 2) C.push([x + i * (w / 2 - 0.25), h + 0.3, z + j * (w / 2 - 0.25), 0.5, 0.6, 0.5, 'stone']); };
  tower(-12, -17, 7, 2.6); tower(-5, -18, 6, 2.2); tower(-9, -19.5, 9, 2.4);
  for (let x = -11; x <= -6; x += 1) for (let y = 0; y < 6; y++) if (x < -9 || x > -7.5 || y > 4) C.push([x, y + 0.5, -17.4, 1, 1, 1.2, 'stone']);
  const castle = new THREE.Group(); world.add(castle); vox(C, castle);
  for (const [x, z, h, w] of [[-12, -17, 7, 2.6], [-5, -18, 6, 2.2], [-9, -19.5, 9, 2.4]]) {
    const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.78, 2.4, 4), tm('roof')); roof.position.set(x, h + 1.8, z); roof.rotation.y = Math.PI / 4; castle.add(roof);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.05), toon('#ffd23f')); flag.position.set(x + 0.3, h + 3.3, z); castle.add(flag);
  }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.1), new THREE.MeshBasicMaterial({ map: ctex(256, 84, (g, w, h) => { g.fillStyle = '#7a3cf0'; roundRect(g, 4, 4, w - 8, h - 8, 18); g.fill(); g.lineWidth = 6; g.strokeStyle = '#ffd23f'; g.stroke(); g.font = '900 58px LoloBaloo, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 8; g.strokeStyle = '#4a14b0'; g.strokeText('LOLO', w / 2, h / 2 + 3); g.fillStyle = '#ffd23f'; g.fillText('LOLO', w / 2, h / 2 + 3); }), transparent: true }));
  sign.position.set(-8.6, 5.3, -16.75); castle.add(sign);
  castle.scale.setScalar(0.52); castle.position.set(-3.4, 0, -9);

  // portal (right, back)
  const P = [];
  for (let y = 0; y < 6; y++) { P.push([6, y + 0.5, -17, 1, 1, 1, 'stone']); P.push([10, y + 0.5, -17, 1, 1, 1, 'stone']); }
  for (let x = 6; x <= 10; x++) P.push([x, 6.5, -17, 1, 1, 1, 'stone']); P.push([5.2, 0.5, -17, 0.8, 1, 1.4, 'stone'], [10.8, 0.5, -17, 0.8, 1, 1.4, 'stone']);
  const gate = new THREE.Group(); world.add(gate); vox(P, gate);
  const portalTex = ctex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.25, '#9ff4ff'); gr.addColorStop(0.6, '#b25cff'); gr.addColorStop(1, 'rgba(120,40,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(w / 2, h / 2, 10 + i * 10, i, i + 2.2); g.stroke(); } });
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 5.4), new THREE.MeshBasicMaterial({ map: portalTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  portal.position.set(8, 3.2, -16.9); gate.add(portal); gate.scale.setScalar(0.7); gate.position.set(2.4, 0, -5.1);

  // blocky trees
  function tree(x, z, s = 1, k = 'leaf') { s *= 0.72;
    const B = []; const h = Math.round(3 * s);
    for (let y = 0; y < h; y++) B.push([x, y + 0.5, z, 0.8, 1, 0.8, 'bark']);
    for (const [dx, dy, dz, w] of [[0, h + 0.6, 0, 2.6], [0, h + 1.8, 0, 1.8], [1, h + 0.2, 0.6, 1.4], [-1, h + 0.4, -0.5, 1.4], [0.4, h + 1.0, -1, 1.2]]) B.push([x + dx * s, dy, z + dz * s, w * s, w * s * 0.9, w * s, k]);
    vox(B, world);
  }
  tree(-10, -5, 1.2); tree(-12.5, 1, 0.9, 'leaf2'); tree(10.5, -6, 1.2, 'leaf2'); tree(12.5, 0.5, 0.9); tree(14, -13, 1.1); tree(-15.5, -12, 1, 'leaf2'); tree(4.2, -20, 0.8, 'leaf2'); tree(-2.2, -21, 0.7); tree(-4.8, -9, 0.7, 'leaf2'); tree(5.2, -10, 0.75);

  // floating islands in the sky (they bob)
  const islands = [];
  for (const [x, y, z, s] of [[-3.5, 6.2, -22, 1.1], [7.5, 7.2, -24, 1.3], [12, 5.2, -17, 0.8], [-11, 6.8, -20, 0.9], [1.8, 8.6, -30, 0.9]]) {
    const g = new THREE.Group(); const B = [];
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { B.push([i * s, 0, j * s, s, s, s, 'side']); B.push([i * s, s / 2 + 0.02, j * s, s * 1.001, 0.04, s * 1.001, 'grass']); }
    B.push([0, -s, 0, s, s, s, 'side']); B.push([s * 0.6, -s * 1.6, 0, s * 0.5, s * 0.6, s * 0.5, 'side']);
    vox(B, g); g.position.set(x, y, z); world.add(g);
    const t = new THREE.Group(); const T = [[0, s, 0, 0.4 * s, s, 0.4 * s, 'bark'], [0, s * 1.9, 0, 1.3 * s, 1.1 * s, 1.3 * s, 'leaf']]; vox(T, t); t.position.x = -0.5 * s; g.add(t);
    islands.push({ g, y, p: x });
  }
  // clouds
  const clouds = [];
  for (let i = 0; i < 7; i++) { const g = new THREE.Group(); const B = []; const n = 3 + (i % 3); for (let k = 0; k < n; k++) B.push([k * 1.2 - n * 0.6, (k % 2) * 0.5, (k % 3) * 0.4, 1.6, 1.1, 1.4, '#ffffff']); vox(B, g); g.position.set(-22 + i * 7.5, 8.5 + (i % 3) * 1.6, -34 - (i % 2) * 6); world.add(g); clouds.push(g); }

  // golden stars on little grass blocks + a treasure chest and pickaxe (front right)
  const starShape = new THREE.Shape(); for (let i = 0; i <= 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.2 : 0.45; i ? starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.14, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1 }); starGeo.center();
  const starMat = toon('#ffd23f', { emissive: '#ffa000', emissiveIntensity: 0.45 });
  const stars = [];
  for (const [x, z] of [[-4.2, -2.5], [4.6, -3.5], [-6.5, 1.5], [2.6, -8.5], [-2.2, -10]]) { vox([[x, 0.25, z, 0.9, 0.5, 0.9, 'side'], [x, 0.52, z, 0.92, 0.05, 0.92, 'grass']], world); const s = new THREE.Mesh(starGeo, starMat); s.scale.setScalar(0.8); s.position.set(x, 1.15, z); world.add(s); stars.push(s); }
  vox([[6.2, 0.45, 1.6, 1.6, 0.9, 1.1, 'chest'], [6.2, 1.05, 1.6, 1.65, 0.35, 1.15, 'chest'], [6.2, 0.75, 2.17, 0.24, 0.32, 0.06, 'gold'], [5.4, 0.6, 1.6, 0.06, 1.2, 1.15, 'gold'], [7.0, 0.6, 1.6, 0.06, 1.2, 1.15, 'gold']], world);
  const pick = new THREE.Group(); vox([[0, 0, 0, 0.14, 1.6, 0.14, 'bark'], [0, 0.75, 0, 1.1, 0.2, 0.18, '#3fe0e8'], [0.55, 0.65, 0, 0.18, 0.3, 0.18, '#3fe0e8'], [-0.55, 0.65, 0, 0.18, 0.3, 0.18, '#3fe0e8']], pick);
  pick.position.set(4.6, 0.9, 2.3); pick.rotation.set(0.2, -0.6, 0.9); world.add(pick);

  // the glowing platform
  const plat = new THREE.Group(); scene.add(plat);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.42, 0.46, 48), toon('#f3edff')); base.position.y = 0.23; base.receiveShadow = true; plat.add(base);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(1.43, 1.43, 0.12, 48, 1, true), new THREE.MeshBasicMaterial({ color: '#ff4fc8' })); band.position.y = 0.12; plat.add(band);
  const glowTex = ctex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const ringTex = ctex(256, 256, (g, w, h) => { g.strokeStyle = '#fff'; g.lineWidth = 10; g.shadowColor = '#fff'; g.shadowBlur = 18; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 22, 0, Math.PI * 2); g.stroke(); g.lineWidth = 3; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 44, 0, Math.PI * 2); g.stroke(); });
  const addMat = (map, c, op) => new THREE.MeshBasicMaterial({ map, color: c, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false });
  const glowFloor = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.2), addMat(glowTex, '#ff4fc8', 0.9)); glowFloor.rotation.x = -Math.PI / 2; glowFloor.position.y = 0.03; plat.add(glowFloor);
  const ringTop = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 2.7), addMat(ringTex, '#ff4fc8', 1)); ringTop.rotation.x = -Math.PI / 2; ringTop.position.y = 0.47; plat.add(ringTop);
  const beamTex = ctex(4, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,.5)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.25, 3.4, 40, 1, true), addMat(beamTex, '#ff4fc8', 0.55)); beam.position.y = 2.15; plat.add(beam);
  const motes = []; const moteMat = addMat(glowTex, '#ffffff', 1);
  for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), moteMat); m.userData = { a: (i / 18) * Math.PI * 2, r: 0.7 + (i % 4) * 0.13, y: (i * 0.37) % 3, v: 0.4 + (i % 5) * 0.12 }; plat.add(m); motes.push(m); }
  const platCol = new THREE.Color('#ff4fc8'), platTarget = new THREE.Color('#ff4fc8');

  // confetti for the "choose" moment
  const confN = 90, conf = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 0.09, 0.03), new THREE.MeshBasicMaterial({ color: '#ffffff' }), confN);
  conf.instanceMatrix.setUsage(THREE.DynamicDrawUsage); conf.frustumCulled = false; conf.visible = false; scene.add(conf);
  const confP = []; const CC = ['#ffd23f', '#ff4fc8', '#2fb8ff', '#7cf04a', '#c05cff', '#ff7a1a'];
  for (let i = 0; i < confN; i++) { conf.setColorAt(i, new THREE.Color(CC[i % CC.length])); confP.push({ p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Euler(), s: 1 }); }
  const dummy = new THREE.Object3D();

  // ===================== state =====================
  const CS = { on: false, cur: -1, kid: null, out: null, inT: 1, outT: 1, yaw: 0.3, yawV: 0, drag: null, lastDrag: -9, wave: 0, nextWave: 6, hop: 0, choosing: false, confT: 0, camKick: 0, thumbs: {}, hint: true };

  // ===================== thumbnails (real 3D renders of each look) =====================
  const thumbScene = new THREE.Scene();
  thumbScene.add(new THREE.HemisphereLight('#ffffff', '#b48cff', 1.8)); const td = new THREE.DirectionalLight('#fff4e0', 2.2); td.position.set(2, 3, 4); thumbScene.add(td);
  const thumbCam = new THREE.PerspectiveCamera(26, 1, 0.1, 20); thumbCam.position.set(0.55, 1.66, 3.15); thumbCam.lookAt(0, 1.58, 0);
  let RT = null, RT8 = null;
  // render one look off-screen; half-float when the device can read it back, 8-bit otherwise
  function renderLook(i, half) {
    const S = 200;
    if (half && !RT) RT = new THREE.WebGLRenderTarget(S, S, { type: THREE.HalfFloatType, samples: 4 });
    if (!half && !RT8) RT8 = new THREE.WebGLRenderTarget(S, S, { samples: 4 });
    const rt = half ? RT : RT8;
    const k = AV.makeAvatar(o.look(i)); k.rotation.y = -0.38; pose(k, 0, true); thumbScene.add(k);
    const prevT = renderer.getRenderTarget(), prevC = new THREE.Color(), prevA = renderer.getClearAlpha(); renderer.getClearColor(prevC);
    renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(thumbScene, thumbCam);
    const buf = half ? new Uint16Array(S * S * 4) : new Uint8Array(S * S * 4); renderer.readRenderTargetPixels(rt, 0, 0, S, S, buf);
    renderer.setRenderTarget(prevT); renderer.setClearColor(prevC, prevA); thumbScene.remove(k);
    const f = half ? THREE.DataUtils.fromHalfFloat : (v) => v / 255;
    let any = false; for (let n = 3; n < buf.length; n += 4) if (buf[n]) { any = true; break; }
    return any ? { S, buf, f } : null;
  }
  function makeThumb(i) {
    let r = null; try { r = renderLook(i, true); } catch (e) { r = null; }
    if (!r) r = renderLook(i, false);
    if (!r) return '';
    const { S, buf, f } = r;
    const cv = document.createElement('canvas'); cv.width = cv.height = S; const cx = cv.getContext('2d'), img = cx.createImageData(S, S), out = img.data;
    const exp = renderer.toneMappingExposure || 1;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const si = ((S - 1 - y) * S + x) * 4, di = (y * S + x) * 4; const a = f(buf[si + 3]); if (a <= 0.002) { out[di + 3] = 0; continue; }
      const c = neutral(f(buf[si]) / a * exp, f(buf[si + 1]) / a * exp, f(buf[si + 2]) / a * exp);
      out[di] = srgb(c[0]); out[di + 1] = srgb(c[1]); out[di + 2] = srgb(c[2]); out[di + 3] = Math.min(255, a * 255 + 0.5);
    }
    cx.putImageData(img, 0, 0); return cv.toDataURL('image/png');
  }
  function thumb(i) { if (!CS.thumbs[i]) { try { CS.thumbs[i] = makeThumb(i); } catch (e) { console.warn('thumb', e); CS.thumbs[i] = ''; } } return CS.thumbs[i]; }
  function dropThumb(i) { delete CS.thumbs[i]; }

  // ===================== UI =====================
  function tileStyle(i) { const t = (CS_INFO[i] || {}).tile || ['#c8b0ff', '#8b5cf6']; return `--g:linear-gradient(160deg,${t[0]},${t[1]})`; }
  function renderList() {
    grid.innerHTML = CS_ORDER.map((i) => `<button class="cs-t${i === CS.cur ? ' sel' : ''}" role="option" aria-selected="${i === CS.cur}" data-ci="${i}" style="${tileStyle(i)}" aria-label="${esc(o.name(i))}"><img src="${thumb(i)}" alt="">${i >= 10 ? '<span class="nw">جديد</span>' : ''}</button>`).join('');
    arrows();
  }
  function markSel() { grid.querySelectorAll('.cs-t').forEach((b) => { const on = +b.dataset.ci === CS.cur; b.classList.toggle('sel', on); b.setAttribute('aria-selected', on); }); }
  function arrows() {
    const v = getComputedStyle(grid).gridAutoFlow.indexOf('column') > -1;
    const pos = v ? Math.abs(grid.scrollLeft) : grid.scrollTop, max = v ? grid.scrollWidth - grid.clientWidth : grid.scrollHeight - grid.clientHeight;
    $('.cs-ar.up').disabled = pos <= 2; $('.cs-ar.dn').disabled = pos >= max - 2;
  }
  grid.addEventListener('scroll', arrows, { passive: true });
  function renderCard() {
    const i = CS.cur, info = CS_INFO[i] || { role: '', desc: '', attrs: [], tile: ['#c8b0ff', '#8b5cf6'] }, L = o.look(i), girl = L.g === 'girl';
    $('.cs-nm b').textContent = o.name(i); $('.cs-nm small').textContent = info.role;
    const av = $('.cs-av'); av.src = thumb(i); av.style.cssText = tileStyle(i);
    $('.cs-desc').textContent = info.desc; $('.cs-pill').textContent = girl ? 'مميزاتها' : 'مميزاته';
    const tints = ['#efe4ff', '#e3f4ff', '#fff2cf'];
    $('.cs-attrs').innerHTML = info.attrs.map((a, n) => `<div class="cs-attr" style="--c:${tints[n % 3]}"><i>${a[0]}</i>${esc(a[1])}</div>`).join('');
    // outfit & accessories of the current look
    const slots = L.dress && L.dress !== 'none' ? ['hair', 'dress', 'shoes', 'hat', 'glasses', 'bag'] : ['hair', 'top', 'bottom', 'shoes', 'hat', 'glasses', 'bag'];
    $('.cs-fit').innerHTML = slots.map((s) => { const it = (WARD[s] || []).find((x) => x.id === L[s]); return it && it.id !== 'none' ? `<span>${it.i} ${esc(it.n)}</span>` : ''; }).join('');
    $('.cs-mini [data-cs="ward"]').textContent = girl ? '🎨 غيّري لبسي' : '🎨 غيّر لبسي';
  }
  function soundIcon() { const b = $('[data-cs="sound"]'), on = o.soundOn(); b.textContent = on ? '🔊' : '🔇'; b.classList.toggle('off', !on); }

  // ===================== selection & transitions =====================
  function select(i, instant) {
    if (i === CS.cur && CS.kid) return;
    const first = !CS.kid; CS.cur = i; o.setCurrent(i);
    if (CS.kid) { if (CS.out) scene.remove(CS.out); CS.out = CS.kid; CS.outT = 0; }
    CS.kid = AV.makeAvatar(o.look(i)); CS.kid.position.y = 0.46; CS.kid.traverse((m) => { if (m.isMesh) m.castShadow = true; }); scene.add(CS.kid);
    CS.inT = instant ? 1 : 0; CS.wave = 1.6; CS.nextWave = 7; CS.camKick = instant ? 0 : 1; CS.yaw = first ? 0.35 : CS.yaw;
    platTarget.set((CS_INFO[i] || {}).theme || '#ff4fc8'); if (instant || first) platCol.copy(platTarget);
    markSel(); renderCard();
    const t = grid.querySelector(`[data-ci="${i}"]`); if (t && !instant) t.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }
  function step(d) { const k = CS_ORDER.indexOf(CS.cur), n = CS_ORDER[(k + d + CS_ORDER.length) % CS_ORDER.length]; o.sfx.click(); select(n); }
  function choose() {
    if (CS.choosing) return; CS.choosing = true; $('.cs-go').disabled = true; o.sfx.win(); CS.hop = 1.25; CS.wave = 0;
    conf.visible = true; CS.confT = 0;
    confP.forEach((c) => { c.p.set((Math.random() - 0.5) * 0.6, 1.2 + Math.random() * 0.6, (Math.random() - 0.5) * 0.6); c.v.set((Math.random() - 0.5) * 5, 4 + Math.random() * 4, (Math.random() - 0.5) * 3 + 1); c.r.set(Math.random() * 6, Math.random() * 6, Math.random() * 6); });
    setTimeout(() => $('.cs-flash').classList.add('on'), 950);
    setTimeout(() => { $('.cs-flash').classList.remove('on'); CS.choosing = false; $('.cs-go').disabled = false; conf.visible = false; o.onChoose(CS.cur); }, 1300);
  }

  // input
  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-ci],[data-cs]'); if (!t || !CS.on) return;
    if (t.dataset.ci !== undefined) { const i = +t.dataset.ci; if (i !== CS.cur) { o.sfx.click(); select(i); } return; }
    const a = t.dataset.cs;
    if (a === 'go') choose();
    else if (a === 'up' || a === 'dn') { const v = getComputedStyle(grid).gridAutoFlow.indexOf('column') > -1, s = (a === 'up' ? -1 : 1) * (v ? grid.clientWidth * 0.8 : grid.clientHeight * 0.6); v ? grid.scrollBy({ left: -s }) : grid.scrollBy({ top: s }); o.sfx.click(); }
    else if (a === 'sound') { o.toggleSound(); soundIcon(); o.sfx.click(); }
    else if (a === 'settings') o.openSettings();
    else if (a === 'home') { o.sfx.click(); o.goHome(); }
    else if (a === 'name') o.openName();
    else if (a === 'ward') o.openWard();
  });
  stage.addEventListener('pointerdown', (e) => { CS.drag = e.clientX; CS.yawV = 0; try { stage.setPointerCapture(e.pointerId); } catch (x) {} });
  stage.addEventListener('pointermove', (e) => { if (CS.drag === null) return; const d = (e.clientX - CS.drag) * 0.011; CS.yaw += d; CS.yawV = d * 60; CS.drag = e.clientX; CS.lastDrag = performance.now(); if (CS.hint) { CS.hint = false; $('.cs-hint').classList.add('hide'); } });
  const up = () => (CS.drag = null); stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  addEventListener('keydown', (e) => {
    if (!CS.on || document.querySelector('.ov.on.dim')) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { step(1); e.preventDefault(); } else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { step(-1); e.preventDefault(); } else if (e.key === 'Enter') choose();
  });

  // ===================== animation =====================
  function pose(k, t, still) {
    const P = k.P; if (!P) return;
    P.legs[0].rotation.set(0, 0, 0); P.legs[1].rotation.set(0, 0, 0);
    P.body.position.y = 0.62 + (still ? 0 : Math.sin(t * 2.4) * 0.012); P.body.rotation.set(0, 0, still ? 0 : Math.sin(t * 1.2) * 0.02);
    P.arms[0].rotation.set(still ? 0 : Math.sin(t * 1.7) * 0.05, 0, -0.14 - (still ? 0 : Math.sin(t * 2.4) * 0.03));
    P.arms[1].rotation.set(still ? 0 : -Math.sin(t * 1.7) * 0.05, 0, 0.14 + (still ? 0 : Math.sin(t * 2.4) * 0.03));
    P.head.rotation.set(still ? 0 : Math.sin(t * 1.3) * 0.04, still ? 0 : Math.sin(t * 0.7) * 0.2, 0);
  }
  const ease = (x) => 1 - Math.pow(1 - x, 3), back = (x) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  function layout() {
    // centre the kid in the free space between the two panels and under the logo
    const W = innerWidth, H = innerHeight, l = $('.cs-list').getBoundingClientRect(), c = $('.cs-card').getBoundingClientRect(), g = $('.cs-go').getBoundingClientRect(), lg = $('.cs-logo').getBoundingClientRect();
    const portrait = W <= H;
    const x0 = portrait ? 0 : l.right, x1 = portrait ? W : c.left, y0 = lg.bottom, y1 = portrait ? Math.min(c.top, l.top) : g.top;
    return { cx: ((x0 + x1) / 2 / W) * 2 - 1, cy: 1 - ((y0 + y1) / 2 / H) * 2, fh: Math.max(0.2, (y1 - y0) / H), fw: Math.max(0.2, (x1 - x0) / W) };
  }
  let LAY = null, layT = 0;
  function render(dt, now) {
    const t = now / 1000;
    if (!LAY || (layT -= dt) <= 0) { LAY = layout(); layT = 0.5; }
    // camera: frame the platform + kid (about 2.7 units tall) inside the free area
    const a = innerWidth / innerHeight; cam.aspect = a;
    const halfV = Math.tan((cam.fov * Math.PI) / 360), need = 3.9 / LAY.fh, needW = 4.2 / (LAY.fw * a);
    let dist = Math.max(need, needW) / (2 * halfV); dist = Math.min(Math.max(dist, 6.5), 18);
    CS.camKick = Math.max(0, CS.camKick - dt * 2.2); dist *= 1 - ease(CS.camKick) * 0.06;
    const hw = halfV * dist * a, hh = halfV * dist, ty = 1.3;
    const ox = -LAY.cx * hw, oy = -LAY.cy * hh, sway = Math.sin(t * 0.25) * 0.35;
    cam.position.set(ox + sway, ty + oy + 1.5, dist); cam.lookAt(ox + sway * 0.6, ty + oy, 0); cam.updateProjectionMatrix();
    // platform colour + glow
    platCol.lerp(platTarget, Math.min(1, dt * 4)); band.material.color.copy(platCol); glowFloor.material.color.copy(platCol); ringTop.material.color.copy(platCol); beam.material.color.copy(platCol);
    ringTop.rotation.z += dt * 0.6; glowFloor.material.opacity = 0.75 + Math.sin(t * 2.2) * 0.15; beam.material.opacity = 0.42 + Math.sin(t * 1.7) * 0.1;
    motes.forEach((m) => { const u = m.userData; u.y += dt * u.v; if (u.y > 3.2) u.y = 0; u.a += dt * 0.5; m.position.set(Math.cos(u.a) * u.r, 0.5 + u.y, Math.sin(u.a) * u.r); m.lookAt(cam.position); m.material.opacity = 1; m.scale.setScalar(1 - u.y / 3.4); });
    // kid in / out
    if (CS.out) { CS.outT += dt / 0.28; const k = ease(Math.min(1, CS.outT)); CS.out.scale.setScalar(1 - k); CS.out.rotation.y += dt * 14; CS.out.position.y = 0.46 + k * 0.6; if (CS.outT >= 1) { scene.remove(CS.out); CS.out = null; } }
    const k = CS.kid;
    if (k) {
      if (CS.inT < 1) CS.inT = Math.min(1, CS.inT + dt / 0.42);
      const s = CS.inT < 1 ? Math.max(0.01, back(CS.inT)) : 1; k.scale.setScalar(s);
      // rotation: drag with inertia, then glide back to face the camera
      if (CS.drag === null) { CS.yaw += CS.yawV * dt; CS.yawV *= Math.pow(0.04, dt); if (now - CS.lastDrag > 2600) CS.yaw = angLerp(CS.yaw, 0.32 + Math.sin(t * 0.5) * 0.18, dt * 1.2); }
      k.rotation.y = CS.yaw + (1 - CS.inT) * -2.2;
      pose(k, t, false);
      if ((CS.nextWave -= dt) <= 0) { CS.wave = 1.4; CS.nextWave = 8 + Math.random() * 4; }
      if (CS.wave > 0) { CS.wave -= dt; k.P.arms[1].rotation.set(0, 0, 2.55 + Math.sin(t * 12) * 0.35); }
      if (CS.hop > 0) { CS.hop -= dt; const h = Math.abs(Math.sin((1.25 - CS.hop) * 7.5)); k.position.y = 0.46 + h * 0.55; k.P.arms[0].rotation.set(0, 0, -2.7); k.P.arms[1].rotation.set(0, 0, 2.7); k.P.legs[0].rotation.x = -h * 0.4; k.P.legs[1].rotation.x = h * 0.3; } else k.position.y = 0.46;
    }
    // world life
    stars.forEach((s, n) => { s.rotation.y = t * 1.6 + n; s.position.y = 1.15 + Math.sin(t * 2 + n) * 0.12; });
    islands.forEach((it, n) => { it.g.position.y = it.y + Math.sin(t * 0.6 + n * 1.3) * 0.35; });
    clouds.forEach((c, n) => { c.position.x += dt * (0.3 + (n % 3) * 0.1); if (c.position.x > 30) c.position.x = -30; });
    waterTex.offset.y = -t * 0.25; fallTex.offset.y = t * 1.6; portal.rotation.z = Math.sin(t * 0.8) * 0.05; portal.material.opacity = 0.85 + Math.sin(t * 3) * 0.15;
    if (conf.visible) {
      CS.confT += dt;
      confP.forEach((c, n) => { c.v.y -= 9.8 * dt; c.p.addScaledVector(c.v, dt); c.r.x += dt * 6; c.r.y += dt * 4; dummy.position.copy(c.p); dummy.rotation.copy(c.r); dummy.scale.setScalar(Math.max(0, 1.4 - CS.confT * 0.6)); dummy.updateMatrix(); conf.setMatrixAt(n, dummy.matrix); });
      conf.instanceMatrix.needsUpdate = true;
    }
    renderer.render(scene, cam);
  }

  function open() {
    CS.on = true; root.classList.add('on'); LAY = null; soundIcon();
    const want = CS_ORDER.indexOf(o.current()) > -1 ? o.current() : CS_ORDER[1];
    renderList(); if (CS.kid && CS.cur === want) { renderCard(); markSel(); } else { if (CS.kid) { scene.remove(CS.kid); CS.kid = null; } select(want, true); }
    requestAnimationFrame(() => { const tEl = grid.querySelector('.cs-t.sel'); if (tEl) tEl.scrollIntoView({ block: 'nearest', inline: 'nearest' }); arrows(); });
  }
  function close() { CS.on = false; root.classList.remove('on'); }
  // the look of the current character changed (wardrobe) — rebuild model + thumbnail
  function refresh() {
    dropThumb(CS.cur); if (CS.kid) { scene.remove(CS.kid); CS.kid = null; }
    const i = CS.cur; CS.cur = -1; select(i, true); renderList();
  }
  addEventListener('resize', () => { LAY = null; });

  return { open, close, render, refresh, thumb, dropThumb, get on() { return CS.on; }, get cur() { return CS.cur; } };
}

// ---------- helpers ----------
function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function angLerp(a, b, t) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * Math.min(1, t); }
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function srgb(v) { v = Math.max(0, Math.min(1, v)); return Math.round((v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255); }
// Khronos PBR Neutral tone mapping (same as the game's renderer) — thumbnails are rendered off-screen without it
function neutral(r, g, b) {
  const s = 0.76, de = 0.15, x = Math.min(r, g, b), off = x < 0.08 ? x - 6.25 * x * x : 0.04; r -= off; g -= off; b -= off;
  const p = Math.max(r, g, b); if (p < s) return [r, g, b];
  const d = 1 - s, np = 1 - (d * d) / (p + d - s), k = np / p; r *= k; g *= k; b *= k;
  const m = 1 - 1 / (de * (p - np) + 1); return [r + (np - r) * m, g + (np - g) * m, b + (np - b) * m];
}
function cubeSVG() {
  return `<svg class="cs-cube" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="csT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff07a"/><stop offset="1" stop-color="#ffb81a"/></linearGradient></defs>
  <path d="M50 6 92 28 50 50 8 28Z" fill="url(#csT)" stroke="#5b22c9" stroke-width="5" stroke-linejoin="round"/>
  <path d="M8 28 50 50 50 96 8 72Z" fill="#2f8cff" stroke="#5b22c9" stroke-width="5" stroke-linejoin="round"/>
  <path d="M92 28 50 50 50 96 92 72Z" fill="#ff8a1f" stroke="#5b22c9" stroke-width="5" stroke-linejoin="round"/>
  <path d="M30 17 72 39M29 50l0 34M71 50l0 34" stroke="#ff3f8e" stroke-width="7" stroke-linecap="round" opacity=".9"/>
  <path d="M40 22 58 32" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/></svg>`;
}
