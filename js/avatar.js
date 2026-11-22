// LOLO WORLD — blocky cartoon kids (Roblox-inspired, original Lolo design) + the wardrobe catalogue.
// The rig keeps the same pivots as before (legs, body, arms, head) so walking / jumping / driving animations still work.

export const SKIN = ['#ffe3cc', '#f8cfae', '#f0b98f', '#dea072', '#c58556', '#a26742', '#82502f', '#5e3820'];
export const PAL = ['#ff2d55', '#ff7a1a', '#ffc21a', '#fff04d', '#7cf04a', '#18c95a', '#14d6c4', '#1fb8ff', '#2f6bff', '#7a4dff', '#c05cff', '#ff4fc8', '#ffa3d6', '#ffffff', '#2b2f48', '#8a5a3b'];
export const HAIRC = ['#24160f', '#55301a', '#8a5528', '#d9973a', '#ffd35c', '#e0502a', '#ff6fc0', '#8f5cff', '#2fb8ff', '#f4f4f4'];

// every slot: list of styles. rare items carry `lock` = how to unlock it (checked by the game)
export const WARD = {
  hair: [
    { id: 'short', n: 'قصير', i: '💇‍♂️' }, { id: 'spiky', n: 'شوك', i: '⚡' }, { id: 'curly', n: 'كيرلي', i: '🌀' }, { id: 'side', n: 'على جنب', i: '💫' },
    { id: 'long', n: 'طويل', i: '👧' }, { id: 'pony', n: 'ديل حصان', i: '🎀' }, { id: 'buns', n: 'كعكتين', i: '🍡' }, { id: 'braids', n: 'ضفاير', i: '🪢' },
    { id: 'bob', n: 'قصير بنات', i: '💁‍♀️' }, { id: 'hijab', n: 'حجاب', i: '🧕' }, { id: 'puffs', n: 'كور شعر', i: '🎈' }, { id: 'quiff', n: 'غُرّة مرفوعة', i: '🌊' },
  ],
  top: [
    { id: 'tee', n: 'تيشيرت', i: '👕' }, { id: 'long', n: 'كم طويل', i: '🥼' }, { id: 'hoodie', n: 'هودي', i: '🧥' }, { id: 'polo', n: 'بولو', i: '👔' },
    { id: 'jacket', n: 'جاكيت', i: '🧥' }, { id: 'tank', n: 'حمالات', i: '🎽' }, { id: 'jersey', n: 'فانلة رياضة', i: '⚽' }, { id: 'lab', n: 'بالطو عالِم', i: '🔬' },
    { id: 'chef', n: 'جاكيت شيف', i: '👨‍🍳' }, { id: 'thobe', n: 'ثوب', i: '🤍' }, { id: 'astro', n: 'بدلة فضاء', i: '🚀', lock: { mi: 3, t: 'خلّص 3 مهام' } },
  ],
  print: [{ id: 'none', n: 'سادة', i: '⬜' }, { id: 'star', n: 'نجمة', i: '⭐' }, { id: 'heart', n: 'قلب', i: '💖' }, { id: 'fish', n: 'لولو', i: '🐟' }, { id: 'bolt', n: 'برق', i: '⚡' }, { id: 'sun', n: 'شمس', i: '☀️' }],
  bottom: [{ id: 'pants', n: 'بنطلون', i: '👖' }, { id: 'shorts', n: 'شورت', i: '🩳' }, { id: 'skirt', n: 'جيبة', i: '👗' }, { id: 'longskirt', n: 'جيبة طويلة', i: '🥻' }],
  dress: [{ id: 'none', n: 'من غير', i: '✖️' }, { id: 'dress', n: 'فستان', i: '👗' }, { id: 'long', n: 'فستان طويل', i: '🥻' }, { id: 'princess', n: 'فستان أميرة', i: '👸', lock: { mi: 8, t: 'خلّص 8 مهام' } }],
  shoes: [{ id: 'sneakers', n: 'كوتشي', i: '👟' }, { id: 'boots', n: 'بوت', i: '🥾' }, { id: 'sandals', n: 'صندل', i: '🩴' }, { id: 'gold', n: 'كوتشي دهبي', i: '✨', lock: { obby: 1, t: 'كسب تحدي القفز' } }],
  hat: [
    { id: 'none', n: 'من غير', i: '✖️' }, { id: 'cap', n: 'كاب', i: '🧢' }, { id: 'beanie', n: 'طاقية', i: '🧶' }, { id: 'flower', n: 'توكة ورد', i: '🌸' },
    { id: 'phones', n: 'سماعات', i: '🎧' }, { id: 'party', n: 'طرطور', i: '🥳' }, { id: 'crown', n: 'تاج دهبي', i: '👑', lock: { prize: 'crown', t: 'من الجوايز 🎟️' } },
    { id: 'tiara', n: 'تاج أميرة', i: '💎', lock: { mi: 6, t: 'خلّص 6 مهام' } },
    { id: 'chef', n: 'طاقية شيف', i: '🍳' }, { id: 'ghutra', n: 'شماغ', i: '🟥' }, { id: 'safari', n: 'قبعة مستكشف', i: '🧭' }, { id: 'band', n: 'باند رياضة', i: '🏃' },
    { id: 'helmet', n: 'خوذة فضاء', i: '👨‍🚀', lock: { mi: 3, t: 'خلّص 3 مهام' } },
  ],
  glasses: [{ id: 'none', n: 'من غير', i: '✖️' }, { id: 'round', n: 'نضارة', i: '👓' }, { id: 'sun', n: 'شمس', i: '🕶️' }, { id: 'heart', n: 'قلوب', i: '💗' }, { id: 'star', n: 'نجوم', i: '🌟', lock: { prize: 'glasses', t: 'من الجوايز 🎟️' } }, { id: 'goggles', n: 'نضارة معمل', i: '🥽' }],
  bag: [
    { id: 'none', n: 'من غير', i: '✖️' }, { id: 'backpack', n: 'شنطة ضهر', i: '🎒' }, { id: 'purse', n: 'شنطة صغيرة', i: '👜' },
    { id: 'cape', n: 'كاب بطل', i: '🦸', lock: { mi: 4, t: 'خلّص 4 مهام' } }, { id: 'wings', n: 'جناحات', i: '🦋', lock: { prize: 'wings', t: 'من الجوايز 🎟️' } }, { id: 'jetpack', n: 'جيت باك', i: '🚀', lock: { mi: 3, t: 'خلّص 3 مهام' } },
  ],
  face: [{ id: 'smile', n: 'ابتسامة', i: '🙂' }, { id: 'happy', n: 'فرحان', i: '😄' }, { id: 'wink', n: 'غمزة', i: '😉' }, { id: 'cool', n: 'واثق', i: '😎' }],
};
// slots that carry a colour (key in look.c)
export const COLOR_SLOTS = { hair: 'hair', top: 'top', bottom: 'bottom', dress: 'dress', shoes: 'shoes', hat: 'hat', bag: 'bag', glasses: 'glasses' };

