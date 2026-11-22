// LOLO WORLD — AMUSEMENT PARK scene (LOLO_AmusementPark)
// Built from procedural, stylized geometry (temporary stand-ins until final 3D models arrive).
// Everything lives in one group placed far from the city at PARK.OFF so both worlds can share the
// same player, camera, input and UI systems.

export const PARK_OFF = 3000;

export function buildPark(C) {
  const { THREE, scene, toon, ctex, signTex, plane, bake, makeKid, solids, circles, PL, sfx, toast, S, save, updPills, platform } = C;
  const OFF = PARK_OFF, B = 98; // half-size of the walkable park
  const root = new THREE.Group(); root.position.x = OFF; scene.add(root);
  const stat = new THREE.Group(); root.add(stat); // static decoration -> baked into few meshes later
  const dyn = []; // things that animate every frame
  const add = (m, x, y, z, parent = stat) => { m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  const box = (w, h, d, c, x, y, z, p) => add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(c)), x, y, z, p);
  const cyl = (r1, r2, h, c, x, y, z, seg = 16, p) => add(new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), toon(c)), x, y, z, p);
  const sph = (r, c, x, y, z, p, emis) => add(new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), emis ? toon(c, { emissive: c, emissiveIntensity: emis }) : toon(c)), x, y, z, p);
  const cone = (r, h, c, x, y, z, seg = 12, p) => add(new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), toon(c)), x, y, z, p);
  const solid = (x, z, w, d) => solids.push({ x0: OFF + x - w / 2, x1: OFF + x + w / 2, z0: z - d / 2, z1: z + d / 2 });
  const circ = (x, z, r) => circles.push({ x: OFF + x, z, r });
  const wsign = (txt, bg, x, y, z, ry, w = 10, h = 2.4) => { const p = plane(signTex(txt, bg, '#ffffff'), w, h); p.position.set(x, y, z); p.rotation.y = ry; root.add(p); const b = p.clone(); b.rotation.y = ry + Math.PI; b.position.set(x, y, z); root.add(b); return p; };
  const star = (s, c = '#ffd23f') => { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 0.42 * s : s; i ? sh.lineTo(Math.cos(a) * r, -Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, -Math.sin(a) * r); } return new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.3 * s, bevelEnabled: false }), toon(c, { emissive: '#ffae00', emissiveIntensity: 0.35 })); };

  // ---------------- ground, paths, water, hills ----------------
  const rr = (w, h, r) => { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };
  const grassTex = ctex(128, 128, (g, w, h) => { g.fillStyle = '#86d36a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { g.fillStyle = Math.random() < 0.5 ? '#92dc76' : '#78c55e'; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); } }, true); grassTex.repeat.set(0.05, 0.05);
  { const g = new THREE.ExtrudeGeometry(rr(B * 2 + 16, B * 2 + 16, 30), { depth: 3, bevelEnabled: false }); g.rotateX(Math.PI / 2); const m = new THREE.Mesh(g, new THREE.MeshToonMaterial({ map: grassTex, color: '#ffffff', gradientMap: C.grad })); m.position.y = 0; m.receiveShadow = true; root.add(m); }
  const pave = (shape, color, y = 0.04) => { const g = new THREE.ShapeGeometry(shape); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, toon(color)); m.position.y = y; m.receiveShadow = true; stat.add(m); return m; };
  // big loop promenade + spokes (soft pink paving like the reference)
  { const outer = rr(150, 150, 40), inner = rr(132, 132, 32); outer.holes.push(inner); pave(outer, '#f3c7c0'); }
  for (const [x, z, w, d] of [[0, 62, 12, 70], [0, -40, 10, 50], [-40, 0, 72, 10], [40, 0, 72, 10]]) pave(rr(w, d, 4), '#f3c7c0', 0.035).position.set(x, 0.035, z);
  { const c = new THREE.Shape(); c.absarc(0, 0, 18, 0, Math.PI * 2); const m = pave(c, '#f6d6cf', 0.05); m.position.z = 72; } // entrance plaza (shape y -> world -z)
  { const c = new THREE.Shape(); c.absarc(0, 0, 14, 0, Math.PI * 2); const m = pave(c, '#eec0d8', 0.05); } // central food plaza
  // dots on plazas (pink polka dots like the reference)
  { const dots = []; for (let k = 0; k < 40; k++) { const a = Math.random() * 6.28, r = 3 + Math.random() * 14; dots.push([Math.cos(a) * r, 0.06, 72 + Math.sin(a) * r]); } C.inst(new THREE.CircleGeometry(0.7, 12).rotateX(-Math.PI / 2), toon('#f59fc6'), dots.map(([x, y, z]) => [x + OFF, y, z]), false); }
  // hills with green tops behind the park (north) like the reference
  for (const [x, z, r, h] of [[-80, -118, 26, 30], [-35, -125, 30, 38], [20, -122, 24, 30], [70, -118, 30, 36], [-118, -60, 22, 26], [118, -55, 24, 28], [-120, 20, 18, 20], [120, 30, 20, 22]]) {
    const cl = cyl(r * 0.8, r, h, '#d98f7f', x, h / 2 - 1, z, 7); cl.castShadow = false;
    const top = cyl(r * 0.84, r * 0.84, 3, '#5cbf4f', x, h + 0.2, z, 7); top.castShadow = false;
    const bl = sph(r * 0.5, '#6fd05f', x + r * 0.2, h + 2, z, stat); bl.scale.y = 0.5;
  }

  // ---------------- entrance (A) ----------------
  const ENT = { x: 0, z: 90 };
  for (const s of [-1, 1]) {
    cyl(2.6, 3, 16, s < 0 ? '#ff6fb5' : '#a35cff', s * 13, 8, ENT.z, 10); cone(3.6, 6, s < 0 ? '#a35cff' : '#ff6fb5', s * 13, 19, ENT.z, 10);
    const st = star(1.4); st.position.set(s * 13, 23.5, ENT.z); root.add(st); dyn.push({ m: st, spin: 1.5 });
    for (let k = 0; k < 3; k++) sph(0.35, '#ffe680', s * 13 + 2.7 * Math.cos(k * 2.1), 6 + k * 4, ENT.z + 2.7 * Math.sin(k * 2.1), stat, 0.8);
    solid(s * 13, ENT.z, 6, 6);
    // ticket booths
    box(4, 3.6, 3.4, '#fff1fa', s * 22, 1.8, ENT.z - 2); box(4.6, 0.5, 4, '#ff6fb5', s * 22, 3.9, ENT.z - 2);
    const stripes = ctex(128, 32, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#ff6fb5'; g.fillRect(i * 16, 0, 16, 32); } }); const aw = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.8, 1.2), new THREE.MeshToonMaterial({ map: stripes, gradientMap: C.grad })); add(aw, s * 22, 3.2, ENT.z + 0.2); aw.rotation.x = 0.4;
    wsign('🎟️ تذاكر', '#a35cff', s * 22, 5, ENT.z + 0.3, 0, 3.6, 1); solid(s * 22, ENT.z - 2, 4, 3.4);
  }
  box(30, 3, 2.4, '#8b4fe0', 0, 15.5, ENT.z); box(31, 0.6, 3, '#ffd23f', 0, 13.8, ENT.z); box(31, 0.6, 3, '#ffd23f', 0, 17.2, ENT.z);
  { const lt = new THREE.TextureLoader().load('assets/ui/logo-box.webp'); lt.colorSpace = THREE.SRGBColorSpace; for (const r of [0, Math.PI]) { const lg = new THREE.Mesh(new THREE.PlaneGeometry(13, 11), new THREE.MeshBasicMaterial({ map: lt, transparent: true, toneMapped: false })); lg.position.set(0, 21, ENT.z + (r ? -1.3 : 1.3)); lg.rotation.y = r; root.add(lg); } }
  for (let k = -6; k <= 6; k++) sph(0.32, ['#ff6fb5', '#ffe680', '#7fd8ff'][(k + 9) % 3], k * 2.2, 14.1, ENT.z + 1.3, stat, 0.9);
  wsign('مدينة الملاهي', '#ff4fae', 0, 11.6, ENT.z + 1.4, 0, 12, 2.4);
  // mascot statue: Lolo on a pedestal in the plaza
  cyl(3.4, 3.8, 1.6, '#ffffff', 0, 0.8, 72, 20); cyl(2.4, 2.8, 1.4, '#ffd23f', 0, 2.3, 72, 20); circ(0, 72, 4);
  { const lt = new THREE.TextureLoader().load('assets/ui/fish.webp'); lt.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: lt, toneMapped: false })); sp.scale.set(7, 6.2, 1); sp.position.set(0, 7, 72); root.add(sp); dyn.push({ m: sp, bob: 6.8 }); }
  // fountains on the plaza
  for (const s of [-1, 1]) { const fx = s * 11, fz = 66; cyl(3, 3.3, 0.8, '#e8dcc8', fx, 0.4, fz, 20); const w = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 0.15, 20), new THREE.MeshPhongMaterial({ color: '#5fd0ff', shininess: 90 })); add(w, fx, 0.75, fz); cyl(0.3, 0.4, 2, '#e8dcc8', fx, 1.4, fz, 8); const jet = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.4, 12, 1, true), new THREE.MeshBasicMaterial({ color: '#bff0ff', transparent: true, opacity: 0.55, side: THREE.DoubleSide })); jet.rotation.x = Math.PI; add(jet, fx, 3, fz, root); dyn.push({ m: jet, pulse: 1 }); circ(fx, fz, 3.4); }
  // return-to-city portal (glowing ring) next to the gate
  const portal = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.35, 10, 32), toon('#7fd8ff', { emissive: '#3fb6ff', emissiveIntensity: 0.9 })); add(portal, -30, 3, 84, root); dyn.push({ m: portal, spinZ: 1 });
  const portalIn = new THREE.Mesh(new THREE.CircleGeometry(2.4, 32), new THREE.MeshBasicMaterial({ color: '#bfeaff', transparent: true, opacity: 0.55, side: THREE.DoubleSide })); add(portalIn, -30, 3, 84, root);
  wsign('🏙️ رجوع للمدينة', '#3fb6ff', -30, 6.6, 84, 0, 7, 1.6);

  // ---------------- decorations ----------------
  const palms = [], trees = [], benches = [], lamps = [], bins = [], fence = [], flowers = [], balloons = [];
  for (let k = 0; k < 46; k++) { const a = (k / 46) * Math.PI * 2, r = 88 + (k % 3) * 2.5; const x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.abs(x) < 34 && z > 70) continue; (k % 2 ? palms : trees).push([x, z]); }
  for (const [x, z] of [[-20, 50], [20, 50], [-20, 30], [20, 30], [-60, -40], [60, -40], [-25, -55], [25, -55], [-80, 55], [80, 55]]) trees.push([x, z]);
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; lamps.push([Math.cos(a) * 71, Math.sin(a) * 71]); benches.push([Math.cos(a + 0.13) * 64.5, Math.sin(a + 0.13) * 64.5, -a]); bins.push([Math.cos(a - 0.12) * 64.5, Math.sin(a - 0.12) * 64.5]); }
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; lamps.push([Math.cos(a) * 18, 72 + Math.sin(a) * 18]); }
  for (let k = 0; k < 160; k++) { const a = Math.random() * 6.28, r = 50 + Math.random() * 12; flowers.push([Math.cos(a) * r, Math.sin(a) * r]); }
  palms.forEach(([x, z]) => circ(x, z, 0.5)); trees.forEach(([x, z]) => circ(x, z, 0.6)); lamps.forEach(([x, z]) => circ(x, z, 0.25));
  const W = (l) => l.map((t) => [t[0] + OFF, t[1], t[2], t[3] || 0, t[4] || 0, t[5] || 0, t[6], t[7], t[8]]);
  C.inst(new THREE.CylinderGeometry(0.22, 0.35, 6, 7), toon('#b07a45'), W(palms.map(([x, z]) => [x, 3, z, 0.08, 0, 0.08])));
  { const pl = []; palms.forEach(([x, z]) => { for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; pl.push([x + Math.cos(a) * 1.6 + 0.5, 6.2, z + Math.sin(a) * 1.6, 0, -a, -0.5, 1]); } }); C.inst(new THREE.BoxGeometry(3.6, 0.15, 1.1), toon('#3fbf4a'), W(pl)); }
  if (C.NATURE && C.NATURE.t3) C.instModel(C.NATURE.t3, trees.map(([x, z]) => [x + OFF, 0, z, Math.random() * 6, 0.9 + Math.random() * 0.3]), 6.5);
  else { C.inst(new THREE.CylinderGeometry(0.25, 0.35, 2.6, 7), toon('#9b6a3f'), W(trees.map(([x, z]) => [x, 1.3, z]))); C.inst(new THREE.IcosahedronGeometry(2, 1), toon('#55c25a'), W(trees.map(([x, z]) => [x, 3.8, z]))); }
  C.inst(new THREE.BoxGeometry(3, 0.25, 1), toon('#c9844c'), W(benches.map(([x, z, r]) => [x, 0.75, z, 0, r, 0])));
  C.inst(new THREE.CylinderGeometry(0.1, 0.14, 5.5, 6), toon('#6b3fc9'), W(lamps.map(([x, z]) => [x, 2.8, z])));
  C.inst(new THREE.SphereGeometry(0.45, 10, 8), toon('#fff3b0', { emissive: '#ffe680', emissiveIntensity: 0.7 }), W(lamps.map(([x, z]) => [x, 5.7, z])), false);
  C.inst(new THREE.CylinderGeometry(0.4, 0.35, 1, 10), toon('#3fb6ff'), W(bins.map(([x, z]) => [x, 0.5, z])));
  C.inst(new THREE.IcosahedronGeometry(0.28, 0), toon('#ff6fb5'), W(flowers.filter((_, n) => n % 3 === 0).map(([x, z]) => [x, 0.3, z])), false);
  C.inst(new THREE.IcosahedronGeometry(0.28, 0), toon('#ffd23f'), W(flowers.filter((_, n) => n % 3 === 1).map(([x, z]) => [x, 0.3, z])), false);
  C.inst(new THREE.IcosahedronGeometry(0.28, 0), toon('#b45cff'), W(flowers.filter((_, n) => n % 3 === 2).map(([x, z]) => [x, 0.3, z])), false);
  // balloon clusters
  const balloonGroup = new THREE.Group(); root.add(balloonGroup);
  for (const [bx, bz] of [[-8, 58], [8, 58], [-34, 14], [34, 14], [-60, -8], [60, -8]]) { const g = new THREE.Group(); for (let k = 0; k < 5; k++) { const c = ['#ff4fae', '#ffd23f', '#3fb6ff', '#b45cff', '#34c759'][k]; const b = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), toon(c)); b.scale.y = 1.2; b.position.set(Math.cos(k * 1.3) * 0.6, 4 + (k % 3) * 0.6, Math.sin(k * 1.3) * 0.6); g.add(b); } const str = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 4, 4), toon('#ffffff')); str.position.y = 2; g.add(str); bake(g, [g]); g.position.set(bx, 0, bz); balloonGroup.add(g); dyn.push({ m: g, sway: Math.random() * 6 }); }
  // bunting flags (triangles on strings) that wave
  const bunting = new THREE.Group(); root.add(bunting);
  const flagGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([-0.35, 0, 0, 0.35, 0, 0, 0, -0.7, 0], 3)); flagGeo.computeVertexNormals();
  const flagCols = ['#ff4fae', '#ffd23f', '#3fb6ff', '#34c759', '#b45cff', '#ff8a1f'].map((c) => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
  const flags = [];
  for (const [x0, z0, x1, z1, y] of [[-12, 90, 12, 90, 12.6], [-18, 56, 18, 56, 6], [-70, 30, -30, 30, 6], [30, 30, 70, 30, 6], [-60, -20, -40, -20, 6]]) {
    const n = Math.round(Math.hypot(x1 - x0, z1 - z0) / 1.1);
    for (let k = 0; k <= n; k++) { const t = k / n, sag = Math.sin(t * Math.PI) * 1.2; flags.push({ c: k % 6, x: x0 + (x1 - x0) * t, y: y - sag, z: z0 + (z1 - z0) * t, ry: Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2 }); }
  }
  const flagIM = flagCols.map((m, c) => { const im = new THREE.InstancedMesh(flagGeo, m, flags.filter((f) => f.c === c).length); im.frustumCulled = false; bunting.add(im); return im; });
  flags.forEach((f) => { f.i = flagIM[f.c].userData.n = (flagIM[f.c].userData.n || 0); flagIM[f.c].userData.n++; });
  const fM = new THREE.Matrix4(), fQ = new THREE.Quaternion(), fE = new THREE.Euler(), fS = new THREE.Vector3(1, 1, 1), fP = new THREE.Vector3();
  const updFlags = (now) => { flags.forEach((f, i) => { fQ.setFromEuler(fE.set(Math.sin(now / 350 + i * 0.7) * 0.35, f.ry, 0, 'YXZ')); flagIM[f.c].setMatrixAt(f.i, fM.compose(fP.set(f.x, f.y, f.z), fQ, fS)); }); flagIM.forEach((im) => (im.instanceMatrix.needsUpdate = true)); };
  // fences around attraction areas
  const fenceRing = (cx, cz, w, d, gapSide) => { const pts = []; for (let x = -w / 2; x <= w / 2; x += 2) { if (!(gapSide === 's' && Math.abs(x) < 3)) pts.push([cx + x, cz + d / 2]); pts.push([cx + x, cz - d / 2]); } for (let z = -d / 2 + 2; z < d / 2; z += 2) { pts.push([cx - w / 2, cz + z]); pts.push([cx + w / 2, cz + z]); } return pts; };

  { const posts = [], rails = [];
    const ring = (cx, cz, r, gapA) => { for (let k = 0; k < 28; k++) { const a = (k / 28) * Math.PI * 2; if (Math.abs(((a - gapA + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.35) continue; posts.push([OFF + cx + Math.cos(a) * r, 0.6, cz + Math.sin(a) * r]); rails.push([OFF + cx + Math.cos(a + 0.112) * r, 1.0, cz + Math.sin(a + 0.112) * r, 0, -a - 0.112, 0]); } };
    ring(-45, 30, 11.5, Math.PI / 2);
    for (let x = -76; x <= -44; x += 2) { posts.push([OFF + x, 0.6, -90]); rails.push([OFF + x + 1, 1.0, -90, 0, Math.PI / 2, 0]); }
    C.inst(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 6), toon('#ffffff'), posts, false); C.inst(new THREE.BoxGeometry(0.08, 0.12, 2.6), toon('#ff6fb5'), rails, false); }
  // ---------------- B. Ferris wheel ----------------
  const FW = { x: -50, z: -45, R: 15, angle: 0, cabins: [] };
  {
    const g = new THREE.Group(); g.position.set(FW.x, FW.R + 5, FW.z); root.add(g); FW.g = g;
    for (const zz of [-1.2, 1.2]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(FW.R, 0.35, 8, 48), toon('#e66bff', { emissive: '#c04dff', emissiveIntensity: 0.4 })); rim.position.z = zz; g.add(rim); }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 3.2, 20), toon('#fff3b0', { emissive: '#ffe680', emissiveIntensity: 1.2 })); hub.rotation.x = Math.PI / 2; g.add(hub);
    const bulbs = [], bulbA = new THREE.Group(), bulbB = new THREE.Group(); g.add(bulbA, bulbB);
    const BULB_A = new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 1.6, 2), toneMapped: false }), BULB_B = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 1.6, 2), toneMapped: false });
    for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; const sp = new THREE.Mesh(new THREE.BoxGeometry(0.25, FW.R, 0.25), toon('#ffb6f5', { emissive: '#ff8af0', emissiveIntensity: 0.6 })); sp.position.set(Math.cos(a) * FW.R / 2, Math.sin(a) * FW.R / 2, 0); sp.rotation.z = a - Math.PI / 2; g.add(sp); const bl = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), k % 2 ? BULB_A : BULB_B); bl.position.set(Math.cos(a) * FW.R, Math.sin(a) * FW.R, 1.5); (k % 2 ? bulbA : bulbB).add(bl); }
    FW.bulbs = [bulbA, bulbB];
    const cabCols = ['#ff3fa4', '#c04dff', '#ff3f6e', '#ff8a1f', '#3fb6ff', '#ff3fa4', '#c04dff', '#ffd23f'];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2, cab = new THREE.Group();
      const bottom = new THREE.Mesh(new THREE.SphereGeometry(1.7, 14, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon(cabCols[k])); cab.add(bottom);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.7, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhongMaterial({ color: '#e8f6ff', transparent: true, opacity: 0.45, shininess: 120 })); cab.add(dome);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 1), toon('#ffffff')); seat.position.y = -0.6; cab.add(seat);
      cab.position.set(Math.cos(a) * FW.R, Math.sin(a) * FW.R - 2, 0); cab.userData.a = a; g.add(cab); FW.cabins.push(cab);
    }
    bake(g, [g, bulbA, bulbB, ...FW.cabins]);
    for (const s of [-1, 1]) for (const zz of [-2.5, 2.5]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.9, FW.R + 7, 0.9), toon('#ffffff')); leg.position.set(FW.x + s * 5, (FW.R + 5) / 2, FW.z + zz); leg.rotation.z = s * 0.3; leg.castShadow = true; root.add(leg); }
    cyl(9, 9.5, 1, '#f6a87a', FW.x, 0.5, FW.z + 2, 24); box(6, 1.6, 3, '#ffb6f5', FW.x, 1.3, FW.z + 8); // boarding platform + steps
    circ(FW.x, FW.z, 6.5);
    wsign('🎡 العجلة الدوارة', '#c04dff', FW.x, 3.5, FW.z + 11, 0, 8, 1.8);
  }

  // ---------------- C. Roller coaster ----------------
  const RC = { u: 0, v: 0.02, cars: [], riding: false };
  {
    const P = [[20, 3, -30], [40, 3, -32], [62, 8, -40], [75, 18, -55], [70, 14, -75], [50, 6, -82], [30, 12, -78], [15, 17, -65], [8, 9, -50], [12, 4, -38]];
    RC.curve = new THREE.CatmullRomCurve3(P.map(([x, y, z]) => new THREE.Vector3(x, y, z)), true, 'catmullrom', 0.5);
    const N = 220, pts = RC.curve.getSpacedPoints(N), left = [], right = [], up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < N; i++) { const t = RC.curve.getTangentAt(i / N), side = new THREE.Vector3().crossVectors(t, up).normalize(); left.push(pts[i].clone().addScaledVector(side, 0.8)); right.push(pts[i].clone().addScaledVector(side, -0.8)); }
    for (const [arr, c] of [[left, '#ff4fae'], [right, '#ff4fae']]) { const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arr, true), 300, 0.18, 6, true), toon(c)); tube.castShadow = true; root.add(tube); }
    const spine = new THREE.Mesh(new THREE.TubeGeometry(RC.curve, 300, 0.3, 6, true), toon('#8b4fe0')); spine.position.y = -0.35; spine.castShadow = true; root.add(spine);
    const ties = []; for (let i = 0; i < N; i += 2) { const p = pts[i], t = RC.curve.getTangentAt(i / N); ties.push([p.x + OFF, p.y - 0.15, p.z, 0, Math.atan2(t.x, t.z), 0]); }
    C.inst(new THREE.BoxGeometry(2.0, 0.12, 0.35), toon('#ffffff'), ties, false);
    const sup = []; for (let i = 0; i < N; i += 9) { const p = pts[i]; if (p.y > 2) sup.push([p.x + OFF, (p.y - 0.4) / 2, p.z, 0, 0, 0, 1, (p.y - 0.4) / 4, 1]); }
    C.inst(new THREE.CylinderGeometry(0.25, 0.3, 4, 8), toon('#ffd23f'), sup);
    sup.forEach((s) => circles.push({ x: s[0], z: s[2], r: 0.4 }));
    const carCols = ['#ff3fa4', '#3fb6ff', '#ffd23f'];
    for (let k = 0; k < 3; k++) { const car = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 2.2), toon(carCols[k])); b.position.y = 0.55; car.add(b); const front = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), toon(carCols[k])); front.scale.set(1, 0.6, 0.6); front.position.set(0, 0.7, 1.1); car.add(front); const st = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.3), toon('#ffffff')); st.position.set(0, 1.1, -0.8); car.add(st); car.traverse((o) => o.isMesh && (o.castShadow = true)); bake(car, [car]); root.add(car); RC.cars.push(car); }
    // station
    RC.stationU = 0.05; const sp = RC.curve.getPointAt(RC.stationU);
    box(12.6, 0.5, 5.6, '#a35cff', sp.x, 6.4, sp.z + 3); for (const s of [-1, 1]) for (const zz of [1, 5.4]) { cyl(0.25, 0.25, 6, '#ffffff', sp.x + s * 5.8, 3.2, sp.z + zz, 8); circ(sp.x + s * 5.8, sp.z + zz, 0.35); }
    platform(OFF + sp.x, sp.z + 3.5, 12, 4.4, 0.45, '#ffd6ec', { th: 0.4 }); RC.station = { x: sp.x, z: sp.z + 7 };
    wsign('🎢 قطار الملاهي', '#ff4fae', sp.x, 7.2, sp.z + 6.8, 0, 8, 1.8);
  }

  // ---------------- D. Carousel ----------------
  const CA = { x: -45, z: 30, a: 0, horses: [] };
  {
    const g = new THREE.Group(); g.position.set(CA.x, 0, CA.z); root.add(g); CA.g = g;
    cyl(8.5, 8.8, 0.8, '#ffd23f', CA.x, 0.4, CA.z, 28); circ(CA.x, CA.z, 8.8);
    const roofTex = ctex(256, 64, (gg) => { for (let i = 0; i < 16; i++) { gg.fillStyle = i % 2 ? '#ffffff' : '#ff6fb5'; gg.fillRect(i * 16, 0, 16, 64); } });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(9.5, 4, 16), new THREE.MeshToonMaterial({ map: roofTex, gradientMap: C.grad })); roof.position.y = 8.6; g.add(roof);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.8, 10, 8), toon('#ffd23f')); cap.position.y = 11; g.add(cap);
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 0.4, 28), toon('#ff9fd0')); plat.position.y = 1; g.add(plat);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 7, 12), toon('#c04dff')); pole.position.y = 4.5; g.add(pole);
    const hCols = ['#ffffff', '#ffd6ec', '#d6c4ff', '#c4ecff', '#fff2b8', '#ffffff', '#ffd6ec', '#d6c4ff'];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2, hg = new THREE.Group();
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6, 6), toon('#ffd23f')); p.position.y = 3; hg.add(p);
      const horse = new THREE.Group(); const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 1.8), toon(hCols[k])); horse.add(body); const neck = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), toon(hCols[k])); neck.position.set(0, 0.6, 0.8); neck.rotation.x = 0.4; horse.add(neck); const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.9), toon(hCols[k])); head.position.set(0, 1.1, 1.2); horse.add(head); const mane = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.9, 0.5), toon(['#ff4fae', '#b45cff', '#3fb6ff', '#ffd23f'][k % 4])); mane.position.set(0, 0.9, 0.7); horse.add(mane); for (const lx of [-0.25, 0.25]) for (const lz of [-0.6, 0.6]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 0.15), toon(hCols[k])); l.position.set(lx, -0.7, lz); horse.add(l); } const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.15, 0.7), toon('#ff4fae')); saddle.position.y = 0.45; horse.add(saddle);
      horse.position.y = 2.6; hg.add(horse); hg.position.set(Math.cos(a) * 6, 1.2, Math.sin(a) * 6); hg.rotation.y = -a; g.add(hg); CA.horses.push({ hg, horse, ph: k });
    }
    const CB = new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 1.8, 0.8), toneMapped: false });
    for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; const b = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), CB); b.position.set(Math.cos(a) * 9.2, 6.6, Math.sin(a) * 9.2); g.add(b); }
    bake(g, [g, ...CA.horses.map((h) => h.horse)]);
    wsign('🎠 الكاروسيل', '#ffb300', CA.x, 3.5, CA.z + 11, 0, 7, 1.6);
  }

  // ---------------- E. Bumper cars ----------------
  const BC = { x: 45, z: 30, w: 28, d: 20, cars: [], player: null };
  {
    const fl = new THREE.Mesh(new THREE.BoxGeometry(BC.w, 0.3, BC.d), toon('#3a3f55')); add(fl, BC.x, 0.15, BC.z);
    for (const [x, z, w, d] of [[0, -BC.d / 2, BC.w, 0.8], [0, BC.d / 2, BC.w, 0.8], [-BC.w / 2, 0, 0.8, BC.d], [BC.w / 2, 0, 0.8, BC.d]]) { box(w, 1.1, d, '#ff6fb5', BC.x + x, 0.7, BC.z + z); }
    for (const [x, z] of [[-BC.w / 2, -BC.d / 2], [BC.w / 2, -BC.d / 2], [-BC.w / 2, BC.d / 2], [BC.w / 2, BC.d / 2]]) cyl(0.3, 0.3, 6, '#ffd23f', BC.x + x, 3, BC.z + z, 8);
    const net = new THREE.Mesh(new THREE.PlaneGeometry(BC.w, BC.d), new THREE.MeshBasicMaterial({ color: '#b45cff', transparent: true, opacity: 0.25, side: THREE.DoubleSide })); net.rotation.x = -Math.PI / 2; add(net, BC.x, 6, BC.z, root);
    const cols = ['#ff3fa4', '#3fb6ff', '#ffd23f', '#34c759', '#ff8a1f', '#c04dff'];
    for (let k = 0; k < 6; k++) {
      const g = new THREE.Group(); const base = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.6, 18), toon('#2a2a35')); base.position.y = 0.45; g.add(base); const body = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.7, 18), toon(cols[k])); body.position.y = 1.0; g.add(body); const back = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.3), toon(cols[k])); back.position.set(0, 1.5, -0.7); g.add(back); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.2, 4), toon('#dddddd')); pole.position.set(0, 3, -0.8); g.add(pole); const sp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 2, 0.5), toneMapped: false })); sp.position.set(0, 5.1, -0.8); g.add(sp);
      g.traverse((o) => o.isMesh && (o.castShadow = true)); bake(g, [g]); root.add(g);
      const c = { g, x: BC.x - 9 + (k % 3) * 9, z: BC.z - 4 + Math.floor(k / 3) * 8, yaw: Math.random() * 6, v: 3 + Math.random() * 2, ai: true, bump: 0 }; BC.cars.push(c);
    }
    wsign('🚗 عربيات التصادم', '#3fb6ff', BC.x, 7.6, BC.z + BC.d / 2 + 0.6, 0, 9, 1.8);
    // walls are solid from the outside; the entrance gap is on the south side
    solid(BC.x - BC.w / 4 - 1.5, BC.z + BC.d / 2, BC.w / 2 - 3, 1); solid(BC.x + BC.w / 4 + 1.5, BC.z + BC.d / 2, BC.w / 2 - 3, 1);
    solid(BC.x, BC.z - BC.d / 2, BC.w, 1); solid(BC.x - BC.w / 2, BC.z, 1, BC.d); solid(BC.x + BC.w / 2, BC.z, 1, BC.d);
  }

  // ---------------- F. Water park ----------------
  const WP = { x: -60, z: -80, w: 34, d: 18, splash: [] };
  {
    box(WP.w + 2, 0.5, WP.d + 2, '#ffffff', WP.x, 0.25, WP.z); // rim
    const water = new THREE.Mesh(new THREE.BoxGeometry(WP.w, 0.1, WP.d), new THREE.MeshPhongMaterial({ color: '#3fc6ff', transparent: true, opacity: 0.85, shininess: 110 })); add(water, WP.x, 0.52, WP.z, root); WP.water = water;
    // slide tower with two twisting slides
    const tx = WP.x + 14, tz = WP.z - 2;
    box(5, 7, 5, '#ffd23f', tx + 6, 3.5, tz); for (const s2 of [-1, 1]) for (const s3 of [-1, 1]) cyl(0.12, 0.12, 3, '#ffffff', tx + 6 + s2 * 2.3, 8.5, tz + s3 * 2.3, 6); box(5.6, 0.4, 5.6, '#ff4fae', tx + 6, 10.2, tz);
    solids.push({ x0: OFF + tx + 3.5, x1: OFF + tx + 8.5, z0: tz - 2.5, z1: tz + 2.5, ymax: 6.4 });
    // stairs up the slide tower (platforms you can walk on)
    for (let k = 0; k < 7; k++) platform(OFF + tx + 9.8, tz + 3.9 - k * 1.0, 2.4, 1.05, 0.55 + k * 0.92, ['#ffffff', '#ffd6ec'][k % 2], { th: 0.35 });
    platform(OFF + tx + 6, tz, 5.2, 5.2, 7.0, '#ffd23f', { th: 0.1 }).mesh.visible = false;
    WP.slides = [];
    for (const [k, col] of [[0, '#ff4fae'], [1, '#3fb6ff']]) {
      const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; const ang = t * Math.PI * (k ? 1.6 : 1.2) * (k ? -1 : 1); pts.push(new THREE.Vector3(tx + 6 - t * 18 + Math.sin(ang) * 3, 7.4 - t * 6.6, tz + (k ? 4 : -4) * (1 - t) + Math.cos(ang) * 2 - 2)); }
      const curve = new THREE.CatmullRomCurve3(pts); const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.9, 10, false), toon(col)); tube.material = new THREE.MeshToonMaterial({ color: col, gradientMap: C.grad, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }); tube.castShadow = true; root.add(tube);
      const sp = []; for (let i = 3; i < 24; i += 4) { const p = pts[i]; if (p.y > 1.2) sp.push([p.x + OFF, p.y / 2 - 0.3, p.z, 0, 0, 0, 1, p.y / 4, 1]); } if (sp.length) C.inst(new THREE.CylinderGeometry(0.15, 0.15, 4, 6), toon('#ffffff'), sp);
      WP.slides.push(curve);
    }
    // splash particles pool
    const spGeo = new THREE.SphereGeometry(0.18, 6, 4), spMat = new THREE.MeshBasicMaterial({ color: '#dff6ff', transparent: true, opacity: 0.85 });
    for (let k = 0; k < 40; k++) { const m = new THREE.Mesh(spGeo, spMat); m.visible = false; root.add(m); WP.splash.push({ m, life: 0, vx: 0, vy: 0, vz: 0 }); }
    // fountain jets in the pool
    for (const s of [-1, 1]) { const j = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.2, 8, 1, true), new THREE.MeshBasicMaterial({ color: '#dff6ff', transparent: true, opacity: 0.6, side: THREE.DoubleSide })); j.rotation.x = Math.PI; add(j, WP.x + s * 8, 1.6, WP.z, root); dyn.push({ m: j, pulse: 2 }); }
    // umbrellas + loungers
    for (let k = 0; k < 5; k++) { const ux = WP.x - 14 + k * 6, uz = WP.z + 13; cyl(0.08, 0.08, 3, '#ffffff', ux, 1.5, uz, 6); const u = cone(2.2, 0.9, ['#ff4fae', '#b8ff5e', '#3fb6ff', '#ffd23f', '#c04dff'][k], ux, 3.2, uz, 12); u.castShadow = true; box(1, 0.25, 2.2, '#ffffff', ux + 1.6, 0.35, uz + 0.5); }
    wsign('💦 الحديقة المائية', '#3fb6ff', WP.x, 3.5, WP.z + 10.4, 0, 9, 1.8);
  }

  // ---------------- G. Arcade ----------------
  const AR = { x: 74, z: -10, machines: [] };
  {
    box(22, 0.3, 16, '#ffe9f6', AR.x, 0.15, AR.z); box(22, 7, 0.6, '#c04dff', AR.x, 3.5, AR.z - 8); box(0.6, 7, 16, '#c04dff', AR.x + 11, 3.5, AR.z); box(0.6, 7, 16, '#c04dff', AR.x - 11, 3.5, AR.z - 0); box(23, 0.6, 3.4, '#ff4fae', AR.x, 7.3, AR.z - 6.6); box(0.6, 0.6, 16, '#ff4fae', AR.x + 11, 7.3, AR.z); box(0.6, 0.6, 16, '#ff4fae', AR.x - 11, 7.3, AR.z);
    solid(AR.x, AR.z - 8, 22, 0.6); solid(AR.x + 11, AR.z, 0.6, 16); solid(AR.x - 11, AR.z, 0.6, 16);
    const scr = (c1, c2, txt) => ctex(128, 96, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 40px sans-serif'; g.textAlign = 'center'; g.fillText(txt, w / 2, h / 2 + 14); });
    const games = [['⭐', '#3a1c71', '#d76d77'], ['🎈', '#0f2027', '#2c5364'], ['🍭', '#42275a', '#734b6d']];
    for (let k = 0; k < 3; k++) {
      const mx = AR.x - 6 + k * 6, mz = AR.z - 5.6, g = new THREE.Group();
      const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.6, 1.8), toon(['#3fb6ff', '#ff4fae', '#ffd23f'][k])); cab.position.y = 1.8; g.add(cab);
      const s = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.3), new THREE.MeshBasicMaterial({ map: scr(games[k][1], games[k][2], games[k][0]), toneMapped: false })); s.position.set(0, 2.6, 0.91); g.add(s);
      const panel = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 0.9), toon('#2a2a35')); panel.position.set(0, 1.5, 1.1); panel.rotation.x = 0.3; g.add(panel);
      const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 10), new THREE.MeshBasicMaterial({ color: '#ff3b3b' })); btn.position.set(0.5, 1.7, 1.2); g.add(btn);
      g.position.set(mx, 0.3, mz); g.traverse((o) => o.isMesh && (o.castShadow = true)); bake(g, [g]); root.add(g); solid(mx, mz, 2.4, 1.8); AR.machines.push({ x: mx, z: mz + 2.4, kind: k });
    }
    // claw / prize machine
    { const px = AR.x + 7, pz = AR.z + 1; box(3, 0.8, 3, '#ff4fae', px, 0.7, pz); const gl = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3, 2.8), new THREE.MeshPhongMaterial({ color: '#e8f6ff', transparent: true, opacity: 0.35 })); add(gl, px, 2.6, pz, root); box(3.1, 0.5, 3.1, '#ff4fae', px, 4.3, pz); for (let k = 0; k < 9; k++) sph(0.35, ['#ffd23f', '#3fb6ff', '#b45cff', '#34c759'][k % 4], px - 0.9 + (k % 3) * 0.9, 1.4, pz - 0.9 + Math.floor(k / 3) * 0.9); solid(px, pz, 3, 3); AR.prize = { x: px - 2.6, z: pz }; }
    wsign('🕹️ الأركيد', '#c04dff', AR.x, 8.6, AR.z + 8.6, 0, 8, 1.8);
  }

  // ---------------- H. Food zone ----------------
  const FD = { stands: [] };
  {
    const stripes = (a, b) => ctex(128, 32, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * 16, 0, 16, 32); } });
    const stand = (x, z, col, name, icon, topper) => {
      box(4, 2.4, 2.6, '#ffffff', x, 1.2, z); box(4.2, 0.2, 2.8, col, x, 2.5, z); const aw = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1, 1.4), new THREE.MeshToonMaterial({ map: stripes('#ffffff', col), gradientMap: C.grad })); add(aw, x, 3.2, z + 1.4); aw.rotation.x = 0.5;
      topper(x, z); solid(x, z, 4, 2.6); FD.stands.push({ x, z: z + 3, name, icon });
    };
    stand(-9, 10, '#ff3b3b', 'فشار', '🍿', (x, z) => { cone(0.9, 1.6, '#ffffff', x, 3.8, z, 12).rotation.x = Math.PI; for (let k = 0; k < 6; k++) sph(0.35, '#ffe9a6', x - 0.5 + Math.random(), 4.7, z - 0.4 + Math.random() * 0.8); });
    stand(0, 4, '#ff6fb5', 'آيس كريم', '🍦', (x, z) => { cone(0.7, 1.8, '#e2a35a', x, 3.9, z, 12).rotation.x = Math.PI; sph(0.8, '#ffd6ec', x, 5.1, z); sph(0.65, '#c4ecff', x, 5.9, z); });
    stand(9, 10, '#b45cff', 'غزل البنات', '🍭', (x, z) => { cyl(0.06, 0.06, 1.4, '#ffffff', x, 3.4, z, 6); sph(0.9, '#ff9fd0', x, 4.6, z); sph(0.7, '#d6b3ff', x + 0.6, 4.3, z); });
    for (const [x, z, c] of [[-8, 22, '#ff4fae'], [0, 24, '#ffd23f'], [8, 22, '#3fb6ff'], [-14, 16, '#b8ff5e'], [14, 16, '#c04dff']]) { cyl(1.1, 1.1, 0.15, '#ffffff', x, 1.1, z, 14); cyl(0.12, 0.12, 1.1, '#cccccc', x, 0.55, z, 6); cyl(0.06, 0.06, 2.4, '#ffffff', x, 2.2, z, 6); cone(2, 0.7, c, x, 3.5, z, 14); for (let k = 0; k < 3; k++) { const a = k * 2.1; box(0.6, 0.6, 0.6, '#ffffff', x + Math.cos(a) * 1.8, 0.3, z + Math.sin(a) * 1.8); } circ(x, z, 1.2); }
    wsign('🍦 منطقة الأكل', '#ff6fb5', 0, 6.5, 0.4, 0, 8, 1.8);
  }

  // ---------------- collectible park stars ⭐ ----------------
  const STARS = [];
  { const spots = [[-50, -28, 1.6], [62, -42, 9.5], [-45, 42, 1.6], [45, 30, 1.6], [-75, -80, 1.2], [80, -10, 1.6], [0, 30, 1.6], [-30, 60, 1.2], [30, 60, 1.2], [WP.x + 20, WP.z - 2, 10.2]];
    spots.forEach(([x, z, y], n) => { const id = 'ps' + n; if ((S.pstars || []).includes(id)) return; const st = star(0.8); st.position.set(x, y, z); root.add(st); STARS.push({ id, m: st, x, z, y }); }); }

  // bake the static decoration into a handful of draw calls
  bake(stat, [stat]);

  // ================= attraction controllers =================
  const v3 = new THREE.Vector3();
  const reward = (key, name) => {
    S.parkRides = S.parkRides || {}; const first = !S.parkRides[key]; S.parkRides[key] = (S.parkRides[key] || 0) + 1;
    const t = first ? 10 : 2; S.tickets = (S.tickets || 0) + t; if (first) S.gems += 1; save(); updPills();
    toast(first ? `🎉 أول مرة في ${name}! +${t}🎟️ +1💎` : `+${t}🎟️`);
  };
  const kidAt = (x, y, z, yaw) => { PL.x = x; PL.y = y; PL.z = z; const k = C.getKid(); k.position.set(x, y, z); if (yaw !== undefined) { k.rotation.y = yaw; PL.yaw = yaw; } C.animKid(k, 0, 0.016, false); };
  const FerrisWheelController = {
    name: 'العجلة الدوارة', start() { const k = C.getKid(); let best = null, by = 1e9; FW.cabins.forEach((c) => { c.getWorldPosition(v3); if (v3.y < by) { by = v3.y; best = c; } }); this.cab = best; this.t = 0; FW.fast = true; toast('🎡 استمتع بالمنظر!'); return { cam: { dist: 34, pitch: 0.14, yaw: 0 } }; },
    update(dt) { this.t += dt; this.cab.getWorldPosition(v3); kidAt(v3.x, v3.y - 0.9, v3.z + 0.2, 0); return this.t < 16; },
    end() { FW.fast = false; kidAt(OFF + FW.x, 0.12, FW.z + 12, Math.PI); reward('ferris', 'العجلة الدوارة'); },
  };
  const RollerCoasterController = {
    name: 'قطار الملاهي', start() { RC.riding = true; RC.u = RC.stationU; RC.v = 0.012; this.dist = 0; toast('🎢 امسك جامد!'); return { cam: { dist: 7, pitch: 0.22, follow: true } }; },
    update(dt) { const front = RC.cars[0]; front.getWorldPosition(v3); const yaw = front.rotation.y; kidAt(v3.x, v3.y + 0.55, v3.z, yaw); PL.yaw = yaw; this.dist += RC.v * dt; return this.dist < 1.0; },
    end() { RC.riding = false; kidAt(OFF + RC.station.x, 0.12, RC.station.z + 2, Math.PI); reward('coaster', 'قطار الملاهي'); },
  };
  const CarouselController = {
    name: 'الكاروسيل', start() { this.h = CA.horses[0]; this.t = 0; CA.fast = true; toast('🎠 يلا نلف!'); C.music(true); return { cam: { dist: 24, pitch: 0.5 } }; },
    update(dt) { this.t += dt; this.h.horse.getWorldPosition(v3); kidAt(v3.x, v3.y - 0.15, v3.z, this.h.hg.rotation.y + CA.a + Math.PI); return this.t < 14; },
    end() { CA.fast = false; C.music(false); kidAt(OFF + CA.x, 0.12, CA.z + 11, Math.PI); reward('carousel', 'الكاروسيل'); },
  };
  const BumperCarController = {
    name: 'عربيات التصادم', start() { const c = BC.cars[0]; c.ai = false; c.v = 0; BC.player = c; this.t = 0; toast('🚗 سوق واخبط في العربيات! (البنزين والدركسيون)'); return { cam: { dist: 9, pitch: 0.5, follow: true }, drive: true }; },
    update(dt) { this.t += dt; const c = BC.player; kidAt(OFF + c.x, 1.0, c.z, c.yaw); return this.t < 45; },
    end() { BC.player.ai = true; BC.player.v = 3; BC.player = null; kidAt(OFF + BC.x, 0.12, BC.z + BC.d / 2 + 2.5, Math.PI); reward('bumper', 'عربيات التصادم'); },
  };
  const WaterSlideController = {
    name: 'الزحليقة', start() { this.c = WP.slides[(S.parkRides && S.parkRides.slide || 0) % 2]; this.t = 0; toast('💦 ويييي!'); C.sfx.jump(); return { cam: { dist: 13, pitch: 0.75 } }; },
    update(dt) { this.t += dt * 0.45; const u = Math.min(1, this.t); const p = this.c.getPointAt(u), tg = this.c.getTangentAt(u); kidAt(OFF + p.x, p.y - 0.4, p.z, Math.atan2(tg.x, tg.z)); if (u >= 1) { splash(p.x, p.z, 30); C.sfx.coin(); } return u < 1; },
    end() { reward('slide', 'الزحليقة'); },
  };
  const ArcadeMachineController = {
    name: 'الأركيد', start(kind) { C.miniGame(kind, (score) => { const t = Math.max(1, Math.round(score / 2)); S.tickets = (S.tickets || 0) + t; save(); updPills(); toast(`🕹️ جبت ${score} نقطة! +${t}🎟️`); S.parkRides = S.parkRides || {}; if (!S.parkRides.arcade) { S.parkRides.arcade = 1; S.gems += 1; save(); updPills(); } }); return null; },
  };
  function splash(x, z, n) { let k = 0; for (const p of WP.splash) { if (p.life > 0) continue; p.life = 0.8 + Math.random() * 0.5; p.m.visible = true; p.m.position.set(x + (Math.random() - 0.5), 0.8, z + (Math.random() - 0.5)); p.vx = (Math.random() - 0.5) * 5; p.vy = 4 + Math.random() * 4; p.vz = (Math.random() - 0.5) * 5; if (++k >= n) break; } }

  // ================= per-frame update =================
  let t0 = 0, splashT = 0;
  function update(dt, now) {
    t0 += dt;
    // ferris wheel
    FW.angle += dt * (FW.fast ? 0.42 : 0.12); FW.g.rotation.z = FW.angle; FW.cabins.forEach((c) => (c.rotation.z = -FW.angle));
    { const ph = Math.floor(now / 350) % 2; FW.bulbs[0].visible = ph === 0; FW.bulbs[1].visible = ph === 1; }
    // coaster: energy-based speed
    { const p = RC.curve.getPointAt(RC.u); const sp = Math.sqrt(Math.max(4, 2 * 9.8 * (19 - p.y))) * 0.9; RC.v = sp / RC.curve.getLength(); RC.u = (RC.u + RC.v * dt) % 1;
      RC.cars.forEach((c, k) => { const u = (RC.u - k * 0.012 + 1) % 1, q = RC.curve.getPointAt(u), tg = RC.curve.getTangentAt(u); c.position.set(q.x, q.y, q.z); c.lookAt(q.x + tg.x, q.y + tg.y, q.z + tg.z); }); }
    // carousel
    CA.a += dt * (CA.fast ? 0.7 : 0.3); CA.g.rotation.y = CA.a; CA.horses.forEach((h) => (h.horse.position.y = 2.4 + Math.sin(now / 400 + h.ph * 1.3) * 0.5));
    // bumper cars
    const pl = BC.player;
    for (const c of BC.cars) {
      if (c === pl) { const st = C.input(); c.v += (st.gas ? 9 : st.brake ? -9 : -Math.sign(c.v) * 4) * dt; c.v = Math.max(-4, Math.min(8, c.v)); if (!st.gas && !st.brake && Math.abs(c.v) < 0.2) c.v = 0; c.yaw += st.steer * dt * 2.6; }
      else { if (Math.random() < dt * 0.6) c.yaw += (Math.random() - 0.5) * 2; c.v += (4 - c.v) * dt; }
      c.x += Math.sin(c.yaw) * c.v * dt; c.z += Math.cos(c.yaw) * c.v * dt;
      const hx = BC.w / 2 - 1.8, hz = BC.d / 2 - 1.8;
      if (c.x < BC.x - hx || c.x > BC.x + hx) { c.x = Math.max(BC.x - hx, Math.min(BC.x + hx, c.x)); c.yaw = -c.yaw; c.v *= 0.7; c.bump = 0.3; }
      if (c.z < BC.z - hz || c.z > BC.z + hz) { c.z = Math.max(BC.z - hz, Math.min(BC.z + hz, c.z)); c.yaw = Math.PI - c.yaw; c.v *= 0.7; c.bump = 0.3; }
    }
    for (let i = 0; i < BC.cars.length; i++) for (let j = i + 1; j < BC.cars.length; j++) { const a = BC.cars[i], b = BC.cars[j], dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz); if (d < 2.6 && d > 0.01) { const push = (2.6 - d) / 2, nx = dx / d, nz = dz / d; a.x -= nx * push; a.z -= nz * push; b.x += nx * push; b.z += nz * push; a.yaw = Math.atan2(-nx, -nz) + (Math.random() - 0.5); b.yaw = Math.atan2(nx, nz) + (Math.random() - 0.5); a.bump = b.bump = 0.3; if (a === pl || b === pl) { C.sfx.bump(); C.shake(0.25); } } }
    for (const c of BC.cars) { c.bump = Math.max(0, c.bump - dt); c.g.position.set(c.x, c.bump ? Math.sin(now / 30) * 0.08 : 0, c.z); c.g.rotation.y = c.yaw; }
    // water park
    WP.water.material.opacity = 0.8 + Math.sin(now / 500) * 0.05;
    for (const p of WP.splash) { if (p.life <= 0) continue; p.life -= dt; p.vy -= 18 * dt; p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt; if (p.life <= 0 || p.m.position.y < 0.4) { p.life = 0; p.m.visible = false; } }
    const lx = PL.x - OFF, lz = PL.z;
    const inPool = Math.abs(lx - WP.x) < WP.w / 2 && Math.abs(lz - WP.z) < WP.d / 2;
    if (inPool && !C.inAct() && (splashT -= dt) < 0 && PL.spd > 1) { splash(lx, lz, 3); splashT = 0.25; }
    // decorations
    for (const d of dyn) { if (d.spin) d.m.rotation.y += dt * d.spin; if (d.spinZ) d.m.rotation.z += dt * d.spinZ; if (d.bob) d.m.position.y = d.bob + Math.sin(now / 600) * 0.4; if (d.pulse) d.m.scale.y = 1 + Math.sin(now / 200 * d.pulse) * 0.15; if (d.sway !== undefined) d.m.rotation.z = Math.sin(now / 900 + d.sway) * 0.08; }
    updFlags(now);
    // collectible stars
    for (let n = STARS.length - 1; n >= 0; n--) { const s = STARS[n]; s.m.rotation.y += dt * 2; if (Math.hypot(lx - s.x, lz - s.z) < 1.8 && Math.abs(PL.y + 1 - s.y) < 2.6) { root.remove(s.m); STARS.splice(n, 1); S.pstars = [...(S.pstars || []), s.id]; S.tickets = (S.tickets || 0) + 3; save(); updPills(); C.sfx.coin(); toast(`⭐ نجمة ${S.pstars.length} من 10  +3🎟️`); } }
  }
  function groundOffset() { const lx = PL.x - OFF, lz = PL.z; return Math.abs(lx - WP.x) < WP.w / 2 && Math.abs(lz - WP.z) < WP.d / 2 ? -0.75 : 0; }
  function interactables() {
    const L = [], o = OFF;
    L.push({ x: o + FW.x, z: FW.z + 9, r: 4, label: '🎡 اركب العجلة', act: () => C.startAct(FerrisWheelController) });
    L.push({ x: o + RC.station.x, z: RC.station.z, r: 4, label: '🎢 اركب القطار', act: () => C.startAct(RollerCoasterController) });
    L.push({ x: o + CA.x, z: CA.z + 10, r: 4, label: '🎠 اركب الكاروسيل', act: () => C.startAct(CarouselController) });
    L.push({ x: o + BC.x, z: BC.z + BC.d / 2 + 1.5, r: 4, label: '🚗 اركب عربية تصادم', act: () => C.startAct(BumperCarController) });
    const tx = WP.x + 20, tz = WP.z - 2; L.push({ x: o + tx, z: tz, r: 3, y: 7, label: '💦 انزلق', act: () => C.startAct(WaterSlideController) });
    AR.machines.forEach((m) => L.push({ x: o + m.x, z: m.z, r: 2.2, label: '🕹️ العب', act: () => ArcadeMachineController.start(m.kind) }));
    L.push({ x: o + AR.prize.x, z: AR.prize.z, r: 2.6, label: '🎁 الجوايز', act: () => C.openPrizes() });
    FD.stands.forEach((s) => L.push({ x: o + s.x, z: s.z, r: 2.8, label: `${s.icon} اشتري ${s.name} (5🪙)`, act: () => { if (S.coins < 5) return toast('محتاج 5 🪙'); S.coins -= 5; save(); updPills(); C.sfx.win(); toast(`${s.icon} يمّي! ${s.name} حلو أوي`); C.treat(s.icon); } }));
    L.push({ x: o - 30, z: 84, r: 3.5, label: '🏙️ رجوع للمدينة', act: () => C.goCity() });
    return L.filter((i) => i.y === undefined ? PL.y < 3 : PL.y > i.y - 1);
  }
  function drawMap(g, s) {
    const P = (v) => v * s;
    g.fillStyle = '#4fb4e8'; g.fillRect(-2000, -2000, 4000, 4000);
    g.fillStyle = '#86d36a'; g.beginPath(); g.roundRect(P(-B - 8), P(-B - 8), P(2 * B + 16), P(2 * B + 16), P(30)); g.fill();
    g.strokeStyle = '#f3c7c0'; g.lineWidth = P(9); g.beginPath(); g.roundRect(P(-70), P(-70), P(140), P(140), P(36)); g.stroke();
    g.fillStyle = '#f3c7c0'; g.fillRect(P(-6), P(0), P(12), P(98)); g.fillRect(P(-76), P(-5), P(152), P(10)); g.fillRect(P(-5), P(-65), P(10), P(65));
    const spot = (x, z, c, r) => { g.fillStyle = c; g.beginPath(); g.arc(P(x), P(z), P(r), 0, 7); g.fill(); };
    spot(FW.x, FW.z, '#e66bff', 9); spot(CA.x, CA.z, '#ffd23f', 9); spot(0, 72, '#f6d6cf', 12); spot(0, 12, '#ff9fd0', 8);
    g.fillStyle = '#3a3f55'; g.fillRect(P(BC.x - BC.w / 2), P(BC.z - BC.d / 2), P(BC.w), P(BC.d));
    g.fillStyle = '#3fc6ff'; g.fillRect(P(WP.x - WP.w / 2), P(WP.z - WP.d / 2), P(WP.w), P(WP.d));
    g.fillStyle = '#c04dff'; g.fillRect(P(AR.x - 11), P(AR.z - 8), P(22), P(16));
    g.strokeStyle = '#ff4fae'; g.lineWidth = P(2); g.beginPath(); RC.curve.getSpacedPoints(60).forEach((p, i) => (i ? g.lineTo(P(p.x), P(p.z)) : g.moveTo(P(p.x), P(p.z)))); g.closePath(); g.stroke();
    STARS.forEach((st) => spot(st.x, st.z, '#ffd23f', 2.2));
  }
  const LABELS = [['البوابة', 0, 92], ['العجلة', FW.x, FW.z], ['القطار', 45, -60], ['الكاروسيل', CA.x, CA.z], ['التصادم', BC.x, BC.z], ['الحديقة المائية', WP.x, WP.z], ['الأركيد', AR.x, AR.z], ['الأكل', 0, 12]];
  const goal = () => `🎡 مدينة الملاهي<small>⭐ النجوم ${10 - STARS.length}/10 · 🎢 الألعاب ${Object.keys(S.parkRides || {}).length}/6 · 🎟️ ${S.tickets || 0}</small>`;
  return { goal, root, update, interactables, drawMap, groundOffset, LABELS, SPAWN: { x: OFF, z: 96, yaw: Math.PI }, B, OFF, STARS, FW, RC, CA, BC, WP, AR, FerrisWheelController, RollerCoasterController, CarouselController, BumperCarController, WaterSlideController, ArcadeMachineController };
}

