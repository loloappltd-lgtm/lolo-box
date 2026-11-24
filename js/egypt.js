// LOLO BOX — آثار مصر / Egypt's Monuments (LOLO_EGYPT_2026)
// An independent world at EGY_OFF (like the park and the mall), reusing the game's player, camera, collision and avatars.
// Zones around a central plaza: the Grand Egyptian Museum (north), the Giza pyramids + Sphinx (west), Luxor: Karnak,
// the avenue of sphinxes and Luxor temple (east), Aswan: the Nile, feluccas, Philae, Abu Simbel and a Nubian village (south).
// Every monument / artifact has a kid-friendly info card; visiting one stamps the "Egypt passport" and gives coins.
import * as THREE from 'three';
import { mergeGeometries } from './jsm/utils/BufferGeometryUtils.js';

export const EGY_OFF = 9000;

// ---------------- monuments & artifacts (facts kept simple and well established) ----------------
const ZONES = { gem: 'المتحف المصري الكبير', giza: 'أهرامات الجيزة', luxor: 'الأقصر', aswan: 'أسوان' };
const SITES = [
  { id: 'ramses', z: 'gem', i: '🗿', n: 'تمثال رمسيس الثاني', era: 'الدولة الحديثة', f: ['ارتفاعه حوالي 11 متر ووزنه حوالي 83 طن.', 'هو أول حاجة بتستقبلك في بهو المتحف المصري الكبير.', 'الملك رمسيس التاني حكم مصر حوالي 66 سنة.'] },
  { id: 'stairs', z: 'gem', i: '🏛️', n: 'الدرج العظيم', era: 'عصور مختلفة', f: ['درج ضخم على جنبيه تماثيل لملوك وآلهة من عصور مختلفة.', 'لما تطلعه للآخر بتشوف الأهرامات من الشباك الكبير.'] },
  { id: 'mask', z: 'gem', i: '👑', n: 'قناع توت عنخ آمون الذهبي', era: 'الدولة الحديثة', f: ['معمول من الدهب ووزنه حوالي 10 كيلو.', 'اكتشف هوارد كارتر مقبرة الملك توت عنخ آمون سنة 1922 وكانت مليانة كنوز.', 'توت عنخ آمون بقى ملك وهو عنده حوالي 9 سنين بس!'] },
  { id: 'throne', z: 'gem', i: '🪑', n: 'كرسي عرش توت عنخ آمون', era: 'الدولة الحديثة', f: ['كرسي متغطي بالدهب ومزيّن بأحجار ملونة.', 'على ضهره رسمة للملك ومراته الملكة عنخ إسن آمون.'] },
  { id: 'boat', z: 'gem', i: '⛵', n: 'مركب خوفو', era: 'الدولة القديمة', f: ['عمرها أكتر من 4500 سنة ومعمولة من خشب الأرز.', 'طولها حوالي 43 متر، واتلقت مدفونة جنب الهرم الأكبر.', 'اتنقلت للمتحف المصري الكبير سنة 2021.'] },
  { id: 'coffin', z: 'gem', i: '⚱️', n: 'التابوت الملون', era: 'مصر القديمة', f: ['المصريين القدماء كانوا بيزوّقوا التوابيت بألوان ورسومات جميلة.', 'وكانوا بيكتبوا عليها بالهيروغليفي أسماء ودعوات.'] },
  { id: 'hiero', z: 'gem', i: '📜', n: 'الكتابة الهيروغليفية', era: 'مصر القديمة', f: ['كتابة بالصور والرموز، كل رمز ليه معنى أو صوت.', 'العالم شامبليون فك رموزها سنة 1822 بمساعدة حجر رشيد.'] },
  { id: 'khufu', z: 'giza', i: '🔺', n: 'الهرم الأكبر — هرم خوفو', era: 'الدولة القديمة', f: ['اتبنى للملك خوفو من حوالي 4500 سنة.', 'ارتفاعه الأصلي كان حوالي 146 متر.', 'هو الوحيد اللي لسه موجود من عجائب الدنيا السبع القديمة.'] },
  { id: 'khafre', z: 'giza', i: '🔺', n: 'هرم خفرع', era: 'الدولة القديمة', f: ['باين أعلى من هرم خوفو لأنه مبني على أرض أعلى.', 'لسه فوق قمته جزء من الكسوة الحجرية الأصلية.'] },
  { id: 'menkaure', z: 'giza', i: '🔺', n: 'هرم منكاورع', era: 'الدولة القديمة', f: ['أصغر الأهرامات التلاتة الكبيرة في الجيزة.', 'اتبنى للملك منكاورع.'] },
  { id: 'sphinx', z: 'giza', i: '🦁', n: 'أبو الهول', era: 'الدولة القديمة', f: ['جسمه جسم أسد وراسه راس إنسان.', 'طوله حوالي 73 متر وارتفاعه حوالي 20 متر.', 'منحوت في الصخر وبيبص ناحية شروق الشمس.'] },
  { id: 'karnak', z: 'luxor', i: '🏛️', n: 'معابد الكرنك', era: 'الدولة الوسطى والحديثة', f: ['أكبر مجمع معابد قديم في العالم.', 'في قاعة الأعمدة الكبرى 134 عمود ضخم!'] },
  { id: 'obelisk', z: 'luxor', i: '🗼', n: 'المسلة', era: 'الدولة الحديثة', f: ['عمود من حتة حجر واحدة وقمته على شكل هرم صغير.', 'مسلة الملكة حتشبسوت في الكرنك من أطول المسلات في مصر.'] },
  { id: 'avenue', z: 'luxor', i: '🐏', n: 'طريق الكباش', era: 'الدولة الحديثة', f: ['طريق طوله حوالي 2.7 كيلو على جنبيه تماثيل كباش وأبو الهول.', 'بيربط معابد الكرنك بمعبد الأقصر، واتفتح للناس سنة 2021 في احتفال كبير.'] },
  { id: 'luxortemple', z: 'luxor', i: '🏯', n: 'معبد الأقصر', era: 'الدولة الحديثة', f: ['معبد كبير في نص مدينة الأقصر على النيل.', 'قدامه تماثيل للملك رمسيس التاني ومسلة.'] },
  { id: 'abusimbel', z: 'aswan', i: '🗿', n: 'معبد أبو سمبل', era: 'الدولة الحديثة', f: ['بناه الملك رمسيس التاني، وقدامه 4 تماثيل قاعدة طول الواحد حوالي 20 متر.', 'اتنقل بالكامل في الستينات عشان ما يغرقش في بحيرة ناصر.', 'يوم 22 فبراير و22 أكتوبر الشمس بتدخل وتنوّر التماثيل اللي جوه.'] },
  { id: 'philae', z: 'aswan', i: '🏝️', n: 'معبد فيلة', era: 'العصر البطلمي', f: ['معبد الإلهة إيزيس على جزيرة في نهر النيل.', 'اتنقل حجر حجر لجزيرة تانية عشان يتحمى من المية.'] },
  { id: 'felucca', z: 'aswan', i: '⛵', n: 'الفلوكة', era: 'من زمان لحد النهارده', f: ['مركب خشب بشراع أبيض، بيمشي بالهوا في النيل.', 'ركوب الفلوكة في أسوان وقت الغروب من أحلى الحاجات.'] },
  { id: 'nubian', z: 'aswan', i: '🏡', n: 'القرية النوبية', era: 'النوبة', f: ['بيوت ملونة بألوان مبهجة ورسومات على الحيطان.', 'أهل النوبة مشهورين بالكرم والترحيب بالضيوف.'] },
];
const SBY = Object.fromEntries(SITES.map((s) => [s.id, s]));