export const PRESETS = [ // the 4 official characters, now as editable looks
  { g: 'girl', skin: 1, face: 'smile', hair: 'long', top: 'hoodie', print: 'heart', bottom: 'pants', dress: 'none', shoes: 'sneakers', hat: 'flower', glasses: 'none', bag: 'none', c: { hair: '#55301a', top: '#ff4fc8', bottom: '#1fb8ff', dress: '#ff4fc8', shoes: '#ffffff', hat: '#ff2d55', bag: '#7a4dff', glasses: '#ff4fc8' } },
  { g: 'boy', skin: 1, face: 'happy', hair: 'short', top: 'tee', print: 'star', bottom: 'pants', dress: 'none', shoes: 'sneakers', hat: 'cap', glasses: 'none', bag: 'backpack', c: { hair: '#55301a', top: '#ffc21a', bottom: '#2f6bff', dress: '#ff4fc8', shoes: '#ffffff', hat: '#7a4dff', bag: '#ff2d55', glasses: '#2b2f48' } },
  { g: 'girl', skin: 0, face: 'smile', hair: 'hijab', top: 'long', print: 'none', bottom: 'longskirt', dress: 'none', shoes: 'sneakers', hat: 'none', glasses: 'none', bag: 'purse', c: { hair: '#ffa3d6', top: '#c05cff', bottom: '#ffa3d6', dress: '#c05cff', shoes: '#ffffff', hat: '#ff4fc8', bag: '#ff4fc8', glasses: '#ff4fc8' } },
  { g: 'boy', skin: 4, face: 'cool', hair: 'curly', top: 'polo', print: 'none', bottom: 'shorts', dress: 'none', shoes: 'sneakers', hat: 'none', glasses: 'round', bag: 'none', c: { hair: '#24160f', top: '#1fb8ff', bottom: '#2b2f48', dress: '#1fb8ff', shoes: '#ff7a1a', hat: '#18c95a', bag: '#ffc21a', glasses: '#2b2f48' } },
];
// LOLO_CHARS2: 6 new characters
export const NEW_CHARS = [
  { name: 'ليلى', f: 1, role: 'العالِمة الصغيرة', look: { g: 'girl', skin: 3, face: 'happy', hair: 'puffs', top: 'lab', print: 'none', bottom: 'pants', dress: 'none', shoes: 'sneakers', hat: 'none', glasses: 'goggles', bag: 'none', c: { hair: '#24160f', top: '#ffffff', bottom: '#7a4dff', dress: '#7a4dff', shoes: '#ff4fc8', hat: '#ff4fc8', bag: '#ff4fc8', glasses: '#1fb8ff' } } },
  { name: 'عمر', f: 0, role: 'رائد الفضاء', look: { g: 'boy', skin: 2, face: 'happy', hair: 'short', top: 'astro', print: 'none', bottom: 'pants', dress: 'none', shoes: 'boots', hat: 'helmet', glasses: 'none', bag: 'jetpack', c: { hair: '#55301a', top: '#f4f6fb', bottom: '#f4f6fb', dress: '#f4f6fb', shoes: '#ff7a1a', hat: '#bfe6ff', bag: '#c7cede', glasses: '#2b2f48' } } },
  { name: 'سلمى', f: 1, role: 'الشيف الشاطرة', look: { g: 'girl', skin: 1, face: 'smile', hair: 'buns', top: 'chef', print: 'none', bottom: 'pants', dress: 'none', shoes: 'sneakers', hat: 'chef', glasses: 'none', bag: 'none', c: { hair: '#8a5528', top: '#ffffff', bottom: '#2b2f48', dress: '#ff2d55', shoes: '#ff2d55', hat: '#ffffff', bag: '#ff2d55', glasses: '#2b2f48' } } },
  { name: 'خالد', f: 0, role: 'ابن الخليج', look: { g: 'boy', skin: 2, face: 'smile', hair: 'short', top: 'thobe', print: 'none', bottom: 'pants', dress: 'none', shoes: 'sandals', hat: 'ghutra', glasses: 'none', bag: 'none', c: { hair: '#24160f', top: '#ffffff', bottom: '#ffffff', dress: '#ffffff', shoes: '#8a5a3b', hat: '#e0302a', bag: '#8a5a3b', glasses: '#2b2f48' } } },
  { name: 'نور', f: 1, role: 'البطلة الرياضية', look: { g: 'girl', skin: 4, face: 'happy', hair: 'pony', top: 'jersey', print: 'none', bottom: 'shorts', dress: 'none', shoes: 'sneakers', hat: 'band', glasses: 'none', bag: 'none', c: { hair: '#24160f', top: '#18c95a', bottom: '#ffffff', dress: '#18c95a', shoes: '#ffc21a', hat: '#ffc21a', bag: '#ffc21a', glasses: '#2b2f48' } } },
  { name: 'زين', f: 0, role: 'المستكشف', look: { g: 'boy', skin: 5, face: 'cool', hair: 'quiff', top: 'jacket', print: 'none', bottom: 'shorts', dress: 'none', shoes: 'boots', hat: 'safari', glasses: 'none', bag: 'backpack', c: { hair: '#24160f', top: '#c9a24e', bottom: '#5b6b3a', dress: '#c9a24e', shoes: '#8a5a3b', hat: '#e9d6a4', bag: '#18c95a', glasses: '#2b2f48' } } },
];
PRESETS.push(...NEW_CHARS.map((c) => c.look));
export const cloneLook = (l) => JSON.parse(JSON.stringify(l));

