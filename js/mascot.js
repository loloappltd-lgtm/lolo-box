// LOLO BOX — the official voxel Lolo mascot (LOLO_MASCOT_VOXEL_2026)
// Blocky version of the Lolo fish: blue cube body, big purple star eyes, yellow forehead star, smile,
// fins and tail made of colourful blocks. Faces +Z. Call mascot.update(seconds) every frame to animate it.
import * as THREE from 'three';
import { mergeGeometries } from './jsm/utils/BufferGeometryUtils.js';

const BLUE = '#3fb6ff', BLUE_D = '#2a8ff0', BLUE_L = '#8fdcff', PURPLE = '#8f5cff', VIOLET = '#b86bff', PINK = '#ff6fd0', YELLOW = '#ffd23f', GOLD_D = '#ffab0f';

export function makeLoloMascot(opts = {}) {
  const toon = opts.toon || ((c, extra) => new THREE.MeshToonMaterial(Object.assign({ color: c }, extra || {})));
  const root = new THREE.Group(); root.name = 'loloMascot';
  const body = new THREE.Group(); root.add(body);

  // boxes grouped by colour and merged: [x, y, z, w, h, d, colour]
  function vox(list, parent, extra) {
    const by = {};
    for (const [x, y, z, w, h, d, c] of list) { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); (by[c] = by[c] || []).push(g); }
    for (const c in by) { const m = new THREE.Mesh(mergeGeometries(by[c]), toon(c, extra)); m.castShadow = true; parent.add(m); }
    return parent;
  }

  // ---- body: a big blue cube with stepped (voxel) edges, lighter belly, darker back ----
  vox([
    [0, 0, 0, 1.2, 1.0, 1.0, BLUE],
    [0, 0, 0, 1.3, 0.84, 0.84, BLUE], [0, 0, 0, 1.04, 1.1, 0.84, BLUE], [0, 0, 0, 1.04, 0.84, 1.1, BLUE],
    [0, -0.36, 0.38, 0.84, 0.24, 0.3, BLUE_L],
    [0, 0.42, -0.36, 0.9, 0.2, 0.34, BLUE_D],
  ], body);

  // ---- face (pixel-art texture on the front) ----
  const fc = document.createElement('canvas'); fc.width = fc.height = 64; const g = fc.getContext('2d');
  g.imageSmoothingEnabled = false;
  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  // eyes: dark purple squares with a yellow star and white sparkles
  for (const ex of [8, 36]) {
    px(ex, 13, 20, 24, '#2a0f5c'); px(ex + 2, 15, 16, 20, '#6a35e0'); px(ex + 2, 26, 16, 9, '#8f5cff');
    // star (pixel)
    const sx = ex + 10, sy = 25; [[0, -5, 1, 3], [-1, -3, 3, 2], [-5, -1, 11, 2], [-3, 1, 7, 2], [-3, 3, 2, 2], [2, 3, 2, 2], [-4, 5, 2, 1], [3, 5, 2, 1]].forEach(([x, y, w, h]) => px(sx + x, sy + y, w, h, '#ffd23f'));
    px(ex + 3, 17, 4, 4, '#ffffff'); px(ex + 14, 29, 2, 2, '#ffffff');
    px(ex - 1, 12, 22, 2, '#2a0f5c'); px(ex + (ex < 30 ? -2 : 19), 10, 3, 3, '#2a0f5c'); // lashes
  }
  px(4, 38, 8, 5, '#ff8fc8'); px(52, 38, 8, 5, '#ff8fc8'); // blush
  // open smile
  px(21, 40, 22, 3, '#3a0f3f'); px(22, 43, 20, 3, '#3a0f3f'); px(24, 46, 16, 3, '#3a0f3f'); px(27, 49, 10, 2, '#3a0f3f'); px(23, 40, 18, 2, '#ffffff'); px(26, 45, 12, 4, '#ff5f8f');
  const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace; ft.magFilter = THREE.NearestFilter; ft.minFilter = THREE.NearestFilter;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.04, 1.04), new THREE.MeshBasicMaterial({ map: ft, transparent: true, toneMapped: false }));
  face.position.set(0, 0, 0.552); body.add(face);

  // ---- yellow forehead star (extruded) ----
  const ss = new THREE.Shape(); for (let i = 0; i <= 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.11 : 0.25; i ? ss.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ss.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const sg = new THREE.ExtrudeGeometry(ss, { depth: 0.1, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 1 }); sg.center();
  const star = new THREE.Mesh(sg, toon(YELLOW, { emissive: GOLD_D, emissiveIntensity: 0.35 })); star.position.set(0, 0.6, 0.36); star.rotation.x = -0.35; star.castShadow = true; body.add(star);

  // ---- dorsal fin: stepped blocks purple -> pink ----
  const dorsal = new THREE.Group(); dorsal.position.set(0, 0.55, -0.1); body.add(dorsal);
  vox([[0, 0.08, 0.1, 0.16, 0.16, 0.3, PURPLE], [0, 0.22, -0.02, 0.16, 0.16, 0.3, VIOLET], [0, 0.36, -0.14, 0.16, 0.16, 0.26, PINK], [0, 0.48, -0.24, 0.16, 0.12, 0.18, YELLOW]], dorsal);

  // ---- side fins (flap) ----
  const fins = [-1, 1].map((s) => {
    const p = new THREE.Group(); p.position.set(s * 0.66, -0.1, 0.05); body.add(p);
    vox([[s * 0.1, 0, 0, 0.2, 0.3, 0.3, VIOLET], [s * 0.26, -0.06, -0.04, 0.16, 0.24, 0.26, PINK], [s * 0.38, -0.12, -0.08, 0.12, 0.16, 0.2, YELLOW]], p);
    return p;
  });

  // ---- tail: a fan of blocks (purple -> pink -> yellow), wags ----
  const tail = new THREE.Group(); tail.position.set(0, 0.05, -0.55); tail.rotation.x = -0.45; body.add(tail);
  const T = [];
  const cols = [PURPLE, VIOLET, PINK, PINK, YELLOW];
  for (let r = 0; r < 5; r++) for (let k = -r; k <= r; k++) { if (Math.abs(k) > 2) continue; const c = cols[Math.min(4, r + (Math.abs(k) === 2 ? 1 : 0))]; T.push([k * 0.22, 0.04 * r + (r % 2) * 0.02, -0.1 - r * 0.2, 0.2, 0.62 - r * 0.04 + (2 - Math.abs(k)) * 0.08, 0.2, c]); }
  vox(T, tail);
  // little wing-like top tail fin
  vox([[0, 0.38, -0.5, 0.16, 0.3, 0.18, PINK], [0, 0.6, -0.66, 0.16, 0.26, 0.16, YELLOW]], tail);

  // ---- sparkles around ----
  const sparkMat = new THREE.MeshBasicMaterial({ color: '#fff6b0', toneMapped: false });
  const sparks = [];
  for (const [x, y, z, s] of [[-0.85, 0.75, 0.2, 0.07], [0.9, 0.55, 0.1, 0.05], [-0.7, -0.6, 0.3, 0.05]]) { const m = new THREE.Mesh(new THREE.OctahedronGeometry(s), sparkMat); m.position.set(x, y, z); root.add(m); sparks.push(m); }

  root.update = (t) => {
    body.position.y = Math.sin(t * 2.2) * 0.08;
    body.rotation.z = Math.sin(t * 1.4) * 0.05;
    fins[0].rotation.z = 0.25 + Math.sin(t * 7) * 0.35; fins[1].rotation.z = -0.25 - Math.sin(t * 7) * 0.35;
    tail.rotation.y = Math.sin(t * 4.5) * 0.35;
    sparks.forEach((s, n) => { s.rotation.y = t * 3 + n; s.scale.setScalar(0.7 + Math.abs(Math.sin(t * 3 + n * 2)) * 0.6); });
  };
  root.update(0);
  return root;
}
