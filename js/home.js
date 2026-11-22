// LOLO BOX — HOUSE INTERIOR (the room the player enters from their house door)
// One reusable room placed far from the city at HOME_OFF, sharing the same player, camera, input and UI.
// Decoration state lives in S.house.in = { wall, floor, f: { slotId: variantIndex } }.

export const HOME_OFF = -3000;

export function buildHome(C) {
  const { THREE, scene, ctex, solids, sfx, toast } = C;
  const OFF = HOME_OFF, HX = 8, HZ = 6.5, WH = 4.4; // half-width, half-depth, wall height
  const root = new THREE.Group(); root.position.x = OFF; scene.add(root);
  const mat = (c, extra) => new THREE.MeshToonMaterial(Object.assign({ color: c, gradientMap: C.grad }, extra || {}));
  const M = {}; const shared = (c) => M[c] || (M[c] = mat(c));
  const mesh = (geo, m, x, y, z, p) => { const o = new THREE.Mesh(geo, typeof m === 'string' ? shared(m) : m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; (p || root).add(o); return o; };
  const box = (w, h, d, c, x, y, z, p) => mesh(new THREE.BoxGeometry(w, h, d), c, x, y, z, p);
  const cyl = (r1, r2, h, c, x, y, z, p, seg = 18) => mesh(new THREE.CylinderGeometry(r1, r2, h, seg), c, x, y, z, p);
  const sph = (r, c, x, y, z, p) => mesh(new THREE.SphereGeometry(r, 16, 12), c, x, y, z, p);

  // ---------------- options ----------------
  const WALLS = ['#ffe3f1', '#e6dcff', '#d6f0ff', '#fff3c4', '#dcf7e0', '#ffffff'];
  const FLOORS = [
    { name: 'خشب', draw: (g, w, h) => { g.fillStyle = '#e0a868'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#d99c5a' : '#e8b376'; g.fillRect(0, i * h / 4, w, h / 4 - 2); g.fillStyle = '#c48a4c'; g.fillRect((i * 37) % w, i * h / 4, 3, h / 4 - 2); } } },
    { name: 'مربعات', draw: (g, w, h) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#ffffff' : '#ffb7dc'; g.fillRect(i * w / 2, j * h / 2, w / 2, h / 2); } } },
    { name: 'سجاد', draw: (g, w, h) => { g.fillStyle = '#7fb6ff'; g.fillRect(0, 0, w, h); g.fillStyle = '#97c4ff'; for (let i = 0; i < 60; i++) g.fillRect((i * 53) % w, (i * 29) % h, 4, 4); } },
    { name: 'بلاط', draw: (g, w, h) => { g.fillStyle = '#f4f1ff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#cfc6ee'; g.lineWidth = 4; g.strokeRect(0, 0, w, h); } },
    { name: 'نعناعي', draw: (g, w, h) => { g.fillStyle = '#bfeed2'; g.fillRect(0, 0, w, h); g.fillStyle = '#a9e4c2'; for (let i = 0; i < 4; i++) g.fillRect(0, i * h / 4, w, 5); } },
  ];
  const COL = ['#ff5fb0', '#4da3ff', '#9b5cff', '#ffc021'];
  const COLN = ['وردي', 'أزرق', 'بنفسجي', 'أصفر'];
  // every slot: where it sits, its footprint (for collisions) and the variants the player can switch between
  const SLOTS = [
    { id: 'bed', name: 'السرير', icon: '🛏️', x: -5.4, z: -3.9, solid: [3.2, 4.6], names: COLN },
    { id: 'sofa', name: 'الكنبة', icon: '🛋️', x: 6.6, z: 0.6, solid: [2.0, 4.4], names: COLN },
    { id: 'rug', name: 'السجادة', icon: '🟣', x: 0.6, z: 0.8, names: ['دائرة', 'نجمة', 'مخططة', 'بدون'] },
    { id: 'shelf', name: 'الركن', icon: '📺', x: 1.2, z: -5.6, solid: [3.6, 1.4], names: ['تلفزيون', 'مكتبة', 'صندوق ألعاب'] },
    { id: 'lamp', name: 'الأباجورة', icon: '💡', x: -1.9, z: -5.4, solid: [0.9, 0.9], names: COLN },
    { id: 'art', name: 'اللوحة', icon: '🖼️', x: 5.2, z: -6.42, names: ['سمكة', 'نجمة', 'قلب', 'قوس قزح'] },
    { id: 'plant', name: 'الزرع', icon: '🪴', x: -6.9, z: 4.9, solid: [1.1, 1.1], names: ['نبتة', 'صبار', 'ورد'] },
    { id: 'table', name: 'الترابيزة', icon: '🧁', x: 0.6, z: 0.8, solid: [1.7, 1.7], names: ['عصير وكيك', 'كتب وألوان', 'بدون'] },
  ];

  // ---------------- room shell ----------------
  const floorMat = mat('#ffffff'); const floorTex = [];
  const floorTexAt = (n) => floorTex[n] || (floorTex[n] = (() => { const t = ctex(128, 128, FLOORS[n].draw, true); t.repeat.set(HX, HZ); return t; })());
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HX * 2, HZ * 2), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.01; floor.receiveShadow = true; root.add(floor);
  // dark surround so the room never floats in the sky when the camera looks past a wall
  const out = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshBasicMaterial({ color: '#3b2a63' })); out.rotation.x = -Math.PI / 2; out.position.y = -0.02; root.add(out);
  const wallMat = mat(WALLS[0]);
  // walls face inwards only: a wall between the camera and the player is culled, so the view is never blocked
  const wall = (w, x, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, WH), wallMat); m.position.set(x, WH / 2, z); m.rotation.y = ry; m.receiveShadow = true; root.add(m); return m; };
  wall(HX * 2, 0, -HZ, 0); wall(HX * 2, 0, HZ, Math.PI); wall(HZ * 2, -HX, 0, Math.PI / 2); wall(HZ * 2, HX, 0, -Math.PI / 2);
  // skirting + window + door (static)
  const skirt = (w, x, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.3), shared('#ffffff')); m.position.set(x, 0.15, z); m.rotation.y = ry; root.add(m); };
  skirt(HX * 2, 0, -HZ + 0.01, 0); skirt(HX * 2, 0, HZ - 0.01, Math.PI); skirt(HZ * 2, -HX + 0.01, 0, Math.PI / 2); skirt(HZ * 2, HX - 0.01, 0, -Math.PI / 2);
  { // window on the left wall with a sky view and curtains
    const g = new THREE.Group(); g.position.set(-HX + 0.03, 2.5, 1.2); g.rotation.y = Math.PI / 2; root.add(g);
    const sky = ctex(128, 96, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7fd0ff'); gr.addColorStop(1, '#d8f3ff'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; [[30, 30, 14], [46, 26, 18], [62, 32, 13], [92, 58, 12], [104, 54, 15]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }); c.fillStyle = '#7ed36a'; c.fillRect(0, h - 14, w, 14); });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2), new THREE.MeshBasicMaterial({ map: sky, toneMapped: false })); g.add(p);
    box(3.5, 0.14, 0.12, '#ffffff', 0, 1.05, 0.05, g); box(3.5, 0.14, 0.12, '#ffffff', 0, -1.05, 0.05, g); box(0.14, 2.2, 0.12, '#ffffff', -1.7, 0, 0.05, g); box(0.14, 2.2, 0.12, '#ffffff', 1.7, 0, 0.05, g); box(0.08, 2, 0.1, '#ffffff', 0, 0, 0.05, g);
    box(0.7, 2.5, 0.1, '#ff8cc8', -2.0, -0.1, 0.1, g); box(0.7, 2.5, 0.1, '#ff8cc8', 2.0, -0.1, 0.1, g); box(4.9, 0.12, 0.16, '#ffc021', 0, 1.25, 0.12, g);
  }
  { // exit door on the front wall
    const g = new THREE.Group(); g.position.set(0, 0, HZ - 0.03); g.rotation.y = Math.PI; root.add(g);
    const pl = (w, h, c, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), shared(c)); m.position.set(x, y, z); g.add(m); return m; };
    pl(2.3, 3.35, '#ffffff', 0, 1.675, 0.01); pl(1.9, 3.1, '#8a4b2a', 0, 1.55, 0.02); pl(1.5, 1.1, '#a3602f', 0, 2.2, 0.03); pl(1.5, 1.1, '#a3602f', 0, 0.85, 0.03); const kn = new THREE.Mesh(new THREE.CircleGeometry(0.11, 16), shared('#ffc021')); kn.position.set(0.72, 1.55, 0.04); g.add(kn);
    const mt = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.2), shared('#b45cff')); mt.rotation.x = -Math.PI / 2; mt.position.set(0, 0.03, 0.9); g.add(mt);
  }
  { // paint pots beside the door: opens the decoration panel
    const g = new THREE.Group(); g.position.set(3.4, 0, HZ - 1.0); root.add(g);
    ['#ff5fb0', '#4da3ff', '#ffc021'].forEach((c, i) => { cyl(0.28, 0.24, 0.5, '#f1f1f6', (i - 1) * 0.62, 0.25, 0, g); cyl(0.24, 0.24, 0.06, c, (i - 1) * 0.62, 0.5, 0, g); });
  }

  // ---------------- furniture builders ----------------
  const artTex = [];
  const artDraw = [
    (g, w, h) => { g.fillStyle = '#cfeeff'; g.fillRect(0, 0, w, h); g.fillStyle = '#4da3ff'; g.beginPath(); g.ellipse(w * 0.46, h / 2, w * 0.26, h * 0.26, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(w * 0.68, h / 2); g.lineTo(w * 0.9, h * 0.28); g.lineTo(w * 0.9, h * 0.72); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(w * 0.36, h * 0.44, 9, 0, 7); g.fill(); g.fillStyle = '#2a1650'; g.beginPath(); g.arc(w * 0.36, h * 0.44, 4, 0, 7); g.fill(); },
    (g, w, h) => { g.fillStyle = '#e6dcff'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffc021'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? h * 0.16 : h * 0.38; g.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } g.fill(); },
    (g, w, h) => { g.fillStyle = '#fff3c4'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff5fb0'; g.beginPath(); g.arc(w * 0.38, h * 0.42, h * 0.2, 0, 7); g.arc(w * 0.62, h * 0.42, h * 0.2, 0, 7); g.fill(); g.beginPath(); g.moveTo(w * 0.2, h * 0.5); g.lineTo(w / 2, h * 0.86); g.lineTo(w * 0.8, h * 0.5); g.fill(); },
    (g, w, h) => { g.fillStyle = '#d6f0ff'; g.fillRect(0, 0, w, h); ['#ff5f5f', '#ffa53d', '#ffe14a', '#5fd06b', '#4da3ff', '#9b5cff'].forEach((c, i) => { g.strokeStyle = c; g.lineWidth = 9; g.beginPath(); g.arc(w / 2, h * 0.86, h * 0.62 - i * 9, Math.PI, 0); g.stroke(); }); },
  ];
  const BUILD = {
    bed(g, v) { const c = COL[v]; box(3, 0.5, 4.4, '#f5e2c8', 0, 0.3, 0, g); box(2.8, 0.36, 4.1, '#ffffff', 0, 0.72, 0, g); box(2.86, 0.4, 2.6, c, 0, 0.78, 0.76, g); box(3.1, 1.7, 0.26, c, 0, 0.95, -2.2, g); box(1.5, 0.26, 0.8, '#ffffff', 0, 1.0, -1.5, g); sph(0.2, '#ffc021', -1.35, 1.9, -2.2, g); sph(0.2, '#ffc021', 1.35, 1.9, -2.2, g); },
    sofa(g, v) { const c = COL[v]; box(1.7, 0.6, 4.2, c, 0, 0.42, 0, g); box(0.5, 1.2, 4.2, c, 0.62, 1.0, 0, g); box(1.7, 0.5, 0.5, c, 0, 0.86, -2.0, g); box(1.7, 0.5, 0.5, c, 0, 0.86, 2.0, g); box(0.7, 0.5, 0.9, '#ffffff', -0.1, 0.92, -1.0, g); box(0.7, 0.5, 0.9, '#ffe14a', -0.1, 0.92, 1.0, g); },
    rug(g, v) {
      if (v === 3) return;
      if (v === 0) { const m = new THREE.Mesh(new THREE.CircleGeometry(2.7, 36), shared('#ff9fd0')); m.rotation.x = -Math.PI / 2; m.position.y = 0.03; g.add(m); const n = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.3, 36), shared('#ffffff')); n.rotation.x = -Math.PI / 2; n.position.y = 0.04; g.add(n); }
      if (v === 1) { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 1.5 : 3.1; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), shared('#ffd23f')); m.rotation.x = -Math.PI / 2; m.position.y = 0.03; g.add(m); }
      if (v === 2) { for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 0.62), shared(i % 2 ? '#ffffff' : '#7fb6ff')); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.03, (i - 2.5) * 0.62); g.add(m); } }
    },
    shelf(g, v) {
      if (v === 0) { box(3.4, 0.8, 1.2, '#ffffff', 0, 0.4, 0, g); box(3.0, 1.8, 0.16, '#2a2a35', 0, 1.9, 0, g); const p = new THREE.Mesh(new THREE.PlaneGeometry(2.76, 1.56), new THREE.MeshBasicMaterial({ color: '#59c8ff', toneMapped: false })); p.position.set(0, 1.9, 0.09); g.add(p); sph(0.34, '#ffd23f', 0.5, 1.95, 0.1, g).scale.z = 0.1; box(0.5, 0.2, 0.5, '#2a2a35', 0, 0.9, 0, g); }
      if (v === 1) { box(3.4, 2.9, 1.0, '#f5e2c8', 0, 1.45, -0.1, g); for (let r = 0; r < 3; r++) { box(3.1, 0.08, 0.9, '#c9925a', 0, 0.55 + r * 0.9, 0.05, g); for (let k = 0; k < 7; k++) box(0.26, 0.62, 0.6, ['#ff5fb0', '#4da3ff', '#ffc021', '#5fd06b', '#9b5cff'][(k + r) % 5], -1.25 + k * 0.4, 0.92 + r * 0.9, 0.2, g); } }
      if (v === 2) { box(3.2, 1.2, 1.2, '#ff8cc8', 0, 0.6, 0, g); box(3.3, 0.18, 1.3, '#ffc021', 0, 1.28, 0, g); sph(0.42, '#4da3ff', -0.9, 1.75, 0, g); sph(0.34, '#ffc021', 0.1, 1.68, 0.1, g); box(0.6, 0.6, 0.6, '#5fd06b', 0.95, 1.66, 0, g); sph(0.2, '#ffffff', 0.1, 2.05, 0.1, g); }
    },
    lamp(g, v) { cyl(0.38, 0.42, 0.1, '#ffffff', 0, 0.05, 0, g); cyl(0.05, 0.05, 2.3, '#ffffff', 0, 1.2, 0, g); const s = mesh(new THREE.CylinderGeometry(0.34, 0.6, 0.72, 18, 1, true), mat(COL[v], { emissive: COL[v], emissiveIntensity: 0.45, side: THREE.DoubleSide }), 0, 2.55, 0, g); s.castShadow = false; },
    art(g, v) { box(2.5, 1.9, 0.1, '#ffc021', 0, 2.75, 0, g); const t = artTex[v] || (artTex[v] = ctex(160, 120, artDraw[v])); const p = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); p.position.set(0, 2.75, 0.06); g.add(p); },
    plant(g, v) {
      cyl(0.42, 0.32, 0.6, v === 2 ? '#ffffff' : '#ff8a3c', 0, 0.3, 0, g);
      if (v === 0) { for (let i = 0; i < 6; i++) { const l = sph(0.34, '#3fbf5f', Math.cos(i) * 0.3, 0.95 + (i % 3) * 0.28, Math.sin(i * 1.7) * 0.3, g); l.scale.y = 1.5; } }
      if (v === 1) { cyl(0.26, 0.26, 1.2, '#2fa85a', 0, 1.15, 0, g); sph(0.26, '#2fa85a', 0, 1.75, 0, g); cyl(0.13, 0.13, 0.5, '#2fa85a', 0.34, 1.2, 0, g); sph(0.1, '#ff5fb0', 0, 2.02, 0, g); }
      if (v === 2) { ['#ff5fb0', '#ffc021', '#9b5cff', '#ff5fb0', '#4da3ff'].forEach((c, i) => { cyl(0.03, 0.03, 0.7, '#3fbf5f', Math.cos(i * 1.3) * 0.2, 0.9, Math.sin(i * 1.3) * 0.2, g); sph(0.2, c, Math.cos(i * 1.3) * 0.26, 1.3 + (i % 2) * 0.14, Math.sin(i * 1.3) * 0.26, g); }); }
    },
    table(g, v) {
      if (v === 2) return;
      cyl(0.8, 0.8, 0.12, '#ffffff', 0, 0.78, 0, g, 28); cyl(0.12, 0.2, 0.72, '#ffc021', 0, 0.36, 0, g);
      if (v === 0) { cyl(0.34, 0.34, 0.22, '#ff9fd0', -0.2, 0.95, 0.1, g); cyl(0.36, 0.36, 0.06, '#ffffff', -0.2, 1.08, 0.1, g); sph(0.08, '#ff3b6b', -0.2, 1.16, 0.1, g); cyl(0.12, 0.1, 0.36, '#ffb13d', 0.38, 1.02, -0.2, g); }
      if (v === 1) { box(0.7, 0.1, 0.5, '#4da3ff', -0.15, 0.89, 0.1, g); box(0.66, 0.1, 0.46, '#ff5fb0', -0.12, 0.99, 0.12, g); ['#ff5f5f', '#ffc021', '#5fd06b'].forEach((c, i) => { const p = cyl(0.04, 0.04, 0.5, c, 0.4, 0.88, -0.2 + i * 0.14, g, 8); p.rotation.z = Math.PI / 2; }); }
    },
  };

  // ---------------- state -> scene ----------------
  const live = {}; let cur = null, editable = false, exitFn = null;
  const state = () => { const H = cur; if (!H.in) H.in = { wall: 0, floor: 0, f: {} }; if (!H.in.f) H.in.f = {}; return H.in; };
  const DEF = { bed: 0, sofa: 1, rug: 0, shelf: 0, lamp: 3, art: 0, plant: 0, table: 0 };
  const val = (id) => { const f = state().f; return f[id] === undefined ? DEF[id] : f[id]; };
  function buildSlot(sl) {
    if (live[sl.id]) { root.remove(live[sl.id]); live[sl.id].traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
    const g = new THREE.Group(); g.position.set(sl.x, 0, sl.z); BUILD[sl.id](g, val(sl.id)); root.add(g); live[sl.id] = g;
  }
  function apply() { const st = state(); wallMat.color.set(WALLS[st.wall || 0]); floorMat.map = floorTexAt(st.floor || 0); floorMat.needsUpdate = true; SLOTS.forEach(buildSlot); }
  // static collisions for the furniture footprints (the room is always laid out the same way)
  SLOTS.forEach((sl) => { if (sl.solid) solids.push({ x0: OFF + sl.x - sl.solid[0] / 2, x1: OFF + sl.x + sl.solid[0] / 2, z0: sl.z - sl.solid[1] / 2, z1: sl.z + sl.solid[1] / 2 }); });

  function enter(house, canEdit, onExit) { cur = house; editable = canEdit; exitFn = onExit; apply(); }
  function setWall(n) { if (!editable) return; state().wall = n; wallMat.color.set(WALLS[n]); C.save(); sfx.click(); }
  function setFloor(n) { if (!editable) return; state().floor = n; floorMat.map = floorTexAt(n); floorMat.needsUpdate = true; C.save(); sfx.click(); }
  function setSlot(id, v) { if (!editable) return; const sl = SLOTS.find((s) => s.id === id); state().f[id] = v; buildSlot(sl); C.save(); sfx.pop(); }
  function cycle(id) { const sl = SLOTS.find((s) => s.id === id); const v = (val(id) + 1) % sl.names.length; setSlot(id, v); toast(`${sl.icon} ${sl.name}: ${sl.names[v]}`); }

  function interactables() {
    const L = [{ x: OFF, z: HZ - 1.1, r: 2.0, label: '🚪 اخرج من البيت', act: () => exitFn && exitFn() }];
    if (!editable) return L;
    L.push({ x: OFF + 3.4, z: HZ - 1.4, r: 1.9, label: '🎨 ديكور البيت', act: () => C.openDecor() });
    for (const sl of SLOTS) { if (sl.id === 'rug' || sl.id === 'table') continue; const ix = sl.id === 'art' ? sl.x : sl.x, iz = sl.id === 'art' ? sl.z + 1.4 : sl.z; L.push({ x: OFF + ix, z: iz, r: sl.id === 'bed' || sl.id === 'sofa' ? 3.4 : 2.4, label: `${sl.icon} غيّر ${sl.name}`, act: () => cycle(sl.id) }); }
    L.push({ x: OFF + 0.6, z: 0.8, r: 1.9, label: '🧁 غيّر الترابيزة', act: () => cycle('table') });
    return L;
  }
  function drawMap(g, s) {
    g.fillStyle = '#f6efff'; g.strokeStyle = '#7a3fe0'; g.lineWidth = 6; g.beginPath(); g.rect(-HX * s, -HZ * s, HX * 2 * s, HZ * 2 * s); g.fill(); g.stroke();
    g.fillStyle = '#d9c8ff'; SLOTS.forEach((sl) => { if (sl.solid) g.fillRect((sl.x - sl.solid[0] / 2) * s, (sl.z - sl.solid[1] / 2) * s, sl.solid[0] * s, sl.solid[1] * s); });
    g.fillStyle = '#8a4b2a'; g.fillRect(-1 * s, (HZ - 0.3) * s, 2 * s, 0.5 * s);
  }
  return { OFF, HX, HZ, SPAWN: { x: OFF, z: HZ - 2.6, yaw: Math.PI }, WALLS, FLOORS, SLOTS, enter, apply, setWall, setFloor, setSlot, cycle, val, state, interactables, drawMap, get editable() { return editable; }, get house() { return cur; } };
}