export function initAvatar({ THREE, toon, ctex, bake }) {
  // ---------- shared geometry ----------
  const GC = {};
  function rbox(w, h, d, r) {
    const k = [w, h, d, r].join(); if (GC[k]) return GC[k];
    r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
    const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, W = w - 2 * r, H = h - 2 * r;
    s.moveTo(x, y); s.lineTo(x + W, y); s.lineTo(x + W, y + H); s.lineTo(x, y + H); s.lineTo(x, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 2, curveSegments: 3 });
    g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals(); return (GC[k] = g);
  }
  const sph = (r, a = 10, b = 8) => GC['s' + r + a] || (GC['s' + r + a] = new THREE.SphereGeometry(r, a, b));
  const cyl = (rt, rb, h, n = 16) => GC['c' + [rt, rb, h, n]] || (GC['c' + [rt, rb, h, n]] = new THREE.CylinderGeometry(rt, rb, h, n));
  function shapeGeo(key, draw, depth) { if (GC[key]) return GC[key]; const s = new THREE.Shape(); draw(s); const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 6 }); g.center(); return (GC[key] = g); }
  const heartGeo = (sz) => shapeGeo('heart' + sz, (s) => { const k = sz; s.moveTo(0, -k); s.bezierCurveTo(-k * 1.6, -k * 0.1, -k * 0.9, k * 1.1, 0, k * 0.45); s.bezierCurveTo(k * 0.9, k * 1.1, k * 1.6, -k * 0.1, 0, -k); }, 0.03);
  const starGeo = (sz) => shapeGeo('star' + sz, (s) => { for (let i = 0; i <= 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? sz * 0.45 : sz; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } }, 0.03);

  // ---------- face & chest prints (canvas textures) ----------
  const FT = {};
  function faceTex(face, lashes) {
    const k = face + lashes; if (FT[k]) return FT[k];
    return (FT[k] = ctex(256, 224, (g, w) => {
      const eye = (x, closed) => {
        if (closed) { g.strokeStyle = '#2a1a12'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.arc(x, 92, 20, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); return; }
        g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x, 92, 27, 33, 0, 0, 7); g.fill();
        g.fillStyle = '#3a2416'; g.beginPath(); g.ellipse(x + 2, 98, 19, 24, 0, 0, 7); g.fill();
        g.fillStyle = '#0d0806'; g.beginPath(); g.ellipse(x + 2, 100, 10, 13, 0, 0, 7); g.fill();
        g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x - 6, 86, 8, 0, 7); g.fill(); g.beginPath(); g.arc(x + 9, 108, 4, 0, 7); g.fill();
        g.strokeStyle = '#2a1a12'; g.lineWidth = 5; g.beginPath(); g.ellipse(x, 92, 27, 33, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
        if (lashes) { g.lineWidth = 4; for (const t of [-0.9, -0.55]) { const a = Math.PI * 1.5 + t * (x < w / 2 ? 1 : -1) * 0.8; g.beginPath(); g.moveTo(x + Math.cos(a) * 27, 92 + Math.sin(a) * 33); g.lineTo(x + Math.cos(a) * 38, 92 + Math.sin(a) * 44); g.stroke(); } }
      };
      eye(78, false); eye(178, face === 'wink');
      g.strokeStyle = '#3a2416'; g.lineWidth = 7; g.lineCap = 'round';
      for (const x of [78, 178]) { g.beginPath(); g.moveTo(x - 20, face === 'cool' ? 50 : 46); g.quadraticCurveTo(x, face === 'cool' ? 46 : 36, x + 20, 46); g.stroke(); }
      g.fillStyle = 'rgba(255,110,150,.45)'; for (const x of [44, 212]) { g.beginPath(); g.ellipse(x, 140, 20, 12, 0, 0, 7); g.fill(); }
      g.strokeStyle = '#b8283f'; g.fillStyle = '#c42d48'; g.lineWidth = 8;
      if (face === 'happy') { g.beginPath(); g.moveTo(98, 150); g.quadraticCurveTo(128, 200, 158, 150); g.closePath(); g.fill(); g.fillStyle = '#ff8aa0'; g.beginPath(); g.ellipse(128, 176, 14, 7, 0, 0, 7); g.fill(); }
      else if (face === 'cool') { g.beginPath(); g.moveTo(102, 162); g.quadraticCurveTo(136, 182, 160, 152); g.stroke(); }
      else { g.beginPath(); g.moveTo(100, 156); g.quadraticCurveTo(128, 184, 156, 156); g.stroke(); }
    }));
  }
  const PT = {};
  function printTex(p) {
    if (PT[p]) return PT[p];
    return (PT[p] = ctex(128, 128, (g) => {
      g.translate(64, 64); g.lineJoin = 'round';
      const path = () => {
        g.beginPath();
        if (p === 'star') for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 22 : 50; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        else if (p === 'heart') { g.moveTo(0, 44); g.bezierCurveTo(-70, 0, -36, -50, 0, -18); g.bezierCurveTo(36, -50, 70, 0, 0, 44); }
        else if (p === 'bolt') { g.moveTo(10, -54); g.lineTo(-30, 6); g.lineTo(-2, 6); g.lineTo(-12, 54); g.lineTo(32, -10); g.lineTo(4, -10); g.closePath(); }
        else if (p === 'fish') { g.ellipse(-6, 0, 36, 28, 0, 0, 7); g.moveTo(26, 0); g.lineTo(54, -24); g.lineTo(54, 24); g.closePath(); }
        else { g.arc(0, 0, 24, 0, 7); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; g.moveTo(Math.cos(a) * 32, Math.sin(a) * 32); g.lineTo(Math.cos(a) * 50, Math.sin(a) * 50); } }
      };
      const fill = { star: '#ffe14d', heart: '#ff3b7a', bolt: '#ffe14d', fish: '#2fb8ff', sun: '#ffb31a' }[p];
      path(); g.lineWidth = 14; g.strokeStyle = '#ffffff'; g.stroke(); if (p !== 'sun') g.fill(); g.fillStyle = fill; g.fill();
      if (p === 'sun') { g.lineWidth = 7; g.strokeStyle = fill; g.stroke(); }
      if (p === 'fish') { g.fillStyle = '#fff'; g.beginPath(); g.arc(-22, -6, 8, 0, 7); g.fill(); g.fillStyle = '#123'; g.beginPath(); g.arc(-20, -5, 4, 0, 7); g.fill(); }
    }));
  }
  function numTex(n) { const k = 'n' + n; if (PT[k]) return PT[k]; return (PT[k] = ctex(128, 128, (g) => { g.font = '900 88px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 12; g.strokeStyle = '#ffffff'; g.strokeText(n, 64, 70); g.fillStyle = '#2b2f48'; g.fillText(n, 64, 70); })); }
  function flagTex() { if (PT.fl) return PT.fl; return (PT.fl = ctex(96, 64, (g) => { g.fillStyle = '#7a4dff'; g.fillRect(0, 0, 96, 64); g.fillStyle = '#ffd23f'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5; i ? g.lineTo(48 + Math.cos(a) * 20, 32 + Math.sin(a) * 20) : (g.beginPath(), g.moveTo(48 + Math.cos(a) * 20, 32 + Math.sin(a) * 20)); } g.closePath(); g.fill(); })); }
  function checkTex(c) { const k = 'ck' + c; if (PT[k]) return PT[k]; return (PT[k] = ctex(64, 64, (g) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 64); g.fillStyle = c; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if ((x + y) % 2 === 0) g.fillRect(x * 16 + 3, y * 16 + 3, 10, 10); g.fillRect(0, 0, 64, 2); g.fillRect(0, 0, 2, 64); })); }
  const BM = {};
  const basic = (tex) => BM[tex.uuid] || (BM[tex.uuid] = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  const gold = () => toon('#ffd23f', { emissive: '#ffa000', emissiveIntensity: 0.35 });

  // ---------- build ----------
  function makeAvatar(L, scale = 1) {
    const g = new THREE.Group(), P = {}, M = (c) => toon(c);
    const skin = SKIN[L.skin] || SKIN[1], C = L.c || {};
    const dress = L.dress && L.dress !== 'none', topC = dress ? C.dress : C.top;
    const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); parent.add(m); return m; };
    const thobe = !dress && L.top === 'thobe', longSkirt = !dress && L.bottom === 'longskirt' || (dress && L.dress !== 'dress') || thobe;
    // legs
    P.legs = [-1, 1].map((s) => {
      const p = new THREE.Group(); p.position.set(s * 0.135, 0.62, 0); g.add(p);
      const legC = dress || L.bottom === 'skirt' ? skin : L.bottom === 'shorts' ? skin : C.bottom;
      add(p, rbox(0.24, 0.6, 0.26, 0.06), M(thobe ? C.top : longSkirt ? C.bottom || skin : legC), 0, -0.3, 0);
      if (!dress && !thobe && L.bottom === 'shorts') add(p, rbox(0.26, 0.26, 0.28, 0.06), M(C.bottom), 0, -0.11, 0);
      if (L.shoes === 'boots') add(p, rbox(0.27, 0.28, 0.32, 0.06), M(C.shoes), 0, -0.48, 0.02);
      else if (L.shoes === 'sandals') { add(p, rbox(0.26, 0.05, 0.32, 0.02), M(C.shoes), 0, -0.6, 0.03); add(p, rbox(0.25, 0.04, 0.05, 0.015), M(C.shoes), 0, -0.53, 0.1); }
      else { const sm = L.shoes === 'gold' ? gold() : M(C.shoes); add(p, rbox(0.27, 0.15, 0.34, 0.06), sm, 0, -0.54, 0.035); add(p, rbox(0.275, 0.04, 0.35, 0.02), M('#ffffff'), 0, -0.6, 0.035); }
      return p;
    });
    // body
    const body = new THREE.Group(); body.position.y = 0.62; g.add(body); P.body = body;
    const torsoC = L.top === 'tank' && !dress ? C.top : topC;
    add(body, rbox(0.58, 0.6, 0.31, 0.08), M(torsoC), 0, 0.3, 0);
    if (!dress) {
      if (L.top === 'polo') { add(body, rbox(0.3, 0.07, 0.33, 0.03), M('#ffffff'), 0, 0.58, 0); add(body, rbox(0.05, 0.16, 0.02, 0.01), M('#ffffff'), 0, 0.49, 0.158); }
      if (L.top === 'hoodie') { add(body, rbox(0.46, 0.22, 0.12, 0.06), M(C.top), 0, 0.55, -0.2); add(body, rbox(0.34, 0.14, 0.03, 0.03), M(shade(C.top, -0.12)), 0, 0.12, 0.16); add(body, rbox(0.02, 0.14, 0.02, 0.01), M('#ffffff'), -0.06, 0.48, 0.16); add(body, rbox(0.02, 0.14, 0.02, 0.01), M('#ffffff'), 0.06, 0.48, 0.16); }
      if (L.top === 'jacket') { add(body, rbox(0.14, 0.58, 0.02, 0.01), M('#ffffff'), 0, 0.3, 0.157); add(body, rbox(0.03, 0.56, 0.025, 0.01), M('#2b2f48'), 0, 0.3, 0.165); }
      if (L.top === 'tank') add(body, rbox(0.46, 0.14, 0.32, 0.05), M(skin), 0, 0.53, 0);
      if (L.top === 'jersey') { add(body, GC.jn || (GC.jn = new THREE.PlaneGeometry(0.3, 0.3)), basic(numTex('10')), 0, 0.32, 0.158); add(body, GC.jn, basic(numTex('10')), 0, 0.32, -0.158, 0, Math.PI, 0); add(body, rbox(0.3, 0.06, 0.32, 0.03), M('#ffffff'), 0, 0.58, 0); for (const x of [-1, 1]) add(body, rbox(0.03, 0.56, 0.32, 0.01), M('#ffffff'), x * 0.29, 0.3, 0); }
      if (L.top === 'lab') { add(body, rbox(0.62, 0.5, 0.33, 0.05), M(C.top), 0, -0.14, 0); for (const x of [-1, 1]) add(body, rbox(0.12, 0.34, 0.02, 0.01), M(shade(C.top, -0.08)), x * 0.1, 0.44, 0.166, 0, 0, x * 0.25); add(body, rbox(0.26, 0.42, 0.02, 0.01), M(C.bottom), 0, 0.42, 0.158); add(body, rbox(0.15, 0.13, 0.02, 0.01), M(shade(C.top, -0.06)), -0.17, 0.2, 0.168); add(body, rbox(0.03, 0.12, 0.03, 0.01), M('#2f6bff'), -0.14, 0.27, 0.172); add(body, rbox(0.03, 0.11, 0.03, 0.01), M('#ff2d55'), -0.19, 0.27, 0.172); }
      if (L.top === 'chef') { add(body, rbox(0.4, 0.08, 0.33, 0.04), M(C.top), 0, 0.58, 0); add(body, rbox(0.22, 0.09, 0.05, 0.03), M('#ff2d55'), 0, 0.53, 0.17); for (const x of [-0.09, 0.09]) for (let k = 0; k < 3; k++) add(body, sph(0.022, 6, 5), M('#2b2f48'), x, 0.42 - k * 0.12, 0.165); }
      if (L.top === 'thobe') { add(body, rbox(0.6, 0.66, 0.33, 0.06), M(C.top), 0, -0.26, 0); add(body, rbox(0.28, 0.06, 0.33, 0.03), M(shade(C.top, -0.05)), 0, 0.59, 0); add(body, rbox(0.03, 0.26, 0.02, 0.01), M(shade(C.top, -0.12)), 0, 0.42, 0.162); }
      if (L.top === 'astro') { add(body, rbox(0.62, 0.11, 0.34, 0.04), M('#c7cede'), 0, 0.04, 0); add(body, rbox(0.26, 0.18, 0.03, 0.02), M('#2b2f48'), 0, 0.32, 0.165); for (const [x, c] of [[-0.07, '#ff2d55'], [0, '#ffc21a'], [0.07, '#18c95a']]) add(body, sph(0.025, 6, 5), M(c), x, 0.35, 0.185); add(body, rbox(0.14, 0.04, 0.02, 0.01), M('#1fb8ff'), 0, 0.27, 0.185); add(body, GC.af || (GC.af = new THREE.PlaneGeometry(0.12, 0.08)), basic(flagTex()), 0.17, 0.48, 0.158); }
      if (L.bottom === 'skirt') add(body, cyl(0.3, 0.42, 0.3, 18), M(C.bottom), 0, -0.04, 0);
      else if (L.bottom === 'longskirt') add(body, cyl(0.3, 0.44, 0.62, 18), M(C.bottom), 0, -0.2, 0);
      else add(body, rbox(0.58, 0.12, 0.31, 0.04), M(thobe ? C.top : C.bottom), 0, 0.02, 0); // waistband
    } else {
      if (L.dress === 'dress') add(body, cyl(0.31, 0.46, 0.36, 18), M(C.dress), 0, -0.06, 0);
      else add(body, cyl(0.31, L.dress === 'princess' ? 0.6 : 0.46, 0.66, 20), M(C.dress), 0, -0.22, 0);
      add(body, rbox(0.6, 0.06, 0.32, 0.03), M('#ffffff'), 0, 0.14, 0);
      if (L.dress === 'princess') { const gm = gold(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; add(body, starGeo(0.05), gm, Math.sin(a) * 0.5, -0.42, Math.cos(a) * 0.5, 0, a, 0); } add(body, starGeo(0.07), gm, 0, 0.38, 0.165); }
    }
    if (!dress && L.print && L.print !== 'none') add(body, GC.pp || (GC.pp = new THREE.PlaneGeometry(0.26, 0.26)), basic(printTex(L.print)), 0, 0.33, L.top === 'jacket' ? 0.17 : 0.158).position.x = L.top === 'jacket' ? 0.15 : 0;
    // arms
    P.arms = [-1, 1].map((s) => {
      const p = new THREE.Group(); p.position.set(s * 0.4, 0.53, 0); body.add(p);
      const full = dress ? L.dress !== 'dress' : ['long', 'hoodie', 'jacket', 'lab', 'chef', 'thobe', 'astro'].includes(L.top), bare = !dress && L.top === 'tank';
      add(p, rbox(0.2, 0.55, 0.22, 0.06), M(full ? topC : skin), 0, -0.24, 0);
      if (!full && !bare) add(p, rbox(0.22, 0.22, 0.24, 0.06), M(topC), 0, -0.07, 0);
      if (full) add(p, rbox(0.19, 0.1, 0.21, 0.04), M(!dress && L.top === 'astro' ? '#ff7a1a' : skin), 0, -0.5, 0);
      if (!dress && L.top === 'astro') add(p, rbox(0.22, 0.07, 0.24, 0.03), M('#c7cede'), 0, -0.42, 0);
      if (!dress && L.top === 'jersey') add(p, rbox(0.23, 0.04, 0.25, 0.02), M('#ffffff'), 0, -0.17, 0);
      if (!dress && L.top === 'tank') add(p, rbox(0.1, 0.06, 0.2, 0.02), M(C.top), -s * 0.04, 0.02, 0);
      return p;
    });
    // neck (LOLO_NECK)
    add(body, cyl(0.13, 0.14, 0.22, 14), M(L.hair === 'hijab' ? C.hair : skin), 0, 0.66, 0);
    // head
    const head = new THREE.Group(); head.position.y = 0.74; body.add(head); P.head = head;
    add(head, rbox(0.56, 0.52, 0.5, 0.15), M(skin), 0, 0.27, 0);
    add(head, GC.fp || (GC.fp = new THREE.PlaneGeometry(0.46, 0.4)), basic(faceTex(L.face || 'smile', L.g === 'girl')), 0, 0.23, 0.252);
    hair(head, L, M(C.hair), add);
    hat(head, L, C, M, add);
    glasses(head, L, C, M, add);
    bag(body, L, C, M, add);
    g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
    bake(g, [P.legs[0], P.legs[1], P.body, P.arms[0], P.arms[1], P.head]);
    g.scale.setScalar(scale); g.P = P; g.phase = 0; g.look = L;
    return g;
  }
  function shade(hex, k) { const c = new THREE.Color(hex); const h = {}; c.getHSL(h); c.setHSL(h.h, h.s, Math.max(0, Math.min(1, h.l + k))); return '#' + c.getHexString(); }

  function hair(head, L, m, add) {
    const s = L.hair;
    if (s === 'hijab') {
      add(head, rbox(0.66, 0.14, 0.58, 0.07), m, 0, 0.56, -0.01);
      for (const x of [-1, 1]) add(head, rbox(0.07, 0.62, 0.56, 0.03), m, x * 0.31, 0.26, -0.01);
      add(head, rbox(0.66, 0.66, 0.08, 0.04), m, 0, 0.25, -0.27);
      add(head, rbox(0.62, 0.07, 0.07, 0.03), m, 0, 0.0, 0.24);
      add(head, rbox(0.7, 0.22, 0.42, 0.1), m, 0, -0.04, -0.02);
      add(head, rbox(0.54, 0.06, 0.06, 0.03), m, 0, 0.5, 0.25);
      return;
    }
    // base cap of hair for every style
    add(head, rbox(0.6, 0.17, 0.55, 0.08), m, 0, 0.55, -0.01);
    add(head, rbox(0.6, 0.36, 0.1, 0.05), m, 0, 0.38, -0.24);
    if (s !== 'curly') add(head, rbox(0.58, 0.09, 0.07, 0.035), m, s === 'side' ? 0.04 : 0, 0.5, 0.235, 0, 0, s === 'side' ? -0.12 : 0);
    if (s === 'spiky') for (let i = 0; i < 5; i++) add(head, cyl(0, 0.08, 0.2, 5), m, -0.2 + i * 0.1, 0.7, -0.02 - (i % 2) * 0.08, -0.25, 0, (i - 2) * 0.12);
    if (s === 'side') add(head, rbox(0.3, 0.16, 0.1, 0.05), m, 0.14, 0.5, 0.22, 0, 0, -0.25);
    if (s === 'curly') { const pts = [[-0.22, 0.6, 0.12], [0, 0.66, 0.14], [0.22, 0.6, 0.12], [-0.27, 0.5, -0.1], [0.27, 0.5, -0.1], [-0.12, 0.68, -0.08], [0.12, 0.68, -0.08], [0, 0.6, -0.24], [-0.24, 0.44, -0.22], [0.24, 0.44, -0.22], [-0.26, 0.38, 0.06], [0.26, 0.38, 0.06]]; for (const [x, y, z] of pts) add(head, sph(0.12, 8, 6), m, x, y, z); }
    if (s === 'long' || s === 'braids' || s === 'pony' || s === 'buns' || s === 'bob') for (const x of [-1, 1]) add(head, rbox(0.08, s === 'bob' ? 0.42 : 0.4, 0.46, 0.04), m, x * 0.3, s === 'bob' ? 0.3 : 0.36, -0.02);
    if (s === 'long') { add(head, rbox(0.62, 0.72, 0.12, 0.06), m, 0, 0.08, -0.26); for (const x of [-1, 1]) add(head, rbox(0.1, 0.5, 0.12, 0.05), m, x * 0.28, -0.02, 0.1); }
    if (s === 'bob') add(head, rbox(0.62, 0.42, 0.12, 0.06), m, 0, 0.25, -0.25);
    if (s === 'pony') { add(head, sph(0.11), m, 0, 0.52, -0.33); add(head, rbox(0.14, 0.5, 0.14, 0.07), m, 0, 0.22, -0.38, 0.25, 0, 0); add(head, sph(0.06), toon('#ff3f9a'), 0, 0.53, -0.38); }
    if (s === 'buns') for (const x of [-1, 1]) { add(head, sph(0.13), m, x * 0.24, 0.66, -0.06); add(head, sph(0.05), toon('#ff3f9a'), x * 0.2, 0.6, 0.04); }
    if (s === 'braids') for (const x of [-1, 1]) for (let k = 0; k < 5; k++) add(head, sph(0.075, 8, 6), m, x * 0.3, 0.12 - k * 0.12, 0.06 - k * 0.01);
    if (s === 'puffs') for (const x of [-1, 1]) { add(head, sph(0.2, 12, 10), m, x * 0.3, 0.68, -0.04); add(head, cyl(0.1, 0.1, 0.05, 12), toon('#ffc21a'), x * 0.23, 0.6, -0.04, 0, 0, x * 0.9); }
    if (s === 'quiff' && (!L.hat || L.hat === 'none' || L.hat === 'band')) { add(head, rbox(0.46, 0.16, 0.2, 0.07), m, 0, 0.66, 0.14, -0.35, 0, 0); add(head, rbox(0.3, 0.1, 0.14, 0.05), m, 0.05, 0.74, 0.22, -0.6, 0, 0); }
  }
  function hat(head, L, C, M, add) {
    const s = L.hat, m = M(C.hat);
    if (!s || s === 'none') return;
    if (L.hair === 'hijab' && ['cap', 'beanie', 'party', 'chef', 'ghutra', 'safari', 'band'].includes(s)) return;
    if (s === 'cap') { add(head, rbox(0.62, 0.2, 0.58, 0.09), m, 0, 0.62, -0.01); add(head, rbox(0.46, 0.04, 0.26, 0.02), m, 0, 0.55, 0.36, 0.12, 0, 0); add(head, sph(0.04), M('#ffffff'), 0, 0.73, 0); }
    if (s === 'beanie') { add(head, rbox(0.64, 0.24, 0.6, 0.11), m, 0, 0.62, -0.01); add(head, rbox(0.66, 0.08, 0.62, 0.04), M('#ffffff'), 0, 0.51, -0.01); add(head, sph(0.08), M('#ffffff'), 0, 0.79, 0); }
    if (s === 'flower') { add(head, rbox(0.64, 0.05, 0.08, 0.02), m, 0, 0.6, 0.12, -0.3, 0, 0); for (const [x, c] of [[-0.2, '#ff4fc8'], [0, '#ffd23f'], [0.2, '#7a4dff']]) { for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; add(head, sph(0.04, 6, 5), M(c), x + Math.cos(a) * 0.05, 0.66 + Math.sin(a) * 0.05, 0.18); } add(head, sph(0.03, 6, 5), M('#ffffff'), x, 0.66, 0.21); } }
    if (s === 'phones') { add(head, rbox(0.06, 0.08, 0.5, 0.03), m, 0, 0.68, 0, 0, Math.PI / 2, 0); add(head, rbox(0.66, 0.06, 0.08, 0.03), m, 0, 0.64, 0); for (const x of [-1, 1]) { add(head, cyl(0.1, 0.1, 0.08, 14), m, x * 0.32, 0.3, 0, 0, 0, Math.PI / 2); add(head, cyl(0.06, 0.06, 0.09, 12), M('#ffffff'), x * 0.33, 0.3, 0, 0, 0, Math.PI / 2); } }
    if (s === 'party') { add(head, cyl(0.02, 0.18, 0.36, 14), m, 0.06, 0.8, 0, 0, 0, -0.15); add(head, sph(0.06), M('#ffd23f'), 0.09, 0.99, 0); }
    if (s === 'crown') { const gm = gold(); add(head, cyl(0.24, 0.26, 0.14, 14, 1), gm, 0, 0.7, 0); for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; add(head, cyl(0, 0.05, 0.14, 4), gm, Math.cos(a) * 0.22, 0.82, Math.sin(a) * 0.22); } add(head, sph(0.04), M('#ff2d55'), 0, 0.7, 0.25); }
    if (s === 'chef') { const w = M('#ffffff'); add(head, cyl(0.28, 0.27, 0.2, 18), w, 0, 0.66, 0); for (const [x, z] of [[-0.13, 0], [0.13, 0], [0, 0.1], [0, -0.1], [0, 0]]) add(head, sph(0.17, 12, 10), w, x, 0.84, z); }
    if (s === 'ghutra') { const cm = new THREE.MeshToonMaterial({ map: (() => { const t = checkTex(C.hat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t; })() }); add(head, rbox(0.68, 0.16, 0.62, 0.07), cm, 0, 0.58, -0.01); for (const x of [-1, 1]) add(head, rbox(0.07, 0.7, 0.58, 0.03), cm, x * 0.33, 0.24, -0.03); add(head, rbox(0.7, 0.86, 0.08, 0.04), cm, 0, 0.18, -0.3); for (const x of [-1, 1]) add(head, rbox(0.12, 0.5, 0.16, 0.04), cm, x * 0.3, -0.12, 0.12, 0, 0, x * 0.12); const ag = M('#1d2030'); for (const y of [0.66, 0.71]) add(head, GC.agal || (GC.agal = new THREE.TorusGeometry(0.3, 0.025, 6, 24)), ag, 0, y, -0.01, Math.PI / 2, 0, 0); }
    if (s === 'safari') { add(head, cyl(0.46, 0.46, 0.03, 24), m, 0, 0.6, 0); add(head, cyl(0.25, 0.3, 0.2, 20), m, 0, 0.7, 0); add(head, cyl(0.305, 0.305, 0.05, 20), M('#5b3a1e'), 0, 0.63, 0); }
    if (s === 'band') { add(head, rbox(0.6, 0.08, 0.53, 0.03), m, 0, 0.47, 0); add(head, rbox(0.04, 0.09, 0.02, 0.01), M('#ffffff'), 0.1, 0.47, 0.268); }
    if (s === 'helmet') { add(head, sph(0.48, 22, 16), new THREE.MeshToonMaterial({ color: C.hat || '#bfe6ff', transparent: true, opacity: 0.32, depthWrite: false }), 0, 0.3, 0.02); add(head, cyl(0.36, 0.38, 0.1, 22), M('#c7cede'), 0, -0.05, 0); add(head, rbox(0.08, 0.14, 0.06, 0.02), M('#ff7a1a'), 0.3, 0.55, 0.12); }
    if (s === 'tiara') { const gm = gold(); add(head, rbox(0.5, 0.05, 0.06, 0.02), gm, 0, 0.64, 0.14, -0.4, 0, 0); add(head, starGeo(0.08), gm, 0, 0.73, 0.16); add(head, sph(0.035), M('#2fb8ff'), 0, 0.73, 0.19); for (const x of [-1, 1]) add(head, starGeo(0.045), gm, x * 0.15, 0.69, 0.15); }
  }
  function glasses(head, L, C, M, add) {
    const s = L.glasses; if (!s || s === 'none') return; const m = s === 'star' ? gold() : M(C.glasses), z = 0.265;
    if (s === 'round') { for (const x of [-1, 1]) { const t = add(head, GC.tor || (GC.tor = new THREE.TorusGeometry(0.075, 0.016, 6, 16)), m, x * 0.11, 0.25, z); } add(head, rbox(0.06, 0.02, 0.02, 0.008), m, 0, 0.26, z); }
    if (s === 'sun') { for (const x of [-1, 1]) add(head, rbox(0.17, 0.11, 0.03, 0.03), M('#1d2030'), x * 0.11, 0.25, z); add(head, rbox(0.44, 0.03, 0.03, 0.01), m, 0, 0.3, z); }
    if (s === 'heart') { for (const x of [-1, 1]) add(head, heartGeo(0.07), m, x * 0.11, 0.25, z); add(head, rbox(0.06, 0.02, 0.02, 0.008), m, 0, 0.27, z); }
    if (s === 'star') { for (const x of [-1, 1]) add(head, starGeo(0.1), m, x * 0.11, 0.25, z); }
    if (s === 'goggles') { add(head, rbox(0.6, 0.06, 0.52, 0.03), M('#2b2f48'), 0, 0.26, 0); for (const x of [-1, 1]) { add(head, cyl(0.1, 0.1, 0.06, 16), m, x * 0.12, 0.26, z + 0.01, Math.PI / 2, 0, 0); add(head, cyl(0.075, 0.075, 0.065, 16), new THREE.MeshToonMaterial({ color: '#d9f4ff', transparent: true, opacity: 0.7 }), x * 0.12, 0.26, z + 0.02, Math.PI / 2, 0, 0); } }
  }
  function bag(body, L, C, M, add) {
    const s = L.bag, m = M(C.bag); if (!s || s === 'none') return;
    if (s === 'backpack') { add(body, rbox(0.44, 0.46, 0.18, 0.08), m, 0, 0.3, -0.24); add(body, rbox(0.3, 0.16, 0.06, 0.04), M(shade(C.bag, 0.12)), 0, 0.2, -0.34); for (const x of [-1, 1]) add(body, rbox(0.06, 0.5, 0.03, 0.01), m, x * 0.16, 0.3, 0.158); }
    if (s === 'purse') { add(body, rbox(0.04, 0.03, 0.66, 0.01), m, 0, 0.32, 0, 0.9, 0, 0.6); add(body, rbox(0.2, 0.18, 0.08, 0.05), m, 0.32, 0.02, 0.06); add(body, heartGeo(0.03), M('#ffffff'), 0.32, 0.03, 0.105); }
    if (s === 'cape') { const cp = add(body, rbox(0.56, 0.86, 0.03, 0.015), m, 0, 0.12, -0.2, 0.12, 0, 0); add(body, rbox(0.52, 0.06, 0.34, 0.03), m, 0, 0.58, 0); add(body, starGeo(0.08), gold(), 0, 0.35, -0.225, 0, Math.PI, 0); }
    if (s === 'jetpack') { add(body, rbox(0.4, 0.42, 0.1, 0.05), m, 0, 0.3, -0.21); for (const x of [-1, 1]) { add(body, cyl(0.09, 0.09, 0.5, 14), m, x * 0.13, 0.28, -0.3); add(body, cyl(0.1, 0.06, 0.08, 14), M('#2b2f48'), x * 0.13, 0.0, -0.3); add(body, cyl(0.06, 0.0, 0.16, 10), toon('#ffb31a', { emissive: '#ff7a1a', emissiveIntensity: 0.6 }), x * 0.13, -0.11, -0.3, Math.PI, 0, 0); } add(body, rbox(0.12, 0.08, 0.04, 0.02), M('#ff2d55'), 0, 0.42, -0.27); }
    if (s === 'wings') for (const x of [-1, 1]) { const w = add(body, heartGeo(0.22), new THREE.MeshToonMaterial({ color: x < 0 ? '#ff9fd0' : '#c7a6ff', transparent: true, opacity: 0.85 }), x * 0.3, 0.42, -0.24, 0, x * 0.5, x * 0.9); }
  }

  // old character definitions (NPCs, park) -> looks
  function defToLook(d) {
    if (d.g && d.c) return d;
    const girl = d.kind === 'girl' || d.kind === 'hijab';
    return {
      g: girl ? 'girl' : 'boy', skin: Math.max(0, SKIN.findIndex((s) => s === d.skin)) || [1, 3, 4, 0][(d.skin || '').length % 4], face: girl ? 'smile' : 'happy',
      hair: d.kind === 'hijab' ? 'hijab' : d.kind === 'curly' ? 'curly' : d.bun ? 'buns' : girl ? 'long' : 'short', top: d.kind === 'hijab' ? 'long' : 'tee', print: 'none',
      bottom: d.kind === 'hijab' ? 'longskirt' : 'pants', dress: 'none', shoes: 'sneakers', hat: d.hat || d.kind === 'boy' ? 'cap' : 'none', glasses: d.kind === 'curly' ? 'round' : 'none', bag: 'none',
      c: { hair: d.hair || '#3a2416', top: d.top, bottom: d.bottom, dress: d.top, shoes: d.shoe || '#ffffff', hat: d.hat || d.cap || '#7a4dff', bag: '#ff4fc8', glasses: '#2b2f48' },
    };
  }
  // small-change randomiser for "surprise me"
  function randomLook(g) {
    const pick = (a) => a[Math.floor(Math.random() * a.length)], free = (slot) => WARD[slot].filter((x) => !x.lock).map((x) => x.id);
    const girl = g === 'girl';
    const hairs = girl ? ['long', 'pony', 'buns', 'braids', 'bob', 'hijab', 'curly'] : ['short', 'spiky', 'curly', 'side'];
    const L = { g, skin: Math.floor(Math.random() * SKIN.length), face: pick(free('face')), hair: pick(hairs), top: pick(free('top')), print: pick(free('print')), bottom: pick(girl ? ['pants', 'skirt', 'longskirt', 'shorts'] : ['pants', 'shorts']), dress: girl && Math.random() < 0.3 ? pick(['dress', 'long']) : 'none', shoes: pick(free('shoes')), hat: Math.random() < 0.5 ? 'none' : pick(free('hat').filter((x) => x !== 'none')), glasses: Math.random() < 0.7 ? 'none' : pick(['round', 'sun', 'heart']), bag: Math.random() < 0.5 ? 'none' : pick(['backpack', 'purse']), c: {} };
    for (const k of Object.values(COLOR_SLOTS)) L.c[k] = pick(PAL.slice(0, 13)); L.c.hair = pick(HAIRC); L.c.shoes = pick(['#ffffff', ...PAL.slice(0, 12)]);
    return L;
  }
  return { makeAvatar, defToLook, randomLook };
}