const CSS = `
.egyUI{position:fixed;inset:0;z-index:25;display:none;font-family:Cairo,Tajawal,"Segoe UI",sans-serif;color:#5a3410}
.egyUI.on{display:block}
.egyUI .dbox{position:absolute;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(94vw,720px);background:linear-gradient(#fffaf0,#ffefcf);border:4px solid #d79a2b;border-radius:24px;box-shadow:0 8px 0 #9a6414,0 16px 40px rgba(0,0,0,.35);padding:12px 14px;display:flex;gap:12px;align-items:flex-start}
.egyUI .dav{width:64px;height:64px;border-radius:18px;background:#ffe6b3;display:grid;place-items:center;font-size:40px;flex:none}
.egyUI .dnm{font-weight:900;color:#a4600f;font-size:15px}.egyUI .dtx{font-weight:800;font-size:clamp(15px,2.8vh,19px);line-height:1.6;margin:2px 0 8px}
.egyUI .dch{display:flex;flex-wrap:wrap;gap:6px}
.egyUI .dch button,.egyUI .row button{border-radius:12px;padding:6px 12px;font-weight:900;font-size:14px;background:#fff;border:3px solid #f0c46a;color:#7a4a0c;font-family:inherit;cursor:pointer}
.egyUI .pan{position:absolute;left:50%;top:12px;bottom:12px;transform:translateX(-50%);width:min(94vw,560px);background:linear-gradient(#fffaf0,#ffefcf);border:4px solid #d79a2b;border-radius:24px;box-shadow:0 8px 0 #9a6414,0 16px 40px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden}
.egyUI .hd{background:linear-gradient(#f0b23a,#c8811a);color:#fff;padding:10px 14px 8px;display:flex;align-items:center;gap:10px}
.egyUI .hd b{flex:1;font-size:clamp(17px,3.2vh,24px);font-weight:900;line-height:1.2}.egyUI .hd small{display:block;font-size:12px;opacity:.95;font-weight:700}
.egyUI .x{width:40px;height:40px;border-radius:50%;background:linear-gradient(#ff7ab8,#e33d8c);color:#fff;font-size:20px;font-weight:900;box-shadow:0 3px 0 #a81f5e;flex:none;border:0}
.egyUI .bd{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px;overscroll-behavior:contain}
.egyUI .big{font-size:64px;text-align:center;line-height:1.1}
.egyUI .fact{background:#fff;border:2px solid #f6dca3;border-radius:14px;padding:8px 12px;font-weight:800;font-size:clamp(14px,2.6vh,17px);line-height:1.6}
.egyUI .era{text-align:center;font-weight:900;color:#a4600f}
.egyUI .stamp{background:#fff4cf;border:3px dashed #d79a2b;border-radius:16px;padding:8px;text-align:center;font-weight:900}
.egyUI .row{display:flex;align-items:center;gap:8px;background:#fff;border-radius:14px;padding:6px 10px;border:2px solid #f6dca3}
.egyUI .row .ic{font-size:26px;width:36px;text-align:center}.egyUI .row .t{flex:1;font-weight:800;font-size:14px}.egyUI .row .t small{display:block;color:#a4600f;font-weight:700}
.egyUI .ok{background:linear-gradient(#6ee37f,#2fb44a);color:#fff;border:0;border-radius:14px;padding:10px;font-weight:900;font-size:17px;font-family:inherit;box-shadow:0 4px 0 #1d7f31;margin:0 12px 12px}
`;

