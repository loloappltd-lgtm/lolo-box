// LOLO BOX — مصر: the coast (LOLO_EGYPT_COAST_2026). Part of the Egypt world (same EGY_OFF), reached by Lolo Air from
// the Cairo airport kiosk: Hurghada (Grand Aquarium with a walk-through glass tunnel, a tourist submarine ride, the
// dolphin show, the marina), Sinai with Dahab (the Blue Hole + a dive ride, Bedouin camp, the bay walk) and Sharm
// El Sheikh (Naama Bay, Ras Mohammed glass-boat ride, the peace roundabout), and El Alamein on the Mediterranean
// (New Alamein towers, white beach, the war museum). Timed collecting challenges give coins (and gems the first time).
import * as THREE from 'three';
import { mergeGeometries } from './jsm/utils/BufferGeometryUtils.js';

export const COAST_REG = { hurghada: 'الغردقة', sinai: 'دهب وشرم الشيخ', alamein: 'العلمين' };
export const COAST_SITES = [
  { id: 'hurg', r: 'hurghada', i: '🏖️', n: 'الغردقة', d: 'على ساحل البحر الأحمر', f: ['الغردقة كانت زمان قرية صيادين صغيرة، ودلوقتي من أشهر المدن السياحية في مصر.', 'بحرها صافي وفيه شعاب مرجانية ملونة وسمك بكل الألوان.'] },
  { id: 'aquarium', r: 'hurghada', i: '🐠', n: 'أكواريوم الغردقة الكبير', d: 'عالم تحت البحر', f: ['في الأكواريوم بتمشي جوه نفق إزاز، والسمك والقروش بيعوموا حواليك وفوق راسك!', 'البحر الأحمر فيه أكتر من 1000 نوع سمك، ومنهم أنواع مش موجودة في أي بحر تاني.'] },
  { id: 'submarine', r: 'hurghada', i: '🛳️', n: 'الغواصة السياحية', d: 'رحلة تحت المية', f: ['الغواصة بتنزل تحت المية وانت قاعد جوه، وبتشوف الشعاب المرجانية والسمك من الشبابيك المدورة.', 'المرجان كائن حي! مش صخرة ولا نبات، وبيكبر ببطء شديد، علشان كده لازم نحافظ عليه وما نلمسوش.'] },
  { id: 'dolphin', r: 'hurghada', i: '🐬', n: 'عرض الدولفين', d: 'أذكى حيوانات البحر', f: ['الدولفين من أذكى الحيوانات، وبيتنفس هوا من فتحة فوق راسه.', 'الدولفين بيكلم أصحابه بأصوات صفير وطقطقة.'] },
  { id: 'marina', r: 'hurghada', i: '⛵', n: 'مارينا الغردقة', d: 'مرسى اليخوت', f: ['مرسى كبير لليخوت والمراكب، وجنبه ممشى فيه مطاعم ومحلات.', 'من هنا المراكب بتطلع رحلات للجزر والغطس.'] },
  { id: 'dahab', r: 'sinai', i: '🐪', n: 'دهب', d: 'جنوب سيناء', f: ['بيقولوا إن اسمها جاي من لون رملتها الدهبي.', 'مدينة هادية فيها بدو وجمال وكافيهات على البحر.'] },
  { id: 'bluehole', r: 'sinai', i: '🔵', n: 'البلو هول', d: 'الحفرة الزرقا في دهب', f: ['حفرة عميقة جدًا جوه الشعاب المرجانية، عمقها أكتر من 100 متر!', 'لونها أزرق غامق من فوق، وحواليها مرجان وسمك ملون، والغواصين المحترفين بس هم اللي بينزلوا فيها.'] },
  { id: 'bedouin', r: 'sinai', i: '⛺', n: 'خيمة البدو', d: 'كرم الضيافة في سيناء', f: ['البدو عايشين في سيناء من زمان، وبيعرفوا الصحرا والجبال كويس.', 'الجمل بيقدر يمشي أيام في الصحرا من غير ما يشرب كتير، علشان كده بيسموه سفينة الصحرا.'] },
  { id: 'sinaimt', r: 'sinai', i: '⛰️', n: 'جبال سيناء', d: 'أعلى جبال مصر', f: ['جبال سيناء ألوانها أحمر وبني ودهبي، وبتلمع وقت الغروب.', 'في سيناء جبل سانت كاترين، وده أعلى جبل في مصر.'] },
  { id: 'sharm', r: 'sinai', i: '🕊️', n: 'شرم الشيخ — مدينة السلام', d: 'جنوب سيناء', f: ['شرم الشيخ اسمها «مدينة السلام»، وبتستضيف مؤتمرات كبيرة من كل العالم.', 'بتجمع بين جبال سيناء والبحر الأحمر.'] },
  { id: 'naama', r: 'sinai', i: '🏝️', n: 'خليج نعمة', d: 'شرم الشيخ', f: ['من أشهر شواطئ شرم الشيخ، ميته هادية ورملته ناعمة.', 'على الممشى محلات ومطاعم، والناس بتتمشى عليه بالليل.'] },
  { id: 'rasmo', r: 'sinai', i: '🐡', n: 'محمية رأس محمد', d: 'محمية طبيعية من سنة 1983', f: ['أول محمية طبيعية في مصر، عند آخر نقطة في جنوب سيناء.', 'فيها شعاب مرجانية من أجمل الشعاب في العالم، وممنوع فيها الصيد علشان نحمي البحر.'] },
  { id: 'alamein', r: 'alamein', i: '🏙️', n: 'مدينة العلمين الجديدة', d: 'على البحر المتوسط', f: ['مدينة جديدة على البحر المتوسط، فيها أبراج عالية وشواطئ وجامعات.', 'الساحل الشمالي رملته بيضا ومية البحر لونها تركواز.'] },
  { id: 'towers', r: 'alamein', i: '🌆', n: 'أبراج العلمين', d: 'على الشط', f: ['أبراج عالية جنب البحر، ومن فوق تشوف البحر المتوسط كله.', 'جنبها ممشى طويل على الشط للعيلة كلها.'] },
  { id: 'museum', r: 'alamein', i: '🏛️', n: 'متحف العلمين العسكري', d: 'معركة العلمين سنة 1942', f: ['في العلمين حصلت معركة كبيرة في الحرب العالمية التانية سنة 1942.', 'المتحف بيحكي التاريخ ده علشان الناس تتعلم قد إيه السلام مهم.'] },
  { id: 'med', r: 'alamein', i: '🌊', n: 'البحر المتوسط', d: 'الساحل الشمالي', f: ['البحر الأبيض المتوسط بيوصل بين أفريقيا وأوروبا وآسيا.', 'على شطه في مصر مدن كتير زي إسكندرية ومطروح والعلمين.'] },
];
// land rectangles (relative x, z) — the sea is everywhere else around them
const ZONE = { hurghada: [400, 560, 280, 540], sinai: [820, 1080, 0, 520], alamein: [-640, -300, -780, -560] };
const AIR = { cairo: { x: 34, z: 196, n: 'القاهرة', yaw: Math.PI }, hurghada: { x: 420, z: 410, n: 'الغردقة', yaw: -Math.PI / 2 }, dahab: { x: 1000, z: 60, n: 'دهب', yaw: Math.PI / 2 }, sharm: { x: 930, z: 420, n: 'شرم الشيخ', yaw: 0 }, alamein: { x: -320, z: -620, n: 'العلمين', yaw: -Math.PI / 2 } };
const FLY_FACTS = ['✈️ مصر فيها بحرين: البحر الأحمر في الشرق، والبحر المتوسط في الشمال.', '🏜️ أغلب أرض مصر صحرا، والناس عايشة جنب النيل والبحر.', '🐠 البحر الأحمر من أجمل أماكن الغطس في العالم.', '🌴 سيناء بتوصل بين قارة أفريقيا وقارة آسيا.'];
const CSS = `
.egyFly{position:fixed;inset:0;z-index:26;display:none;background:linear-gradient(#5fc8ff,#bfe9ff 60%,#fff3cf);font-family:Cairo,Tajawal,"Segoe UI",sans-serif;overflow:hidden}
.egyFly.on{display:block}
.egyFly .pl{position:absolute;top:34%;left:-120px;font-size:min(22vw,140px);animation:egyPl 2.8s linear forwards;transform:scaleX(-1)}
@keyframes egyPl{to{left:110%}}
.egyFly .cl{position:absolute;font-size:70px;opacity:.9;animation:egyCl 2.8s linear infinite}
@keyframes egyCl{from{transform:translateX(30vw)}to{transform:translateX(-60vw)}}
.egyFly .t{position:absolute;top:14%;left:50%;transform:translateX(-50%);background:#fff;color:#0d4f80;font-weight:900;font-size:clamp(18px,3.4vh,26px);padding:10px 24px;border-radius:999px;border:4px solid #2fa6e8;white-space:nowrap}
.egyFly .f{position:absolute;bottom:18%;left:50%;transform:translateX(-50%);width:min(90vw,600px);background:rgba(255,255,255,.95);color:#0d4f80;font-weight:900;font-size:clamp(15px,2.8vh,19px);padding:10px 16px;border-radius:18px;text-align:center;line-height:1.6}
.egyChal{position:fixed;top:calc(clamp(118px,25vh,170px) + env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:7;display:none;background:linear-gradient(#ffd34d,#ffad0f);color:#5a2c00;font-family:Cairo,Tajawal,sans-serif;font-weight:900;font-size:clamp(15px,3vh,20px);padding:6px 18px;border-radius:999px;border:3px solid #fff;box-shadow:0 4px 0 #c77800;white-space:nowrap}
.egyChal.on{display:block}
`;