export function buildEgypt(C) {
  const { toon, ctex } = C;
  const OFF = EGY_OFF, B = 168;
  const root = new THREE.Group(); root.position.x = OFF; C.scene.add(root);
  const camBlock = [];
  const st = () => { const S = C.S; if (!S.egypt || typeof S.egypt !== 'object') S.egypt = {}; if (!Array.isArray(S.egypt.stamps)) S.egypt.stamps = []; return S.egypt; };

  // ---------- helpers ----------
  const solid = (x0, x1, z0, z1) => C.solids.push({ x0: OFF + Math.min(x0, x1), x1: OFF + Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) });
  const circ = (x, z, r) => C.circles.push({ x: OFF + x, z, r });
  function vox(list, parent = root, opt = {}) {
    const by = {}; for (const [x, y, z, w, h, d, c] of list) { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); (by[c] = by[c] || []).push(g); }
    for (const c in by) { const m = new THREE.Mesh(mergeGeometries(by[c]), toon(c)); m.castShadow = !!opt.shadow; m.receiveShadow = true; parent.add(m); if (opt.block) camBlock.push(m); }
  }
  function textTex(lines, o = {}) {
    const w = o.w || 512, h = o.h || 128;
    const t = ctex(w, h, (g) => {
      if (o.bg) { g.fillStyle = o.bg; rr(g, 4, 4, w - 8, h - 8, o.r == null ? 22 : o.r); g.fill(); if (o.border) { g.lineWidth = 8; g.strokeStyle = o.border; g.stroke(); } }
      g.textAlign = 'center'; g.textBaseline = 'middle'; const n = lines.length;
      lines.forEach(([tx, px, col, stroke], i) => { g.font = `900 ${px}px Cairo, Tajawal, "Segoe UI", sans-serif`; g.direction = /[؀-ۿ]/.test(tx) ? 'rtl' : 'ltr'; const y = h * (i + 0.5) / n; if (stroke) { g.lineWidth = px * 0.18; g.strokeStyle = stroke; g.lineJoin = 'round'; g.strokeText(tx, w / 2, y); } g.fillStyle = col; g.fillText(tx, w / 2, y); });
    });
    t.anisotropy = 4; return t;
  }
  const sign = (tex, w, h, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
  const pixTex = (base, spots, n = 60, sz = 16, extra) => { const t = ctex(sz, sz, (g) => { g.fillStyle = base; g.fillRect(0, 0, sz, sz); let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < n; i++) { g.fillStyle = spots[(r() * spots.length) | 0]; g.fillRect((r() * sz) | 0, (r() * sz) | 0, 1, 1); } if (extra) extra(g, sz); }); t.magFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const plane = (tex, w, d, x, z, y, rep, mat) => { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(w / rep, d / rep); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat || new THREE.MeshToonMaterial({ map: t })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; root.add(m); return m; };
  const zsign = (title, sub, x, z, ry = 0) => { sign(textTex([[title, 76, '#ffffff', '#6b3a07'], [sub, 40, '#ffe27a']], { w: 1024, h: 260, bg: '#a4600f', border: '#ffd23f', r: 26 }), 9, 2.3, x, 5.2, z, ry); vox([[x - 3.8 * Math.cos(ry), 2, z + 3.8 * Math.sin(ry), 0.4, 4, 0.4, '#6b3a07'], [x + 3.8 * Math.cos(ry), 2, z - 3.8 * Math.sin(ry), 0.4, 4, 0.4, '#6b3a07']]); };

  const T = {
    sand: pixTex('#ead7ad', ['#e0c99b', '#f2e2c0', '#dcc393', '#f0dcb5'], 80),
    stone: pixTex('#d9b57a', ['#cfa96c', '#e2c08a', '#c49c5c'], 40, 16, (g, s) => { g.fillStyle = '#b98f52'; g.fillRect(0, 0, s, 1); g.fillRect(0, 0, 1, s); }),
    road: pixTex('#cfb27f', ['#c4a571', '#d9bd8b'], 40, 16, (g, s) => { g.fillStyle = '#b8955c'; g.fillRect(0, s / 2, s, 1); }),
    marble: pixTex('#efe3cc', ['#e6d7bb', '#f6ecd9', '#e0cfae'], 30, 16, (g, s) => { g.fillStyle = '#d2bd96'; g.fillRect(0, 0, s, 1); g.fillRect(0, 0, 1, s); }),
    grass: pixTex('#6cc04a', ['#7fd35c', '#5aab3c'], 60),
  };
  // ---------- ground, roads, palms ----------
  plane(T.sand, 2 * B + 60, 2 * B + 60, 0, 0, 0, 5);
  plane(T.road, 10, 96, 0, 18, 0.03, 3); plane(T.road, 120, 8, -60, 66, 0.03, 3); plane(T.road, 120, 8, 60, 50, 0.03, 3); plane(T.road, 8, 50, 0, 100, 0.03, 3);
  { const m = new THREE.Mesh(new THREE.CircleGeometry(20, 40), new THREE.MeshToonMaterial({ map: (() => { const t = T.stone.clone(); t.needsUpdate = true; t.repeat.set(10, 10); return t; })() })); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.05, 66); m.receiveShadow = true; root.add(m); }
  const palm = (x, z) => { vox([[x, 2.5, z, 0.6, 5, 0.6, '#8a5a2b'], [x, 5.2, z, 3.2, 0.5, 0.9, '#3ea83a'], [x, 5.2, z, 0.9, 0.5, 3.2, '#3ea83a'], [x, 5.6, z, 2.0, 0.5, 2.0, '#58c04a'], [x + 0.4, 4.7, z, 0.4, 0.4, 0.4, '#7a3a12']], root, { shadow: true }); circ(x, z, 0.45); };
  for (const [x, z] of [[-12, 54], [12, 54], [-12, 80], [12, 80], [-20, 66], [20, 66], [-6, 30], [6, 30], [-6, 6 + 10], [6, 16], [-40, 72], [40, 44], [-90, 90], [90, 90], [-60, 100], [60, 100]]) palm(x, z);

  // ---------- central plaza: big arch sign + map board ----------
  vox([[-11, 6, 86, 2.4, 12, 2.4, '#d9b57a'], [11, 6, 86, 2.4, 12, 2.4, '#d9b57a'], [0, 12.6, 86, 25, 1.6, 2.6, '#c49c5c'], [-11, 12.6, 86, 3, 1.8, 3, '#ffd23f'], [11, 12.6, 86, 3, 1.8, 3, '#ffd23f']], root, { shadow: true, block: true });
  solid(-12.2, -9.8, 84.8, 87.2); solid(9.8, 12.2, 84.8, 87.2);
  sign(textTex([['آثار مصر', 120, '#ffffff', '#6b3a07'], ["EGYPT'S MONUMENTS", 46, '#ffe27a']], { w: 1024, h: 300, bg: '#a4600f', border: '#ffd23f', r: 26 }), 13, 3.8, 0, 15.4, 86.2);
  sign(textTex([['آثار مصر', 120, '#ffffff', '#6b3a07'], ["EGYPT'S MONUMENTS", 46, '#ffe27a']], { w: 1024, h: 300, bg: '#a4600f', border: '#ffd23f', r: 26 }), 13, 3.8, 0, 15.4, 85.8, Math.PI);
  vox([[9, 1.4, 60, 0.4, 2.8, 0.4, '#6b3a07'], [9, 2.6, 60, 4.2, 2.4, 0.3, '#a4600f']], root, { shadow: true }); solid(6.8, 11.2, 59.6, 60.4);
  sign(textTex([['🗺️ خريطة آثار مصر', 54, '#ffffff'], ['اضغط وروح لأي مكان', 34, '#ffe27a']], { w: 512, h: 260, bg: '#6b3a07', border: '#ffd23f', r: 20 }), 3.9, 2.0, 9, 2.6, 60.2);
  // small obelisk + fountain in the plaza
  { const f = new THREE.Mesh(new THREE.CylinderGeometry(5, 5.4, 0.8, 32), toon('#d9b57a')); f.position.set(0, 0.4, 66); root.add(f); const w = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 0.1, 32), new THREE.MeshToonMaterial({ color: '#3fb6ff', emissive: '#1d78c9', emissiveIntensity: 0.3 })); w.position.set(0, 0.82, 66); root.add(w); circ(0, 66, 5.4); }
  const obelisk = (x, z, h, s = 1) => { vox([[x, 0.4 * s, z, 2.4 * s, 0.8 * s, 2.4 * s, '#c49c5c'], [x, h / 2 + 0.6 * s, z, 1.4 * s, h, 1.4 * s, '#d9a75e'], [x, h + 0.9 * s, z, 0.9 * s, 0.6 * s, 0.9 * s, '#ffd23f'], [x, h + 1.3 * s, z, 0.45 * s, 0.35 * s, 0.45 * s, '#ffd23f']], root, { shadow: true, block: true }); for (let i = 0; i < 5; i++) vox([[x, 2 * s + i * h / 6, z + 0.71 * s, 0.6 * s, 0.25 * s, 0.02, '#8a5a2b']]); circ(x, z, 1.4 * s); };
  obelisk(0, 66, 8, 0.7);
  zsign('المتحف المصري الكبير', 'شمال ⬆', 0, 48);

  // ======================= GRAND EGYPTIAN MUSEUM (north) =======================
  // building x -34..34, z -54..10, entrance door x -6..6 on the facade (z 10)
  const GH = 16, GC = '#efe3cc', GS = [];
  const gwall = (x0, z0, x1, z1, h = GH, c = GC) => { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = Math.abs(x1 - x0) || 1, d = Math.abs(z1 - z0) || 1; GS.push([cx, h / 2, cz, w, h, d, c]); solid(cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2); };
  gwall(-34, 10, -6, 10); gwall(6, 10, 34, 10); GS.push([0, (GH + 8) / 2, 10, 12, GH - 8, 1, GC]);
  gwall(-34, -54, 34, -54); gwall(-34, -54, -34, 10); gwall(34, -54, 34, 10);
  vox(GS, root, { block: true });
  // facade: big triangle pattern (like the museum's alabaster facade)
  const tri = ctex(512, 256, (g) => { g.fillStyle = '#efe3cc'; g.fillRect(0, 0, 512, 256); for (let y = 0; y < 4; y++) for (let x = 0; x < 9; x++) { const up = (x + y) % 2 === 0; g.fillStyle = ['#e2cfa8', '#f6ecd9', '#d9c193', '#eadbbd'][(x * 3 + y) % 4]; g.beginPath(); const X = x * 57, Y = y * 64; if (up) { g.moveTo(X, Y + 64); g.lineTo(X + 57, Y + 64); g.lineTo(X + 28, Y); } else { g.moveTo(X, Y); g.lineTo(X + 57, Y); g.lineTo(X + 28, Y + 64); } g.fill(); g.strokeStyle = '#c4a26a'; g.lineWidth = 2; g.stroke(); } });
  for (const [x, w] of [[-20, 27.4], [20, 27.4]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, GH - 0.4), new THREE.MeshToonMaterial({ map: tri })); m.position.set(x, GH / 2, 10.55); root.add(m); }
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(12, GH - 8.4), new THREE.MeshToonMaterial({ map: tri })); m.position.set(0, (GH + 8) / 2, 10.55); root.add(m); }
  sign(textTex([['المتحف المصري الكبير', 92, '#ffffff', '#3b1d05'], ['GRAND EGYPTIAN MUSEUM', 44, '#ffe27a']], { w: 1024, h: 230, bg: '#6b3a07', border: '#ffd23f', r: 20 }), 16, 3.6, 0, 11.6, 10.7);
  { const roof = new THREE.Mesh(new THREE.BoxGeometry(68, 0.4, 64), toon('#d9c193')); roof.position.set(0, GH, -22); root.add(roof); }
  plane(T.marble, 67, 63, 0, -22, 0.05, 3);
  // atrium: Ramses II standing statue on a pedestal
  const ramses = (x, z, s) => { vox([
    [x, 0.8 * s, z, 4 * s, 1.6 * s, 3 * s, '#b98f52'],
    [x - 0.45 * s, 2.9 * s, z + 0.2 * s, 0.75 * s, 2.6 * s, 0.9 * s, '#c9935a'], [x + 0.45 * s, 2.9 * s, z - 0.3 * s, 0.75 * s, 2.6 * s, 0.9 * s, '#c9935a'],
    [x, 4.7 * s, z, 1.9 * s, 1.2 * s, 1.1 * s, '#f1e6c8'], [x, 6.4 * s, z, 2.0 * s, 2.3 * s, 1.0 * s, '#c9935a'],
    [x - 1.25 * s, 6.0 * s, z, 0.5 * s, 2.4 * s, 0.6 * s, '#c9935a'], [x + 1.25 * s, 6.0 * s, z, 0.5 * s, 2.4 * s, 0.6 * s, '#c9935a'],
    [x, 8.1 * s, z, 1.1 * s, 1.1 * s, 1.0 * s, '#c9935a'], [x, 8.3 * s, z - 0.05 * s, 1.5 * s, 1.4 * s, 1.1 * s, '#e7c86a'], [x, 9.3 * s, z, 0.9 * s, 0.8 * s, 0.9 * s, '#f1e6c8'], [x, 7.5 * s, z + 0.5 * s, 0.25 * s, 0.6 * s, 0.2 * s, '#8a5a2b']], root, { shadow: true }); };
  ramses(0, -4, 1.2); solid(-2.4, 2.4, -5.8, -2.2); sign(textTex([['تمثال رمسيس الثاني', 48, '#ffffff']], { w: 512, h: 90, bg: '#6b3a07', border: '#ffd23f', r: 16 }), 3.2, 0.56, 0, 1.0, -2.1);
  // grand staircase (decorative, rope in front) with statues on both sides
  { const S = []; for (let i = 0; i < 14; i++) S.push([0, 0.3 + i * 0.55, -12 - i * 2, 18, 0.6 + i * 1.1 - i * 0.55, 2, i % 2 ? '#e2cfa8' : '#d9c193']); for (let i = 0; i < 14; i++) S[i][4] = 0.6 + i * 0.55, S[i][1] = (0.6 + i * 0.55) / 2;
    for (let i = 1; i < 13; i += 2) for (const sx of [-1, 1]) { const y = 0.6 + i * 0.55, z = -12 - i * 2, x = sx * 7.4; S.push([x, y + 0.6, z, 1.2, 1.2, 1.2, '#a88358'], [x, y + 1.6, z, 0.8, 0.9, 0.7, i % 4 === 1 ? '#7d6a55' : '#b98f52'], [x, y + 2.3, z, 0.6, 0.6, 0.6, i % 4 === 1 ? '#7d6a55' : '#b98f52']); }
    vox(S, root, { shadow: true }); solid(-9, 9, -40, -11);
    vox([[-8.8, 0.55, -10.6, 0.2, 1.1, 0.2, '#ffd23f'], [8.8, 0.55, -10.6, 0.2, 1.1, 0.2, '#ffd23f'], [0, 0.95, -10.6, 17.6, 0.12, 0.12, '#c8203c']]);
    sign(textTex([['الدرج العظيم', 52, '#ffffff']], { w: 512, h: 100, bg: '#6b3a07', border: '#ffd23f', r: 16 }), 3.4, 0.66, 0, 2.2, -10.4); }
  // Tutankhamun hall (west wing x -32..-12)
  sign(textTex([['👑 قاعة توت عنخ آمون', 54, '#ffffff']], { w: 640, h: 110, bg: '#a4600f', border: '#ffd23f', r: 18 }), 6, 1.0, -22, 6.2, -6, 0);
  const glassCase = (x, z, w, d, h = 2.2) => { vox([[x, 0.5, z, w + 0.4, 1, d + 0.4, '#3b2a1a']], root, { shadow: true }); const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshPhongMaterial({ color: '#cfefff', transparent: true, opacity: 0.22, shininess: 120, depthWrite: false })); g.position.set(x, 1 + h / 2, z); root.add(g); solid(x - w / 2 - 0.2, x + w / 2 + 0.2, z - d / 2 - 0.2, z + d / 2 + 0.2); };
  // golden mask
  glassCase(-22, -20, 2.2, 2.2);
  vox([[-22, 1.9, -20, 1.0, 1.3, 0.8, '#f2c234'], [-22, 2.65, -20.05, 1.3, 0.5, 0.85, '#f2c234'], [-22.55, 1.7, -20, 0.25, 1.2, 0.7, '#1f4fb8'], [-21.45, 1.7, -20, 0.25, 1.2, 0.7, '#1f4fb8'], [-22, 1.25, -19.6, 1.3, 0.35, 0.2, '#1f4fb8'], [-22.2, 2.05, -19.58, 0.16, 0.08, 0.04, '#1d1d2b'], [-21.8, 2.05, -19.58, 0.16, 0.08, 0.04, '#1d1d2b'], [-22, 2.95, -19.7, 0.25, 0.25, 0.25, '#f2c234'], [-22, 1.25, -19.95, 0.35, 0.35, 0.5, '#1f4fb8']], root, { shadow: true });
  // golden throne
  glassCase(-22, -32, 2.6, 2.6, 2.6);
  vox([[-22, 1.45, -32, 1.4, 0.15, 1.2, '#f2c234'], [-22, 2.3, -32.55, 1.4, 1.6, 0.15, '#f2c234'], [-22, 2.3, -32.46, 1.0, 1.1, 0.04, '#2f8bff'], [-22.65, 1.2, -31.45, 0.15, 0.8, 0.15, '#f2c234'], [-21.35, 1.2, -31.45, 0.15, 0.8, 0.15, '#f2c234'], [-22.65, 1.2, -32.55, 0.15, 0.8, 0.15, '#f2c234'], [-21.35, 1.2, -32.55, 0.15, 0.8, 0.15, '#f2c234'], [-22.7, 1.85, -32, 0.1, 0.5, 1.2, '#f2c234'], [-21.3, 1.85, -32, 0.1, 0.5, 1.2, '#f2c234']], root, { shadow: true });
  // golden coffin lying in a case
  glassCase(-28, -44, 2.4, 5, 1.6);
  vox([[-28, 1.4, -44, 1.3, 0.8, 4.2, '#f2c234'], [-28, 1.85, -42.3, 1.0, 0.3, 0.7, '#f2c234'], [-28, 1.85, -44.6, 1.1, 0.1, 1.4, '#1f4fb8'], [-28, 1.85, -42.3, 0.7, 0.12, 0.4, '#1f4fb8']], root, { shadow: true });
  // painted coffin standing + hieroglyph wall (west wall)
  vox([[-31.5, 1.6, -30, 1.2, 3.2, 1.0, '#2b6bd6'], [-31.5, 2.9, -29.48, 0.9, 0.7, 0.05, '#f2c234'], [-31.5, 1.6, -29.48, 0.9, 1.4, 0.05, '#e8213d'], [-31.5, 0.8, -29.48, 0.9, 0.6, 0.05, '#3ec95a']], root, { shadow: true }); solid(-32.2, -30.8, -30.6, -29.4);
  const hiero = ctex(512, 256, (g) => { g.fillStyle = '#e2c48c'; g.fillRect(0, 0, 512, 256); const sy = ['𓂀', '𓃭', '𓅓', '𓆣', '𓋹', '𓇳', '𓊖', '𓁹', '𓃒', '𓆓', '𓏏', '𓂝']; g.fillStyle = '#5a3410'; g.font = '44px "Noto Sans Egyptian Hieroglyphs", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; for (let c = 0; c < 8; c++) { g.fillRect(c * 64, 0, 2, 256); for (let r = 0; r < 4; r++) g.fillText(sy[(c * 5 + r * 3) % sy.length], c * 64 + 32, r * 62 + 32); } });
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), new THREE.MeshToonMaterial({ map: hiero })); m.position.set(33.45, 4, -24); m.rotation.y = -Math.PI / 2; root.add(m); }
  // Khufu boat (east wing x 12..32), long wooden boat on a stand
  { const S = [[22, 0.5, -36, 3.4, 1.0, 22, '#3b2a1a']]; for (let i = 0; i < 20; i++) { const z = -45.5 + i, k = 1 - Math.pow((i - 9.5) / 10.5, 2), w = 0.8 + 1.6 * k; S.push([22, 1.4 + (1 - k) * 0.6, z, w, 0.6, 1.02, '#a06a35']); } S.push([22, 2.4, -36, 0.25, 1.6, 0.25, '#8a5a2b'], [22, 2.0, -38, 1.6, 0.9, 3, '#c8925a'], [22, 2.6, -46.3, 0.3, 1.4, 0.3, '#a06a35'], [22, 2.6, -25.7, 0.3, 1.4, 0.3, '#a06a35']); vox(S, root, { shadow: true }); solid(20.2, 23.8, -47.2, -24.8); }
  sign(textTex([['⛵ مركب خوفو', 54, '#ffffff']], { w: 512, h: 110, bg: '#a4600f', border: '#ffd23f', r: 18 }), 4.4, 0.95, 22, 6, -23.5);
  // painted coffin (east) near the entrance
  vox([[14, 0.5, -6, 1.8, 1.0, 3.4, '#3b2a1a'], [14, 1.35, -6, 1.2, 0.7, 2.8, '#2b6bd6'], [14, 1.72, -5, 0.9, 0.1, 0.8, '#f2c234'], [14, 1.72, -6.4, 0.9, 0.1, 1.2, '#e8213d']], root, { shadow: true }); solid(13, 15, -7.8, -4.2);
  // warm museum lights
  { const lm = new THREE.MeshBasicMaterial({ color: '#fff3d6', toneMapped: false }); for (const x of [-22, 0, 22]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 56), lm); s.position.set(x, GH - 0.25, -22); root.add(s); } }

  // ======================= GIZA PYRAMIDS + SPHINX (west) =======================
  const pyramid = (x, z, base, h, col, cap) => { const L = []; const n = Math.round(h / 1.2); for (let i = 0; i < n; i++) { const w = base * (1 - i / n); L.push([x, 0.6 + i * 1.2, z, w, 1.2, w, i % 2 ? col : shade(col, -12)]); } if (cap) for (let i = Math.floor(n * 0.8); i < n; i++) { const w = base * (1 - i / n) + 0.05; L.push([x, 0.6 + i * 1.2, z, w, 1.22, w, '#f1e6c8']); } vox(L, root, { shadow: true, block: true }); solid(x - base / 2, x + base / 2, z - base / 2, z + base / 2); };
  pyramid(-112, 14, 46, 30, '#d9b57a'); pyramid(-138, -40, 42, 28.8, '#d4ad70', true); pyramid(-120, -84, 24, 16.8, '#cfa96c');
  for (const [x, z] of [[-96, -74], [-100, -70]]) pyramid(x, z, 7, 4.8, '#c49c5c');
  // the Sphinx, facing east (+x)
  { const x = -76, z = 46, S = [];
    S.push([x, 1.6, z, 18, 3.2, 6, '#d8b071'], [x - 7.5, 3.6, z, 3.4, 2.4, 5.6, '#d8b071'], [x + 9.5, 0.9, z - 1.8, 6, 1.8, 1.6, '#cfa96c'], [x + 9.5, 0.9, z + 1.8, 6, 1.8, 1.6, '#cfa96c']);
    S.push([x + 6, 5.6, z, 4.4, 4.8, 4.6, '#d8b071'], [x + 6.2, 6.0, z, 4.8, 5.4, 5.6, '#d2a865'], [x + 8.3, 5.8, z, 0.6, 1.0, 0.8, '#c49c5c'], [x + 8.25, 6.6, z - 0.9, 0.2, 0.35, 0.6, '#6b3a07'], [x + 8.25, 6.6, z + 0.9, 0.2, 0.35, 0.6, '#6b3a07'], [x + 8.25, 5.1, z, 0.2, 0.25, 1.4, '#8a5a2b']);
    for (let i = 0; i < 5; i++) S.push([x + 6.25, 3.8 + i * 0.95, z - 2.85, 4.8, 0.45, 0.1, '#2b6bd6'], [x + 6.25, 3.8 + i * 0.95, z + 2.85, 4.8, 0.45, 0.1, '#2b6bd6']);
    vox(S, root, { shadow: true, block: true }); solid(x - 9.2, x + 12.5, z - 3.2, z + 3.2); }
  zsign('أهرامات الجيزة', '⬅ غرب', -40, 66, Math.PI / 2);
  // camels resting near the pyramids
  const camel = (x, z, ry) => { const g = new THREE.Group(); vox([[0, 1.6, 0, 1.0, 1.1, 2.4, '#c9935a'], [0, 2.3, -0.2, 0.9, 0.7, 0.9, '#b97f45'], [0, 2.6, 1.3, 0.45, 1.4, 0.45, '#c9935a'], [0, 3.3, 1.65, 0.55, 0.5, 0.8, '#c9935a'], [0, 2.4, -0.2, 1.2, 0.2, 1.2, '#e8213d'], ...[[-0.35, -0.9], [0.35, -0.9], [-0.35, 0.9], [0.35, 0.9]].map(([a, b]) => [a, 0.55, b, 0.3, 1.1, 0.3, '#b97f45'])], g, { shadow: true }); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); circ(x, z, 1.3); };
  camel(-84, 70, 0.6); camel(-90, 76, 2.2); camel(-100, 58, -0.4);

  // ======================= LUXOR (east): Karnak, avenue of sphinxes, Luxor temple =======================
  const pylon = (x, z, w, h) => { const L = []; for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { const hh = h / 6; L.push([x + sx * w * 0.3, hh * i + hh / 2, z, w * 0.4 * (1 - i * 0.05), hh, 3.2 - i * 0.15, i % 2 ? '#d9b57a' : '#cfa96c']); } L.push([x, (7 + h * 0.84) / 2, z, w * 0.24, h * 0.84 - 7, 2.6, '#c49c5c'], [x, 7.6, z + 1.32, w * 0.2, 0.8, 0.1, '#2b6bd6']); vox(L, root, { shadow: true, block: true }); solid(x - w * 0.5, x - w * 0.1, z - 1.6, z + 1.6); solid(x + w * 0.1, x + w * 0.5, z - 1.6, z + 1.6); };
  // Karnak: pylon facing south (toward the avenue) + hypostyle hall of columns
  pylon(110, -2, 26, 15);
  { const L = []; for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { const x = 98 + i * 4.8, z = -10 - j * 6; L.push([x, 0.5, z, 3.0, 1.0, 3.0, '#c49c5c'], [x, 6, z, 2.4, 10.4, 2.4, j % 2 ? '#d9b57a' : '#d4ad70'], [x, 11.6, z, 3.4, 0.9, 3.4, '#cfa96c']); for (const y of [3, 5.5, 8]) L.push([x, y, z, 2.5, 0.5, 2.5, ['#2b6bd6', '#e8213d', '#3ec95a'][(i + j) % 3]]); circ(x, z, 1.4); } for (let j = 0; j < 4; j++) L.push([110, 12.4, -10 - j * 6, 28, 0.8, 2.2, '#cfa96c']); vox(L, root, { shadow: true, block: true }); }
  obelisk(92, -12, 18); sign(textTex([['معابد الكرنك', 56, '#ffffff']], { w: 512, h: 110, bg: '#a4600f', border: '#ffd23f', r: 18 }), 4.6, 1.0, 110, 2.4, 1.0);
  // avenue of sphinxes from Karnak (north) to Luxor temple (south), x = 110
  { const L = []; for (let z = 10; z <= 66; z += 4) for (const s of [-1, 1]) { const x = 110 + s * 5; L.push([x, 0.5, z, 1.4, 1.0, 2.6, '#c49c5c'], [x, 1.35, z + 0.4, 1.0, 0.8, 1.6, '#d8b071'], [x, 1.95, z - 0.65, 0.8, 0.9, 0.8, '#d8b071'], [x - s * 0.05, 2.3, z - 0.6, 0.9, 0.3, 0.3, '#cfa96c']); circ(x, z, 1.0); } vox(L, root, { shadow: true }); }
  plane(T.stone, 7, 64, 110, 38, 0.04, 3);
  // Luxor temple: pylon facing north + two seated colossi + an obelisk
  pylon(110, 76, 22, 13);
  const seated = (x, z, s, ry) => { const g = new THREE.Group(); vox([[0, 0.6 * s, 0, 2 * s, 1.2 * s, 2.6 * s, '#b98f52'], [0, 2.0 * s, -0.2 * s, 1.6 * s, 1.6 * s, 1.6 * s, '#c9935a'], [0, 1.6 * s, 0.9 * s, 1.5 * s, 0.4 * s, 1.2 * s, '#c9935a'], [0, 3.4 * s, -0.3 * s, 1.5 * s, 1.4 * s, 1.0 * s, '#c9935a'], [0, 4.6 * s, -0.3 * s, 0.9 * s, 1.0 * s, 0.9 * s, '#c9935a'], [0, 4.7 * s, -0.4 * s, 1.3 * s, 1.1 * s, 0.9 * s, '#e7c86a'], [0, 5.5 * s, -0.3 * s, 0.6 * s, 0.6 * s, 0.6 * s, '#f1e6c8']], g, { shadow: true }); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); circ(x, z, 1.4 * s); };
  seated(104, 70, 1.6, Math.PI); seated(116, 70, 1.6, Math.PI); obelisk(98, 70, 14);
  sign(textTex([['معبد الأقصر', 56, '#ffffff']], { w: 512, h: 110, bg: '#a4600f', border: '#ffd23f', r: 18 }), 4.6, 1.0, 110, 2.4, 73.8, Math.PI);
  zsign('الأقصر', 'شرق ➡', 44, 50, -Math.PI / 2);

  // ======================= ASWAN (south): Nile, feluccas, Philae, Abu Simbel, Nubian village =======================
  const water = new THREE.Mesh(new THREE.PlaneGeometry(2 * B + 60, 40), new THREE.MeshToonMaterial({ color: '#2f9ee8', emissive: '#1460a8', emissiveIntensity: 0.25 })); water.rotation.x = -Math.PI / 2; water.position.set(0, 0.08, 150); root.add(water);
  plane(T.grass, 2 * B + 60, 4, 0, 128, 0.06, 3); solid(-B - 10, B + 10, 131, B + 20);
  vox([[0, 0.4, 130.6, 2 * B, 0.8, 0.6, '#c49c5c']]);
  // Philae on its island
  { const x = 60, z = 150; const isl = new THREE.Mesh(new THREE.CylinderGeometry(11, 12, 1.2, 28), toon('#d8b071')); isl.position.set(x, 0.3, z); root.add(isl); const L = [];
    for (let i = 0; i < 5; i++) L.push([x - 6 + i * 3, 3.6, z + 3, 1.5, 6.4, 1.5, '#e2c48c'], [x - 6 + i * 3, 7, z + 3, 2.2, 0.6, 2.2, '#3ec95a']); L.push([x, 7.6, z + 3, 15, 0.6, 2.4, '#d9b57a'], [x, 4, z - 3, 12, 7.2, 5, '#d9b57a'], [x, 4, z - 0.45, 3, 4.6, 0.2, '#6b3a07']);
    vox(L, root, { shadow: true }); palm(x - 8, z - 5); palm(x + 8, z - 4); }
  // feluccas sailing on the Nile
  const FEL = []; for (let i = 0; i < 4; i++) { const g = new THREE.Group(); vox([[0, 0.4, 0, 1.6, 0.5, 4.2, '#8a5a2b'], [0, 0.7, 0, 1.3, 0.2, 3.8, '#c8925a'], [0, 3.2, 0.2, 0.15, 5, 0.15, '#6b3a07']], g, { shadow: true }); const sail = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 1, 1.8), new THREE.Vector3(0, 6, -0.2), new THREE.Vector3(0, 1, -1.6)]), new THREE.MeshToonMaterial({ color: '#ffffff', side: THREE.DoubleSide })); sail.geometry.computeVertexNormals(); g.add(sail); g.position.set(-120 + i * 70, 0.2, 140 + (i % 2) * 9); g.rotation.y = Math.PI / 2; root.add(g); FEL.push({ g, sp: 2 + i * 0.4, dir: i % 2 ? -1 : 1 }); }
  // dock
  vox([[-10, 0.4, 132, 10, 0.4, 4, '#8a5a2b'], [-14, 0.9, 133.6, 0.3, 1.4, 0.3, '#6b3a07'], [-6, 0.9, 133.6, 0.3, 1.4, 0.3, '#6b3a07']], root, { shadow: true });
  // Abu Simbel: a cliff with four seated colossi, facing north (toward the player)
  { const x = -60, z = 120; vox([[x, 11, z + 6, 46, 22, 10, '#cfa96c'], [x, 23, z + 7, 40, 2, 8, '#c49c5c'], [x, 14, z + 0.6, 36, 2, 1, '#d9b57a'], [x, 3.5, z + 1.05, 3, 7, 0.2, '#3b2a1a']], root, { shadow: true, block: true }); solid(x - 23, x + 23, z + 1, z + 11);
    for (const dx of [-14, -7, 7, 14]) seated(x + dx, z - 1.5, 2.4, Math.PI);
    sign(textTex([['معبد أبو سمبل', 56, '#ffffff']], { w: 512, h: 110, bg: '#a4600f', border: '#ffd23f', r: 18 }), 4.6, 1.0, x, 8.6, z + 1.2, Math.PI); }
  // Nubian village: colourful houses with domes
  { const L = []; const cols = ['#2fc4ff', '#ffd23f', '#ff8fb8', '#7cf04a', '#ff8a1f', '#b277ff'];
    [[22, 104], [32, 108], [42, 104], [26, 118], [38, 118]].forEach(([x, z], i) => { const c = cols[i % cols.length]; L.push([x, 2.2, z, 7, 4.4, 6, c], [x, 4.6, z, 7.4, 0.4, 6.4, '#ffffff'], [x, 1.4, z - 3.05, 1.6, 2.8, 0.15, '#6b3a07'], [x - 2.2, 2.8, z - 3.05, 1.0, 1.0, 0.15, '#ffffff'], [x + 2.2, 2.8, z - 3.05, 1.0, 1.0, 0.15, '#ffffff']); for (let t = 0; t < 6; t++) L.push([x - 3 + t * 1.2, 3.9, z - 3.06, 0.6, 0.3, 0.12, cols[(i + t + 1) % cols.length]]); solid(x - 3.6, x + 3.6, z - 3.1, z + 3.1); });
    vox(L, root, { shadow: true, block: true });
    for (const [x, z] of [[22, 104], [42, 104], [32, 108]]) { const d = new THREE.Mesh(new THREE.SphereGeometry(2.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#ffffff')); d.position.set(x, 4.8, z); root.add(d); } }
  zsign('أسوان', 'جنوب ⬇', 0, 116, Math.PI);

  // ======================= people: guides + tourists =======================
  const NPC = [];
  const UNI = { top: 'polo', print: 'none', bottom: 'pants', dress: 'none', shoes: 'sneakers', hat: 'none', glasses: 'none', bag: 'none' };
  const guideLook = (base, extra, top) => { const L = C.cloneLook(C.PRESETS[base]); Object.assign(L, UNI, extra || {}); L.c = Object.assign({}, L.c, { top: top || '#a4600f', bottom: '#f1e6c8', shoes: '#6b3a07' }); return L; };
  const addNPC = (e) => { const k = C.makeAvatar(e.look); k.scale.setScalar(1.1); k.position.set(OFF + e.x, 0.12, e.z); k.rotation.y = e.yaw; C.scene.add(k); const tag = nameTag(e.nm); tag.position.set(0, 2.55, 0); k.add(tag); const n = Object.assign({ k, seen: false, bub: null, bubT: 0 }, e); NPC.push(n); circ(e.x, e.z, 0.5); };
  [
    { id: 'salma', nm: 'المرشدة سلمى', role: 'مرشدة سياحية', av: '🧕', x: -6, z: 74, yaw: Math.PI, look: guideLook(0, { hair: 'long', hat: 'none' }), hello: 'أهلاً بيك في آثار مصر! 🇪🇬' },
    { id: 'khaled', nm: 'د. خالد', role: 'أمين المتحف', av: '👨‍🏫', x: 6, z: 2, yaw: Math.PI, look: guideLook(3, { glasses: 'round' }, '#1d2030'), hello: 'نورت المتحف المصري الكبير! 🏛️' },
    { id: 'sayed', nm: 'عم سيد الجمّال', role: 'أهرامات الجيزة', av: '🐪', x: -80, z: 66, yaw: Math.PI / 2, look: guideLook(1, { hat: 'cap' }, '#ffffff'), hello: 'أهلاً بالأبطال عند الأهرامات! 🐪' },
    { id: 'mona', nm: 'أبلة منى', role: 'مرشدة الأقصر', av: '👩‍🏫', x: 110, z: 8, yaw: -Math.PI / 2, look: guideLook(2, { hair: 'pony' }), hello: 'الأقصر فيها تلت آثار العالم! 🏛️' },
    { id: 'fatma', nm: 'حاجة فاطمة', role: 'القرية النوبية', av: '👵', x: 32, z: 98, yaw: Math.PI, look: guideLook(0, { hair: 'bun' }, '#2fc4ff'), hello: 'مرحب بيك في النوبة! 🌞' },
  ].forEach(addNPC);
  const VIS = [];
  const loops = [[[-14, 56], [14, 56], [14, 78], [-14, 78]], [[-10, 4], [10, 4], [10, -8], [-10, -8]], [[-70, 60], [-90, 30], [-90, 60]], [[104, 8], [104, 60], [116, 60], [116, 8]], [[-30, 110], [10, 110], [10, 124], [-30, 124]]];
  loops.forEach((loop, i) => { for (let j = 0; j < 2; j++) { const k = C.makeAvatar(C.randomLook((i + j) % 2 ? 'girl' : 'boy')); k.scale.setScalar(j ? 0.9 : 1.05); C.scene.add(k); VIS.push({ k, loop, seg: j, t: 0.4 * j, sp: 1.1 + j * 0.3 }); } });

  // ======================= UI: dialogs, info cards, passport =======================
  const st2 = document.createElement('style'); st2.textContent = CSS; document.head.appendChild(st2);
  const ui = document.createElement('div'); ui.className = 'egyUI'; ui.id = 'egyP'; ui.setAttribute('dir', 'rtl'); document.body.appendChild(ui);
  let uiMode = null;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function openUI(cls, html) { ui.className = 'egyUI on ' + cls; ui.innerHTML = html; uiMode = cls; document.body.classList.add('mallFocus'); C.setPanel('egypt'); }
  function closeUI() { ui.className = 'egyUI'; ui.innerHTML = ''; uiMode = null; document.body.classList.remove('mallFocus'); C.setPanel(null); }
  let CH = [];
  function talk(n, tx, choices) { CH = choices; openUI('dlg', `<div class="dbox"><div class="dav">${n.av}</div><div style="flex:1"><div class="dnm">${esc(n.nm)} · <small>${esc(n.role)}</small></div><div class="dtx">${esc(tx)}</div><div class="dch">${choices.map((c, i) => `<button data-eg="ch" data-v="${i}">${esc(c[0])}</button>`).join('')}</div></div></div>`); n.k.emo = { k: 'wave', t: 1.2 }; C.sfx.pop(); }
  function say(n, tx) { if (n.bub) n.k.remove(n.bub); n.bub = bubbleSprite(tx); n.bub.position.set(0, 3.1, 0); n.k.add(n.bub); n.bubT = 3.2; }
  function openSite(id) {
    const s = SBY[id], m = st(), had = m.stamps.includes(id);
    if (!had) { m.stamps.push(id); C.S.coins = (C.S.coins || 0) + 10; let all = ''; if (m.stamps.length === SITES.length && !m.done) { m.done = 1; C.S.coins += 100; all = '<div class="stamp">🏅 جمعت كل أختام آثار مصر! بقيت «مستكشف آثار مصر» + 🪙 100</div>'; C.sfx.win(); } else C.sfx.coin(); C.save(); C.updPills(); s.__all = all; }
    openUI('card', `<div class="pan"><div class="hd"><b>${esc(s.n)}<small>${esc(ZONES[s.z])}</small></b><button class="x" data-eg="close" aria-label="إغلاق">✕</button></div><div class="bd"><div class="big">${s.i}</div><div class="era">⏳ ${esc(s.era)}</div>
      ${s.f.map((f) => `<div class="fact">✨ ${esc(f)}</div>`).join('')}
      <div class="stamp">${had ? '✅ الختم ده في جواز سفرك' : '🎉 ختم جديد في جواز سفر الآثار + 🪙 10'} · ${m.stamps.length}/${SITES.length}</div>${had ? '' : s.__all || ''}</div><button class="ok" data-eg="close">اتعلمت حاجة جديدة 👍</button></div>`);
  }
  const SPOTS = { gem: { x: 0, z: 16, n: 'المتحف المصري الكبير' }, giza: { x: -70, z: 66, n: 'أهرامات الجيزة' }, luxor: { x: 110, z: 6, n: 'الأقصر — الكرنك' }, aswan: { x: 0, z: 122, n: 'أسوان' }, plaza: { x: 0, z: 76, n: 'ميدان آثار مصر' } };
  function goZone(k) { closeUI(); const s = SPOTS[k]; C.PL.x = OFF + s.x; C.PL.z = s.z; C.PL.y = 0.12; C.PL.vy = 0; C.toast(`📍 ${s.n}`); C.sfx.coin(); }
  function openMap() {
    const m = st(); const cnt = (z) => SITES.filter((s) => s.z === z && m.stamps.includes(s.id)).length + '/' + SITES.filter((s) => s.z === z).length;
    openUI('card', `<div class="pan"><div class="hd"><b>🗺️ خريطة آثار مصر<small>جواز سفر الآثار: ${m.stamps.length}/${SITES.length} ختم</small></b><button class="x" data-eg="close" aria-label="إغلاق">✕</button></div><div class="bd">
      ${[['gem', '🏛️'], ['giza', '🔺'], ['luxor', '🏯'], ['aswan', '⛵'], ['plaza', '⛲']].map(([k, i]) => `<div class="row"><span class="ic">${i}</span><div class="t">${SPOTS[k].n}${ZONES[k] ? `<small>الأختام ${cnt(k)}</small>` : ''}</div><button data-eg="go" data-v="${k}">🚀 روح</button></div>`).join('')}
      <div class="fact">💡 قرّب من أي أثر واضغط عليه عشان تعرف حكايته وتاخد ختم + 🪙 10. اجمع الأختام كلها وخد 🪙 100!</div></div></div>`);
  }
  ui.addEventListener('click', (e) => { const b = e.target.closest('[data-eg]'); if (!b) return; C.sfx.click(); const a = b.dataset.eg, v = b.dataset.v; if (a === 'close') closeUI(); else if (a === 'ch') { const c = CH[+v]; if (c) c[1](); } else if (a === 'go') goZone(v); });
  const SCRIPTS = {
    salma: (n) => talk(n, 'أهلاً بيك في آثار مصر! هنا تقدر تزور المتحف المصري الكبير والأهرامات والأقصر وأسوان. تحب تبدأ بإيه؟', [['🏛️ المتحف الكبير', () => goZone('gem')], ['🔺 الأهرامات', () => goZone('giza')], ['🏯 الأقصر', () => goZone('luxor')], ['⛵ أسوان', () => goZone('aswan')], ['🛂 جواز سفر الآثار', openMap], ['👋 شكرًا', closeUI]]),
    khaled: (n) => talk(n, 'نورت المتحف المصري الكبير، أكبر متحف في العالم لحضارة واحدة! شوف تمثال رمسيس والدرج العظيم وكنوز توت عنخ آمون.', [['👑 قناع توت عنخ آمون', () => openSite('mask')], ['⛵ مركب خوفو', () => openSite('boat')], ['🗿 تمثال رمسيس', () => openSite('ramses')], ['👋 شكرًا', closeUI]]),
    sayed: (n) => talk(n, 'أهلاً يا بطل! دي أهرامات الجيزة، والكبير ده هرم خوفو. ونجمنا التاني أبو الهول هناك بيبص على الشروق 🌅', [['🔺 احكيلي عن الهرم الأكبر', () => openSite('khufu')], ['🦁 أبو الهول', () => openSite('sphinx')], ['👋 شكرًا يا عم سيد', closeUI]]),
    mona: (n) => talk(n, 'أهلاً بيك في الأقصر! قدامك معابد الكرنك، وطريق الكباش بيوصلك لمعبد الأقصر.', [['🏛️ الكرنك', () => openSite('karnak')], ['🐏 طريق الكباش', () => openSite('avenue')], ['🗼 المسلة', () => openSite('obelisk')], ['👋 شكرًا', closeUI]]),
    fatma: (n) => talk(n, 'مرحب بيك في النوبة يا حبيبي! شوف بيوتنا الملونة، وروح شوف معبد أبو سمبل والفلوكة على النيل.', [['🏡 احكيلي عن النوبة', () => openSite('nubian')], ['🗿 أبو سمبل', () => openSite('abusimbel')], ['⛵ الفلوكة', () => openSite('felucca')], ['👋 شكرًا', closeUI]]),
  };
  // where each info card can be opened (local x, z, radius)
  const SITE_PTS = [
    ['ramses', 0, -0.5, 3], ['stairs', 0, -8.8, 3], ['mask', -22, -17.6, 2], ['throne', -22, -29.4, 2], ['coffin', 14, -3.2, 2], ['hiero', 31.6, -24, 3], ['boat', 22, -22.4, 3],
    ['khufu', -86, 14, 4], ['khafre', -114, -40, 4], ['menkaure', -106, -84, 3.5], ['sphinx', -60, 46, 4],
    ['karnak', 110, 3, 3.5], ['obelisk', 92, -8.6, 2.6], ['avenue', 110, 30, 3], ['luxortemple', 110, 70, 3.5],
    ['abusimbel', -60, 112, 4], ['philae', 60, 127, 4], ['felucca', -10, 128.5, 3.5], ['nubian', 32, 100, 3],
  ];
  function interactables() {
    const L = [], o = OFF;
    L.push({ x: o + 9, z: 61.8, r: 3, label: '🗺️ خريطة آثار مصر', act: openMap });
    L.push({ x: o, z: 96, r: 4, label: '🏙️ ارجع للمدينة', act: C.goCity });
    for (const n of NPC) L.push({ x: n.k.position.x, z: n.k.position.z, r: 2.6, label: `💬 كلّم ${n.nm}`, act: () => SCRIPTS[n.id](n) });
    const m = st();
    for (const [id, x, z, r] of SITE_PTS) L.push({ x: o + x, z, r, label: `${m.stamps.includes(id) ? '✅' : '🔎'} ${SBY[id].n}`, act: () => openSite(id) });
    return L;
  }
  function update(dt, now, active) {
    if (!active) return; const t = now / 1000;
    for (const f of FEL) { f.g.position.x += f.dir * f.sp * dt; if (f.g.position.x > B + 20) f.g.position.x = -B - 20; if (f.g.position.x < -B - 20) f.g.position.x = B + 20; f.g.rotation.y = f.dir > 0 ? Math.PI / 2 : -Math.PI / 2; f.g.position.y = 0.2 + Math.sin(t * 1.5 + f.sp) * 0.08; }
    for (const n of NPC) {
      const dx = C.PL.x - n.k.position.x, dz = C.PL.z - n.k.position.z, d = Math.hypot(dx, dz);
      if (d < 6.5) n.k.rotation.y = angLerp(n.k.rotation.y, Math.atan2(dx, dz), dt * 5); else n.k.rotation.y = angLerp(n.k.rotation.y, n.yaw, dt * 2);
      if (d < 5 && !n.seen) { n.seen = true; n.k.emo = { k: 'wave', t: 1.4 }; say(n, n.hello); C.sfx.pop(); } if (d > 14) n.seen = false;
      C.animKid(n.k, 0, dt, false);
      if (n.bub) { n.bubT -= dt; n.bub.material.opacity = Math.min(1, n.bubT); if (n.bubT <= 0) { n.k.remove(n.bub); n.bub = null; } }
    }
    for (const v of VIS) { const a = v.loop[v.seg], b = v.loop[(v.seg + 1) % v.loop.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); v.t += (v.sp * dt) / L; if (v.t >= 1) { v.t = 0; v.seg = (v.seg + 1) % v.loop.length; } const x = a[0] + (b[0] - a[0]) * v.t, z = a[1] + (b[1] - a[1]) * v.t; v.k.position.set(OFF + x, 0.12, z); v.k.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); C.animKid(v.k, v.sp, dt, false); }
  }
  function goal() { const m = st(); return `🇪🇬 آثار مصر<small>جواز سفر الآثار: ${m.stamps.length}/${SITES.length} ختم — قرّب من أي أثر واعرف حكايته</small>`; }
  function drawMap(g, s) {
    g.fillStyle = '#e8c98a'; g.fillRect(-B * s, -B * s, 2 * B * s, 2 * B * s);
    g.fillStyle = '#2f9ee8'; g.fillRect(-B * s, 131 * s, 2 * B * s, 40 * s);
    g.fillStyle = '#cfb27f'; g.fillRect(-5 * s, -30 * s, 10 * s, 96 * s); g.fillRect(-120 * s, 62 * s, 120 * s, 8 * s); g.fillRect(0, 46 * s, 120 * s, 8 * s); g.fillRect(-4 * s, 66 * s, 8 * s, 60 * s);
    g.fillStyle = '#efe3cc'; g.fillRect(-34 * s, -54 * s, 68 * s, 64 * s);
    g.fillStyle = '#c49c5c'; for (const [x, z, b] of [[-112, 14, 46], [-138, -40, 42], [-120, -84, 24]]) { g.beginPath(); g.moveTo((x - b / 2) * s, (z + b / 2) * s); g.lineTo((x + b / 2) * s, (z + b / 2) * s); g.lineTo(x * s, (z - b / 2) * s); g.closePath(); g.fill(); }
    g.fillStyle = '#d8b071'; g.fillRect(-85 * s, 43 * s, 22 * s, 6 * s); g.fillRect(96 * s, -30 * s, 30 * s, 32 * s); g.fillRect(98 * s, 70 * s, 24 * s, 10 * s); g.fillRect(-83 * s, 120 * s, 46 * s, 10 * s);
    g.fillStyle = '#ff8fb8'; g.fillRect(18 * s, 100 * s, 28 * s, 22 * s);
  }
  function onEnter() {}
  function onLeave() { closeUI(); }
  return { root, update, interactables, goal, drawMap, onEnter, onLeave, camBlock, B, OFF, MAPW: 360, SPAWN: { x: OFF, z: 100, yaw: Math.PI }, viewOn: false };
}

// ---------------- small helpers ----------------
function shade(hex, d) { const n = parseInt(hex.slice(1), 16); const c = (v) => Math.max(0, Math.min(255, v + d)); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => c(v).toString(16).padStart(2, '0')).join(''); }
function nameTag(t) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d'); g.fillStyle = 'rgba(107,58,7,.8)'; rr(g, 4, 6, 248, 52, 24); g.fill(); g.font = '900 28px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillStyle = '#fff'; g.fillText(t, 128, 33, 236);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, toneMapped: false })); s.scale.set(1.8, 0.45, 1); s.renderOrder = 5; return s;
}
function bubbleSprite(t) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#ffffff'; rr(g, 4, 4, 504, 100, 30); g.fill(); g.beginPath(); g.moveTo(236, 100); g.lineTo(256, 124); g.lineTo(276, 100); g.fill(); g.lineWidth = 5; g.strokeStyle = '#d79a2b'; rr(g, 4, 4, 504, 100, 30); g.stroke();
  g.font = '900 30px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillStyle = '#6b3a07'; g.fillText(t, 256, 54, 480);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, toneMapped: false })); s.scale.set(3.4, 0.85, 1); s.renderOrder = 6; return s;
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function angLerp(a, b, t) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * Math.min(1, t); }