export function buildCoast(C, E) {
  const { root, OFF, vox, sign, label, textTex, palm, plane, T, solid, circ, place } = E;
  const toon = C.toon;
  const RIDE_EL = document.createElement('div'); RIDE_EL.className = 'egyRide'; RIDE_EL.setAttribute('dir', 'rtl'); RIDE_EL.innerHTML = '<div class="t"></div><div class="f"></div><div class="bar"><i></i></div><button class="sk" data-ec="skip">⏩ خلّصني</button>'; document.body.appendChild(RIDE_EL);
  const FLY = document.createElement('div'); FLY.className = 'egyFly'; FLY.setAttribute('dir', 'rtl'); document.body.appendChild(FLY);
  const CHUD = document.createElement('div'); CHUD.className = 'egyChal'; document.body.appendChild(CHUD);
  { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }
  const st = () => { const m = E.st(); if (!m.coast || typeof m.coast !== 'object') m.coast = {}; if (!Array.isArray(m.coast.won)) m.coast.won = []; if (!Array.isArray(m.coast.seen)) m.coast.seen = []; return m.coast; };
  const reward = (c, g, msg) => { C.S.coins = (C.S.coins || 0) + c; if (g) C.S.gems = (C.S.gems || 0) + g; C.save(); C.updPills(); if (msg) C.toast(msg); };
  const water = (w, d, x, z, y, col = '#1fa2e0', em = '#0b5fa8') => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshToonMaterial({ color: col, emissive: em, emissiveIntensity: 0.25 })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); root.add(m); return m; };
  const fence = ([x0, x1, z0, z1]) => { solid(x0 - 6, x0, z0 - 6, z1 + 6); solid(x1, x1 + 6, z0 - 6, z1 + 6); solid(x0 - 6, x1 + 6, z0 - 6, z0); solid(x0 - 6, x1 + 6, z1, z1 + 6); };
  const umbrella = (L, x, z, c) => L.push([x, 1.3, z, 0.15, 2.6, 0.15, '#ffffff'], [x, 2.7, z, 2.6, 0.25, 2.6, c], [x, 2.95, z, 1.6, 0.25, 1.6, c], [x + 1.6, 0.3, z, 1, 0.3, 2, '#ffffff']);
  const kiosk = (k) => { const a = AIR[k]; const L = [[a.x, 0.6, a.z, 4, 1.2, 2, '#ffffff'], [a.x, 2.6, a.z, 4.4, 0.3, 2.6, '#2fa6e8'], [a.x - 1.9, 1.9, a.z, 0.2, 1.4, 0.2, '#2fa6e8'], [a.x + 1.9, 1.9, a.z, 0.2, 1.4, 0.2, '#2fa6e8']]; vox(L); solid(a.x - 2, a.x + 2, a.z - 1, a.z + 1); sign(textTex([['✈️ طيارة لولو', 64, '#ffffff', '#0d4f80'], ['Lolo Air', 36, '#d9f2ff']], { w: 600, h: 170, bg: '#2fa6e8', border: '#ffffff', r: 20 }), 4.4, 1.25, a.x, 3.6, a.z + 1.32); };

  // ======================= the seas =======================
  water(1000, 1200, 860, 300, -0.25); // the Red Sea around Hurghada and Sinai
  water(700, 500, -460, -1020, -0.25, '#2cc4d8', '#0f7c96'); // the Mediterranean (turquoise)
  for (const k in ZONE) fence(ZONE[k]);

  // ======================= HURGHADA =======================
  const FISH = [];
  const fishGeo = (() => { const g = new THREE.BoxGeometry(0.7, 0.36, 0.16), t = new THREE.BoxGeometry(0.22, 0.3, 0.06); t.translate(-0.42, 0, 0); const f = new THREE.BoxGeometry(0.2, 0.14, 0.05); f.translate(0, 0.22, 0); return mergeGeometries([g, t, f]); })();
  const FCOL = ['#ffd23f', '#ff7a1a', '#2fc4ff', '#ff4fae', '#7a5cff', '#36e07a', '#ffffff', '#ff3b3b'];
  function school(n, cx, cy, cz, r0, r1, y0, y1, big) { const S = { n, cx, cy, cz, r0, r1, y0, y1, mesh: null, d: [] }; for (let i = 0; i < n; i++) S.d.push({ r: r0 + Math.random() * (r1 - r0), a: Math.random() * 6.28, y: y0 + Math.random() * (y1 - y0), w: (0.25 + Math.random() * 0.35) * (Math.random() < 0.5 ? 1 : -1), s: big ? 3 + Math.random() : 0.8 + Math.random() * 0.8 }); { const g = fishGeo; const m = new THREE.InstancedMesh(g, new THREE.MeshToonMaterial({ color: '#ffffff' }), n); for (let i = 0; i < n; i++) m.setColorAt(i, new THREE.Color(big ? '#8da2b8' : FCOL[i % FCOL.length])); m.frustumCulled = false; root.add(m); S.mesh = m; } FISH.push(S); return S; }
  const dummy = new THREE.Object3D();
  function swim(S, t, dt) { if (!S.mesh) return; for (let i = 0; i < S.n; i++) { const f = S.d[i]; f.a += f.w * dt; dummy.position.set(S.cx + Math.cos(f.a) * f.r, f.y + Math.sin(t * 1.3 + i) * 0.3, S.cz + Math.sin(f.a) * f.r); dummy.rotation.set(0, -f.a - (f.w > 0 ? Math.PI / 2 : -Math.PI / 2) + Math.PI, 0); dummy.scale.setScalar(f.s); dummy.updateMatrix(); S.mesh.setMatrixAt(i, dummy.matrix); } S.mesh.instanceMatrix.needsUpdate = true; }
  const coral = (L, x, y, z, s = 1) => { const c = ['#ff6fa0', '#ff9f43', '#b98cff', '#ffd23f', '#3fd7c4']; for (let i = 0; i < 5; i++) { const a = i * 1.3; L.push([x + Math.cos(a) * s, y + (0.6 + (i % 3) * 0.5) * s, z + Math.sin(a) * s, 0.5 * s, (1.2 + (i % 3)) * s, 0.5 * s, c[(i + Math.round(x)) % c.length]]); } };
  {
    const [x0, x1, z0, z1] = ZONE.hurghada;
    plane(T.sand, x1 - x0, z1 - z0, (x0 + x1) / 2, (z0 + z1) / 2, 0.02, 6);
    plane(T.marble, 20, z1 - z0 - 20, x1 - 10, (z0 + z1) / 2, 0.04, 3); // marina promenade
    const L = [];
    for (let z = z0 + 14; z < z1 - 10; z += 12) { palm(x1 - 21, z); }
    // resort hotels on the west side
    [[412, 300, 18, 12, 9, '#ffb84d'], [412, 330, 18, 12, 12, '#ff8fb8'], [412, 480, 18, 14, 10, '#7fd4ff'], [412, 510, 18, 12, 8, '#b4f07a']].forEach(([x, z, w, d, h, c]) => { L.push([x, h / 2, z, w, h, d, c], [x, h + 0.3, z, w + 0.4, 0.6, d + 0.4, '#ffffff']); for (let f = 1; f < h / 2.6; f++) L.push([x + w / 2 + 0.05, f * 2.6, z, 0.1, 1.2, d * 0.8, '#ffffff'], [x + w / 2 + 0.06, f * 2.6, z, 0.1, 0.9, d * 0.7, '#5fb6ff']); solid(x - w / 2, x + w / 2, z - d / 2, z + d / 2); });
    // marina yachts in the sea
    for (let i = 0; i < 7; i++) { const z = 300 + i * 30, x = 572; L.push([x, 0.3, z, 4, 1.2, 12, '#ffffff'], [x, 1.4, z - 1, 3, 1.2, 6, '#ffffff'], [x, 1.6, z - 1, 3.06, 0.5, 6.06, '#1f4fb8'], [x, 4, z + 2, 0.2, 5, 0.2, '#e8e8e8']); }
    vox(L, root, { shadow: true });
    label('مارينا الغردقة', x1 - 10, 2.6, 300, -Math.PI / 2, 4.4);
    // beach umbrellas + sunbeds (east side, south)
    { const U = []; for (let i = 0; i < 8; i++) umbrella(U, 520 + (i % 2) * 8, 470 + i * 8, ['#ff4fae', '#2fc4ff', '#ffd23f'][i % 3]); vox(U); }
  }
  // Grand Aquarium: a building you walk into, with a glass tunnel and the sea all around it
  const AQ = { x: 470, z: 330 };
  {
    const { x, z } = AQ, W = 40, D = 36, H = 11, x0 = x - W / 2, x1 = x + W / 2, z0 = z - D / 2, z1 = z + D / 2, L = [];
    L.push([x, H / 2, z0, W, H, 1, '#1f6fb8'], [x0, H / 2, z, 1, H, D, '#1f6fb8'], [x1, H / 2, z, 1, H, D, '#1f6fb8'], [(x0 + x - 4) / 2, H / 2, z1, x - 4 - x0, H, 1, '#1f6fb8'], [(x + 4 + x1) / 2, H / 2, z1, x1 - x - 4, H, 1, '#1f6fb8'], [x, H - 1.5, z1, 8, 3, 1, '#1f6fb8'], [x, H + 0.3, z, W + 1, 0.6, D + 1, '#e9f6ff']);
    // facade waves
    for (let i = 0; i < 10; i++) L.push([x0 + 2 + i * 4, H + 1 + Math.sin(i) * 0.6, z1 + 0.3, 3.6, 1.2, 0.6, i % 2 ? '#2fc4ff' : '#ffffff']);
    // inside: dark blue sea walls, sandy floor, corals, the tunnel (glass ribs) running from the door to the back
    L.push([x, 0.05, z, W - 2, 0.1, D - 2, '#e9d6a6'], [x, H / 2, z0 + 0.6, W - 2, H - 0.2, 0.1, '#0e5d9a'], [x0 + 0.6, H / 2, z, 0.1, H - 0.2, D - 2, '#0e5d9a'], [x1 - 0.6, H / 2, z, 0.1, H - 0.2, D - 2, '#0e5d9a'], [x, H - 0.4, z, W - 2, 0.1, D - 2, '#2c86c9']);
    for (let i = 0; i < 9; i++) { const rz = z1 - 3 - i * 3.6; L.push([x - 3.3, 1.6, rz, 0.25, 3.2, 0.25, '#bfe8ff'], [x + 3.3, 1.6, rz, 0.25, 3.2, 0.25, '#bfe8ff'], [x - 2.4, 3.8, rz, 1.6, 0.25, 0.25, '#bfe8ff'], [x + 2.4, 3.8, rz, 1.6, 0.25, 0.25, '#bfe8ff'], [x, 4.4, rz, 3.4, 0.25, 0.25, '#bfe8ff']); }
    for (const [cx, cz] of [[x - 12, z - 10], [x - 8, z + 8], [x + 10, z - 6], [x + 12, z + 10], [x - 15, z + 2], [x + 15, z - 12]]) coral(L, cx, 0, cz, 1.2);
    vox(L, root, { shadow: false, block: true });
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, D - 4, 20, 1, true, -Math.PI / 2, Math.PI), new THREE.MeshBasicMaterial({ color: '#9fe0ff', transparent: true, opacity: 0.18, side: THREE.DoubleSide, toneMapped: false })); glass.rotation.x = Math.PI / 2; glass.rotation.z = Math.PI / 2; glass.rotation.y = 0; glass.position.set(x, 0.4, z + 0.5); glass.rotation.set(Math.PI / 2, 0, 0); glass.rotateY(Math.PI / 2); root.add(glass);
    // walls (with the door gap) and the water on both sides of the tunnel
    solid(x0 - 0.5, x1 + 0.5, z0 - 0.5, z0 + 0.5); solid(x0 - 0.5, x0 + 0.5, z0, z1); solid(x1 - 0.5, x1 + 0.5, z0, z1); solid(x0, x - 4, z1 - 0.5, z1 + 0.5); solid(x + 4, x1, z1 - 0.5, z1 + 0.5);
    solid(x0, x - 3.2, z0, z1 - 1.2); solid(x + 3.2, x1, z0, z1 - 1.2);
    sign(textTex([['🐠 أكواريوم الغردقة الكبير', 70, '#ffffff', '#0d4f80'], ['Hurghada Grand Aquarium', 36, '#d9f2ff']], { w: 900, h: 200, bg: '#1f6fb8', border: '#ffffff', r: 26 }), 14, 3.1, x, H + 3.4, z1 + 0.7);
    school(70, x, 0, z, 5, 15, 1, 9); school(3, x, 0, z, 9, 14, 5, 8, true);
  }
  // the dolphin show: pool, stands, stage
  const DOL = { x: 480, z: 455, dol: [], hoop: null, ball: null };
  {
    const { x, z } = DOL, L = [[x, 0.5, z, 42, 1, 22, '#ffffff']];
    for (let i = 0; i < 4; i++) L.push([x, 0.5 + i * 0.8, z + 13 + i * 1.6, 42, 1 + i * 1.6, 1.6, i % 2 ? '#2fc4ff' : '#ffffff']);
    L.push([x, 3, z - 13, 20, 6, 2, '#1f6fb8'], [x, 6.6, z - 13, 22, 1.2, 2.4, '#ffd23f']);
    vox(L, root, { shadow: true }); water(40, 20, x, z, 1.02, '#3fd0ff', '#1a8fd8');
    solid(x - 21, x + 21, z - 11, z + 11); solid(x - 21, x + 21, z + 12, z + 19.5); solid(x - 11, x + 11, z - 14, z - 12);
    sign(textTex([['🐬 عرض الدولفين', 80, '#ffffff', '#0d4f80'], ['Dolphin Show', 38, '#fff3b0']], { w: 800, h: 200, bg: '#1f6fb8', border: '#ffd23f', r: 26 }), 12, 3, x, 9.2, z - 13);
    const dg = (() => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 2.2, 4, 10), toon('#8fb3cc')); b.rotation.z = Math.PI / 2; g.add(b); const be = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.6, 4, 8), toon('#e9f2f8')); be.rotation.z = Math.PI / 2; be.position.y = -0.2; g.add(be); const fin = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 4), toon('#7aa0bb')); fin.position.set(-0.2, 0.75, 0); g.add(fin); const tail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 1.4), toon('#7aa0bb')); tail.position.set(-1.8, 0, 0); g.add(tail); const nose = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 8), toon('#8fb3cc')); nose.rotation.z = -Math.PI / 2; nose.position.set(1.6, -0.1, 0); g.add(nose); return g; });
    for (let i = 0; i < 3; i++) { const d = dg(); d.position.set(x - 10 + i * 10, 0.6, z); root.add(d); DOL.dol.push(d); }
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.15, 8, 24), toon('#ff4fae')); hoop.position.set(x, 6, z); root.add(hoop); DOL.hoop = hoop;
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 10), toon('#ffd23f')); ball.position.set(x + 10, 1.4, z); root.add(ball); DOL.ball = ball;
  }
  // submarine at the dock + the reef under the sea (east of the marina)
  const SUB = new THREE.Group(); { const b = new THREE.Mesh(new THREE.CapsuleGeometry(1.6, 7, 6, 14), toon('#ffd23f')); b.rotation.z = Math.PI / 2; SUB.add(b); const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 12), toon('#ffd23f')); tw.position.y = 1.8; SUB.add(tw); for (let i = 0; i < 5; i++) { const w = new THREE.Mesh(new THREE.CircleGeometry(0.4, 12), toon('#5fd0ff')); w.position.set(-2.6 + i * 1.3, 0.2, 1.62); SUB.add(w); } SUB.position.set(578, 0.2, 400); root.add(SUB); }
  { const L = []; for (let i = 0; i < 46; i++) { const x = 600 + (i * 37 % 90), z = 380 + (i * 53 % 90); coral(L, x, -16, z, 1.3 + (i % 3) * 0.4); } L.push([645, -16.5, 425, 110, 1, 110, '#e9d6a6'], [660, -14, 440, 3, 4, 14, '#6b4a2a'], [660, -11.5, 440, 1.5, 1.5, 4, '#6b4a2a']); vox(L); school(90, 645, 0, 425, 6, 38, -13, -4); }
  sign(textTex([['🛳️ الغواصة', 70, '#ffffff', '#7a4a0c']], { w: 600, h: 130, bg: '#ffd23f', border: '#ffffff', r: 20 }), 3.4, 0.74, 556, 2.6, 400, -Math.PI / 2);

  // ======================= SINAI: Dahab (north) + Sharm El Sheikh (south) =======================
  {
    const [x0, x1, z0, z1] = ZONE.sinai;
    plane(T.sand, x1 - x0, z1 - z0, (x0 + x1) / 2, (z0 + z1) / 2, 0.02, 6);
    plane(T.road, 8, 300, 1000, 260, 0.04, 4); // the coast road Dahab ↔ Sharm
    const L = [];
    // red mountains on the west
    for (let i = 0; i < 9; i++) { const z = 20 + i * 56, w = 30 + (i % 3) * 8, h = 16 + (i * 7 % 13); for (let k = 0; k < h / 2; k++) { const s = 1 - k / (h / 2) * 0.7; L.push([842 + (i % 2) * 8, k * 2 + 1, z, w * 0.5 * s, 2, w * s, k % 2 ? '#c4643a' : '#b0532e']); } solid(830, 846 + (i % 2) * 8 + w * 0.25, z - w / 2, z + w / 2); }
    // Dahab bay walk: low cafés with cushions by the sea + the Bedouin tent and camels
    for (let i = 0; i < 6; i++) { const z = 30 + i * 22; L.push([1068, 0.15, z, 10, 0.3, 14, '#e8c690'], [1066, 0.5, z - 5, 6, 0.4, 1, '#e8213d'], [1066, 0.5, z + 5, 6, 0.4, 1, '#2b6bd6'], [1068, 0.45, z, 2, 0.3, 2, '#8a5a2b'], [1062.5, 1.6, z, 0.2, 3.2, 0.2, '#8a5a2b'], [1067, 3.2, z, 10, 0.2, 14, '#f5deb3']); }
    L.push([960, 1.5, 120, 10, 3, 7, '#3b2a1a'], [960, 3.2, 120, 10.4, 0.4, 4, '#3b2a1a'], [960, 1.3, 123.6, 3, 2.6, 0.1, '#e8213d'], [962, 0.3, 128, 2, 0.6, 2, '#8a5a2b'], [962, 0.9, 128, 1.2, 0.8, 1.2, '#ff8a1f']);
    solid(955, 965, 116.5, 123.5);
    // lighthouse in Dahab
    L.push([1074, 4, 8, 3, 8, 3, '#ffffff'], [1074, 9, 8, 2.4, 2, 2.4, '#e8213d'], [1074, 10.4, 8, 1.6, 1, 1.6, '#ffe680']); solid(1072.5, 1075.5, 6.5, 9.5);
    // Sharm: Naama Bay beach (south), the peace roundabout with a dove, hotels, Ras Mohammed gate
    for (let i = 0; i < 10; i++) umbrella(L, 880 + i * 16, 506, ['#ff4fae', '#2fc4ff', '#ffd23f', '#36e07a'][i % 4]);
    [[880, 440, 16, 12, 9, '#ffd7a0'], [1050, 440, 16, 14, 12, '#ffffff'], [1050, 470, 16, 12, 8, '#ff8fb8']].forEach(([x, z, w, d, h, c]) => { L.push([x, h / 2, z, w, h, d, c], [x, h + 0.3, z, w + 0.4, 0.6, d + 0.4, '#e3b97a']); for (let f = 1; f < h / 2.6; f++) L.push([x, f * 2.6, z + d / 2 + 0.05, w * 0.8, 1, 0.1, '#5fb6ff']); solid(x - w / 2, x + w / 2, z - d / 2, z + d / 2); });
    L.push([960, 0.4, 380, 10, 0.8, 10, '#36e07a'], [960, 1.6, 380, 1.4, 1.6, 1.4, '#ffffff'], [960, 3.2, 380, 1.2, 1.2, 2.6, '#ffffff'], [959.4, 3.4, 380, 2.4, 0.3, 1, '#ffffff'], [960.6, 3.4, 380, 2.4, 0.3, 1, '#ffffff'], [960, 3.6, 381.6, 0.5, 0.5, 0.6, '#ffd23f']); solid(955, 965, 375, 385);
    L.push([856, 3, 470, 1.6, 6, 1.6, '#c4643a'], [872, 3, 470, 1.6, 6, 1.6, '#c4643a'], [864, 6.4, 470, 18, 1.2, 1.8, '#c4643a']); circ(856, 470, 1); circ(872, 470, 1);
    vox(L, root, { shadow: true, block: true });
    for (const [x, z] of [[940, 470], [990, 470], [1010, 490], [910, 470], [1040, 150], [1040, 60], [990, 30], [1000, 180]]) palm(x, z);
    label('خيمة البدو', 960, 4.2, 123.8, 0, 3.4); label('محمية رأس محمد', 864, 7.8, 470.95, 0, 5); label('دوار السلام', 960, 2.2, 385.1, 0, 3.4); label('خليج نعمة', 930, 3.2, 498, 0, 3.6);
    // camels
    const camel = (x, z, ry) => { const g = new THREE.Group(); vox([[0, 1.6, 0, 1, 1, 2.6, '#d9a75e'], [0, 2.3, 0, 0.9, 0.6, 0.9, '#c8924a'], [0, 2.4, 1.4, 0.4, 1.4, 0.4, '#d9a75e'], [0, 3.1, 1.7, 0.5, 0.5, 0.8, '#d9a75e'], [-0.35, 0.6, -1, 0.25, 1.2, 0.25, '#c8924a'], [0.35, 0.6, -1, 0.25, 1.2, 0.25, '#c8924a'], [-0.35, 0.6, 1, 0.25, 1.2, 0.25, '#c8924a'], [0.35, 0.6, 1, 0.25, 1.2, 0.25, '#c8924a'], [0, 2.85, 0, 1, 0.15, 1.4, '#e8213d']], g, { shadow: true }); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); circ(x, z, 1.4); };
    camel(972, 116, 0.6); camel(976, 128, -0.4);
  }
  // the Blue Hole: a reef flat with a deep blue circle just off the Dahab shore + its underwater walls
  const BH = { x: 1104, z: 92, r: 11 };
  {
    const reef = new THREE.Mesh(new THREE.CircleGeometry(26, 40), toon('#43d3c8')); reef.rotation.x = -Math.PI / 2; reef.position.set(BH.x, -0.2, BH.z); root.add(reef);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(BH.r, 40), new THREE.MeshToonMaterial({ color: '#0b2f8a', emissive: '#06205e', emissiveIntensity: 0.4 })); hole.rotation.x = -Math.PI / 2; hole.position.set(BH.x, -0.15, BH.z); root.add(hole);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(BH.r, BH.r * 0.8, 52, 28, 1, true), new THREE.MeshToonMaterial({ color: '#3d7d9e', emissive: '#123d5a', emissiveIntensity: 0.4, side: THREE.BackSide })); wall.position.set(BH.x, -26.4, BH.z); root.add(wall);
    const L = []; for (let i = 0; i < 26; i++) { const a = i * 0.9, y = -4 - (i * 7 % 40); coral(L, BH.x + Math.cos(a) * (BH.r - 0.8), y, BH.z + Math.sin(a) * (BH.r - 0.8), 0.8); }
    L.push([BH.x + 9.5, -48, BH.z, 1, 8, 7, '#3b4a5a'], [BH.x + 9.5, -44, BH.z, 1, 1, 9, '#55697d']); vox(L);
    school(50, BH.x, 0, BH.z, 3, 8, -36, -3);
    sign(textTex([['🔵 البلو هول', 70, '#ffffff', '#06205e'], ['The Blue Hole', 36, '#bfe8ff']], { w: 600, h: 170, bg: '#0b2f8a', border: '#ffffff', r: 20 }), 4.4, 1.25, 1078, 2.6, 92, -Math.PI / 2);
  }
  // Ras Mohammed reef under the sea, south of Sharm (glass-bottom boat ride)
  { const L = []; for (let i = 0; i < 40; i++) coral(L, 880 + (i * 41 % 110), -12, 560 + (i * 29 % 50), 1.2 + (i % 3) * 0.3); L.push([935, -12.5, 585, 130, 1, 70, '#e9d6a6']); vox(L); school(80, 935, 0, 585, 6, 40, -10, -3); }
  const BOAT = new THREE.Group(); vox([[0, 0.4, 0, 3.4, 1, 9, '#ffffff'], [0, 1.2, 0, 3.5, 0.3, 9.1, '#2fa6e8'], [0, 2.2, 1, 3, 0.2, 5, '#ffd23f'], [-1.4, 1.6, 1, 0.15, 1.6, 0.15, '#ffffff'], [1.4, 1.6, 1, 0.15, 1.6, 0.15, '#ffffff']], BOAT, { shadow: true }); BOAT.position.set(930, 0, 528); root.add(BOAT);

  // ======================= EL ALAMEIN (Mediterranean) =======================
  {
    const [x0, x1, z0, z1] = ZONE.alamein;
    plane(T.sand, x1 - x0, z1 - z0, (x0 + x1) / 2, (z0 + z1) / 2, 0.02, 6);
    const beach = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, 30), toon('#fbf4e2')); beach.rotation.x = -Math.PI / 2; beach.position.set((x0 + x1) / 2, 0.04, z0 + 15); root.add(beach);
    plane(T.marble, x1 - x0 - 20, 10, (x0 + x1) / 2, z0 + 36, 0.05, 3); // corniche walk
    const L = [];
    // New Alamein towers (tall glass towers by the sea)
    [[-580, -716, 9, 56], [-552, -716, 9, 62], [-524, -716, 9, 52], [-470, -712, 10, 44], [-440, -712, 10, 48]].forEach(([x, z, w, h], i) => { L.push([x, h / 2, z, w, h, w, i % 2 ? '#9fd3f2' : '#c7e6f7']); for (let y = 3; y < h; y += 3) L.push([x, y, z - w / 2 - 0.03, w * 0.9, 0.25, 0.05, '#ffffff'], [x, y, z + w / 2 + 0.03, w * 0.9, 0.25, 0.05, '#ffffff']); L.push([x, h + 1, z, w * 0.6, 2, w * 0.6, '#ffffff']); solid(x - w / 2, x + w / 2, z - w / 2, z + w / 2); });
    for (let i = 0; i < 14; i++) umbrella(L, -620 + i * 22, -766, ['#2fc4ff', '#ffffff', '#ffd23f'][i % 3]);
    // war museum + an old tank (a museum exhibit)
    L.push([-370, 3, -640, 24, 6, 14, '#d9c49a'], [-370, 6.3, -640, 25, 0.6, 15, '#b89a6a'], [-370, 2, -632.9, 4, 4, 0.2, '#6b4a2a']); solid(-382, -358, -647, -633);
    L.push([-350, 0.7, -620, 5, 1.2, 3, '#6f7a4a'], [-350, 1.6, -620, 3, 0.8, 2.2, '#7d8856'], [-347.5, 1.7, -620, 3, 0.3, 0.3, '#5c6640'], [-350, 0.4, -621.6, 5.2, 0.8, 0.4, '#333333'], [-350, 0.4, -618.4, 5.2, 0.8, 0.4, '#333333']); solid(-352.6, -347.4, -621.6, -618.4);
    vox(L, root, { shadow: true, block: true });
    for (let i = 0; i < 12; i++) palm(-630 + i * 28, -700);
    label('متحف العلمين العسكري', -370, 7.4, -632.6, 0, 5); label('أبراج العلمين', -552, 3, -711.2, 0, 4); label('البحر المتوسط', -480, 2.4, -778, Math.PI, 4.4);
  }
  kiosk('cairo'); kiosk('hurghada'); kiosk('dahab'); kiosk('sharm'); kiosk('alamein');

  // ======================= guides =======================
  const UNI = { top: 'polo', print: 'none', bottom: 'shorts', dress: 'none', shoes: 'sneakers', hat: 'cap', glasses: 'none', bag: 'none' };
  const look = (base, extra, top) => { const L = C.cloneLook(C.PRESETS[base]); Object.assign(L, UNI, extra || {}); L.c = Object.assign({}, L.c, { top: top || '#2fa6e8', bottom: '#f1e6c8', shoes: '#ffffff' }); return L; };
  const G = [
    { id: 'c_pilot', nm: 'الكابتن طارق', role: 'طيار لولو', av: '🧑‍✈️', x: 38, z: 199, yaw: Math.PI, look: look(1, {}, '#1f4fb8'), hello: 'تطير معايا للبحر؟ ✈️' },
    { id: 'c_hurg', nm: 'الكابتن مروان', role: 'مرشد الغردقة', av: '🤿', x: 426, z: 404, yaw: -Math.PI / 2, look: look(1, {}, '#2fc4ff'), hello: 'أهلاً بيك في الغردقة! 🐠' },
    { id: 'c_dahab', nm: 'سالم البدوي', role: 'مرشد دهب', av: '🧔', x: 1006, z: 64, yaw: Math.PI / 2, look: look(3, { hat: 'none' }, '#ffffff'), hello: 'مرحبا بيك في دهب! 🐪' },
    { id: 'c_sharm', nm: 'المرشدة ليلى', role: 'مرشدة شرم الشيخ', av: '👩', x: 936, z: 424, yaw: 0, look: look(0, { hair: 'long' }, '#ff8fb8'), hello: 'أهلاً بيك في شرم الشيخ 🕊️' },
    { id: 'c_alamein', nm: 'المرشد يوسف', role: 'مرشد العلمين', av: '🧑', x: -326, z: -616, yaw: -Math.PI / 2, look: look(2, {}, '#36e07a'), hello: 'أهلاً بيك في العلمين 🌊' },
  ];
  G.forEach((g) => E.addNPC(g));
  const flyMenu = (n) => { const here = airHere(); E.talk(n, 'طيارة لولو بتطير لكل مدن مصر الحلوة. عايز تروح فين؟', [...Object.keys(AIR).filter((k) => k !== here).map((k) => [`✈️ ${AIR[k].n}`, () => fly(k)]), ['👋 بعدين', E.closeUI]]); };
  E.SCRIPTS.c_pilot = flyMenu;
  E.SCRIPTS.c_hurg = (n) => E.talk(n, 'الغردقة فيها أحلى بحر! ادخل الأكواريوم وامشي في نفق السمك، واركب الغواصة، واتفرج على عرض الدولفين، وجرب تحدي نجوم البحر على الشط.', [['🐠 الأكواريوم', () => E.openSite('aquarium')], ['🐬 عرض الدولفين', () => dolphinShow()], ['🛳️ الغواصة', () => subRide()], ['⭐ تحدي نجوم البحر', () => startChal('h')], ['✈️ سافر', () => flyMenu(n)]]);
  E.SCRIPTS.c_dahab = (n) => E.talk(n, 'دهب جميلة وهادية. على البحر هتلاقي البلو هول، حفرة زرقا عميقة جدًا. تحب تغطس معانا بالكاميرا وتشوفها من جوه؟', [['🔵 انزل البلو هول', () => blueDive()], ['⭐ تحدي الصدف', () => startChal('d')], ['⛺ خيمة البدو', () => E.openSite('bedouin')], ['✈️ سافر', () => flyMenu(n)]]);
  E.SCRIPTS.c_sharm = (n) => E.talk(n, 'شرم الشيخ مدينة السلام! اركب مركب القاع الإزاز لمحمية رأس محمد وشوف المرجان، أو جرّب تحدي الجري في خليج نعمة.', [['🐡 مركب رأس محمد', () => glassBoat()], ['🏃 تحدي خليج نعمة', () => startChal('s')], ['🕊️ شرم الشيخ', () => E.openSite('sharm')], ['✈️ سافر', () => flyMenu(n)]]);
  E.SCRIPTS.c_alamein = (n) => E.talk(n, 'دي العلمين على البحر المتوسط: أبراج عالية ورملة بيضا ومية تركواز. جرّب تحدي الصدف على الشط!', [['🌆 أبراج العلمين', () => E.openSite('towers')], ['🏛️ المتحف', () => E.openSite('museum')], ['🐚 تحدي الصدف', () => startChal('a')], ['✈️ سافر', () => flyMenu(n)]]);

  // ======================= rides (flight, submarine, Blue Hole dive, glass boat, dolphin show) =======================
  let RIDE = null;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(70, 20, 14), new THREE.MeshBasicMaterial({ color: '#0d5f99', side: THREE.BackSide, fog: false, toneMapped: false })); dome.visible = false; root.add(dome);
  let savedFog = null;
  function underwater(on) { if (on) { if (!savedFog) savedFog = C.scene.fog; C.scene.fog = new THREE.Fog('#1077b3', 4, 62); dome.visible = true; } else { if (savedFog) C.scene.fog = savedFog; savedFog = null; dome.visible = false; } }
  function startRide(o) { E.closeUI(); RIDE = Object.assign({ t: 0, fi: -1 }, o); C.setPanel('coast'); document.body.classList.add('mallFocus'); const kid = C.getKid(); if (kid) kid.visible = false; if (o.under) underwater(true); RIDE_EL.className = 'egyRide on'; RIDE_EL.querySelector('.t').textContent = o.title; RIDE_EL.querySelector('.f').textContent = o.facts[0]; C.sfx.pop(); }
  function endRide(skip) { const r = RIDE; if (!r) return; RIDE = null; E.hush(); underwater(false); RIDE_EL.className = 'egyRide'; document.body.classList.remove('mallFocus'); C.setPanel(null); const kid = C.getKid(); if (kid) kid.visible = true; if (r.end) r.end(skip); }
  RIDE_EL.addEventListener('click', (e) => { if (e.target.closest('[data-ec="skip"]') && RIDE) { C.sfx.click(); endRide(true); } });
  const firstTime = (id, c) => { const m = st(); if (!m.seen.includes(id)) { m.seen.push(id); reward(c, 0, `🎉 تجربة جديدة! + 🪙 ${c}`); } };
  function subRide() { startRide({ title: '🛳️ الغواصة نازلة تحت المية…', under: true, dur: 26, facts: ['🐠 بص من الشباك! السمك الملون عايش حوالين الشعاب المرجانية.', '🪸 المرجان كائن حي وبيكبر ببطء، ما نلمسوش ولا نكسره.', '🐢 في البحر الأحمر سلاحف بحرية ودلافين وأسماك قرش صغيرة.', '⚓ دي سفينة قديمة غرقت، وبقت بيت للسمك!'],
    cam: (k, t) => { const a = k * Math.PI * 1.6, x = 645 + Math.cos(a) * 26, z = 425 + Math.sin(a) * 26, y = -6 - Math.sin(k * Math.PI) * 5; SUB.position.set(x, y - 1.5, z); SUB.rotation.y = -a; return { p: [OFF + x, y, z], l: [OFF + 645, -12, 425] }; },
    end: () => { SUB.position.set(578, 0.2, 400); SUB.rotation.y = 0; place(552, 400); firstTime('submarine', 15); C.toast('🛳️ رجعنا للمرسى!'); } }); }
  function blueDive() { startRide({ title: '🤿 بننزل في البلو هول…', under: true, dur: 22, facts: ['🔵 البلو هول حفرة عميقة جدًا في الشعاب المرجانية، أكتر من 100 متر!', '🐟 السمك بيحب يعيش على حيطان الحفرة جنب المرجان.', '⚠️ الغطس العميق للمحترفين بس ومع مدرب، وإحنا هنا بنتفرج بالكاميرا.', '🪸 تحت خالص فيه فتحة كبيرة في الصخر اسمها «القوس».'],
    cam: (k, t) => { const y = -2 - Math.sin(k * Math.PI) * 40, a = t * 0.35; return { p: [OFF + BH.x + Math.cos(a) * 3, y, BH.z + Math.sin(a) * 3], l: [OFF + BH.x + Math.cos(a + 1.2) * 10, y - 4, BH.z + Math.sin(a + 1.2) * 10] }; },
    end: () => { place(1074, 92); firstTime('bluehole', 20); C.toast('🔵 طلعنا من البلو هول!'); } }); }
  function glassBoat() { startRide({ title: '🐡 مركب القاع الإزاز رايح رأس محمد…', under: true, dur: 22, facts: ['🐡 رأس محمد أول محمية طبيعية في مصر، من سنة 1983.', '🪸 الشعاب هنا من أجمل الشعاب المرجانية في العالم.', '🚫 في المحمية ممنوع الصيد علشان نحمي السمك والمرجان.'],
    cam: (k) => { const x = 885 + k * 100, z = 575 + Math.sin(k * 6) * 8; BOAT.position.set(x, 0, z - 2); BOAT.rotation.y = Math.PI / 2; return { p: [OFF + x, -2.5, z], l: [OFF + x + 8, -10, z + 6] }; },
    end: () => { BOAT.position.set(930, 0, 528); BOAT.rotation.y = 0; place(930, 494); firstTime('rasmo', 15); C.toast('🐡 رجعنا خليج نعمة!'); } }); }
  function dolphinShow() { place(DOL.x, DOL.z + 22); startRide({ title: '🐬 عرض الدولفين بدأ!', show: true, dur: 24, facts: ['🐬 الدولفين بيتنفس هوا من فتحة فوق راسه.', '🎶 الدولفين بيكلم أصحابه بأصوات صفير وطقطقة.', '🤸 الدولفين بينط من المية أعلى من طول راجل كبير!', '👏 سقّف للدولفين!'],
    cam: () => ({ p: [OFF + DOL.x, 7, DOL.z + 24], l: [OFF + DOL.x, 2, DOL.z - 2] }),
    end: () => { DOL.dol.forEach((d, i) => { d.position.set(DOL.x - 10 + i * 10, 0.6, DOL.z); d.rotation.set(0, 0, 0); }); DOL.ball.position.set(DOL.x + 10, 1.4, DOL.z); firstTime('dolphin', 15); C.toast('👏 برافو يا دلافين!'); } }); }
  function airHere() { const x = C.PL.x - OFF, z = C.PL.z; let best = 'cairo', bd = 1e9; for (const k in AIR) { const d = Math.hypot(AIR[k].x - x, AIR[k].z - z); if (d < bd) { bd = d; best = k; } } return best; }
  function fly(to) { E.closeUI(); const a = AIR[to]; FLY.innerHTML = `<div class="cl" style="top:12%;left:20%">☁️</div><div class="cl" style="top:60%;left:70%;animation-delay:-1s">☁️</div><div class="pl">✈️</div><div class="t">✈️ طيارة لولو رايحة ${a.n}…</div><div class="f">${FLY_FACTS[(Math.random() * FLY_FACTS.length) | 0]}</div>`; FLY.className = 'egyFly on'; C.setPanel('fly'); C.sfx.pop();
    setTimeout(() => { place(a.x + 7, a.z - 2); if (C.setYaw) C.setYaw(Math.PI); else C.PL.yaw = Math.PI; }, 1400);
    setTimeout(() => { FLY.className = 'egyFly'; C.setPanel(null); C.toast(`🎉 وصلنا ${a.n}!`); C.sfx.win(); }, 2900); }

  // ======================= timed challenges (coins every win, gems the first time) =======================
  const CHAL_DEF = {
    h: { n: 'نجوم البحر', i: '⭐', rect: [500, 556, 440, 534], k: 10, time: 60, coins: 40, gems: 3, start: [530, 470] },
    d: { n: 'صدف دهب', i: '🐚', rect: [1020, 1076, 20, 170], k: 12, time: 60, coins: 45, gems: 3, start: [1050, 90] },
    s: { n: 'جري خليج نعمة', i: '🚩', rect: [870, 1040, 480, 510], k: 8, time: 45, coins: 40, gems: 3, start: [890, 494] },
    a: { n: 'صدف العلمين', i: '🐚', rect: [-630, -310, -776, -752], k: 12, time: 70, coins: 50, gems: 4, start: [-470, -760] },
  };
  let CH = null;
  const starGeo = (() => { const g = new THREE.ConeGeometry(0.5, 0.25, 5); return g; })();
  function startChal(k) { E.closeUI(); if (CH) endChal(false); const D = CHAL_DEF[k], [x0, x1, z0, z1] = D.rect, items = []; place(D.start[0], D.start[1]);
    for (let i = 0; i < D.k; i++) { const x = x0 + 3 + Math.random() * (x1 - x0 - 6), z = z0 + 3 + Math.random() * (z1 - z0 - 6); const m = new THREE.Mesh(starGeo, toon(k === 's' ? '#e8213d' : i % 2 ? '#ff8a3d' : '#ff5fa2', { emissive: '#ff6a00', emissiveIntensity: 0.3 })); m.position.set(x, 0.5, z); root.add(m); items.push({ m, x, z }); }
    CH = { k, D, items, left: D.time, got: 0 }; CHUD.className = 'egyChal on'; C.toast(`${D.i} تحدي ${D.n}: لِم ${D.k} في ${D.time} ثانية!`); C.sfx.pop(); }
  function endChal(win) { const c = CH; if (!c) return; CH = null; c.items.forEach((it) => root.remove(it.m)); CHUD.className = 'egyChal'; if (win === null) return;
    if (win) { const m = st(), first = !m.won.includes(c.k); if (first) m.won.push(c.k); reward(c.D.coins, first ? c.D.gems : 0, `🏆 كسبت التحدي! + 🪙 ${c.D.coins}${first ? ` + 💎 ${c.D.gems}` : ''}`); C.sfx.win(); } else { C.toast('⏰ الوقت خلص! جرّب تاني'); C.sfx.pop(); } }

  // ======================= region, interactables, update, map =======================
  function regionAt(x, z) { for (const k in ZONE) { const [x0, x1, z0, z1] = ZONE[k]; if (x > x0 - 30 && x < x1 + 30 && z > z0 - 30 && z < z1 + 30) return k; } return null; }
  const PTS = [['hurg', 426, 418, 3], ['aquarium', 470, 351, 3.5], ['marina', 548, 300, 4], ['dolphin', 466, 476, 3.5], ['submarine', 552, 404, 3], ['dahab', 1000, 52, 3.5], ['bluehole', 1074, 96, 3.5], ['bedouin', 960, 126, 3.5], ['sinaimt', 884, 200, 4], ['sharm', 960, 390, 3.5], ['naama', 930, 494, 4], ['rasmo', 864, 474, 4], ['alamein', -326, -628, 3.5], ['towers', -552, -706, 4], ['museum', -370, -630, 3.5], ['med', -480, -770, 4]];
  function interactables() {
    if (RIDE || FLY.className.includes('on')) return [];
    const L = [], o = OFF, m = E.st();
    for (const [id, x, z, r] of PTS) L.push({ x: o + x, z, r, label: `${m.stamps.includes(id) ? '✅' : '🔎'} ${E.SBY[id].n}`, act: () => E.openSite(id) });
    for (const k in AIR) { const a = AIR[k]; L.push({ x: o + a.x, z: a.z + 2.4, r: 2.6, label: '✈️ طيارة لولو', act: () => flyMenu(E.NPC.find((n) => n.id === 'c_pilot')) }); }
    L.push({ x: o + DOL.x, z: DOL.z + 21, r: 3, label: '🐬 اتفرج على العرض', act: dolphinShow });
    L.push({ x: o + 556, z: 396, r: 2.6, label: '🛳️ اركب الغواصة', act: subRide });
    L.push({ x: o + 1076, z: 88, r: 2.6, label: '🤿 انزل البلو هول', act: blueDive });
    L.push({ x: o + 930, z: 516, r: 3, label: '🐡 مركب رأس محمد', act: glassBoat });
    for (const [k, D] of Object.entries(CHAL_DEF)) if (!CH) L.push({ x: o + D.start[0], z: D.start[1], r: 2.4, label: `${D.i} تحدي ${D.n}`, act: () => startChal(k) });
    return L;
  }
  const RLAB = { h: 'hurghada', d: 'sinai', s: 'sinai', a: 'alamein' };
  function update(dt, now, active) {
    const t = now / 1000;
    if (!active) { if (RIDE) endRide(true); if (CH) endChal(null); return; }
    const px = C.PL.x - OFF, pz = C.PL.z, rg = regionAt(px, pz);
    if (RIDE) { RIDE.t += dt; const k = Math.min(1, RIDE.t / RIDE.dur), fi = Math.min(RIDE.facts.length - 1, Math.floor(k * RIDE.facts.length)); if (fi !== RIDE.fi) { RIDE.fi = fi; RIDE_EL.querySelector('.f').textContent = RIDE.facts[fi]; if (E.st().voice) E.speak(RIDE.facts[fi].replace(/^\S+\s/, '')); } RIDE_EL.querySelector('.bar i').style.width = (k * 100).toFixed(1) + '%'; RIDE.camNow = RIDE.cam(k, RIDE.t); if (RIDE.under) dome.position.set(RIDE.camNow.p[0] - OFF, RIDE.camNow.p[1], RIDE.camNow.p[2]); if (k >= 1) endRide(false); }
    // the dolphins: idle swim, or the show routine
    if (rg === 'hurghada') {
      const show = RIDE && RIDE.show ? RIDE.t : -1;
      DOL.dol.forEach((d, i) => { if (show >= 0) { const ph = (show * 0.9 + i * 0.33) % 1, x = DOL.x - 14 + ph * 28, y = 0.6 + Math.max(0, Math.sin(ph * Math.PI)) * (i === 1 ? 7 : 4.5); d.position.set(x, y, DOL.z - 4 + i * 4); d.rotation.set(0, 0, Math.cos(ph * Math.PI) * 0.9); } else { const a = t * 0.6 + i * 2.1; d.position.set(DOL.x + Math.cos(a) * 12, 0.6 + Math.sin(t * 2 + i) * 0.15, DOL.z + Math.sin(a) * 5); d.rotation.set(0, -a - Math.PI / 2, 0); } });
      DOL.hoop.rotation.y = t; DOL.ball.position.y = show >= 0 ? 2 + Math.abs(Math.sin(show * 3)) * 5 : 1.4; DOL.ball.rotation.x = t * 2;
    }
    for (const S of FISH) if (Math.hypot(S.cx - px, S.cz - pz) < 160) swim(S, t, dt);
    if (CH) { CH.left -= dt; for (const it of CH.items) { if (!it.m.visible) continue; it.m.rotation.y = t * 3; it.m.position.y = 0.5 + Math.sin(t * 4 + it.x) * 0.15; if (Math.hypot(it.x - px, it.z - pz) < 1.5) { it.m.visible = false; CH.got++; C.sfx.coin(); } } CHUD.textContent = `${CH.D.i} ${CH.got}/${CH.D.k} · ⏱️ ${Math.max(0, Math.ceil(CH.left))}`; if (CH.got >= CH.D.k) endChal(true); else if (CH.left <= 0 || regionAt(px, pz) !== RLAB[CH.k]) endChal(false); }
  }
  function drawMap(g, s, r) {
    const [x0, x1, z0, z1] = ZONE[r]; g.fillStyle = r === 'alamein' ? '#2cc4d8' : '#1fa2e0'; g.fillRect((x0 - 300) * s, (z0 - 300) * s, (x1 - x0 + 600) * s, (z1 - z0 + 600) * s); g.fillStyle = '#ead7ad'; g.fillRect(x0 * s, z0 * s, (x1 - x0) * s, (z1 - z0) * s);
    g.fillStyle = '#efe3cc'; if (r === 'hurghada') { g.fillRect(540 * s, 290 * s, 20 * s, 240 * s); g.fillStyle = '#1f6fb8'; g.fillRect(450 * s, 312 * s, 40 * s, 36 * s); g.fillStyle = '#3fd0ff'; g.fillRect(460 * s, 445 * s, 40 * s, 20 * s); }
    else if (r === 'sinai') { g.fillStyle = '#5b5f74'; g.fillRect(996 * s, 110 * s, 8 * s, 300 * s); g.fillStyle = '#c4643a'; g.fillRect(830 * s, 0, 30 * s, 520 * s); g.fillStyle = '#0b2f8a'; g.beginPath(); g.arc(BH.x * s, BH.z * s, BH.r * s, 0, 7); g.fill(); }
    else { g.fillStyle = '#fbf4e2'; g.fillRect(x0 * s, z0 * s, (x1 - x0) * s, 30 * s); g.fillStyle = '#9fd3f2'; g.fillRect(-585 * s, -721 * s, 150 * s, 10 * s); }
  }
  const GOAL = { hurghada: 'الأكواريوم والغواصة وعرض الدولفين وتحدي نجوم البحر', sinai: 'البلو هول في دهب، ورأس محمد وخليج نعمة في شرم', alamein: 'الأبراج والشط الأبيض وتحدي الصدف' };
  return {
    regionAt, interactables, update, drawMap, fly, startChal, subRide, blueDive, glassBoat, dolphinShow,
    goal: (r) => `🇪🇬 مصر · ${COAST_REG[r]}<small>${CH ? `${CH.D.i} التحدي: ${CH.got}/${CH.D.k}` : 'اكتشف: ' + GOAL[r]}</small>`,
    get cam() { return RIDE && RIDE.camNow ? RIDE.camNow : null; }, get busy() { return !!RIDE; },
    leave() { if (RIDE) endRide(true); if (CH) endChal(null); FLY.className = 'egyFly'; },
    AIR, ZONE, lines: [].concat(['🐠 بص من الشباك! السمك الملون عايش حوالين الشعاب المرجانية.', '🪸 المرجان كائن حي وبيكبر ببطء، ما نلمسوش ولا نكسره.', '🐢 في البحر الأحمر سلاحف بحرية ودلافين وأسماك قرش صغيرة.', '⚓ دي سفينة قديمة غرقت، وبقت بيت للسمك!'], ['🔵 البلو هول حفرة عميقة جدًا في الشعاب المرجانية، أكتر من 100 متر!', '🐟 السمك بيحب يعيش على حيطان الحفرة جنب المرجان.', '⚠️ الغطس العميق للمحترفين بس ومع مدرب، وإحنا هنا بنتفرج بالكاميرا.', '🪸 تحت خالص فيه فتحة كبيرة في الصخر اسمها «القوس».'], ['🐡 رأس محمد أول محمية طبيعية في مصر، من سنة 1983.', '🪸 الشعاب هنا من أجمل الشعاب المرجانية في العالم.', '🚫 في المحمية ممنوع الصيد علشان نحمي السمك والمرجان.'], ['🐬 الدولفين بيتنفس هوا من فتحة فوق راسه.', '🎶 الدولفين بيكلم أصحابه بأصوات صفير وطقطقة.', '🤸 الدولفين بينط من المية أعلى من طول راجل كبير!', '👏 سقّف للدولفين!']),
  };
}
