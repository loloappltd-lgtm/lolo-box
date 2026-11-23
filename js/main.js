// LOLO WORLD — Open World (prototype: Downtown area)
// Three.js, no external models yet: every 3D object below is a temporary procedural stand-in
import * as THREE from 'three';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from './jsm/utils/BufferGeometryUtils.js';
import { buildPark, PARK_OFF } from './park.js?v=9';
import { buildHome, HOME_OFF } from './home.js?v=1';
import { initAvatar, WARD, PRESETS, SKIN, PAL, HAIRC, cloneLook, NEW_CHARS } from './avatar.js?v=3';
import { initCharSel } from './charsel.js?v=2';
import { makeLoloMascot } from './mascot.js?v=1';
import { buildMall, MALL_OFF } from './mall.js?v=4';
import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './jsm/postprocessing/OutputPass.js';

// ===== LOLO LOOK: bright, saturated cartoon colours on EVERY material (textures, vertex colours, models) =====
// Runs inside each shader just before tone mapping, so it costs nothing extra (no post pass) and works on weak tablets too.
THREE.ShaderChunk.tonemapping_fragment = `
{ vec3 c = gl_FragColor.rgb; float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b));
  float sat = (mx - mn) / max(mx, 1e-4); c = mix(vec3(l), c, 1.0 + 0.75 * (1.0 - sat) * step(0.02, mx - mn) + 0.18);
  gl_FragColor.rgb = max(c, 0.0); }
` + THREE.ShaderChunk.tonemapping_fragment;
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
const angLerp = (a, b, t) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * t; };
let seed = 7; const srnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647); const sr = (a, b) => a + srnd() * (b - a);
const MOBILE = matchMedia('(pointer:coarse)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent);

// ================= save =================
const KEY = 'loloWorld.v1';
const DEF = { char: 0, coins: 0, gems: 0, mi: 0, seen: [], mapsKnown: [1], drove: false, bal: [], got: [], gemsGot: [], house: null, shells: [], obby: 0, rides: 0, car: 'pink', owned: ['pink'], sound: true, q: (navigator.deviceMemory && navigator.deviceMemory <= 3) ? 'low' : 'high' };
let S = Object.assign({}, DEF, (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })());
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const CHARS = [
  { name: 'جنى', f: 1, kind: 'girl', skin: '#f6c9a8', hair: '#6b3a22', top: '#ff5fa8', bottom: '#6f9de8', shoe: '#ff7ab8' },
  { name: 'آدم', f: 0, kind: 'boy', skin: '#f1c19c', hair: '#6b3a22', top: '#ffc21a', bottom: '#3f5fb8', shoe: '#ffffff', cap: '#8b4fe0' },
  { name: 'مريم', f: 1, kind: 'hijab', skin: '#f6cfb2', hair: '#f7b6d2', top: '#c48bf0', bottom: '#f3d6ff', shoe: '#ffffff' },
  { name: 'يوسف', f: 0, kind: 'curly', skin: '#c98b5f', hair: '#2a1b12', top: '#3aa0ff', bottom: '#2f4f8f', shoe: '#ff8a1f' },
  ...NEW_CHARS.map((c) => ({ name: c.name, f: c.f, kind: c.f ? 'girl' : 'boy', skin: SKIN[c.look.skin], hair: c.look.c.hair, top: c.look.c.top, bottom: c.look.c.bottom, shoe: c.look.c.shoes })),
];
if (!(S.char >= 0 && S.char < CHARS.length)) S.char = 0;
const gx = (f, m) => (curLook().g === 'girl' ? f : m); // gendered Arabic text
// every one of the 4 characters keeps its own outfit
function curLook() { if (!S.looks || typeof S.looks !== 'object') S.looks = {}; return S.looks[S.char] || (S.looks[S.char] = cloneLook(PRESETS[S.char])); }

// ================= renderer =================
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !MOBILE, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.05; // ACES greys colours out; Neutral keeps them pure
renderer.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#8fd3ff', 190, 560);
const camera = new THREE.PerspectiveCamera(60, 1, 0.3, 1400);
const hemi = new THREE.HemisphereLight('#d8f0ff', '#6ad84a', 1.45); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff4dc', 2.5);
const sc = sun.shadow.camera; sc.left = -55; sc.right = 55; sc.top = 55; sc.bottom = -55; sc.near = 1; sc.far = 260; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);
let composer = null, bloom = null;
function applyQuality() {
  const hi = S.q === 'high';
  if (hi && !composer) { composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera)); bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.28, 0.5, 0.92); composer.addPass(bloom); composer.addPass(new OutputPass()); }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, hi ? (MOBILE ? 1.5 : 2) : 1));
  renderer.shadowMap.enabled = hi; sun.castShadow = hi;
  sun.shadow.mapSize.set(1024, 1024);
  if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
  scene.traverse((o) => { if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => (m.needsUpdate = true)); } });
  resize();
}
function resize() { renderer.setSize(innerWidth, innerHeight, false); if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(innerWidth, innerHeight); } camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); $('#rot').classList.toggle('need', MOBILE); }
addEventListener('resize', resize);

// ================= materials & textures =================
const grad = (() => { const d = new Uint8Array([90, 170, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const MC = {};
const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); return MC[k] || (MC[k] = new THREE.MeshToonMaterial(Object.assign({ color: c, gradientMap: grad }, extra || {}))); };
function ctex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const WT = {};
function winTex(wall, glass, frame, style) {
  const k = wall + glass + frame + style; if (WT[k]) return WT[k];
  return (WT[k] = ctex(128, 128, (g, w, h) => {
    g.fillStyle = wall; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(0, 60, w, 4); g.fillRect(0, 124, w, 4);
    for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
      const X = x * 64, Y = y * 64;
      if (style === 'glass') { const gr = g.createLinearGradient(X, Y, X + 64, Y + 64); gr.addColorStop(0, '#bfe8ff'); gr.addColorStop(1, glass); g.fillStyle = gr; g.fillRect(X + 3, Y + 3, 58, 56); g.fillStyle = frame; g.fillRect(X + 31, Y + 3, 2, 56); g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(X + 6, Y + 6, 10, 46); continue; }
      g.fillStyle = frame; rrect(g, X + 12, Y + 10, 40, 42, 9); g.fill();
      const gr = g.createLinearGradient(X, Y + 12, X, Y + 52); gr.addColorStop(0, '#d9f3ff'); gr.addColorStop(1, glass); g.fillStyle = gr; rrect(g, X + 16, Y + 14, 32, 34, 6); g.fill();
      g.fillStyle = frame; g.fillRect(X + 31, Y + 14, 2, 34); g.fillRect(X + 16, Y + 30, 32, 2);
      g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(X + 19, Y + 17, 6, 10);
    }
  }, true));
}
function signTex(text, bg, fg, w = 512, h = 128, font = 84) {
  return ctex(w, h, (g) => {
    g.fillStyle = bg; rrect(g, 6, 6, w - 12, h - 12, 30); g.fill(); g.lineWidth = 10; g.strokeStyle = '#fff'; g.stroke();
    g.font = `900 ${font}px Cairo, Tajawal, "Arial Black", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 14; g.strokeStyle = 'rgba(0,0,0,.25)'; g.strokeText(text, w / 2, h / 2 + 4); g.fillStyle = fg; g.fillText(text, w / 2, h / 2 + 4);
  });
}
function plane(tex, w, h) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })); }

// ================= sky =================
{
  const g = new THREE.SphereGeometry(900, 32, 16), col = [], top = new THREE.Color('#1f8fff'), bot = new THREE.Color('#9fe0ff');
  for (let i = 0; i < g.attributes.position.count; i++) { const y = g.attributes.position.getY(i) / 900; const c = bot.clone().lerp(top, clamp(y * 1.6, 0, 1)); col.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  window.__sky = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, toneMapped: false })); scene.add(window.__sky);
  const cm = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#e8f4ff', emissiveIntensity: 0.6, fog: false });
  for (let i = 0; i < 18; i++) { const cl = new THREE.Group(); const a = sr(0, 6.28), r = sr(250, 560); for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(sr(10, 20), 10, 8), cm); s.position.set(k * 14 - 28, sr(-3, 6), sr(-6, 6)); cl.add(s); } cl.position.set(Math.cos(a) * r, sr(110, 190), Math.sin(a) * r); cl.rotation.y = -a; scene.add(cl); }
}

// ================= island =================
const G = [-120, -60, 0, 60, 120], RW = 12, BC = [-90, -30, 30, 90], BH = 24, EXT = 134;
const beachDir = Math.PI / 2; // +z = south = beach
const Rg = (a) => 205 + 7 * Math.sin(3 * a + 0.5) + 5 * Math.sin(7 * a + 1.3) - 18 * Math.pow(Math.max(0, Math.cos(a - beachDir)), 3);
const Rs = (a) => Rg(a) + 9 + 30 * Math.pow(Math.max(0, Math.cos(a - beachDir)), 3);
const landR = (x, z) => Rs(Math.atan2(z, x)) - 2.5;
function islandShape(fn) { const s = new THREE.Shape(); for (let i = 0; i <= 160; i++) { const a = (i / 160) * Math.PI * 2, r = fn(a); i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } return s; }
function slab(fn, top, depth, mat) { const geo = new THREE.ExtrudeGeometry(islandShape(fn), { depth, bevelEnabled: true, bevelSize: 2, bevelThickness: 1.2, bevelSegments: 2, curveSegments: 4 }); geo.rotateX(Math.PI / 2); const m = new THREE.Mesh(geo, mat); m.position.y = top - 1.2; m.receiveShadow = true; scene.add(m); return m; }
const grassTex = ctex(128, 128, (g, w, h) => { g.fillStyle = '#4fe03c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? '#66ef4e' : '#3fcf34'; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); } }, true); grassTex.repeat.set(0.06, 0.06);
const sandTex = ctex(128, 128, (g, w, h) => { g.fillStyle = '#ffd86b'; g.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { g.fillStyle = Math.random() < 0.5 ? '#ffe48f' : '#f5c84f'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, true); sandTex.repeat.set(0.08, 0.08);
slab(Rs, -0.06, 4, new THREE.MeshToonMaterial({ color: '#ffffff', map: sandTex, gradientMap: grad }));
slab(Rg, 0, 1.2, new THREE.MeshToonMaterial({ color: '#ffffff', map: grassTex, gradientMap: grad }));
// water
const waterTex = ctex(256, 256, (g, w, h) => { g.fillStyle = '#12c6ff'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 3; for (let i = 0; i < 40; i++) { const x = Math.random() * w, y = Math.random() * h; g.beginPath(); g.arc(x, y, 8 + Math.random() * 10, 0.2, 2.6); g.stroke(); } }, true); waterTex.repeat.set(60, 60);
const water = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshPhongMaterial({ color: '#ffffff', map: waterTex, shininess: 80, specular: '#ffffff' }));
water.rotation.x = -Math.PI / 2; water.position.y = -0.9; scene.add(water);
{ const foam = new THREE.Mesh(new THREE.ShapeGeometry((() => { const o = islandShape((a) => Rs(a) + 7); o.holes.push(islandShape((a) => Rs(a) + 1)); return o; })()), new THREE.MeshBasicMaterial({ color: '#e9fbff', transparent: true, opacity: 0.7 })); foam.rotation.x = Math.PI / 2; foam.scale.y = -1; foam.rotation.x = -Math.PI / 2; foam.position.y = -0.85; scene.add(foam); }

// ================= roads =================
const solids = [];            // {x0,x1,z0,z1} buildings etc. (characters & cars collide)
const circles = [];           // {x,z,r}
const camBlock = [];          // meshes the camera should not pass through
const roadMat = toon('#4b4f7a'), lineMat = toon('#ffffff'), yellowMat = toon('#ffd23f');
const simpleRoads = []; // procedural roads, hidden once the Kenney road tiles load
const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3(), tmpP = new THREE.Vector3(), tmpE = new THREE.Euler();
function inst(geo, mat, list, cast = true) { const m = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((t, n) => { tmpM.compose(tmpP.set(t[0], t[1], t[2]), tmpQ.setFromEuler(tmpE.set(t[3] || 0, t[4] || 0, t[5] || 0)), tmpS.set(t[6] || 1, t[7] || t[6] || 1, t[8] || t[6] || 1)); m.setMatrixAt(n, tmpM); }); m.castShadow = cast; m.receiveShadow = true; m.computeBoundingSphere(); scene.add(m); return m; }
for (const k of G) {
  const a = new THREE.Mesh(new THREE.BoxGeometry(EXT * 2 + RW, 0.06, RW), roadMat); a.position.set(0, 0.03, k); a.receiveShadow = true; scene.add(a); simpleRoads.push(a);
  const b = new THREE.Mesh(new THREE.BoxGeometry(RW, 0.061, EXT * 2 + RW), roadMat); b.position.set(k, 0.031, 0); b.receiveShadow = true; scene.add(b); simpleRoads.push(b);
}
// roads leaving the grid towards the beach and the edges
for (const [x, z, w, d] of [[0, EXT + 24, RW, 48], [EXT + 22, 0, 44, RW], [-EXT - 22, 0, 44, RW], [0, -EXT - 20, RW, 40]]) { const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), roadMat); r.position.set(x, 0.03, z); r.receiveShadow = true; scene.add(r); }
{ const dashes = [], zebra = [];
  for (const k of G) for (let i = -1; i < 4; i++) {
    const a = (i < 0 ? -EXT : G[i] + RW / 2) + 3, b = (i < 0 ? G[0] - RW / 2 : i === 3 ? EXT : G[i + 1] - RW / 2) - 3;
    for (let t = a; t < b; t += 5) { dashes.push([t + 1.2, 0.07, k, 0, 0, 0]); dashes.push([k, 0.07, t + 1.2, 0, Math.PI / 2, 0]); }
  }
  for (const kx of G) for (const kz of G) for (let s = -RW / 2 + 1.2; s < RW / 2 - 0.8; s += 1.5) { zebra.push([kx + RW / 2 + 1.4, 0.07, kz + s, 0, 0, 0]); zebra.push([kx - RW / 2 - 1.4, 0.07, kz + s, 0, 0, 0]); zebra.push([kx + s, 0.07, kz + RW / 2 + 1.4, 0, Math.PI / 2, 0]); zebra.push([kx + s, 0.07, kz - RW / 2 - 1.4, 0, Math.PI / 2, 0]); }
  simpleRoads.push(inst(new THREE.BoxGeometry(2.4, 0.02, 0.28), yellowMat, dashes, false));
  simpleRoads.push(inst(new THREE.BoxGeometry(2.2, 0.02, 0.7), lineMat, zebra, false));
}

// ================= blocks / buildings =================
const tileTex = (a, b, line) => ctex(128, 128, (g, w, h) => { g.fillStyle = line; g.fillRect(0, 0, w, h); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? a : b; rrect(g, x * 32 + 2, y * 32 + 2, 28, 28, 5); g.fill(); } }, true);
const plazaTex = tileTex('#ff7cc8', '#b98cff', '#ffffff'); plazaTex.repeat.set(9, 9);
const walkTex = tileTex('#fff3c4', '#ffe08a', '#ffffff'); walkTex.repeat.set(6, 6);
const sideMat = new THREE.MeshToonMaterial({ map: walkTex, gradientMap: grad }), curbMat = toon('#ff9f43'), plazaMat = new THREE.MeshToonMaterial({ map: plazaTex, gradientMap: grad });
const blockType = {};
const T = (i, j, t) => (blockType[i + ',' + j] = t);
T(1, 1, 'plaza'); T(0, 1, 'mall'); T(0, 0, 'police'); T(3, 1, 'hospital'); T(2, 2, 'school');
T(1, 0, 'tower'); T(2, 0, 'tower'); T(3, 0, 'tower'); T(2, 1, 'tower');
T(1, 2, 'shops'); T(3, 2, 'fair'); T(3, 3, 'fair2');
T(0, 2, 'homes'); T(0, 3, 'homes'); T(1, 3, 'homes'); T(2, 3, 'homes');
const onBlock = (x, z) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (Math.abs(x - BC[i]) < BH && Math.abs(z - BC[j]) < BH) return [i, j]; return null; };
function building(x, z, w, d, h, wall, glass, frame, style, roof, rot) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const U = 7; // one texture = 7 m
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) {
    const i = f * 4 + k, fw = f < 2 ? d : w;
    if (f === 2 || f === 3) uv.setXY(i, 0.02, 0.97); else uv.setXY(i, uv.getX(i) * fw / U, uv.getY(i) * h / U);
  }
  const tx = winTex(wall, glass, frame, style); const m = new THREE.Mesh(g, tx.__mat || (tx.__mat = new THREE.MeshToonMaterial({ map: tx, gradientMap: grad })));
  m.position.set(x, 0.12 + h / 2, z); if (rot) m.rotation.y = rot; m.castShadow = m.receiveShadow = true; scene.add(m); camBlock.push(m);
  const r = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.7, d + 0.8), toon(roof)); r.position.set(x, 0.12 + h + 0.35, z); if (rot) r.rotation.y = rot; r.castShadow = true; scene.add(r);
  const sw = rot && Math.abs(Math.sin(rot)) > 0.5; solids.push({ x0: x - (sw ? d : w) / 2, x1: x + (sw ? d : w) / 2, z0: z - (sw ? w : d) / 2, z1: z + (sw ? w : d) / 2 });
  m.userData.slab = r;
  return m;
}
function gable(x, z, w, d, h, color, rot) { // triangular house roof
  const s = new THREE.Shape(); s.moveTo(-w / 2 - 0.6, 0); s.lineTo(0, h); s.lineTo(w / 2 + 0.6, 0); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: d + 1, bevelEnabled: false }); g.translate(0, 0, -(d + 1) / 2);
  const m = new THREE.Mesh(g, toon(color)); m.position.set(x, 0, z); m.rotation.y = rot || 0; m.castShadow = true; scene.add(m); return m;
}
function sign(text, bg, fg, x, y, z, rot, w = 12, h = 3) { const p = plane(signTex(text, bg, fg), w, h); p.position.set(x, y, z); p.rotation.y = rot; scene.add(p); return p; }
// front direction of each block = towards the plaza-ish main roads
const simpleTrees = [];
const treeSpots = [], palmSpots = [], lampSpots = [], benchSpots = [], bushSpots = [];
const LAND = {}; // named landmark positions
const HOUSES = [];
const OBBY_AT = { x: 0, z: 0 }; // houses the player can buy
const KLOTS = []; // lots filled with Kenney buildings (fallback: procedural boxes)
for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
  const cx = BC[i], cz = BC[j], t = blockType[i + ',' + j];
  const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(BH * 2, 0.12, BH * 2), t === 'plaza' ? plazaMat : sideMat); sidewalk.position.set(cx, 0.06, cz); sidewalk.receiveShadow = true; scene.add(sidewalk);
  for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) lampSpots.push([cx + lx * (BH - 1), cz + lz * (BH - 1)]);
  if (t !== 'plaza' && t !== 'fair' && t !== 'fair2') for (let k = 0; k < 4; k++) { treeSpots.push([cx - BH + 2, cz - 15 + k * 10]); treeSpots.push([cx + BH - 2, cz - 15 + k * 10]); }
  if (t === 'tower') {
    const pal = [['#7fb8ff', '#3b7fd6', '#e8f2ff'], ['#a98cff', '#6a4ed6', '#f0eaff'], ['#6fd3ff', '#2f97d0', '#e6f8ff'], ['#ffb3d9', '#e05aa0', '#fff0f7']];
    const lots = [[-10, -10], [10, -10], [-10, 10], [10, 10]];
    lots.forEach(([ox, oz], n) => { const p = pal[(i + j + n) % 4], h = 20 + ((i * 7 + j * 3 + n * 5) % 5) * 9; KLOTS.push({ x: cx + ox, z: cz + oz, type: (i + j + n) % 3 === 0 ? 'mid' : 'sky', n: i * 7 + j * 3 + n, rot: oz < 0 ? Math.PI : 0, fb: () => building(cx + ox, cz + oz, 15, 15, h, p[0], p[1], p[2], 'glass', '#ffffff') }); });
  } else if (t === 'mall') {
    const m = building(cx - 2, cz, 34, 36, 15, '#b45cff', '#7a2fe0', '#ffffff', 'win', '#ff7ac0');
    sign('LOLO MALL', '#ff4fae', '#ffe14a', cx + 15.3, 17.5, cz, Math.PI / 2, 16, 4);
    const aw = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.4, 16), toon('#ffd23f')); aw.position.set(cx + 16, 5, cz); scene.add(aw);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.5, 9), toon('#bfe8ff')); door.position.set(cx + 15.1, 2.4, cz); scene.add(door);
    const bag = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 1.5), toon('#ffd23f')); bag.position.set(cx - 2, 18.5, cz); scene.add(bag);
    const hd = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.25, 8, 16, Math.PI), toon('#ffd23f')); hd.position.set(cx - 2, 20.5, cz); scene.add(hd);
    LAND.mall = { x: cx + 20, z: cz, name: 'مول لولو', lx: cx, lz: cz };
  } else if (t === 'police') {
    building(cx - 3, cz, 26, 30, 11, '#4d86ff', '#1f4fb8', '#ffffff', 'win', '#1f3f99');
    sign('POLICE', '#1f4fb8', '#ffffff', cx + 10.3, 13, cz, Math.PI / 2, 11, 2.8);
    const badge = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.8, 6), toon('#ffd23f')); badge.rotation.z = Math.PI / 2; badge.position.set(cx + 10.5, 9, cz); scene.add(badge);
    for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), toon(s < 0 ? '#ff3b3b' : '#3b7bff', { emissive: s < 0 ? '#ff0000' : '#0044ff', emissiveIntensity: 0.6 })); l.position.set(cx - 3, 12.2, cz + s * 1); scene.add(l); }
    LAND.police = { x: cx + 18, z: cz, name: 'الشرطة', lx: cx, lz: cz };
  } else if (t === 'hospital') {
    building(cx + 3, cz, 26, 32, 13, '#f2ece2', '#7ec8ff', '#d94b4b', 'win', '#e94c4c');
    sign('HOSPITAL', '#e94c4c', '#ffffff', cx - 10.3, 15, cz, -Math.PI / 2, 12, 2.8);
    const cr = new THREE.Group(); cr.add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 4, 1.3), toon('#ff3b3b')), new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.3, 4), toon('#ff3b3b'))); cr.position.set(cx - 10.4, 10, cz); scene.add(cr);
    LAND.hospital = { x: cx - 18, z: cz, name: 'المستشفى', lx: cx, lz: cz };
  } else if (t === 'school') {
    building(cx, cz + 6, 34, 22, 10, '#ffbf6b', '#5ab0ff', '#ffffff', 'win', '#c9542f');
    const r = gable(cx, cz + 6, 22, 34, 5, '#e2603a', Math.PI / 2); r.position.y = 10.8;
    sign('SCHOOL', '#7a3fe0', '#ffffff', cx, 9, cz - 5.2, Math.PI, 11, 2.8);
    const fp = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 12, 6), toon('#dddddd')); fp.position.set(cx + 14, 6, cz - 12); scene.add(fp);
    const fl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2, 3), toon('#34c759')); fl.position.set(cx + 14, 11, cz - 10.5); scene.add(fl); circles.push({ x: cx + 14, z: cz - 12, r: 0.5 });
    LAND.school = { x: cx, z: cz - 14, name: 'المدرسة', lx: cx, lz: cz };
  } else if (t === 'shops') {
    const cols = [['#ff9fd0', '#ff4fae'], ['#ffe066', '#ff9f1c'], ['#9fe3ff', '#2fa8ff'], ['#c7a6ff', '#8b4fe0']];
    [[-11, -11], [11, -11], [-11, 11], [11, 11]].forEach(([ox, oz], n) => {
      KLOTS.push({ x: cx + ox, z: cz + oz, type: 'shop', n: n + 3, rot: oz < 0 ? Math.PI : 0, fb: () => { building(cx + ox, cz + oz, 16, 16, 7 + (n % 2) * 3, cols[n][0], '#5ab0ff', '#ffffff', 'win', cols[n][1]); const aw = new THREE.Mesh(new THREE.BoxGeometry(14, 0.35, 2.4), toon(cols[n][1])); aw.position.set(cx + ox, 3.6, cz + oz + (oz < 0 ? -9 : 9)); scene.add(aw); } });
    });
    LAND.shops = { x: cx, z: cz, name: 'المحلات' };
  } else if (t === 'homes') {
    const roofs = ['#e2603a', '#4d86ff', '#b45cff', '#ff7ab8'], walls = ['#fff4e0', '#ffe6f2', '#e8f6ff', '#fffbd6'];
    [[-11, -11], [11, -11], [-11, 11], [11, 11]].forEach(([ox, oz], n) => {
      const k = (i * 3 + j + n) % 4; const wm = building(cx + ox, cz + oz, 11, 9, 6, walls[k], '#5ab0ff', '#ffffff', 'win', walls[k]);
      const r = gable(cx + ox, cz + oz, 11, 9, 4, roofs[k], 0); r.position.y = 6.5;
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 0.2), toon('#8a4b2a')); door.position.set(cx + ox, 1.4, cz + oz + (oz < 0 ? -4.6 : 4.6)); scene.add(door);
      if (i === 0 && j === 2) { // houses for sale
        wm.material = wm.material.clone(); r.material = r.material.clone(); [wm, r, door, wm.userData.slab].forEach((o) => (o.userData.keep = true));
        HOUSES.push({ id: n, x: cx + ox, z: cz + oz, dir: oz < 0 ? -1 : 1, wall: wm, roof: r, price: [400, 500, 600, 800][n], items: {} });
      }
      bushSpots.push([cx + ox - 4, cz + oz + (oz < 0 ? -6 : 6)], [cx + ox + 4, cz + oz + (oz < 0 ? -6 : 6)]);
    });
    if (!LAND.homes) LAND.homes = { x: cx, z: cz, name: 'الحي السكني' };
  } else if (t === 'plaza') {
    // fountain
    const f = new THREE.Group();
    { const _m = new THREE.Mesh(new THREE.CylinderGeometry(6, 6.4, 0.9, 32), toon('#e8dcc8')); _m.position.set(0, 0.45, 0); f.add(_m); }
    const wtr = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 0.2, 32), new THREE.MeshPhongMaterial({ color: '#5fd0ff', transparent: true, opacity: 0.85, shininess: 90 })); wtr.position.y = 0.85; f.add(wtr);
    { const _m = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 3, 12), toon('#e8dcc8')); _m.position.set(0, 2, 0); f.add(_m); }
    { const _m = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2, 0.5, 24), toon('#e8dcc8')); _m.position.set(0, 3.5, 0); f.add(_m); }
    const jet = new THREE.Mesh(new THREE.ConeGeometry(1.4, 3.4, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#bff0ff', transparent: true, opacity: 0.55, side: THREE.DoubleSide })); jet.position.y = 4.2; jet.rotation.x = Math.PI; f.add(jet);
    f.position.set(cx, 0.12, cz); f.traverse((o) => { o.castShadow = o.receiveShadow = true; }); scene.add(f); circles.push({ x: cx, z: cz, r: 6.6 });
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; benchSpots.push([cx + Math.cos(a) * 12, cz + Math.sin(a) * 12, -a + Math.PI / 2]); treeSpots.push([cx + Math.cos(a + 0.4) * 19, cz + Math.sin(a + 0.4) * 19]); }
    LAND.fountain = { x: cx, z: cz, name: 'النافورة' };
    window.__jet = jet;
  } else if (t === 'fair') {
    OBBY_AT.x = cx; OBBY_AT.z = cz;
    LAND.fair = { x: cx, z: cz - 22, name: 'مدينة الملاهي', lx: cx, lz: cz + 30 };
    sign('مدينة الملاهي', '#b45cff', '#ffe14a', cx, 8, cz - 23.5, Math.PI, 14, 3.2);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 9, 10), toon('#ff4fae')); p.position.set(cx + s * 7.5, 4.5, cz - 23.5); scene.add(p); circles.push({ x: cx + s * 7.5, z: cz - 23.5, r: 0.6 }); }
  } else if (t === 'fair2') {
    // ferris wheel
    const fw = new THREE.Group(), R = 15;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.45, 8, 48), toon('#ff4fae')); fw.add(rim);
    const rim2 = rim.clone(); rim2.position.z = 2.2; fw.add(rim2);
    const cabins = [];
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2; const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, R, 6), toon('#ffffff')); sp.position.set(Math.cos(a) * R / 2, Math.sin(a) * R / 2, 1.1); sp.rotation.z = a - Math.PI / 2; fw.add(sp);
      const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), toon(['#ffd23f', '#3fb6ff', '#b45cff', '#34c759'][k % 4])); cab.position.set(Math.cos(a) * R, Math.sin(a) * R - 1.4, 1.1); fw.add(cab); cabins.push(cab);
    }
    fw.position.set(cx, R + 3, cz); scene.add(fw);
    for (const s of [-1, 1]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.8, R + 5, 0.8), toon('#ffffff')); leg.position.set(cx + s * 4, (R + 3) / 2, cz - 1); leg.rotation.z = s * 0.25; scene.add(leg); const leg2 = leg.clone(); leg2.position.z = cz + 3.2; scene.add(leg2); }
    circles.push({ x: cx, z: cz + 1, r: 6 });
    window.__wheel = { fw, cabins };
  }
}
// mountains (north)
for (const [x, z, r, h] of [[-70, -178, 34, 52], [-25, -188, 26, 40], [40, -182, 30, 46], [95, -165, 22, 30]]) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 9), toon('#7aa86a')); m.position.set(x, h / 2 - 1, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); camBlock.push(m);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.38, h * 0.38, 9), toon('#ffffff')); cap.position.set(x, h - h * 0.19 - 0.9, z); scene.add(cap);
  circles.push({ x, z, r: r * 0.85 });
}
// lighthouse + beach
{ const lx = 120, lz = 200;
  for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(2.2 - k * 0.25, 2.4 - k * 0.25, 3, 14), toon(k % 2 ? '#ffffff' : '#ff4b4b')); s.position.set(lx, 1.5 + k * 3, lz); s.castShadow = true; scene.add(s); }
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2, 12), toon('#ffe680', { emissive: '#ffd23f', emissiveIntensity: 0.5 })); top.position.set(lx, 16, lz); scene.add(top);
  const hat = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.2, 12), toon('#ff4b4b')); hat.position.set(lx, 18.1, lz); scene.add(hat);
  circles.push({ x: lx, z: lz, r: 2.6 }); LAND.beach = { x: 0, z: 200, name: 'الشاطئ والميناء' };
  const umb = [], poles = [], beds = [];
  for (let k = 0; k < 16; k++) { const x = -100 + k * 13 + sr(-3, 3), z = 190 + sr(-6, 14); if (Math.hypot(x, z) > landR(x, z) - 4) continue; umb.push([x, 3.2, z, 0, sr(0, 3), 0]); poles.push([x, 1.6, z]); beds.push([x + 2.5, 0.35, z + 1.5, 0, sr(-0.4, 0.4), 0]); }
  inst(new THREE.ConeGeometry(2.6, 1.2, 10), toon('#ff7ab8'), umb); inst(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 5), toon('#ffffff'), poles); inst(new THREE.BoxGeometry(1, 0.3, 2.4), toon('#ffd23f'), beds);
  for (let k = 0; k < 26; k++) { const a = sr(0.9, 2.3), r = Rg(a) + sr(2, 12); palmSpots.push([Math.cos(a) * r, Math.sin(a) * r]); }
  const boat = new THREE.Group(); const hull = new THREE.Mesh(new THREE.BoxGeometry(3, 1.4, 8), toon('#ffffff')); hull.position.y = 0.4; boat.add(hull); const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 3), toon('#3fb6ff')); cab.position.y = 1.8; boat.add(cab); scene.add(boat); window.__boat = boat;
}
// nature outside the grid
for (let k = 0; k < 140; k++) { const a = sr(0, 6.28), r = sr(EXT + 12, 200); const x = Math.cos(a) * r, z = Math.sin(a) * r; if (r > Rg(a) - 6) continue; if (Math.abs(x) < 8 || Math.abs(z) < 8) continue; if (circles.some((c) => Math.hypot(c.x - x, c.z - z) < c.r + 4)) continue; treeSpots.push([x, z]); }
for (let k = 0; k < 18; k++) { const a = sr(-0.7, 0.7) + (k % 2 ? 0 : Math.PI), r = sr(EXT + 16, 190); if (r > Rg(a) - 6) continue; palmSpots.push([Math.cos(a) * r, Math.sin(a) * r]); }
// instanced nature & props
{
  const tc = ['#3fae4a', '#55c25a', '#2f9a48', '#ff9fd0'];
  const tr = [], cr = [[], [], [], []];
  treeSpots.forEach(([x, z], n) => { const s = sr(0.85, 1.3); tr.push([x, 1.3 * s, z, 0, 0, 0, s]); cr[n % 11 === 0 ? 3 : n % 3].push([x, 3.6 * s, z, 0, sr(0, 3), 0, s * sr(1, 1.2)]); circles.push({ x, z, r: 0.5 }); });
  simpleTrees.push(inst(new THREE.CylinderGeometry(0.25, 0.35, 2.6, 7), toon('#9b6a3f'), tr));
  cr.forEach((l, n) => l.length && simpleTrees.push(inst(new THREE.IcosahedronGeometry(1.9, 1), toon(tc[n]), l)));
  const pt = [], pl = [];
  palmSpots.forEach(([x, z]) => { const lean = sr(-0.18, 0.18); pt.push([x, 3, z, lean, 0, lean]); for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; pl.push([x + Math.cos(a) * 1.6 + lean * 6, 6.2, z + Math.sin(a) * 1.6 - lean * 6, 0, -a, -0.5, 1]); } circles.push({ x, z, r: 0.5 }); });
  inst(new THREE.CylinderGeometry(0.22, 0.35, 6, 7), toon('#b07a45'), pt);
  inst(new THREE.BoxGeometry(3.6, 0.15, 1.1), toon('#3fbf4a'), pl);
  simpleRoads.push(inst(new THREE.CylinderGeometry(0.1, 0.14, 5.5, 6), toon('#5a4cb8'), lampSpots.map(([x, z]) => [x, 2.9, z])));
  simpleRoads.push(inst(new THREE.SphereGeometry(0.55, 10, 8), toon('#fff3b0', { emissive: '#ffe680', emissiveIntensity: 0.4 }), lampSpots.map(([x, z]) => [x, 5.8, z]), false));
  lampSpots.forEach(([x, z]) => circles.push({ x, z, r: 0.25 }));
  inst(new THREE.BoxGeometry(3, 0.25, 1), toon('#c9844c'), benchSpots.map(([x, z, r]) => [x, 0.75, z, 0, r, 0]));
  simpleTrees.push(inst(new THREE.IcosahedronGeometry(1.1, 1), toon('#4fc25a'), bushSpots.map(([x, z]) => [x, 0.9, z, 0, 0, 0, 1, 0.8, 1])));
  // traffic lights at the inner crossings
  const tlP = [], tlB = [], tlL = [];
  for (const kx of [-60, 0, 60]) for (const kz of [-60, 0, 60]) { const x = kx + RW / 2 + 0.8, z = kz + RW / 2 + 0.8; tlP.push([x, 2.2, z]); tlB.push([x, 4.6, z]); circles.push({ x, z, r: 0.3 }); }
  simpleRoads.push(inst(new THREE.CylinderGeometry(0.12, 0.12, 4.4, 6), toon('#333a4a'), tlP), inst(new THREE.BoxGeometry(0.6, 1.6, 0.6), toon('#333a4a'), tlB)); window.__tlPos = tlB;
  window.__tl = tlB.map(([x, , z]) => { const g = []; ['#ff3b3b', '#ffd23f', '#34c759'].forEach((c, n) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), new THREE.MeshBasicMaterial({ color: c })); m.position.set(x - 0.32, 5.1 - n * 0.5, z); scene.add(m); g.push(m); simpleRoads.push(m); }); return g; });
}



// merge every static decoration that was added straight to the scene into a few big meshes
function bakeStatic() {
  const skip = new Set(simpleRoads), root = new THREE.Group();
  const take = scene.children.filter((o) => o.isMesh && !o.isInstancedMesh && !skip.has(o) && !o.userData.keep && !o.material.transparent && !(o.material.isMeshBasicMaterial));
  for (const o of take) { root.attach(o); }
  scene.add(root); bake(root, [root]);
  root.children.forEach((m) => { m.receiveShadow = true; });
}

// ================= Kenney city kit (CC0, www.kenney.nl) =================
const gltf = new GLTFLoader();
const loadGLB = (u) => new Promise((res, rej) => gltf.load(u, (g) => res(g.scene), undefined, rej));
const texL = new THREE.TextureLoader();
const CMAP = {};
function cmap(v) { if (CMAP[v]) return CMAP[v]; const t = texL.load(`assets/city/cm_${v}.png?v=9`); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.magFilter = THREE.NearestFilter; return (CMAP[v] = t); }
const KMAT = {};
function kmat(v, base) { const k = v; if (KMAT[k]) return KMAT[k]; const m = new THREE.MeshToonMaterial({ map: v === 'roads' ? base.map : cmap(v), gradientMap: grad }); if (v === 'roads') m.map.magFilter = THREE.NearestFilter; return (KMAT[k] = m); }
function prep(root, v) { root.traverse((o) => { if (o.isMesh) { o.material = kmat(v, o.material); o.castShadow = o.receiveShadow = true; } }); return root; }
function place(src, v, x, z, sx, sy, rot, solid) {
  const o = prep(src.clone(), v); o.scale.set(sx, sy, sx); o.position.set(x, 0.12, z); o.rotation.y = rot || 0; scene.add(o);
  if (solid) { o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); solids.push({ x0: b.min.x, x1: b.max.x, z0: b.min.z, z1: b.max.z }); o.traverse((m) => m.isMesh && camBlock.push(m)); }
  return o;
}
function instTiles(src, list, sx, sy, y = 0.005, cast = false) { // list: [x,z,rot]
  const meshes = []; src.updateMatrixWorld(true); src.traverse((o) => o.isMesh && meshes.push(o));
  for (const m of meshes) {
    const im = new THREE.InstancedMesh(m.geometry, kmat('roads', m.material), list.length);
    list.forEach(([x, z, r], n) => { tmpM.compose(tmpP.set(x, y, z), tmpQ.setFromEuler(tmpE.set(0, r, 0)), tmpS.set(sx, sy, sx)); im.setMatrixAt(n, tmpM.multiply(m.matrixWorld)); });
    im.receiveShadow = true; im.castShadow = cast; im.computeBoundingSphere(); scene.add(im);
  }
}
async function loadCity() {
  const B = 'assets/city/bld/', RD = 'assets/city/roads/';
  const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n'];
  const [bld, sky, straight, cross, lamp, tlight, awning] = await Promise.all([
    Promise.all(names.map((n) => loadGLB(B + `building-${n}.glb`))),
    Promise.all(['a', 'b', 'c', 'd', 'e'].map((n) => loadGLB(B + `building-skyscraper-${n}.glb`))),
    loadGLB(RD + 'road-straight.glb'), loadGLB(RD + 'road-crossroad-path.glb'), loadGLB(RD + 'light-square.glb'), loadGLB(RD + 'traffic-light.glb'), loadGLB(B + 'detail-awning-wide.glb'),
  ]);
  // roads: 12 m tiles along every grid line, crossroads at the junctions
  const TS = 12, st = [], cr = [];
  const isG = (v) => G.includes(v);
  for (const k of G) for (let t = -EXT + 2; t <= EXT; t += TS) {
    const tt = Math.round(t / TS) * TS;
    if (isG(tt)) { if (k === G[0] || true) cr.push([k, tt, 0]); continue; }
    st.push([tt, k, 0]); st.push([k, tt, Math.PI / 2]);
  }
  for (const [x, z, r] of [[0, 144, Math.PI / 2], [0, 156, Math.PI / 2], [0, 168, Math.PI / 2], [144, 0, 0], [156, 0, 0], [-144, 0, 0], [-156, 0, 0], [0, -144, Math.PI / 2], [0, -156, Math.PI / 2]]) st.push([x, z, r]);
  const crU = [...new Map(cr.map((c) => [c[0] + ',' + c[1], c])).values()];
  instTiles(straight, st, TS, 1); instTiles(cross, crU, TS, 1);
  simpleRoads.forEach((m) => (m.visible = false));
  // street lamps at block corners, arm pointing over the road
  instTiles(lamp, lampSpots.map(([x, z]) => { const lx = Math.sign(x - BC.reduce((a, c) => (Math.abs(c - x) < Math.abs(a - x) ? c : a))); circles.push({ x, z, r: 0.3 }); return [x, z, -lx * Math.PI / 2]; }), 11, 11, 0.12, true);
  instTiles(tlight, (window.__tlPos || []).map(([x, , z]) => [x, z, Math.PI / 4 * 3]), 10, 10, 0.12, true);
  // buildings
  const VAR = ['pink', 'purple', 'blue', 'yellow', 'mint', 'peach', 'white'];
  for (const L of KLOTS) {
    const v = VAR[L.n % VAR.length];
    if (L.type === 'sky') { const src = sky[L.n % sky.length]; place(src, v, L.x, L.z, 10.5, 10.5 + (L.n % 3) * 1.5, L.rot, true); }
    else if (L.type === 'mid') { const src = bld[8 + (L.n % 6)]; place(src, v, L.x, L.z, 15, 15, L.rot, true); }
    else { const src = bld[L.n % 8]; place(src, v, L.x, L.z, 15, 13, L.rot, true); const a = place(awning, VAR[(L.n + 2) % VAR.length], L.x, L.z + (L.rot ? -1 : 1) * 7.6, 9, 9, L.rot, false); }
  }
}


// ================= Quaternius Stylized Nature (CC0) =================
function instModel(root, list, targetH, cast = true) { // list: [x,y,z,rot,scaleMul]; split into 90 m cells so off-screen cells are culled
  const cells = new Map(); for (const it of list) { const k = Math.floor(it[0] / 100) + ',' + Math.floor(it[2] / 100); if (!cells.has(k)) cells.set(k, []); cells.get(k).push(it); }
  if (cells.size > 1) { for (const l of cells.values()) instModel(root, l, targetH, cast); return; }
  if (!list.length) return;
  root.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(root), h = box.max.y - box.min.y || 1, k = targetH / h;
  const meshes = []; root.traverse((o) => o.isMesh && meshes.push(o));
  for (const m of meshes) {
    const mats = (Array.isArray(m.material) ? m.material : [m.material]).map((mt) => { const n = mt.clone(); n.roughness = 1; n.metalness = 0; if (!n.alphaTest && /leaf|leaves|flower|grass/i.test(mt.name)) n.alphaTest = 0.3; return n; });
    const im = new THREE.InstancedMesh(m.geometry, mats.length > 1 ? mats : mats[0], list.length);
    list.forEach(([x, y, z, r, sm], n) => { tmpM.compose(tmpP.set(x, y, z), tmpQ.setFromEuler(tmpE.set(0, r, 0)), tmpS.setScalar(k * (sm || 1))); im.setMatrixAt(n, tmpM.multiply(m.matrixWorld)); });
    im.castShadow = cast; im.receiveShadow = true; im.computeBoundingSphere(); scene.add(im);
  }
}
const loadGLTF = (u) => new Promise((res, rej) => gltf.load(u, (g) => res(g.scene), undefined, rej));
let NATURE = null;
async function loadNature() {
  if (S.q !== 'high') return;
  const N = 'assets/nature/';
  const NL = await Promise.all(['CommonTree_1', 'CommonTree_3', 'Pine_2', 'Bush_Common_Flowers', 'Flower_3_Group', 'Flower_4_Group', 'Rock_Medium_1'].map((n) => loadGLTF(N + n + '.gltf')));
  const [t1, t3, pine, bush, f3, f4, rock] = NL; NATURE = { t1, t3, pine, bush, f3, f4, rock };
  const city = [], wild = [], pines = [];
  treeSpots.forEach(([x, z], n) => { const inCity = Math.abs(x) < EXT + 4 && Math.abs(z) < EXT + 4; const it = [x, 0.12, z, sr(0, 6.28), sr(0.85, 1.2)]; if (inCity) city.push(it); else if (z < -120) pines.push(it); else wild.push(it); });
  const cityK = city.filter((_, n) => n % 2 === 0); instModel(t1, cityK.filter((_, n) => n % 5 === 0), 6.4); instModel(t3, cityK.filter((_, n) => n % 5 !== 0), 6);
  instModel(t3, wild.filter((_, n) => n % 2 === 0), 9, false); instModel(pine, pines, 11, false);
  instModel(bush, bushSpots.map(([x, z]) => [x, 0.12, z, sr(0, 6.28), 1]), 1.6, false);
  const fl = []; for (const [x, z] of bushSpots) fl.push([x + sr(-1.5, 1.5), 0.12, z + sr(-1.5, 1.5), sr(0, 6.28), 1]);
  for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; fl.push([-30 + Math.cos(a) * 9, 0.12, -30 + Math.sin(a) * 9, a, 1]); }
  instModel(f3, fl.filter((_, n) => n % 2 === 0), 0.7, false); instModel(f4, fl.filter((_, n) => n % 2 === 1), 0.7, false);
  const rk = []; for (let k = 0; k < 40; k++) { const a = sr(0, 6.28), r = Rg(a) + sr(-2, 6); rk.push([Math.cos(a) * r, -0.2, Math.sin(a) * r, sr(0, 6.28), sr(0.6, 1.8)]); }
  instModel(rock, rk, 1.6, false);
  simpleTrees.forEach((m) => (m.visible = false));
  const keep = city.filter((_, n) => n % 2 === 1); if (keep.length) { inst(new THREE.CylinderGeometry(0.25, 0.35, 2.6, 7), toon('#9b6a3f'), keep.map(([x, , z]) => [x, 1.3, z])); inst(new THREE.IcosahedronGeometry(1.9, 1), toon('#55c25a'), keep.map(([x, , z, r]) => [x, 3.6, z, 0, r, 0])); }
}


// ================= mesh baking (fewer draw calls) =================
const VCMAT = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad });
function bake(root, pivots) {
  root.updateMatrixWorld(true);
  const set = new Set(pivots);
  for (const pv of pivots) {
    const meshes = [];
    (function walk(o) { for (const c of o.children) { if (set.has(c)) continue; if (c.isMesh && !c.isInstancedMesh) meshes.push(c); walk(c); } })(pv);
    if (meshes.length < 2) continue;
    const inv = new THREE.Matrix4().copy(pv.matrixWorld).invert(), groups = new Map();
    for (const m of meshes) {
      const mt = m.material;
      const vc = mt.isMeshToonMaterial && !mt.transparent && !mt.map && (!mt.emissive || mt.emissive.getHex() === 0);
      let g = m.geometry.clone(); if (g.index) g = g.toNonIndexed();
      for (const a of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(a)) g.deleteAttribute(a);
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      g.morphAttributes = {}; g.clearGroups();
      g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld));
      if (vc) { const n = g.attributes.position.count, arr = new Float32Array(n * 3), c = mt.color; for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.Float32BufferAttribute(arr, 3)); }
      const key = vc ? 'vc' : mt.uuid; if (!groups.has(key)) groups.set(key, { mat: vc ? VCMAT : mt, geos: [], cast: false });
      const G2 = groups.get(key); G2.geos.push(g); G2.cast = G2.cast || m.castShadow; m.parent.remove(m);
    }
    for (const { mat, geos, cast } of groups.values()) { const merged = geos.length > 1 ? mergeGeometries(geos, false) : geos[0]; if (!merged) continue; const mm = new THREE.Mesh(merged, mat); mm.castShadow = cast; pv.add(mm); }
  }
  return root;
}

bakeStatic();
// ================= characters =================
const AV = initAvatar({ THREE, toon, ctex, bake });
function makeKid(o, scale = 1) { return AV.makeAvatar(AV.defToLook(o), scale); }
function animKid(k, speed, dt, air) {
  const P = k.P; k.phase += dt * (4 + speed * 1.6);
  const amp = air ? 0.6 : clamp(speed / 3.5, 0, 1) * 0.75, s = Math.sin(k.phase);
  P.legs[0].rotation.x = air ? -0.5 : s * amp; P.legs[1].rotation.x = air ? 0.3 : -s * amp;
  P.arms[0].rotation.x = air ? -2.6 : -s * amp * 0.9; P.arms[1].rotation.x = air ? -2.6 : s * amp * 0.9;
  P.arms[0].rotation.z = -0.12; P.arms[1].rotation.z = 0.12;
  P.body.position.y = 0.62 + (air ? 0 : Math.abs(Math.cos(k.phase)) * 0.05 * amp + Math.sin(performance.now() / 500) * 0.006);
  P.body.rotation.x = clamp(speed / 7, 0, 1) * 0.12;
  P.head.rotation.y = speed < 0.2 ? Math.sin(performance.now() / 1800) * 0.25 : 0;
  P.body.rotation.z = 0; if (k.emo) emotePose(k, dt);
}

// ================= cars =================
const CAR_COLORS = { pink: '#ff4fb0', yellow: '#ffc21a', blue: '#2fc4ff', orange: '#ff8a1f' };
const glassM = new THREE.MeshPhongMaterial({ color: '#1d2b44', shininess: 120, specular: '#aaccff' });
const HL_C = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.0, 0.9), toneMapped: false }), HL_N = new THREE.MeshBasicMaterial({ color: '#fffbe0' }), TL_M = new THREE.MeshBasicMaterial({ color: '#ff2a4a' }), SH_M = new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.22, depthWrite: false });
function makeCar(color, sport = true) {
  const conv = sport === 'conv'; if (conv) sport = true;
  const W = 2.05, g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
  const bodyMat = new THREE.MeshPhongMaterial({ color, shininess: 100, specular: '#ffffff' });
  const ext = (pts, depth, mat, bevel) => { const sh = new THREE.Shape(); pts.forEach(([x, y], n) => (n ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath(); const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 4, curveSegments: 6 }); geo.translate(0, 0, -depth / 2); const m = new THREE.Mesh(geo, mat); m.castShadow = true; inner.add(m); return m; };
  // lower body: full width, low and long
  const low = sport ? [[-2.15, 0.36], [-2.25, 0.62], [-2.15, 0.9], [-1.2, 0.96], [1.1, 0.92], [2.0, 0.74], [2.2, 0.52], [2.15, 0.36]] : [[-2.15, 0.4], [-2.2, 1.05], [-1.2, 1.1], [1.2, 1.08], [2.15, 0.95], [2.2, 0.4]];
  ext(low, W - 0.5, bodyMat, 0.25);
  // cabin: narrower glass bubble with a coloured roof
  if (conv) {
    // open-top: windshield, purple seats with hearts, steering wheel, mirrors, plate
    const seatM = toon('#8b4fe0'), heartM = toon('#ff7ab8', { emissive: '#ff4fae', emissiveIntensity: 0.25 });
    const ws = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.62, W - 0.45), new THREE.MeshPhongMaterial({ color: '#bfe6ff', transparent: true, opacity: 0.45, shininess: 120 })); ws.position.set(0.55, 1.22, 0); ws.rotation.z = 0.62; inner.add(ws);
    const fr = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, W - 0.35), bodyMat); fr.position.set(0.37, 1.48, 0); inner.add(fr);
    for (const zz of [-0.45, 0.45]) {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.22, 0.6), seatM); base.position.set(-0.35, 0.98, zz); inner.add(base);
      const back = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.32, 4, 10), seatM); back.position.set(-0.72, 1.32, zz); back.rotation.z = 0.25; back.scale.set(0.55, 1, 1.05); inner.add(back);
      const ht = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), heartM); ht.scale.set(0.4, 0.9, 1.2); ht.position.set(-0.6, 1.45, zz); inner.add(ht);
      const mir = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), bodyMat); mir.scale.set(0.8, 0.7, 1.2); mir.position.set(0.55, 1.05, zz > 0 ? W / 2 + 0.05 : -W / 2 - 0.05); inner.add(mir);
    }
    const sw = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 6, 16), toon('#2a2a35')); sw.position.set(0.1, 1.15, 0.45); sw.rotation.y = Math.PI / 2; sw.rotation.x = 0.4; inner.add(sw);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.3), new THREE.MeshBasicMaterial({ map: signTex('LOLO BOX', '#7a2fe0', '#ffd23f', 512, 200, 80), toneMapped: false })); plate.position.set(2.32, 0.5, 0); plate.rotation.y = Math.PI / 2; inner.add(plate);
    for (const s2 of [-1, 1]) for (const [x, y, sc2] of [[0.6, 0.7, 0.22], [-0.2, 0.62, 0.15], [0.2, 0.55, 0.12]]) { const st2 = new THREE.Mesh(new THREE.OctahedronGeometry(sc2), toon('#ffd23f')); st2.scale.z = 0.25; st2.position.set(x, y, s2 * (W / 2 + 0.06)); inner.add(st2); }
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, W + 0.04), toon('#9b4ff0')); skirt.position.set(0, 0.36, 0); inner.add(skirt);
  } else {
    const cab = sport ? [[-1.45, 0.9], [-0.55, 1.45], [0.45, 1.47], [1.2, 0.9]] : [[-1.7, 1.05], [-1.35, 1.85], [0.95, 1.87], [1.35, 1.05]];
    ext(cab, W - 0.95, glassM, 0.18);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(sport ? 0.85 : 2.1, 0.08, W - 0.85), bodyMat); roof.position.set(sport ? -0.05 : -0.2, (sport ? 1.47 : 1.87) + 0.17, 0); inner.add(roof);
  }
  if (sport) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, W - 0.1), bodyMat); sp.position.set(-2.1, conv ? 1.4 : 1.25, 0); inner.add(sp); for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), bodyMat); st.position.set(-2.05, conv ? 1.15 : 1.07, s * 0.6); st.scale.y = conv ? 1.6 : 1; inner.add(st); } }
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), toon('#ffd23f')); star.scale.y = 0.3; star.position.set(1.45, 0.98, 0); inner.add(star);
  const tire = toon('#24242c'), rim = toon('#e6e8ef'), wg = new THREE.CylinderGeometry(0.44, 0.44, 0.34, 16), rg = new THREE.CylinderGeometry(0.27, 0.27, 0.36, 8);
  wg.rotateX(Math.PI / 2); rg.rotateX(Math.PI / 2);
  g.wheels = [];
  const hub = new THREE.OctahedronGeometry(0.12);
  for (const [x, z] of [[-1.38, W / 2 - 0.12], [-1.38, -W / 2 + 0.12], [1.4, W / 2 - 0.12], [1.4, -W / 2 + 0.12]]) { const w = new THREE.Group(); w.add(new THREE.Mesh(wg, tire), new THREE.Mesh(rg, rim)); if (conv) { const h = new THREE.Mesh(hub, toon('#ffd23f')); h.position.z = z > 0 ? 0.19 : -0.19; h.scale.z = 0.4; w.add(h); } w.position.set(x, 0.44, z); inner.add(w); g.wheels.push(w); }
  for (const s of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), (conv ? HL_C : HL_N)); hl.position.set(2.18, 0.66, s * 0.62); hl.scale.set(0.45, 0.7, 1.2); inner.add(hl);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.5), TL_M); tl.position.set(-2.38, 0.74, s * 0.55); inner.add(tl);
  }
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 2.5), SH_M); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.05; inner.add(shadow);
  inner.rotation.y = -Math.PI / 2; // model faces +x -> game forward is +z
  bake(g, [inner, ...g.wheels]);
  g.bodyMat = bodyMat; g.inner = inner;
  return g;
}

// ================= player =================
const PL = { x: -30, y: 0, z: -8, vy: 0, yaw: Math.PI, spd: 0, ground: true, run: false, mode: 'walk' };
let kid = null;
function buildPlayer() { if (kid) scene.remove(kid); kid = AV.makeAvatar(curLook()); scene.add(kid); setTimeout(applyEquip, 0); { const th = CS && CS.thumb(S.char); $('#ph').style.backgroundImage = th ? `url(${th})` : S.char < 10 ? `url(assets/ui/sel${S.char + 1}.webp?v=vx1)` : ''; } }
const CAR = { x: 4, z: -22, yaw: Math.PI, v: 0, steer: 0, mesh: null };
function buildCar() { if (CAR.mesh) scene.remove(CAR.mesh); CAR.mesh = makeCar(CAR_COLORS[S.car], 'conv'); scene.add(CAR.mesh); syncCar(0); }
function syncCar(dt) { const m = CAR.mesh; m.position.set(CAR.x, 0, CAR.z); m.rotation.y = CAR.yaw; const spin = (CAR.v * dt) / 0.44; m.wheels.forEach((w, n) => { w.children.forEach((c) => (c.rotation.z -= spin)); if (n >= 2) w.rotation.y = CAR.steer * 0.5; }); m.inner.rotation.x = clamp(-CAR.steer * CAR.v * 0.004, -0.06, 0.06); }

// ================= NPCs =================
const NPCS = [];
function npc(def, x, z, yaw, opts = {}) { const k = makeKid(def, opts.scale || 1.15); k.position.set(x, 0.12, z); k.rotation.y = yaw; scene.add(k); const n = Object.assign({ k, x, z, yaw, def }, opts); NPCS.push(n); return n; }
const officer = npc({ kind: 'boy', skin: '#e8b48f', hair: '#3a2416', top: '#2f5fd0', bottom: '#1f3f99', shoe: '#111111', hat: '#1f3f99', cap: '#1f3f99' }, -70, -86, Math.PI / 2, { name: 'الظابط سامح', av: '👮' });
const teacher = npc({ kind: 'girl', skin: '#f3c6a5', hair: '#4a2a1a', top: '#34c759', bottom: '#2a8f45', shoe: '#7a3fe0', bun: true }, 30, 9.5, Math.PI, { name: 'أبلة نور', av: '👩‍🏫' });
// pedestrians walking along sidewalks
const walkers = [];
{ const tops = ['#ff7ab8', '#ffd23f', '#3fb6ff', '#34c759', '#b45cff', '#ff8a1f'], kinds = ['girl', 'boy', 'curly', 'hijab'];
  for (let n = 0; n < (MOBILE ? 8 : 12); n++) {
    const i = n % 4, j = Math.floor(n / 4) % 4, cx = BC[i], cz = BC[j];
    const d = { kind: kinds[n % 4], skin: ['#f6c9a8', '#e0a77e', '#c98b5f', '#f3d2b8'][n % 4], hair: n % 4 === 3 ? tops[(n + 2) % 6] : ['#3a2416', '#6b3a22', '#1d1410'][n % 3], top: tops[n % 6], bottom: '#3f5fb8', shoe: '#ffffff', cap: tops[(n + 3) % 6] };
    const k = makeKid(d, 0.95); scene.add(k);
    const pts = [[cx - BH + 1.2, cz - BH + 1.2], [cx + BH - 1.2, cz - BH + 1.2], [cx + BH - 1.2, cz + BH - 1.2], [cx - BH + 1.2, cz + BH - 1.2]];
    walkers.push({ k, pts, seg: n % 4, t: sr(0, 1), sp: sr(1.1, 1.7) });
  }
}
// traffic: loops around the outer and middle ring roads
const traffic = [];
{ const loops = [[[-120, -120], [120, -120], [120, 120], [-120, 120]], [[-60, -60], [60, -60], [60, 60], [-60, 60]]];
  const cols = ['#ffc21a', '#2fc4ff', '#ff8a1f', '#34c759', '#ffffff', '#b45cff', '#ff4b4b'];
  for (let n = 0; n < (MOBILE ? 6 : 9); n++) { const loop = loops[n % 2]; const m = makeCar(cols[n % cols.length], n % 3 !== 0); scene.add(m); traffic.push({ m, loop, seg: n % 4, t: (n * 0.37) % 1, sp: sr(8, 11), v: 0, x: 0, z: 0, yaw: 0 }); }
}

// ================= Lolo (real 2D art as a floating sprite) =================
const loader = new THREE.TextureLoader();
const lolo = makeLoloMascot({ toon }); lolo.scale.setScalar(2.1); lolo.position.set(-30, 4, -20); scene.add(lolo); // voxel Lolo (LOLO_MASCOT_VOXEL_2026)
const loloGlow = new THREE.Mesh(new THREE.CircleGeometry(1.8, 24), new THREE.MeshBasicMaterial({ color: '#7fd8ff', transparent: true, opacity: 0.35 })); loloGlow.rotation.x = -Math.PI / 2; loloGlow.position.set(-30, 0.15, -20); scene.add(loloGlow);

// ================= collectibles =================
const coinGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.14, 20); coinGeo.rotateX(Math.PI / 2);
const coinMat = toon('#ffd23f', { emissive: '#ffae00', emissiveIntensity: 0.35 });
const COINS = [];
const coinIM = new THREE.InstancedMesh(coinGeo, coinMat, 48); coinIM.castShadow = true; scene.add(coinIM);
seed = 42;
for (let n = 0; n < 48; n++) {
  const horiz = n % 2, k = G[Math.floor(sr(0, 5))], t = sr(-EXT + 4, EXT - 4), off = sr(-3.5, 3.5);
  const x = horiz ? t : k + off, z = horiz ? k + off : t; const id = 'c' + n;
  if (S.got.includes(id)) continue;
  COINS.push({ id, x, z, i: COINS.length });
}
coinIM.count = COINS.length;
const gemGeo = new THREE.OctahedronGeometry(0.7), gemMat = toon('#c86bff', { emissive: '#9b30ff', emissiveIntensity: 0.4 });
const GEMS = [];
for (const [id, x, z] of [['g1', -111, -30], ['g2', 104, 104], ['g3', -140, 150], ['g4', 10, -150], ['g5', 150, -60]]) {
  if (S.gemsGot.includes(id)) continue; const m = new THREE.Mesh(gemGeo, gemMat); m.position.set(x, 1.3, z); m.castShadow = true; scene.add(m); GEMS.push({ id, m });
}
const BALLOONS = [];
function spawnBalloons() {
  BALLOONS.forEach((b) => scene.remove(b.m)); BALLOONS.length = 0;
  [['b1', 60, -96, '#ff4fae'], ['b2', -95, 60, '#ffd23f'], ['b3', 100, 0, '#3fb6ff']].forEach(([id, x, z, c]) => {
    if (S.bal.includes(id)) return; const g = new THREE.Group();
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 12), toon(c, { emissive: c, emissiveIntensity: 0.15 })); s.scale.y = 1.2; s.position.y = 3.2; g.add(s);
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.2, 4), toon('#ffffff')); str.position.y = 1.4; g.add(str);
    g.position.set(x, 0, z); scene.add(g); BALLOONS.push({ id, m: g, x, z });
  });
}

// ================= mission marker =================
const pin = new THREE.Group();
{ const c = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 16), toon('#ffb300', { emissive: '#ff8a00', emissiveIntensity: 0.4 })); c.rotation.x = Math.PI; c.position.y = 0.9; pin.add(c); const s = new THREE.Mesh(new THREE.SphereGeometry(0.95, 16, 12), toon('#ffb300', { emissive: '#ff8a00', emissiveIntensity: 0.4 })); s.position.y = 2.1; pin.add(s); const d = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8), toon('#ffffff')); d.position.set(0, 2.1, 0); d.scale.z = 2.4; pin.add(d); }
const ring = new THREE.Mesh(new THREE.RingGeometry(2.2, 3, 32), new THREE.MeshBasicMaterial({ color: '#ffb300', transparent: true, opacity: 0.7, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2;
scene.add(pin, ring);

// ================= platforms (things you can stand on) =================
const PLATS = []; // {x,z,w,d,top,mesh,move,bounce,lastX,lastZ}
function platform(x, z, w, d, top, color, opt = {}) {
  const th = opt.th || 0.6;
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, th, d), toon(color)); m.position.set(x, top - th / 2, z); m.castShadow = m.receiveShadow = true; scene.add(m);
  const p = Object.assign({ x, z, w, d, top, mesh: m, bx: x, bz: z, by: top, px: x, pz: z }, opt); PLATS.push(p); return p;
}
function groundAt(x, y, z) {
  let gh = onBlock(x, z) ? 0.12 : 0, on = null;
  for (const p of PLATS) { if (Math.abs(x - p.x) < p.w / 2 + 0.25 && Math.abs(z - p.z) < p.d / 2 + 0.25 && p.top <= y + 0.4 && p.top > gh) { gh = p.top; on = p; } }
  return { gh, on };
}
function updPlats(dt, now) {
  for (const p of PLATS) {
    p.px = p.x; p.pz = p.z; const py = p.top;
    if (p.move) { const t = now / 1000 * (p.move.sp || 1); if (p.move.ax === 'x') p.x = p.bx + Math.sin(t) * p.move.amp; else if (p.move.ax === 'z') p.z = p.bz + Math.sin(t) * p.move.amp; else p.top = p.by + (Math.sin(t) * 0.5 + 0.5) * p.move.amp; p.mesh.position.set(p.x, p.top - (p.th || 0.6) / 2, p.z); }
    p.dy = p.top - py;
  }
}

// ================= obby (jump challenge) in the fun fair =================
const OB = { cps: [], start: null, finish: null, active: false, cp: 0, lava: null };
{
  const cx = OBBY_AT.x, cz = OBBY_AT.z, cols = ['#ff4fae', '#ffd23f', '#3fb6ff', '#b45cff', '#34c759', '#ff8a1f'];
  // glowing pink "slime" floor: touching it sends you back to the last checkpoint
  const lavaTex = ctex(128, 128, (g, w, h) => { g.fillStyle = '#ff5fb8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,${180 + Math.random() * 70 | 0},240,.55)`; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 4 + Math.random() * 10, 0, 7); g.fill(); } }, true); lavaTex.repeat.set(6, 6);
  const lava = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ map: lavaTex, toneMapped: false })); lava.rotation.x = -Math.PI / 2; lava.position.set(cx, 0.16, cz); scene.add(lava); OB.lava = lavaTex;
  OB.rect = { x0: cx - 20, x1: cx + 20, z0: cz - 20, z1: cz + 20 };
  // fence posts around the slime
  const posts = []; for (let k = -20; k <= 20; k += 4) { posts.push([cx + k, 0.6, cz - 20.6], [cx + k, 0.6, cz + 20.6], [cx - 20.6, 0.6, cz + k], [cx + 20.6, 0.6, cz + k]); }
  inst(new THREE.CylinderGeometry(0.15, 0.15, 1.2, 6), toon('#ffffff'), posts);
  OB.start = platform(cx - 15, cz - 17, 6, 5, 0.45, '#ffffff', { th: 0.4 });
  const path = [[-15, -11, 1.1], [-15, -5.5, 1.7], [-10, -2.5, 2.3, { move: { ax: 'x', amp: 2, sp: 1.2 } }], [-5, -2, 2.9], [0, -6, 3.5], ['cp', 5, -10, 3.9], [10, -6, 4.5], [14, -1, 5.1, { w: 2.2, d: 2.2 }], [10, 3, 5.7, { move: { ax: 'z', amp: 2.2, sp: 1.4 } }], [5, 6.5, 6.3], [0, 10, 6.9], ['cp', -6, 12, 7.3], [-11, 16, 7.9, { w: 2.2, d: 2.2 }], [-16, 12, 8.5, { move: { ax: 'y', amp: 1.2, sp: 1.6 } }], [-17, 6, 9.6]];
  path.forEach((s, n) => {
    if (s[0] === 'cp') { const p = platform(cx + s[1], cz + s[2], 4.5, 4.5, s[3], '#ffffff'); OB.cps.push(p); const fl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 1.6), toon('#34c759')); fl.position.set(cx + s[1] + 1.6, s[3] + 2.2, cz + s[2]); scene.add(fl); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), toon('#ffffff')); pole.position.set(cx + s[1] + 1.6, s[3] + 1.3, cz + s[2] - 0.8); scene.add(pole); return; }
    const o = s[3] || {}; platform(cx + s[0], cz + s[1], o.w || 3, o.d || 3, s[2], cols[n % cols.length], o);
  });
  OB.finish = platform(cx - 13, cz + 0.5, 5, 5, 10, '#ffd23f');
  const cup = new THREE.Group(); const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.35, 1.2, 16), toon('#ffd23f', { emissive: '#ffae00', emissiveIntensity: 0.5 })); c1.position.y = 1.6; cup.add(c1); const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.3, 12), toon('#b45cff')); c2.position.y = 0.9; cup.add(c2); const c3 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8), toon('#ffd23f')); c3.position.y = 1.0; cup.add(c3);
  cup.position.set(cx - 13, 10, cz + 0.5); scene.add(cup); OB.cup = cup;
  sign('تحدي القفز 🏆', '#ff4fae', '#ffffff', cx - 15, 3.4, cz - 20.2, Math.PI, 8, 2);
  OB.respawn = () => { const p = OB.cp ? OB.cps[OB.cp - 1] : OB.start; PL.x = p.x; PL.z = p.z; PL.y = p.top + 0.05; PL.vy = 0; };
}
function updObby(dt) {
  OB.lava.offset.x += dt * 0.05; OB.lava.offset.y += dt * 0.03; OB.cup.rotation.y += dt * 1.5;
  if (PL.mode !== 'walk') return;
  const r = OB.rect, inside = PL.x > r.x0 && PL.x < r.x1 && PL.z > r.z0 && PL.z < r.z1;
  if (!inside) { if (OB.active && PL.y < 0.5) { OB.active = false; } return; }
  if (!OB.active && PL.ground && OB.on === OB.start) { OB.active = true; OB.cp = 0; toast('🔥 تحدي القفز! متلمسش الأرض البينك'); }
  OB.cps.forEach((p, n) => { if (OB.on === p && OB.cp < n + 1) { OB.cp = n + 1; sfx.coin(); toast(`🚩 نقطة حفظ ${n + 1}`); } });
  if (PL.y < 0.4 && PL.ground && !OB.on) { sfx.bump(); toast('أوبس! 😅 جرّب تاني'); OB.respawn(); }
  if (OB.on === OB.finish && !OB.won) {
    OB.won = true; S.obby = (S.obby || 0) + 1; const first = S.obby === 1; S.coins += first ? 0 : 30; save(); updPills(); sfx.win();
    toast(first ? '🏆 خلّصت تحدي القفز!' : '🏆 برافو! +30🪙');
    if (curMis() && curMis().id === 'obby') completeMission();
    setTimeout(() => { OB.won = false; }, 4000);
  }
}

// ================= ferris wheel ride =================
const RIDE = { on: false, t: 0, cab: null };
let wheelA = 0;
function startRide() {
  const W = window.__wheel; if (!W) return;
  let best = null, by = 1e9; const v = new THREE.Vector3(); W.cabins.forEach((c) => { c.getWorldPosition(v); if (v.y < by) { by = v.y; best = c; } });
  RIDE.on = true; RIDE.t = 0; RIDE.cab = best; kid.visible = true; toast('🎡 استمتع بالمنظر!'); sfx.win();
}
function updRide(dt) {
  RIDE.t += dt; const v = new THREE.Vector3(); RIDE.cab.getWorldPosition(v);
  PL.x = v.x; PL.y = v.y - 1.0; PL.z = v.z + 0.2; kid.position.set(PL.x, PL.y, PL.z); kid.rotation.y = Math.PI; animKid(kid, 0, dt, false);
  if (RIDE.t > 14) { RIDE.on = false; PL.x = 90; PL.y = 0.12; PL.z = 82; S.rides = (S.rides || 0) + 1; save(); toast('🎡 كانت لفة حلوة!'); if (curMis() && curMis().id === 'fair') completeMission(); }
}

// ================= houses =================
const WALLC = ['#ffffff', '#ffd1e8', '#e2d4ff', '#cfeeff', '#fff2b8', '#d6ffd9'], ROOFC = ['#e2603a', '#ff4fae', '#8b4fe0', '#3a7bff', '#34c759', '#ffb300'];
const ITEMS = [
  { id: 'flowers', name: 'ورد', icon: '🌷', cost: 50 }, { id: 'pool', name: 'حمام سباحة', icon: '🏊', cost: 300 }, { id: 'tramp', name: 'ترامبولين', icon: '🤸', cost: 200 },
  { id: 'swing', name: 'مرجيحة', icon: '🎠', cost: 150 }, { id: 'dog', name: 'بيت كلب', icon: '🐶', cost: 120 },
];
const saleSigns = [];
function houseSign(h) {
  if (h.sign) { scene.remove(h.sign); }
  const mine = S.house && S.house.id === h.id;
  const txt = mine ? `بيت ${myName()}` : `للبيع ${h.price}🪙`;
  const g = new THREE.Group(); const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 6), toon('#ffffff')); post.position.y = 0.9; g.add(post);
  const board = plane(signTex(txt, mine ? '#b45cff' : '#ff4fae', '#ffffff', 512, 160, 72), 2.6, 0.8); board.position.y = 1.9; g.add(board);
  const back = board.clone(); back.rotation.y = Math.PI; g.add(back);
  g.position.set(h.x + 3.2, 0.12, h.z + h.dir * 7.4); g.rotation.y = h.dir > 0 ? 0 : Math.PI; scene.add(g); h.sign = g;
}
function yardPos(h, k) { return [h.x - 6 + k * 3.2, h.z - h.dir * 8]; }
function buildItem(h, id) {
  if (h.items[id]) return; const g = new THREE.Group(); const idx = ITEMS.findIndex((i) => i.id === id); const [x, z] = yardPos(h, idx);
  if (id === 'flowers') { for (let k = 0; k < 7; k++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), toon(['#ff4fae', '#ffd23f', '#b45cff', '#ff8a1f'][k % 4])); f.position.set(Math.cos(k) * 0.8, 0.5, Math.sin(k * 1.7) * 0.8); g.add(f); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 4), toon('#34c759')); st.position.set(f.position.x, 0.25, f.position.z); g.add(st); } }
  if (id === 'pool') { const rim = new THREE.Mesh(new THREE.BoxGeometry(3, 0.35, 2.4), toon('#ffffff')); rim.position.y = 0.18; g.add(rim); const w = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.06, 2), new THREE.MeshPhongMaterial({ color: '#3fc6ff', shininess: 100 })); w.position.y = 0.37; g.add(w); }
  if (id === 'tramp') { const base = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.12, 20), toon('#2a2a35')); base.position.y = 0.7; g.add(base); const ringM = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.12, 6, 24), toon('#3fb6ff')); ringM.rotation.x = Math.PI / 2; ringM.position.y = 0.72; g.add(ringM); for (let k = 0; k < 4; k++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 4), toon('#888')); l.position.set(Math.cos(k * 1.57) * 1.1, 0.35, Math.sin(k * 1.57) * 1.1); g.add(l); } platform(x, z, 2.4, 2.4, 0.78, '#2a2a35', { th: 0.05, bounce: true }).mesh.visible = false; }
  if (id === 'swing') { for (const s of [-1, 1]) { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), toon('#ff8a1f')); a.position.set(s * 1.1, 1.25, 0); g.add(a); } const top = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 6), toon('#ff8a1f')); top.rotation.z = Math.PI / 2; top.position.y = 2.5; g.add(top); const seat = new THREE.Group(); const sb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.35), toon('#ff4fae')); sb.position.y = -1.6; seat.add(sb); for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 4), toon('#ddd')); r.position.set(s * 0.3, -0.8, 0); seat.add(r); } seat.position.y = 2.5; g.add(seat); h.swingSeat = seat; }
  if (id === 'dog') { const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.2), toon('#c9844c')); b.position.y = 0.45; g.add(b); const r = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.7, 4), toon('#e2603a')); r.position.y = 1.25; r.rotation.y = Math.PI / 4; g.add(r); const hole = new THREE.Mesh(new THREE.CircleGeometry(0.3, 12), toon('#3a2416')); hole.position.set(0, 0.4, h.dir > 0 ? -0.61 : 0.61); hole.rotation.y = h.dir > 0 ? Math.PI : 0; g.add(hole); }
  g.position.set(x, 0.12, z); g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(g); h.items[id] = g;
}
function applyHouse() {
  const H = S.house; HOUSES.forEach((h) => houseSign(h));
  if (!H) return; const h = HOUSES[H.id];
  h.wall.material.color.set(WALLC[H.wall || 0]); h.roof.material.color.set(ROOFC[H.roof || 0]);
  (H.items || []).forEach((id) => buildItem(h, id));
}
function myHouse() { return S.house ? HOUSES[S.house.id] : null; }
function renderHousePanel(h) {
  const mine = S.house && S.house.id === h.id, el = $('#hpBody'); $('#hpTitle').textContent = mine ? '🏠 بيتي' : '🏡 بيت للبيع';
  if (!mine) {
    const other = S.house ? 'عندك بيت بالفعل 🏠 — البيت ده لو اشتريته هتنقل له.' : '';
    el.innerHTML = `<div class="hcard"><div class="hbig">🏡</div><div><b>بيت ${['الورد', 'السما', 'البنفسج', 'الشمس'][h.id]}</b><br>جنينة واسعة ومكان للألعاب<br><span class="price">${h.price} 🪙</span></div></div><div class="center" style="color:#8a62c9;font-weight:800;margin:6px 0">${other}</div><div class="center"><button class="big3d g" id="hpBuy">اشتري البيت</button></div>`;
    $('#hpBuy').onclick = () => {
      if (S.coins < h.price) { toast(`محتاج ${h.price - S.coins} 🪙 كمان — لِم عملات وخلّص مهام`); return; }
      S.coins -= h.price; const old = myHouse(); if (old) { Object.values(old.items).forEach((g) => scene.remove(g)); old.items = {}; }
      S.house = { id: h.id, wall: 0, roof: 0, items: [] }; save(); updPills(); applyHouse(); sfx.win(); toast('🏠 مبروك! البيت بقى بتاعك');
      if (curMis() && curMis().id === 'house') completeMission(); renderHousePanel(h);
    };
    return;
  }
  const H = S.house;
  el.innerHTML = `<div class="hsec">🎨 لون الحيطان</div><div class="sw">${WALLC.map((c, n) => `<button style="background:${c}" class="${H.wall === n ? 'on' : ''}" data-hw="${n}"></button>`).join('')}</div>
  <div class="hsec">🏠 لون السقف</div><div class="sw">${ROOFC.map((c, n) => `<button style="background:${c}" class="${H.roof === n ? 'on' : ''}" data-hr="${n}"></button>`).join('')}</div>
  <div class="hsec">🌳 حاجات للجنينة</div><div class="hitems">${ITEMS.map((it) => `<button class="hit ${H.items.includes(it.id) ? 'own' : ''}" data-hi="${it.id}"><span>${it.icon}</span>${it.name}<small>${H.items.includes(it.id) ? '✓ عندك' : it.cost + ' 🪙'}</small></button>`).join('')}</div>`;
  const decorDone = () => { if (curMis() && curMis().id === 'decor') completeMission(); };
  $$('[data-hw]').forEach((b) => (b.onclick = () => { H.wall = +b.dataset.hw; save(); applyHouse(); sfx.click(); renderHousePanel(h); decorDone(); }));
  $$('[data-hr]').forEach((b) => (b.onclick = () => { H.roof = +b.dataset.hr; save(); applyHouse(); sfx.click(); renderHousePanel(h); decorDone(); }));
  $$('[data-hi]').forEach((b) => (b.onclick = () => { const it = ITEMS.find((i) => i.id === b.dataset.hi); if (H.items.includes(it.id)) return; if (S.coins < it.cost) { toast(`محتاج ${it.cost - S.coins} 🪙 كمان`); return; } S.coins -= it.cost; H.items.push(it.id); save(); updPills(); buildItem(h, it.id); sfx.win(); renderHousePanel(h); decorDone(); }));
}
function openHouse(h) { renderHousePanel(h); $('#hpTitle').textContent = S.house && S.house.id === h.id ? '🏠 بيتي' : '🏡 بيت للبيع'; openPanel('houseP'); }
function goHome() { const h = myHouse(); if (!h) { toast('لسه معندكش بيت — روح الحي السكني 🏡'); return; } if (PL.mode === 'drive') exitCar(); if (PL.mode === 'drive') return; if (WORLD !== 'city') { closePanel(); teleport('city', h.x + 2, h.z + h.dir * 9, h.dir > 0 ? Math.PI : 0, 'رجوع للبيت…'); return; } PL.x = h.x + 2; PL.z = h.z + h.dir * 9; PL.y = 0.12; PL.yaw = h.dir > 0 ? Math.PI : 0; camYaw = PL.yaw; updCam(0, true); closePanel(); toast('🏠 أهلاً بيك في بيتك'); }

// ================= beach shells =================
const SHELLS = [];
function spawnShells() {
  SHELLS.forEach((s) => scene.remove(s.m)); SHELLS.length = 0;
  [['s1', -70, 190], ['s2', -30, 205], ['s3', 10, 214], ['s4', 50, 205], ['s5', 85, 192]].forEach(([id, x, z]) => {
    if (S.shells.includes(id)) return; const lr = landR(x, z), d = Math.hypot(x, z); if (d > lr - 1) { x *= (lr - 2) / d; z *= (lr - 2) / d; }
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#ffb3d9', { emissive: '#ff7ab8', emissiveIntensity: 0.3 })); m.scale.set(1.2, 0.6, 1); m.position.set(x, 0.05, z); scene.add(m); SHELLS.push({ id, m, x, z });
  });
}

// ================= missions =================
const MIS = [
  { id: 'meet', name: 'تعرّف على لولو', desc: () => 'روح للنافورة في وسط المدينة وكلّم لولو', at: () => ({ x: -30, z: -20 }), reward: { coins: 100 } },
  { id: 'car', name: 'اركب العربية البينك', desc: () => 'العربية مستنياك في الشارع جنب النافورة', at: () => ({ x: CAR.x, z: CAR.z }), reward: { coins: 50 } },
  { id: 'mall', name: 'زيارة مول لولو', desc: () => 'سوق لحد مول لولو البنفسجي', at: () => LAND.mall, reward: { coins: 100 } },
  { id: 'police', name: 'مساعدة الشرطة', desc: () => 'كلّم الظابط سامح قدام قسم الشرطة', at: () => ({ x: officer.x, z: officer.z }), reward: { coins: 50 } },
  { id: 'balloons', name: 'رجّع البلالين الطايرة', desc: () => `لِم البلالين اللي طارت في المدينة (${S.bal.length}/3)`, at: () => { const b = BALLOONS[0]; return b ? { x: b.x, z: b.z } : null; }, reward: { coins: 150, gems: 5 }, prog: () => S.bal.length / 3 },
  { id: 'school', name: 'زيارة المدرسة', desc: () => 'روح المدرسة وكلّم أبلة نور', at: () => ({ x: teacher.x, z: teacher.z }), reward: { coins: 100 } },
  { id: 'fair', name: 'العجلة الدوارة', desc: () => 'روح مدينة الملاهي واركب العجلة الدوارة 🎡', at: () => ({ x: 90, z: 83 }), reward: { coins: 100 } },
  { id: 'obby', name: 'تحدي القفز', desc: () => 'نط من مكان لمكان لحد الكاس الدهبي 🏆 — متلمسش الأرض البينك', at: () => ({ x: OB.start.x, z: OB.start.z }), reward: { coins: 200, gems: 10 } },
  { id: 'house', name: 'شراء أول بيت', desc: () => `روح الحي السكني واشتري بيت (أرخص بيت ${HOUSES[0] ? HOUSES[0].price : 400}🪙)`, at: () => { const h = HOUSES.reduce((a, b) => (Math.hypot(b.x - PL.x, b.z - PL.z) < Math.hypot(a.x - PL.x, a.z - PL.z) ? b : a)); return { x: h.x + 3.2, z: h.z + h.dir * 7.4 }; }, reward: { coins: 50, gems: 5 } },
  { id: 'decor', name: 'زيّن بيتك', desc: () => 'غيّر لون البيت أو اشتري لعبة للجنينة 🌷', at: () => { const h = myHouse(); return h ? { x: h.x + 3.2, z: h.z + h.dir * 7.4 } : null; }, reward: { coins: 100 } },
  { id: 'beach', name: 'صدف الشاطئ', desc: () => `روح الشاطئ ولِم الصدف البينك (${S.shells.length}/5)`, at: () => { const s2 = SHELLS[0]; return s2 ? { x: s2.x, z: s2.z } : null; }, reward: { coins: 150, gems: 5 }, prog: () => S.shells.length / 5 },
  { id: 'more', name: 'المزرعة والقلعة ومركز الفضاء', soon: true },
];
const curMis = () => MIS[S.mi] && !MIS[S.mi].soon ? MIS[S.mi] : null;
function completeMission() {
  const m = curMis(); if (!m) return;
  S.coins += m.reward.coins || 0; S.gems += m.reward.gems || 0; S.mi++; save(); updPills(); sfx.win();
  toast(`✅ ${m.name}  +${m.reward.coins}🪙${m.reward.gems ? ' +' + m.reward.gems + '💎' : ''}`);
  if (MIS[S.mi] && MIS[S.mi].id === 'balloons') spawnBalloons();
  if (MIS[S.mi] && MIS[S.mi].id === 'beach') spawnShells();
  setTimeout(updGoal, 50);
  if (!curMis()) setTimeout(() => showDialog([{ nm: 'لولو', av: 'fish', tx: gx('برافو يا بطلة! 🎉 خلّصتي كل المهام المتاحة دلوقتي. لفّي في المدينة ولِمّي العملات والجواهر المستخبية، والمهام الجديدة جاية قريب!', 'برافو يا بطل! 🎉 خلّصت كل المهام المتاحة دلوقتي. لف في المدينة ولِم العملات والجواهر المستخبية، والمهام الجديدة جاية قريب!') }]), 1500);
}
function updGoal() {
  const m = curMis(), el = $('#goal');
  if (WORLD === 'park' && PARK) { el.innerHTML = PARK.goal(); return; }
  if (WORLD === 'mall' && MALL) { el.innerHTML = MALL.goal(); return; }
  if (WORLD === 'home') { el.innerHTML = HOME && HOME.editable ? '🏠 بيتي من جوه<small>قرّب من أي حاجة وغيّرها، أو افتح 🎨 ديكور البيت</small>' : '🏡 بيت للبيع<small>اشتري البيت عشان تغيّر الديكور</small>'; return; }
  if (!m) { el.innerHTML = '⭐ استكشف المدينة<small>لِم العملات 🪙 والجواهر 💎 المستخبية</small>'; return; }
  el.innerHTML = `⭐ ${m.name}<small>${m.desc()}</small>` + (m.prog ? `<div class="bar"><i style="width:${m.prog() * 100}%"></i></div>` : '');
}
function renderMissions() {
  $('#mlist').innerHTML = MIS.map((m, n) => { const st = n < S.mi ? 'done' : n === S.mi && !m.soon ? 'cur' : 'lock'; return `<div class="mi ${st}"><div class="st">${st === 'done' ? '✓' : st === 'cur' ? '!' : '🔒'}</div><div>${m.name}<small>${m.soon ? 'قريبًا' : st === 'done' ? 'خلصت' : st === 'cur' ? m.desc() : 'هتتفتح بعد المهمة اللي قبلها'}</small></div>${m.reward ? `<div class="rw">+${m.reward.coins} 🪙${m.reward.gems ? ' +' + m.reward.gems + ' 💎' : ''}</div>` : ''}</div>`; }).join('');
}

// ================= dialog =================
let dlgQ = null, dlgDone = null;
function showDialog(lines, done) { dlgQ = lines.slice(); dlgDone = done; nextLine(); $('#dlg').classList.add('on'); state.talk = true; }
function nextLine() {
  if (!dlgQ.length) { $('#dlg').classList.remove('on'); state.talk = false; const d = dlgDone; dlgDone = null; d && d(); return; }
  const l = dlgQ.shift(); $('#dlgNm').textContent = l.nm; $('#dlgTx').textContent = l.tx;
  const av = $('#dlgAv'); if (l.av === 'fish') { av.style.backgroundImage = 'url(assets/ui/fish.webp?v=vx1)'; av.textContent = ''; } else { av.style.backgroundImage = 'none'; av.textContent = l.av; av.style.display = 'grid'; av.style.placeItems = 'center'; av.style.fontSize = '54px'; }
  sfx.pop();
}

// ================= interactions =================
function interactables() {
  if (ACT) return [{ x: PL.x, z: PL.z, r: 99, label: '🚪 انزل', act: endAct }];
  if (WORLD === 'park') return PL.mode === 'walk' ? PARK.interactables() : [];
  if (WORLD === 'home') return PL.mode === 'walk' && HOME ? HOME.interactables() : [];
  if (WORLD === 'mall') return PL.mode === 'walk' && MALL ? MALL.interactables() : [];
  const L = [];
  if (PL.mode === 'walk') L.push({ x: 90, z: 4, r: 5, label: '🎡 ادخل مدينة الملاهي الكبيرة', act: goPark });
  if (PL.mode === 'walk') {
    L.push({ x: lolo.position.x, z: lolo.position.z, r: 4, label: '💬 كلّم لولو', act: talkLolo });
    L.push({ x: officer.x, z: officer.z, r: 3.5, label: '💬 كلّم الظابط', act: talkOfficer });
    L.push({ x: teacher.x, z: teacher.z, r: 3.5, label: '💬 كلّم أبلة نور', act: talkTeacher });
    L.push({ x: LAND.mall.x - 4, z: LAND.mall.z, r: 4.5, label: '🛍️ ادخل المول', act: goMall });
    if (!RIDE.on) L.push({ x: 90, z: 83, r: 5, label: '🎡 اركب العجلة', act: startRide });
    for (const h of HOUSES) { const mine = S.house && S.house.id === h.id; L.push({ x: h.x + 3.2, z: h.z + h.dir * 7.4, r: 3.5, label: mine ? '🏠 زيّن بيتي' : '🏡 شوف البيت', act: () => openHouse(h) }); L.push({ x: h.x, z: h.z + h.dir * 5.6, r: 2.2, label: mine ? '🚪 ادخل بيتي' : '🚪 اتفرج على البيت من جوه', act: () => enterHouse(h) }); }
  }
  return L;
}
function talkLolo() {
  if (curMis() && curMis().id === 'meet') return showDialog([
    { nm: 'لولو', av: 'fish', tx: gx(`أهلاً بيكي يا ${myName()} في مدينة لولو! 💙 أنا لولو، صاحبتك في المغامرة دي.`, `أهلاً بيك يا ${myName()} في مدينة لولو! 💙 أنا لولو، صاحبك في المغامرة دي.`) },
    { nm: 'لولو', av: 'fish', tx: 'المدينة مليانة أماكن حلوة: مول لولو، المدرسة، مدينة الملاهي، والشاطئ.' },
    { nm: 'لولو', av: 'fish', tx: gx('شايفة العربية البينك اللي في الشارع؟ دي بتاعتك! اركبيها ويلا نبدأ 🚗✨', 'شايف العربية البينك اللي في الشارع؟ دي بتاعتك! اركبها ويلا نبدأ 🚗✨') },
  ], completeMission);
  showDialog([{ nm: 'لولو', av: 'fish', tx: ['المدينة كلها مستنياك! 🌟', 'جرّب تنط على النافورة 😄', 'في جواهر بنفسجي مستخبية ورا المباني… دوّر عليها! 💎', 'لو تعبت من المشي، اركب العربية 🚗'][Math.floor(Math.random() * 4)] }]);
}
function talkOfficer() {
  const m = curMis();
  if (m && m.id === 'police') return showDialog([
    { nm: officer.name, av: officer.av, tx: gx('أهلاً يا بطلة! 👋 كويس إنك جيتي.', 'أهلاً يا بطل! 👋 كويس إنك جيت.') },
    { nm: officer.name, av: officer.av, tx: 'في 3 بلالين طاروا من الأطفال وراحوا في شوارع المدينة. 🎈' },
    { nm: officer.name, av: officer.av, tx: gx('ممكن تساعديني ترجّعيهم؟ هتلاقيهم على الخريطة!', 'ممكن تساعدني ترجّعهم؟ هتلاقيهم على الخريطة!') },
  ], completeMission);
  showDialog([{ nm: officer.name, av: officer.av, tx: m && m.id === 'balloons' ? 'لسه في بلالين في الشوارع، شوف الخريطة 🎈' : 'المدينة في أمان، شكرًا على مساعدتك! 🚓' }]);
}
function talkTeacher() {
  const m = curMis();
  if (m && m.id === 'school') return showDialog([
    { nm: teacher.name, av: teacher.av, tx: gx('أهلاً بيكي في مدرسة لولو! 📚', 'أهلاً بيك في مدرسة لولو! 📚') },
    { nm: teacher.name, av: teacher.av, tx: 'هنا بنتعلم ونلعب كل يوم: حروف وأرقام ورسم وألعاب حلوة كتير.' },
    { nm: teacher.name, av: teacher.av, tx: 'الفصول هتفتح قريب، استنّانا! 🍎' },
  ], completeMission);
  showDialog([{ nm: teacher.name, av: teacher.av, tx: 'المدرسة هتفتح فصولها قريب! 📖' }]);
}
function enterCar() { if (!S.drove) { S.drove = true; save(); } PL.mode = 'drive'; kid.visible = false; $('#ctl').classList.add('drive'); $('#pedals').classList.add('on'); $('#speed').classList.add('on'); sfx.door(); if (curMis() && curMis().id === 'car') completeMission(); camYaw = CAR.yaw; }
function exitCar() {
  if (Math.abs(CAR.v) > 3) { toast('هدّي السرعة الأول ✋'); return; }
  PL.mode = 'walk'; CAR.v = 0; kid.visible = true; const rx = Math.cos(CAR.yaw), rz = -Math.sin(CAR.yaw);
  PL.x = CAR.x + rx * 2.2; PL.z = CAR.z + rz * 2.2; PL.y = 0; PL.yaw = CAR.yaw; collide(PL, 0.4); $('#ctl').classList.remove('drive'); $('#pedals').classList.remove('on'); $('#speed').classList.remove('on'); sfx.door();
}

// ================= input =================
const J = { x: 0, y: 0 }, K = {}, PED = { gas: 0, brake: 0 };
let camYaw = Math.PI, camPitch = 0.32, camDrag = null, lastDrag = 0;
addEventListener('keydown', (e) => {
  K[e.code] = 1; if (!state.play) return;
  if (state.talk && (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE')) return nextLine();
  if (e.code === 'Space' && PL.mode === 'walk') jump();
  if (e.code === 'KeyE') doAct(); if (e.code === 'KeyF') carBtn(); if (e.code === 'KeyM') openPanel('bigmap'); if (e.code === 'Escape') openPanel('pause');
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') PL.run = true;
});
addEventListener('keyup', (e) => { K[e.code] = 0; if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') PL.run = runToggle; });
let runToggle = false;
{ const joy = $('#joy'), knob = $('#knob'); let pid = null;
  const set = (e) => { const r = joy.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width * 0.36; let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; } J.x = dx / R; J.y = -dy / R; knob.style.transform = `translate(${dx}px,${dy}px)`; };
  joy.addEventListener('pointerdown', (e) => { e.preventDefault(); pid = e.pointerId; try { joy.setPointerCapture(pid); } catch (x) {} set(e); audioStart(); });
  joy.addEventListener('pointermove', (e) => { if (e.pointerId === pid) set(e); });
  const up = (e) => { if (e.pointerId !== pid) return; pid = null; J.x = J.y = 0; knob.style.transform = ''; };
  joy.addEventListener('pointerup', up); joy.addEventListener('pointercancel', up); joy.addEventListener('lostpointercapture', up);
}
function hold(el, on, off) { const ids = new Set(); el.addEventListener('pointerdown', (e) => { e.preventDefault(); ids.add(e.pointerId); el.classList.add('dn'); try { el.setPointerCapture(e.pointerId); } catch (x) {} audioStart(); on(); }); const u = (e) => { ids.delete(e.pointerId); if (!ids.size) { el.classList.remove('dn'); off && off(); } }; el.addEventListener('pointerup', u); el.addEventListener('pointercancel', u); el.addEventListener('lostpointercapture', u); }
hold($('#bJump'), () => jump());
hold($('#bRun'), () => { runToggle = !runToggle; PL.run = runToggle; $('#bRun').classList.toggle('on', runToggle); });
hold($('#pGas'), () => (PED.gas = 1), () => (PED.gas = 0));
hold($('#pBrake'), () => (PED.brake = 1), () => (PED.brake = 0));
$('#bCar').addEventListener('click', () => carBtn());
$('#bAct').addEventListener('click', () => doAct());
canvas.addEventListener('pointerdown', (e) => { if (!state.play) return; camDrag = { id: e.pointerId, x: e.clientX, y: e.clientY }; try { canvas.setPointerCapture(e.pointerId); } catch (x) {} });
canvas.addEventListener('pointermove', (e) => { if (!camDrag || e.pointerId !== camDrag.id) return; camYaw -= (e.clientX - camDrag.x) * 0.006; camPitch = clamp(camPitch + (e.clientY - camDrag.y) * 0.004, 0.06, 1.1); camDrag.x = e.clientX; camDrag.y = e.clientY; lastDrag = performance.now(); });
const endDrag = (e) => { if (camDrag && e.pointerId === camDrag.id) camDrag = null; };
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
function jump() { if (PL.mode !== 'walk' || !PL.ground || state.talk || RIDE.on) return; PL.vy = 8.2; PL.ground = false; sfx.jump(); }
let curAct = null;
function doAct() { if (state.talk) return nextLine(); if (curAct) curAct.act(); }
function carBtn() { if (state.talk) return; if (PL.mode === 'drive') exitCar(); else if (Math.hypot(PL.x - CAR.x, PL.z - CAR.z) < 4.2) enterCar(); }

// ================= physics =================
function collide(o, r) {
  let hit = false;
  for (const b of solids) {
    if (b.ymax !== undefined && (o.y || 0) > b.ymax) continue;
    if (o.x + r < b.x0 || o.x - r > b.x1 || o.z + r < b.z0 || o.z - r > b.z1) continue;
    const pl = o.x + r - b.x0, pr = b.x1 - (o.x - r), pu = o.z + r - b.z0, pd = b.z1 - (o.z - r), m = Math.min(pl, pr, pu, pd);
    if (m === pl) o.x -= pl; else if (m === pr) o.x += pr; else if (m === pu) o.z -= pu; else o.z += pd; hit = true;
  }
  for (const c of circles) { const dx = o.x - c.x, dz = o.z - c.z, d = Math.hypot(dx, dz), m = r + c.r; if (d < m && d > 0.001) { o.x += (dx / d) * (m - d); o.z += (dz / d) * (m - d); hit = true; } }
  if (WORLD === 'home' && HOME) { const bx = HOME.HX - 0.45, bz = HOME.HZ - 0.45; if (o.x < HOME_OFF - bx) { o.x = HOME_OFF - bx; hit = true; } if (o.x > HOME_OFF + bx) { o.x = HOME_OFF + bx; hit = true; } if (o.z < -bz) { o.z = -bz; hit = true; } if (o.z > bz) { o.z = bz; hit = true; } return hit; }
  if (WORLD === 'mall' && MALL) { const B = MALL.B; if (o.x < MALL_OFF - B) { o.x = MALL_OFF - B; hit = true; } if (o.x > MALL_OFF + B) { o.x = MALL_OFF + B; hit = true; } if (o.z < -B) { o.z = -B; hit = true; } if (o.z > B) { o.z = B; hit = true; } return hit; }
  if (WORLD === 'park') { const B = PARK.B; if (o.x < PARK_OFF - B) { o.x = PARK_OFF - B; hit = true; } if (o.x > PARK_OFF + B) { o.x = PARK_OFF + B; hit = true; } if (o.z < -B) { o.z = -B; hit = true; } if (o.z > B) { o.z = B; hit = true; } return hit; }
  const lr = landR(o.x, o.z), d = Math.hypot(o.x, o.z); if (d > lr) { o.x *= lr / d; o.z *= lr / d; hit = true; }
  return hit;
}
function updWalk(dt) {
  let ix = J.x + ((K.KeyD || K.ArrowRight) ? 1 : 0) - ((K.KeyA || K.ArrowLeft) ? 1 : 0), iy = J.y + ((K.KeyW || K.ArrowUp) ? 1 : 0) - ((K.KeyS || K.ArrowDown) ? 1 : 0);
  if (state.talk) ix = iy = 0;
  const mag = Math.min(1, Math.hypot(ix, iy));
  const fx = Math.sin(camYaw), fz = Math.cos(camYaw), rx = -Math.cos(camYaw), rz = Math.sin(camYaw);
  let mx = fx * iy + rx * ix, mz = fz * iy + rz * ix; const ml = Math.hypot(mx, mz) || 1; mx /= ml; mz /= ml;
  const target = mag * (PL.run ? 7.5 : 3.8);
  PL.spd = lerp(PL.spd, target, dt * 8);
  if (mag > 0.05) { PL.yaw = angLerp(PL.yaw, Math.atan2(mx, mz), dt * 12); PL.x += mx * PL.spd * dt; PL.z += mz * PL.spd * dt; }
  if (PL.ground && OB.on) { PL.x += OB.on.x - OB.on.px; PL.z += OB.on.z - OB.on.pz; PL.y += Math.max(0, OB.on.dy || 0); } // ride moving platforms
  PL.vy -= 24 * dt; PL.y += PL.vy * dt;
  const G0 = groundAt(PL.x, PL.y, PL.z), gh = G0.gh;
  if (PL.y <= gh) {
    if (G0.on && G0.on.bounce && PL.vy < -1) { PL.y = gh; PL.vy = 13; PL.ground = false; sfx.jump(); OB.on = null; }
    else { if (!PL.ground && PL.vy < -6) sfx.land(); PL.y = gh; PL.vy = 0; PL.ground = true; OB.on = G0.on; }
  } else if (PL.y > gh + 0.08) { PL.ground = false; OB.on = null; }
  collide(PL, 0.42);
  kid.position.set(PL.x, PL.y + (WORLD === 'park' && PL.ground ? PARK.groundOffset() : 0), PL.z); kid.rotation.y = PL.yaw; animKid(kid, PL.spd, dt, !PL.ground);
  // camera auto-follows gently when walking forward and the player is not dragging
  if (iy > 0.4 && performance.now() - lastDrag > 1500) camYaw = angLerp(camYaw, PL.yaw, dt * 0.8);
}
function updDrive(dt) {
  const gas = PED.gas || K.KeyW || K.ArrowUp || J.y > 0.35 ? 1 : 0, brk = PED.brake || K.KeyS || K.ArrowDown || J.y < -0.35 ? 1 : 0;
  const st = clamp(-J.x + ((K.KeyA || K.ArrowLeft) ? 1 : 0) - ((K.KeyD || K.ArrowRight) ? 1 : 0), -1, 1);
  const TOP = 26;
  if (state.talk) { CAR.v = lerp(CAR.v, 0, dt * 3); }
  else {
    if (gas) CAR.v += 14 * (1 - Math.max(0, CAR.v) / TOP) * dt;
    if (brk) CAR.v -= (CAR.v > 0.5 ? 26 : 7) * dt;
    if (!gas && !brk) CAR.v -= Math.sign(CAR.v) * Math.min(Math.abs(CAR.v), 5 * dt);
    CAR.v = clamp(CAR.v, -8, TOP);
  }
  CAR.steer = lerp(CAR.steer, st, dt * 7);
  const sp = Math.abs(CAR.v); CAR.yaw += CAR.steer * (1.7 / (1 + sp * 0.04)) * clamp(sp / 3, 0, 1) * Math.sign(CAR.v || 1) * dt;
  CAR.x += Math.sin(CAR.yaw) * CAR.v * dt; CAR.z += Math.cos(CAR.yaw) * CAR.v * dt;
  const before = CAR.v;
  if (collide(CAR, 1.9)) { CAR.v *= 0.5; if (Math.abs(before) > 7) { sfx.bump(); shake = 0.3; } }
  for (const t of traffic) { const dx = CAR.x - t.x, dz = CAR.z - t.z, d = Math.hypot(dx, dz); if (d < 4 && d > 0.01) { CAR.x += (dx / d) * (4 - d) * 0.8; CAR.z += (dz / d) * (4 - d) * 0.8; if (Math.abs(CAR.v) > 5) { sfx.bump(); shake = 0.25; } CAR.v *= 0.6; } }
  syncCar(dt); PL.x = CAR.x; PL.z = CAR.z;
  $('#spd').textContent = Math.round(sp * 3.6);
  if (performance.now() - lastDrag > 900) camYaw = angLerp(camYaw, CAR.yaw + (CAR.v < -1 ? Math.PI : 0), dt * 3);
}
function updNPC(dt, now) {
  for (const w of walkers) {
    const a = w.pts[w.seg], b = w.pts[(w.seg + 1) % 4], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    w.t += (w.sp * dt) / L; if (w.t >= 1) { w.t = 0; w.seg = (w.seg + 1) % 4; }
    const x = lerp(a[0], b[0], w.t), z = lerp(a[1], b[1], w.t);
    let near = Math.hypot(x - PL.x, z - PL.z) < 1.4 && PL.mode === 'walk';
    if (!near) { w.k.position.set(x, 0.12, z); w.k.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); animKid(w.k, w.sp, dt, false); } else { w.t -= (w.sp * dt) / L; animKid(w.k, 0, dt, false); }
  }
  for (const n of NPCS) { const d = Math.hypot(PL.x - n.x, PL.z - n.z); if (d < 8) n.k.rotation.y = angLerp(n.k.rotation.y, Math.atan2(PL.x - n.x, PL.z - n.z), dt * 4); animKid(n.k, 0, dt, false); }
  for (const t of traffic) {
    const a = t.loop[t.seg], b = t.loop[(t.seg + 1) % 4], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
    const lx = -uz * 3.2, lz = ux * 3.2; // keep right
    // slow for player/car ahead
    const px = PL.x - t.x, pz = PL.z - t.z, ah = px * ux + pz * uz, side = Math.abs(px * uz - pz * ux);
    t.v = lerp(t.v, ah > 0 && ah < 12 && side < 3 ? 0 : t.sp, dt * 2.5);
    t.t += (t.v * dt) / L; if (t.t >= 1) { t.t = 0; t.seg = (t.seg + 1) % 4; }
    t.x = lerp(a[0], b[0], t.t) + lx; t.z = lerp(a[1], b[1], t.t) + lz; const ty = Math.atan2(ux, uz); t.yaw = angLerp(t.yaw, ty, dt * 6);
    t.m.position.set(t.x, 0, t.z); t.m.rotation.y = t.yaw; t.m.wheels.forEach((w) => w.children.forEach((c) => (c.rotation.z -= (t.v * dt) / 0.44)));
    if (PL.mode === 'walk') { const d = Math.hypot(PL.x - t.x, PL.z - t.z); if (d < 2.4) { PL.x += ((PL.x - t.x) / d) * (2.4 - d); PL.z += ((PL.z - t.z) / d) * (2.4 - d); } }
  }
}
function updCollect(now) {
  for (let n = SHELLS.length - 1; n >= 0; n--) { const sh = SHELLS[n]; sh.m.rotation.y = now / 600; if (Math.hypot(PL.x - sh.x, PL.z - sh.z) < (PL.mode === 'drive' ? 3.5 : 1.8)) { scene.remove(sh.m); SHELLS.splice(n, 1); S.shells.push(sh.id); S.coins += 10; save(); updPills(); sfx.coin(); toast(`🐚 صدفة ${S.shells.length} من 5`); updGoal(); if (S.shells.length >= 5 && curMis() && curMis().id === 'beach') completeMission(); } }
  const r2 = PL.mode === 'drive' ? 3.2 : 1.6;
  tmpQ.setFromEuler(tmpE.set(0, now / 300, 0));
  for (let n = COINS.length - 1; n >= 0; n--) { const c = COINS[n]; tmpM.compose(tmpP.set(c.x, 1.1, c.z), tmpQ, tmpS.setScalar(c.gone ? 0 : 1)); coinIM.setMatrixAt(c.i, tmpM); if (!c.gone && Math.abs(PL.x - c.x) < r2 && Math.abs(PL.z - c.z) < r2 && PL.y < 2.5) { c.gone = true; tmpM.compose(tmpP, tmpQ, tmpS.setScalar(0)); coinIM.setMatrixAt(c.i, tmpM); S.got.push(c.id); S.coins += 10; save(); updPills(); sfx.coin(); } }
  coinIM.instanceMatrix.needsUpdate = true; if (!updCollect.bs) { coinIM.computeBoundingSphere(); updCollect.bs = 1; }
  for (let n = GEMS.length - 1; n >= 0; n--) { const c = GEMS[n]; c.m.rotation.y = now / 400; c.m.position.y = 1.3 + Math.sin(now / 400) * 0.2; if (Math.hypot(PL.x - c.m.position.x, PL.z - c.m.position.z) < r2 + 0.4) { scene.remove(c.m); GEMS.splice(n, 1); S.gemsGot.push(c.id); S.gems += 10; save(); updPills(); sfx.win(); toast('💎 لقيت جوهرة مستخبية! +10'); } }
  for (let n = BALLOONS.length - 1; n >= 0; n--) { const b = BALLOONS[n]; b.m.position.y = Math.sin(now / 500 + n) * 0.3; if (Math.hypot(PL.x - b.x, PL.z - b.z) < r2 + 0.8) { scene.remove(b.m); BALLOONS.splice(n, 1); S.bal.push(b.id); save(); sfx.coin(); toast(`🎈 بالونة ${S.bal.length} من 3`); updGoal(); if (S.bal.length >= 3 && curMis() && curMis().id === 'balloons') completeMission(); } }
}
function updMission(now) {
  const m = curMis(); let tgt = WORLD !== 'city' ? null : m && m.at && m.at();
  pin.visible = ring.visible = !!tgt;
  if (tgt) {
    pin.position.set(tgt.x, (m.id === 'car' ? 3 : 3.6) + Math.sin(now / 300) * 0.35, tgt.z); pin.rotation.y = now / 600;
    ring.position.set(tgt.x, 0.18, tgt.z); ring.scale.setScalar(1 + Math.sin(now / 250) * 0.08);
    if (m.id === 'mall' && Math.hypot(PL.x - tgt.x, PL.z - tgt.z) < 6) completeMission();
  }
  // interact button
  curAct = null; let best = 1e9;
  for (const it of interactables()) { const d = Math.hypot(PL.x - it.x, PL.z - it.z); if (d < it.r && d < best) { best = d; curAct = it; } }
  const ab = $('#bAct'); if (curAct && !state.talk) { ab.textContent = curAct.label; ab.classList.add('on'); } else ab.classList.remove('on');
  const nearCar = !ACT && (PL.mode === 'drive' || Math.hypot(PL.x - CAR.x, PL.z - CAR.z) < 4.2); $('#bCar').classList.toggle('on', nearCar && !state.talk);
}

// ================= camera =================
const ray = new THREE.Raycaster(), camT = new THREE.Vector3(), camW = new THREE.Vector3();
let shake = 0;
function updCam(dt, snap) {
  const drive = PL.mode === 'drive', dist = RIDE.on ? 30 : drive ? 10.5 : WORLD === 'home' ? 5.4 : 6.2, hgt = drive ? 1.6 : 1.3;
  if (RIDE.on) { camYaw = angLerp(camYaw, 0, dt * 2); camPitch = lerp(camPitch, 0.12, dt * 2); }
  let distA = dist; if (ACT && ACT.cam) { const c = ACT.cam; distA = c.dist; camPitch = lerp(camPitch, c.pitch, dt * 2); if (c.yaw !== undefined) camYaw = angLerp(camYaw, c.yaw, dt * 2); if (c.follow && performance.now() - lastDrag > 1200) camYaw = angLerp(camYaw, PL.yaw, dt * 2.5); }
  camT.set(PL.x, PL.y + hgt, PL.z);
  const cp = Math.cos(camPitch), dir = new THREE.Vector3(-Math.sin(camYaw) * cp, Math.sin(camPitch), -Math.cos(camYaw) * cp);
  ray.set(camT, dir); ray.far = distA; const hit = RIDE.on || ACT || (WORLD !== 'city' && WORLD !== 'mall') ? null : ray.intersectObjects(WORLD === 'mall' && MALL ? MALL.camBlock : camBlock, false)[0];
  const d = hit ? Math.max(1.5, hit.distance - 0.6) : distA;
  camW.copy(camT).addScaledVector(dir, d); if (camW.y < 0.6) camW.y = 0.6;
  if (snap) camera.position.copy(camW); else camera.position.lerp(camW, 1 - Math.exp(-dt * 12));
  camera.lookAt(camT);
  if (window.__cam) { camera.position.set(...window.__cam[0]); camera.lookAt(...window.__cam[1]); }
  if (shake > 0) { camera.position.x += (Math.random() - 0.5) * shake; camera.position.y += (Math.random() - 0.5) * shake; shake = Math.max(0, shake - dt * 1.4); }
  camera.fov = lerp(camera.fov, drive ? 62 + Math.abs(CAR.v) * 0.45 : 60, dt * 3); camera.updateProjectionMatrix();
  sun.position.set(PL.x + 50, 90, PL.z + 30); sun.target.position.set(PL.x, 0, PL.z);
}

// ================= minimap & big map =================
const LANDCOL = { tower: '#9cc3ff', mall: '#c48bff', police: '#6f9bff', hospital: '#ffb3b3', school: '#ffc98a', shops: '#ffb3dd', homes: '#ffe7b3', plaza: '#ffd6ec', fair: '#d9b3ff', fair2: '#d9b3ff' };
function drawWorld(g, s, ox, oz) { // s: px per meter, map centred on ox,oz in the current transform
  const P = (x) => x * s;
  g.fillStyle = '#4fb4e8'; g.fillRect(-2000, -2000, 4000, 4000);
  g.beginPath(); for (let i = 0; i <= 80; i++) { const a = (i / 80) * Math.PI * 2, r = Rs(a); i ? g.lineTo(P(Math.cos(a) * r), P(Math.sin(a) * r)) : g.moveTo(P(Math.cos(a) * r), P(Math.sin(a) * r)); } g.fillStyle = '#f7dfa3'; g.fill();
  g.beginPath(); for (let i = 0; i <= 80; i++) { const a = (i / 80) * Math.PI * 2, r = Rg(a); i ? g.lineTo(P(Math.cos(a) * r), P(Math.sin(a) * r)) : g.moveTo(P(Math.cos(a) * r), P(Math.sin(a) * r)); } g.fillStyle = '#7ccf5c'; g.fill();
  g.fillStyle = '#8b90a0'; for (const k of G) { g.fillRect(P(-EXT - RW / 2), P(k - RW / 2), P(EXT * 2 + RW), P(RW)); g.fillRect(P(k - RW / 2), P(-EXT - RW / 2), P(RW), P(EXT * 2 + RW)); }
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = LANDCOL[blockType[i + ',' + j]] || '#eee'; g.fillRect(P(BC[i] - BH), P(BC[j] - BH), P(BH * 2), P(BH * 2)); }
}
const mini = $('#mini'), mg = mini.getContext('2d');
function drawMini() {
  const W = mini.width, s = 1.6;
  mg.save(); mg.clearRect(0, 0, W, W); mg.beginPath(); mg.arc(W / 2, W / 2, W / 2, 0, 7); mg.clip();
  if (WORLD === 'home' && HOME) { const s3 = 9; mg.fillStyle = '#3b2a63'; mg.fillRect(0, 0, W, W); mg.translate(W / 2, W / 2); mg.rotate(camYaw - Math.PI); mg.translate(-(PL.x - HOME_OFF) * s3, -PL.z * s3); HOME.drawMap(mg, s3); mg.restore(); mg.save(); mg.translate(W / 2, W / 2); mg.rotate(-PL.yaw + camYaw); mg.fillStyle = '#ffd23f'; mg.strokeStyle = '#7a3fe0'; mg.lineWidth = 4; mg.beginPath(); mg.moveTo(0, -18); mg.lineTo(13, 13); mg.lineTo(0, 6); mg.lineTo(-13, 13); mg.closePath(); mg.fill(); mg.stroke(); mg.restore(); return; }
  if (WORLD === 'mall' && MALL) { mg.translate(W / 2, W / 2); mg.rotate(camYaw - Math.PI); mg.translate(-(PL.x - MALL_OFF) * s, -PL.z * s); MALL.drawMap(mg, s); mg.restore(); mg.save(); mg.translate(W / 2, W / 2); mg.rotate(-PL.yaw + camYaw); mg.fillStyle = '#ffd23f'; mg.strokeStyle = '#7a3fe0'; mg.lineWidth = 4; mg.beginPath(); mg.moveTo(0, -18); mg.lineTo(13, 13); mg.lineTo(0, 6); mg.lineTo(-13, 13); mg.closePath(); mg.fill(); mg.stroke(); mg.restore(); return; }
  if (WORLD === 'park') { mg.translate(W / 2, W / 2); mg.rotate(camYaw - Math.PI); mg.translate(-(PL.x - PARK_OFF) * s, -PL.z * s); PARK.drawMap(mg, s); NET.dots(mg, s, PARK_OFF); mg.restore(); mg.save(); mg.translate(W / 2, W / 2); mg.rotate(-PL.yaw + camYaw); mg.fillStyle = '#ffd23f'; mg.strokeStyle = '#7a3fe0'; mg.lineWidth = 4; mg.beginPath(); mg.moveTo(0, -18); mg.lineTo(13, 13); mg.lineTo(0, 6); mg.lineTo(-13, 13); mg.closePath(); mg.fill(); mg.stroke(); mg.restore(); return; }
  mg.translate(W / 2, W / 2); mg.rotate(camYaw - Math.PI); mg.translate(-PL.x * s, -PL.z * s);
  drawWorld(mg, s);
  const m = curMis(), t = m && m.at && m.at();
  const dot = (x, z, c, r) => { mg.fillStyle = c; mg.beginPath(); mg.arc(x * s, z * s, r, 0, 7); mg.fill(); mg.strokeStyle = '#fff'; mg.lineWidth = 3; mg.stroke(); };
  BALLOONS.forEach((b) => dot(b.x, b.z, '#ff4fae', 8));
  if (PL.mode === 'walk') dot(CAR.x, CAR.z, '#ff4fb0', 7);
  if (t) dot(t.x, t.z, '#ffb300', 11);
  NET.dots(mg, s, 0);
  mg.restore();
  // target arrow on the rim if it is off-map
  if (t) { const dx = t.x - PL.x, dz = t.z - PL.z, d = Math.hypot(dx, dz); if (d * s > W / 2 - 10) { const a = Math.atan2(dx, dz) - camYaw; mg.save(); mg.translate(W / 2, W / 2); mg.rotate(-a); mg.fillStyle = '#ffb300'; mg.beginPath(); mg.moveTo(0, -W / 2 + 6); mg.lineTo(-12, -W / 2 + 28); mg.lineTo(12, -W / 2 + 28); mg.fill(); mg.restore(); } }
  mg.save(); mg.translate(W / 2, W / 2); mg.rotate(-(PL.mode === 'drive' ? CAR.yaw : PL.yaw) + camYaw); mg.fillStyle = '#ffd23f'; mg.strokeStyle = '#7a3fe0'; mg.lineWidth = 4; mg.beginPath(); mg.moveTo(0, -18); mg.lineTo(13, 13); mg.lineTo(0, 6); mg.lineTo(-13, 13); mg.closePath(); mg.fill(); mg.stroke(); mg.restore();
}
function drawBig() {
  const c = $('#bm'), g = c.getContext('2d'), W = c.width, s = W / 380;
  g.save(); g.clearRect(0, 0, W, W); g.translate(W / 2, W / 2);
  if (WORLD === 'home' && HOME) { const s3 = W / 22; HOME.drawMap(g, s3); g.translate((PL.x - HOME_OFF) * s3, PL.z * s3); g.rotate(-PL.yaw + Math.PI); g.fillStyle = '#ffd23f'; g.strokeStyle = '#7a3fe0'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -16); g.lineTo(12, 12); g.lineTo(0, 6); g.lineTo(-12, 12); g.closePath(); g.fill(); g.stroke(); g.restore(); return; }
  if (WORLD === 'mall' && MALL) { const s2 = W / 240; MALL.drawMap(g, s2); g.translate((PL.x - MALL_OFF) * s2, PL.z * s2); g.rotate(-PL.yaw + Math.PI); g.fillStyle = '#ffd23f'; g.strokeStyle = '#7a3fe0'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -16); g.lineTo(12, 12); g.lineTo(0, 6); g.lineTo(-12, 12); g.closePath(); g.fill(); g.stroke(); g.restore(); return; }
  if (WORLD === 'park') { const s2 = W / 230; PARK.drawMap(g, s2); NET.dots(g, s2, PARK_OFF, true); g.font = '900 30px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; for (const [n, x, z] of PARK.LABELS) { g.lineWidth = 7; g.strokeStyle = '#fff'; g.strokeText(n, x * s2, z * s2); g.fillStyle = '#5a20b8'; g.fillText(n, x * s2, z * s2); } g.translate((PL.x - PARK_OFF) * s2, PL.z * s2); g.rotate(-PL.yaw + Math.PI); g.fillStyle = '#ffd23f'; g.strokeStyle = '#7a3fe0'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -16); g.lineTo(12, 12); g.lineTo(0, 6); g.lineTo(-12, 12); g.closePath(); g.fill(); g.stroke(); g.restore(); return; }
  drawWorld(g, s);
  g.font = '900 34px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const SHORT = { 'مول لولو': 'المول', 'الحي السكني': 'البيوت', 'مدينة الملاهي': 'الملاهي', 'الشاطئ والميناء': 'الشاطئ', 'المستشفى': 'المستشفى' };
  for (const L0 of Object.values(LAND)) { const L = Object.assign({}, L0, { name: SHORT[L0.name] || L0.name }); if (L0.name === 'الحي السكني') { L.lx = -30; L.lz = 90; } if (L0.name === 'الشاطئ والميناء') { L.lz = 170; } const x = (L.lx ?? L.x) * s, y = (L.lz ?? L.z) * s; g.lineWidth = 8; g.strokeStyle = '#ffffff'; g.strokeText(L.name, x, y); g.fillStyle = '#5a20b8'; g.fillText(L.name, x, y); }
  const m = curMis(), t = m && m.at && m.at(); if (t) { g.fillStyle = '#ffb300'; g.beginPath(); g.arc(t.x * s, t.z * s - 20, 12, 0, 7); g.fill(); g.beginPath(); g.moveTo(t.x * s - 9, t.z * s - 14); g.lineTo(t.x * s + 9, t.z * s - 14); g.lineTo(t.x * s, t.z * s); g.fill(); }
  BALLOONS.forEach((b) => { g.fillStyle = '#ff4fae'; g.beginPath(); g.arc(b.x * s, b.z * s, 8, 0, 7); g.fill(); });
  NET.dots(g, s, 0, true);
  g.translate(PL.x * s, PL.z * s); g.rotate(-(PL.mode === 'drive' ? CAR.yaw : PL.yaw) + Math.PI); g.fillStyle = '#ffd23f'; g.strokeStyle = '#7a3fe0'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -16); g.lineTo(12, 12); g.lineTo(0, 6); g.lineTo(-12, 12); g.closePath(); g.fill(); g.stroke();
  g.restore();
}


// ================= ONLINE: kids see each other in the same city (phase 3) =================
// Server: /lolo-mp/wws (shared with Lolo Drive). No chat at all — only position, outfit and one of the 4 official names.
function nameTag(text) {
  const t = ctex(256, 64, (g, w, h) => { g.font = '900 34px Cairo, Tajawal, sans-serif'; const tw = Math.min(w - 8, g.measureText(text).width + 34); g.fillStyle = 'rgba(122,63,224,.92)'; rrect(g, (w - tw) / 2, 6, tw, 52, 26); g.fill(); g.lineWidth = 4; g.strokeStyle = '#fff'; g.stroke(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, 34); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true, toneMapped: false })); s.scale.set(1.9, 0.48, 1); s.renderOrder = 5; return s;
}
const NET = {
  ws: null, want: false, ready: false, retry: 0, id: null, offset: null, lastSend: 0, last: null, others: new Map(), sentKey: '', keyT: 0,
  url() { return (window.LW_MP_URL || ((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/lolo-mp/wws')); },
  lookMsg() { return { ch: S.char, n: myName(), lk: curLook(), car: S.car }; },
  connect() {
    let ws; try { ws = new WebSocket(this.url()); } catch (e) { this.later(); return; }
    this.ws = ws; this.ready = false; let sid = ''; try { sid = sessionStorage.getItem('lwSid') || ''; } catch (e) {}
    ws.onopen = () => { this.ready = true; this.retry = 0; this.last = null; const lm = this.lookMsg(); this.sentKey = JSON.stringify(lm); ws.send(JSON.stringify(Object.assign({ t: 'h', tok: new URLSearchParams(location.search).get('token') || '', sid }, lm))); };
    ws.onmessage = (e) => { let d; try { d = JSON.parse(e.data); } catch (x) { return; } this.onMsg(d); };
    ws.onclose = () => { if (this.ws === ws) { this.ws = null; this.ready = false; this.later(); } };
    ws.onerror = () => {};
  },
  later() { if (!this.want) return; this.retry++; setTimeout(() => { if (this.want && !this.ws) this.connect(); }, Math.min(8000, 700 * this.retry)); },
  disconnect() { this.want = false; const ws = this.ws; this.ws = null; this.ready = false; if (ws) try { ws.close(); } catch (e) {} this.clear(); },
  send(o) { if (this.ws && this.ready) try { this.ws.send(JSON.stringify(o)); } catch (e) {} },
  tick(now) {
    const should = state.play && !document.hidden;
    if (should && !this.want) { this.want = true; this.retry = 0; this.connect(); }
    if (!should && this.want) { this.disconnect(); return; }
    if (!this.ready) return;
    if (now - this.keyT > 1000) { this.keyT = now; const lm = this.lookMsg(), k = JSON.stringify(lm); if (k !== this.sentKey) { this.sentKey = k; this.send(Object.assign({ t: 'l' }, lm)); } }
    if (now - this.lastSend < 100) return;
    const drive = PL.mode === 'drive', act = !!(ACT || RIDE.on), src = drive ? CAR.mesh.position : kid.position;
    const st = [+src.x.toFixed(2), +src.y.toFixed(2), +src.z.toFixed(2), +(drive ? CAR.yaw : kid.rotation.y).toFixed(3), +Math.abs(drive ? CAR.v : PL.spd || 0).toFixed(2), drive ? 1 : act ? 2 : 0, !drive && !PL.ground ? 1 : 0], L = this.last;
    const moved = !L || Math.abs(st[0] - L[0]) > 0.04 || Math.abs(st[1] - L[1]) > 0.04 || Math.abs(st[2] - L[2]) > 0.04 || Math.abs(st[3] - L[3]) > 0.02 || st[5] !== L[5] || st[6] !== L[6] || (st[4] < 0.2) !== (L[4] < 0.2);
    if (!moved && now - this.lastSend < 1000) return;
    this.lastSend = now; this.last = st;
    this.send({ t: 'u', x: st[0], y: st[1], z: st[2], a: st[3], s: st[4], m: st[5], f: st[6] });
  },
  onMsg(d) {
    if (d.t === 's') {
      const est = d.ts - Date.now(); this.offset = this.offset === null ? est : (est > this.offset ? lerp(this.offset, est, 0.3) : lerp(this.offset, est, 0.02));
      for (const [id, x, y, z, a, s, md, f] of d.p) { const o = this.others.get(id); if (!o) continue; o.buf.push({ t: d.ts, x, y, z, a, s, m: md, f }); if (o.buf.length > 24) o.buf.shift(); }
    } else if (d.t === 'r') this.roster(d.p);
    else if (d.t === 'w') { this.id = d.sid; this.everOk = true; try { sessionStorage.setItem('lwSid', d.sid); } catch (e) {} }
    else if (d.t === 'e') { const o = this.others.get(d.f); if (o) bubble(o.k, d.k); }
    else if (d.t === 'iv') showInvite(d.f, d.n, d.ev);
    else if (d.t === 'ivr') inviteReply(d);
    else if (d.t === 'nd') { waitBox(); toast(d.r === 'to' ? `⏰ ${d.n} ما ردّش، جرّب تاني بعد شوية` : `🙂 ${d.n} مش فاضي دلوقتي، جرّب بعدين`); }
    else if (d.t === 'ch') { this.seenCh = this.seenCh || new Set(); if (!this.seenCh.has(d.id)) { this.seenCh.add(d.id); if (!d.end) startVs(d); } else vsResult(d); }
  },
  roster(list) {
    const seen = new Set(), before = this.others.size;
    for (const [id, name, look, car] of list) {
      if (id === this.id) continue; seen.add(id);
      const key = JSON.stringify(look) + car + name; let o = this.others.get(id);
      if (o && o.key === key) continue;
      const buf = o ? o.buf : []; if (o) this.drop(o);
      const k = AV.makeAvatar(look); k.visible = false; scene.add(k);
      const tag = nameTag(name); tag.visible = false; scene.add(tag);
      o = { key, name, k, tag, carC: CAR_COLORS[car] || CAR_COLORS.pink, car: null, buf, x: 0, z: 0, vis: false };
      this.others.set(id, o);
    }
    for (const [id, o] of this.others) if (!seen.has(id)) { this.drop(o); this.others.delete(id); }
    const n = this.others.size, w = $('#who'); $('#bFr').dataset.n = n || ''; if (state.panel === 'friends') renderFriends(); w.textContent = n ? `👫 ${n} ${n === 1 ? 'صاحب' : n === 2 ? 'صاحبين' : 'أصحاب'} أونلاين` : ''; w.classList.toggle('on', n > 0);
    if (n > before && state.play) toast('👋 فيه صاحب جديد دخل المدينة!');
  },
  drop(o) { scene.remove(o.k); scene.remove(o.tag); if (o.car) scene.remove(o.car); },
  // draw every other kid 150 ms in the past, between two real server snapshots (smooth, no jumps)
  update(dt) {
    if (this.offset === null) return; const rt = Date.now() + this.offset - 150;
    for (const o of this.others.values()) {
      const B = o.buf; if (!B.length) continue;
      let x, y, z, a, s, md, f;
      if (rt <= B[0].t) ({ x, y, z, a, s, m: md, f } = B[0]);
      else if (rt >= B[B.length - 1].t) { const Lb = B[B.length - 1], ex = Math.min(0.3, (rt - Lb.t) / 1000), mv = Lb.m === 1 ? Lb.s : Lb.s; x = Lb.x + Math.sin(Lb.a) * mv * ex; z = Lb.z + Math.cos(Lb.a) * mv * ex; y = Lb.y; a = Lb.a; s = Lb.s; md = Lb.m; f = Lb.f; }
      else { let i = 0; while (i < B.length - 2 && B[i + 1].t < rt) i++; const p = B[i], q = B[i + 1], t = (rt - p.t) / Math.max(1, q.t - p.t);
        let da = q.a - p.a; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
        x = lerp(p.x, q.x, t); y = lerp(p.y, q.y, t); z = lerp(p.z, q.z, t); a = p.a + da * t; s = lerp(p.s, q.s, t); md = q.m; f = q.f; }
      o.x = x; o.z = z; o.vis = true;
      const drive = md === 1;
      if (drive) { if (!o.car) { o.car = makeCar(o.carC, 'conv'); scene.add(o.car); } o.car.visible = true; o.car.position.set(x, 0, z); o.car.rotation.y = a; const spin = (s * dt) / 0.44; o.car.wheels.forEach((wh) => wh.children.forEach((c) => (c.rotation.z -= spin))); }
      else if (o.car) o.car.visible = false;
      o.k.visible = !drive; if (!drive) { o.k.position.set(x, y, z); o.k.rotation.y = a; animKid(o.k, s, dt, !!f); }
      o.tag.visible = true; o.tag.position.set(x, y + (drive ? 2.6 : 2.55), z);
    }
  },
  clear() { for (const o of this.others.values()) this.drop(o); this.others.clear(); $('#who').classList.remove('on'); },
  dots(g, s, off, names) { // friends on the mini / big map
    for (const o of this.others.values()) {
      if (!o.vis || (off ? o.x < off / 2 : o.x > PARK_OFF / 2)) continue; const x = (o.x - off) * s, z = o.z * s;
      g.fillStyle = '#ff3bd4'; g.beginPath(); g.arc(x, z, names ? 11 : 7, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke();
      if (names) { g.font = '900 24px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.lineWidth = 6; g.strokeStyle = '#fff'; g.strokeText(o.name, x, z - 22); g.fillStyle = '#c0179b'; g.fillText(o.name, x, z - 22); }
    }
  },
};


// ================= FRIENDS, MEETING, CHALLENGES, EMOTES (phase 4) =================
const EMO = { wave: ['👋', 'أهلاً!'], clap: ['👏', 'برافو!'], dance: ['💃', 'يلا نرقص!'], hop: ['🦘', 'هييييه!'], play: ['🎮', 'هيا نلعب!'], follow: ['➡️', 'اتبعني!'], great: ['👍', 'أحسنت!'], race: ['🏁', 'يلا نتسابق!'] };
function bubble(k, key) {
  if (!k || !EMO[key]) return; if (k.bub) { k.remove(k.bub); k.bub = null; }
  const [ic, tx] = EMO[key], t = ctex(320, 110, (g, w, h) => { g.fillStyle = '#ffffff'; rrect(g, 6, 6, w - 12, 78, 34); g.fill(); g.beginPath(); g.moveTo(w / 2 - 16, 82); g.lineTo(w / 2, 104); g.lineTo(w / 2 + 16, 82); g.fill(); g.lineWidth = 5; g.strokeStyle = '#a46cf5'; rrect(g, 6, 6, w - 12, 78, 34); g.stroke(); g.font = '900 40px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#5a20b8'; g.fillText(ic + ' ' + tx, w / 2, 46); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true, toneMapped: false })); s.scale.set(2.3, 0.8, 1); s.position.y = 3.05; s.renderOrder = 6; k.add(s); k.bub = s;
  k.emo = { k: key, t: 2.6 }; clearTimeout(k.bubT); k.bubT = setTimeout(() => { if (k.bub === s) { k.remove(s); k.bub = null; } }, 3000);
}
function emotePose(k, dt) { // runs after the normal walk animation
  const e = k.emo; if (!e) return; e.t -= dt; if (e.t <= 0) { k.emo = null; return; }
  const P = k.P, t = performance.now() / 1000;
  if (e.k === 'wave' || e.k === 'play' || e.k === 'great') { P.arms[1].rotation.set(0, 0, 2.6 + Math.sin(t * 12) * 0.35); }
  else if (e.k === 'clap') { const c = Math.abs(Math.sin(t * 9)); P.arms[0].rotation.set(-1.4, 0, -0.5 + c * 0.45); P.arms[1].rotation.set(-1.4, 0, 0.5 - c * 0.45); }
  else if (e.k === 'dance') { P.body.rotation.z = Math.sin(t * 8) * 0.18; P.arms[0].rotation.set(0, 0, -2.4 + Math.sin(t * 8) * 0.4); P.arms[1].rotation.set(0, 0, 2.4 + Math.sin(t * 8) * 0.4); P.legs[0].rotation.x = Math.sin(t * 8) * 0.3; P.legs[1].rotation.x = -Math.sin(t * 8) * 0.3; }
  else if (e.k === 'hop') { P.body.position.y = 0.62 + Math.abs(Math.sin(t * 9)) * 0.35; P.arms[0].rotation.set(0, 0, -2.7); P.arms[1].rotation.set(0, 0, 2.7); }
  else if (e.k === 'follow' || e.k === 'race') { P.arms[1].rotation.set(-1.5, 0, 0.2); }
  if (e.t < 0.05) { P.body.rotation.z = 0; }
}
function doEmote(key) { $('#emo').classList.remove('on'); if (!kid) return; bubble(kid, key); NET.send({ t: 'e', k: key }); sfx.pop(); }

// ----- friends panel -----
function friendWhere(o) { const md = o.buf.length ? o.buf[o.buf.length - 1].m : 0; return o.x > PARK_OFF / 2 ? '🎡 في مدينة الملاهي' : md === 1 ? '🚗 بيسوق في المدينة' : '🏙️ في المدينة'; }
function openFriends() {
  closePanel(); openPanel('friends'); renderFriends();
}
function renderFriends() {
  const st = $('#frStatus'), list = [...NET.others.entries()].filter(([, o]) => o.vis || o.buf.length);
  st.className = 'frst ' + (NET.ready ? 'ok' : 'bad');
  st.textContent = NET.ready ? `🟢 متصل — ${list.length ? list.length + ' أونلاين معاك' : 'مفيش حد أونلاين دلوقتي'}` : NET.everOk ? '🟠 النت فصل… بنحاول نرجع' : '🔴 مش متصل بسيرفر الأونلاين (لو فضلت كده كلّم الدعم)';
  const me = PL.mode === 'drive' ? CAR : PL;
  $('#frList').innerHTML = list.length ? list.map(([id, o]) => `<div class="fcard"><div class="fhead"><b>🧒 ${o.name}</b><span>${friendWhere(o)} · ${Math.round(Math.hypot(o.x - me.x, o.z - me.z))} متر</span></div>
      <div class="frow"><button class="big3d v" data-fgo="${id}">📍 روحله</button><button class="big3d g" data-ftp="${id}">🚀 روح عنده</button></div>
      <div class="frow">${Object.entries(VSK).map(([k, v]) => `<button class="big3d" data-fvs="${k}" data-to="${id}">${v.i} ${v.n}</button>`).join('')}</div></div>`).join('')
    : `<div class="fempty">مفيش أصحاب أونلاين دلوقتي 🙂<br>أول ما حد يدخل لولو بوكس هيظهر هنا وعلى الخريطة بلون بينك</div>`;
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-fgo],[data-ftp],[data-fvs],[data-emo]'); if (!b) return; sfx.click();
  if (b.dataset.emo) return doEmote(b.dataset.emo);
  const o = NET.others.get(b.dataset.fgo || b.dataset.ftp || b.dataset.to); if (!o) { toast('صاحبك خرج 🙂'); return; }
  closePanel();
  if (b.dataset.fgo) { GUIDE.id = b.dataset.fgo; toast('📍 امشي ورا السهم الأصفر'); }
  else if (b.dataset.ftp) goToFriend(o);
  else { if (!NET.ready) { toast('📶 مش متصل دلوقتي'); return; } NET.send({ t: 'iv', to: b.dataset.to, ev: b.dataset.fvs }); waitBox(o.name); }
});
function goToFriend(o) {
  const inPark = o.x > PARK_OFF / 2, x = o.x + 1.6, z = o.z + 1.6;
  if (inPark !== (WORLD === 'park') || WORLD === 'home') { teleport(inPark ? 'park' : 'city', x, z, 0, 'رايحين لصاحبك…'); setTimeout(() => toast(`🎉 وصلت عند ${o.name}!`), 1200); return; }
  if (ACT) endAct(true); if (RIDE.on) RIDE.on = false; if (PL.mode === 'drive') exitCarForce();
  PL.x = x; PL.z = z; PL.y = (o.k.position.y || 0) + 0.3; PL.vy = 0; camYaw = PL.yaw; updCam(0, true); toast(`🎉 وصلت عند ${o.name}!`); bubble(kid, 'wave'); NET.send({ t: 'e', k: 'wave' });
}
// ----- yellow arrow to a friend -----
const GUIDE = { id: null };
function updGuide() {
  const ar = $('#arrow'), o = GUIDE.id && NET.others.get(GUIDE.id);
  if (!o || !o.vis || VS.on) { ar.classList.remove('on'); if (GUIDE.id && !o) GUIDE.id = null; return; }
  const me = PL.mode === 'drive' ? CAR : PL, dx = o.x - me.x, dz = o.z - me.z, d = Math.hypot(dx, dz);
  if (d < 5) { GUIDE.id = null; ar.classList.remove('on'); toast(`🎉 اتقابلت مع ${o.name}!`); bubble(kid, 'wave'); NET.send({ t: 'e', k: 'wave' }); return; }
  const rel = Math.atan2(dx, dz) - camYaw + Math.PI; ar.classList.add('on'); ar.querySelector('i').style.transform = `rotate(${-rel}rad)`; ar.querySelector('b').textContent = `${o.name} · ${Math.round(d)} متر`;
}
// ----- invites (same flow as Lolo Drive) -----
function waitBox(name) {
  const w = $('#ivWait'); clearTimeout(w._t);
  if (!name) { w.classList.remove('on'); return; }
  w.querySelector('b').textContent = `📨 بعتنا التحدي لـ ${name} ⏳ مستنيين يرد...`; w.classList.add('on');
  w.querySelector('button').onclick = () => w.classList.remove('on');
  w._t = setTimeout(() => { if (w.classList.contains('on')) { w.classList.remove('on'); toast(`⏰ ${name} ما ردّش، جرّب تاني`); } }, 32000);
}
function inviteReply(d) {
  if (d.r === 'ok') { const w = $('#ivWait'); if (w.classList.contains('on')) w.querySelector('b').textContent = `✅ التحدي وصل لـ ${d.n} ⏳ مستنيين يوافق...`; return; }
  waitBox(); toast(d.r === 'busy' ? `🏁 ${d.n} في تحدي دلوقتي، جرّب بعد ما يخلّص` : d.r === 'late' ? '⌛ التحدي خلص وقته، اطلب منه يبعتلك تاني' : `🚪 ${d.n || 'صاحبك'} خرج من اللعبة`);
}
function showInvite(from, name, ev) {
  const box = $('#invite'), v = VSK[ev]; if (!v) return;
  if (VS.on && !VS.done || (box.classList.contains('on') && box._from !== from)) { NET.send({ t: 'dn', f: from, r: 'busy' }); return; }
  box._from = from; box.querySelector('p').textContent = `${name} عايز يتحداك: ${v.i} ${v.n}`; box.classList.add('on'); sfx.win();
  const close = () => { box.classList.remove('on'); box._from = null; }; clearTimeout(box._t);
  box._t = setTimeout(() => { if (box._from === from) { NET.send({ t: 'dn', f: from, r: 'to' }); close(); } }, 20000);
  box.querySelector('.yes').onclick = () => { NET.send({ t: 'ac', f: from }); close(); toast('👍 تمام! التحدي هيبدأ دلوقتي'); };
  box.querySelector('.no').onclick = () => { NET.send({ t: 'dn', f: from, r: 'no' }); close(); };
}
// ----- challenges -----
const VSK = {
  run: { n: 'سباق جري', i: '🏃', pts: [[-60, -100], [-60, -60], [0, -60], [0, 0], [60, 0], [60, 60], [0, 60]], r: 4 },
  stars: { n: 'مين يلم نجوم أكتر', i: '⭐', at: [0, 0], count: 20, time: 60 },
  car: { n: 'سباق عربيات', i: '🚗', pts: [[-120, 96], [-120, -120], [120, -120], [120, 120], [-120, 120], [-120, 70]], r: 7 },
};
const VS = { on: false, done: false, id: null, ev: null, cps: [], cp: 0, startAt: 0, t0: 0, got: 0, stars: [], vsName: '', shown: false, myScore: 0, myTime: 0, doneAt: 0 };
const cpRing = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.32, 10, 32), toon('#ffd23f', { emissive: '#ffa000', emissiveIntensity: 0.6 })); cpRing.visible = false; scene.add(cpRing);
const cpBeam = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 60, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide })); cpBeam.visible = false; scene.add(cpBeam);
const vsStarGeo = (() => { const s = new THREE.Shape(); for (let i = 0; i <= 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.38 : 0.85; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } const g = new THREE.ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: false }); g.center(); return g; })();
const vsStarMat = toon('#ffd23f', { emissive: '#ffb300', emissiveIntensity: 0.5 });
function seeded(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function vsClear() { cpRing.visible = cpBeam.visible = false; VS.stars.forEach((s) => scene.remove(s)); VS.stars = []; $('#vsbar').classList.remove('on'); $('#vsCount').classList.remove('on'); }
function startVs(ch) {
  const D = VSK[ch.ev]; if (!D) return; vsClear(); $('#invite').classList.remove('on'); waitBox(); GUIDE.id = null;
  if (state.panel) closePanel(); if (state.talk) { state.talk = false; $('#dlg').classList.remove('on'); }
  const mine = Math.max(0, ch.p.findIndex((x) => x[0] === NET.id)), others = ch.p.filter((x) => x[0] !== NET.id);
  Object.assign(VS, { t0: 0, sx: undefined, cps: [], on: true, done: false, shown: false, id: ch.id, ev: ch.ev, cp: 0, got: 0, startAt: performance.now() + ch.in * 1000, vsName: others.map((x) => x[1]).join(' و ') || 'صاحبك', doneAt: 0 });
  const place = () => {
    if (ACT) endAct(true); if (RIDE.on) RIDE.on = false; WORLD = 'city';
    const side = mine ? 2.6 : -2.6;
    if (ch.ev === 'stars') { if (PL.mode === 'drive') exitCarForce(); VS.sx = D.at[0] + 3.5 + side * 0.6; VS.sz = D.at[1] + 14; VS.syaw = Math.PI; }
    else { const [a, b] = D.pts, yaw = Math.atan2(b[0] - a[0], b[1] - a[1]), rx = Math.cos(yaw), rz = -Math.sin(yaw); VS.sx = a[0] + rx * side; VS.sz = a[1] + rz * side; VS.syaw = yaw; VS.cps = D.pts.slice(1).map(([x, z]) => ({ x, z })); }
    if (ch.ev === 'car') { CAR.x = VS.sx; CAR.z = VS.sz; CAR.yaw = VS.syaw; CAR.v = 0; syncCar(0); if (PL.mode !== 'drive') enterCar(); }
    else { if (PL.mode === 'drive') exitCarForce(); PL.x = VS.sx; PL.z = VS.sz; PL.y = 0.12; PL.vy = 0; PL.yaw = VS.syaw; }
    camYaw = VS.syaw; updCam(0, true);
    if (ch.ev === 'stars') { const R = seeded(ch.seed), used = new Set(); while (VS.stars.length < D.count) { const along = R() < 0.5, k = G[1 + Math.floor(R() * 3)], t = -96 + R() * 192, key = Math.round(t / 6) + ',' + k + along; if (used.has(key) || Math.abs(t - k) < 8) continue; used.add(key); const s = new THREE.Mesh(vsStarGeo, vsStarMat); const off = (R() - 0.5) * 6; along ? s.position.set(k + off, 1.4, t) : s.position.set(t, 1.4, k + off); scene.add(s); VS.stars.push(s); } }
    else vsShowCp();
  };
  if (WORLD !== 'city') { teleport('city', 0, 0, 0, 'رايحين للتحدي…'); setTimeout(place, 900); } else place();
  $('#vsbar').classList.add('on'); sfx.win(); bubble(kid, 'race');
}
function vsShowCp() { const c = VS.cps[VS.cp]; if (!c) { cpRing.visible = cpBeam.visible = false; return; } const pv = VS.cp ? VS.cps[VS.cp - 1] : { x: VS.sx, z: VS.sz }; cpRing.position.set(c.x, 3.4, c.z); cpRing.rotation.set(0, Math.atan2(c.x - pv.x, c.z - pv.z), 0); cpBeam.position.set(c.x, 30, c.z); cpRing.visible = cpBeam.visible = true; }
function updVs(dt, now) {
  if (!VS.on) return; const D = VSK[VS.ev], cnt = $('#vsCount');
  if (now < VS.startAt) { // countdown: hold everybody on the start line
    const n = Math.ceil((VS.startAt - now) / 1000); if (VS.sx !== undefined) { if (VS.ev === 'car') { CAR.x = VS.sx; CAR.z = VS.sz; CAR.yaw = VS.syaw; CAR.v = 0; } else { PL.x = VS.sx; PL.z = VS.sz; PL.spd = 0; } }
    if (n <= 3) { if (cnt.textContent !== String(n)) { cnt.textContent = n; cnt.classList.remove('on'); void cnt.offsetWidth; cnt.classList.add('on'); tone(520, 0.15, 'square', 0.1); } } else { cnt.textContent = 'استعد…'; cnt.classList.add('on'); }
    $('#vsbar b').textContent = `${D.i} ${D.n} ضد ${VS.vsName}`; $('#vsbar small').textContent = 'بيبدأ بعد شوية…'; return;
  }
  if (!VS.t0) { VS.t0 = VS.startAt; cnt.textContent = 'انطلق! 🏁'; cnt.classList.remove('on'); void cnt.offsetWidth; cnt.classList.add('on'); tone(880, 0.35, 'square', 0.12); setTimeout(() => cnt.classList.remove('on'), 900); }
  if (VS.done) return;
  const el = (now - VS.t0) / 1000, me = PL.mode === 'drive' ? CAR : PL;
  if (VS.ev === 'stars') {
    VS.stars.forEach((s) => (s.rotation.y += dt * 3));
    for (let i = VS.stars.length - 1; i >= 0; i--) { const s = VS.stars[i]; if (Math.hypot(s.position.x - me.x, s.position.z - me.z) < 1.8) { scene.remove(s); VS.stars.splice(i, 1); VS.got++; sfx.coin(); } }
    const left = Math.max(0, D.time - el); $('#vsbar small').textContent = `⭐ ${VS.got}/${D.count} · ⏱️ ${Math.ceil(left)} ثانية`;
    if (left <= 0 || !VS.stars.length) vsFinish(VS.got, Math.min(el, D.time));
  } else {
    const c = VS.cps[VS.cp]; if (c && Math.hypot(c.x - me.x, c.z - me.z) < D.r + 1.5) { VS.cp++; sfx.coin(); vsShowCp(); }
    $('#vsbar small').textContent = `🚩 ${VS.cp}/${VS.cps.length} · ⏱️ ${el.toFixed(1)}`;
    if (VS.cp >= VS.cps.length) vsFinish(0, el);
  }
}
function vsFinish(score, el) {
  VS.done = true; VS.myScore = score; VS.myTime = el; VS.doneAt = performance.now(); vsClear(); $('#vsbar').classList.add('on');
  $('#vsbar small').textContent = `⏳ مستني ${VS.vsName} يخلّص...`; NET.send({ t: 'rs', c: VS.id, s: score, tm: +el.toFixed(2) }); sfx.win(); bubble(kid, 'hop');
}
function vsQuit() { if (!VS.on) return; if (!VS.done) NET.send({ t: 'lv' }); VS.on = false; vsClear(); toast('خرجت من التحدي'); }
function vsResult(ch) {
  if (!VS.on || VS.id !== ch.id) return;
  if (!VS.done) { if (ch.end) { VS.on = false; vsClear(); toast('🙂 صاحبك خرج من التحدي'); } else if (ch.p.some((x) => x[0] !== NET.id && x[5])) toast('🙂 صاحبك خرج من التحدي، كمّل!'); return; }
  const all = ch.p.map((x) => x[5] || x[4] >= 9999 ? [x[0], x[1], 1, 0, 9999, 1] : x), done = all.filter((x) => x[2]);
  if (done.length < all.length && !ch.end) return; if (VS.shown) return; VS.shown = true; VS.on = false; vsClear();
  const stars = ch.ev === 'stars', rank = all.slice().sort((a, b) => (a[5] - b[5]) || (stars ? b[3] - a[3] || a[4] - b[4] : a[4] - b[4]));
  const nobody = rank.every((x) => x[5]), tie = !nobody && rank.length > 1 && !rank[0][5] && !rank[1][5] && (stars ? rank[0][3] === rank[1][3] : Math.abs(rank[0][4] - rank[1][4]) < 0.05), iWon = !nobody && !tie && rank[0][0] === NET.id;
  const prize = nobody ? 10 : tie ? 30 : iWon ? 50 : 20; S.coins += prize; save(); updPills(); sfx.win();
  $('#vrT').textContent = nobody ? '🙂 مفيش فايز المرة دي — جرّبوا تاني!' : tie ? '🤝 تعادل! إنتوا الاتنين أبطال' : iWon ? '🏆 إنت كسبت التحدي!' : `👏 الفايز المرة دي: ${rank[0][1]}`;
  $('#vrB').innerHTML = rank.map((x, i) => `${['🥇', '🥈', '🥉'][i] || '🏁'} ${x[1]}${x[0] === NET.id ? ' (إنت)' : ''} — ${x[5] ? 'ما خلّصش' : stars ? '⭐ ' + x[3] : x[4].toFixed(1) + ' ثانية'}`).join('<br>') + `<br><span class="prize">كسبت 🪙 ${prize}</span>`;
  openPanel('vsres'); bubble(kid, iWon || tie ? 'dance' : 'clap');
}

// ================= audio =================
let AC = null, eng = null, musicOn = false;
function audioStart() {
  if (!S.sound) return; if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; } }
  if (AC.state === 'suspended') AC.resume();
  if (!eng) { const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain(); o.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0; o.connect(f).connect(g).connect(AC.destination); o.start(); eng = { o, g }; }
  if (!musicOn) { musicOn = true; music(); }
}
function tone(f, d, type = 'triangle', v = 0.15, delay = 0) { if (!AC || !S.sound) return; const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + 0.05); return o; }
const sfx = {
  coin: () => { tone(988, 0.1, 'square', 0.08); tone(1319, 0.18, 'square', 0.08, 0.07); },
  jump: () => { const o = tone(330, 0.22, 'sine', 0.15); o && o.frequency.exponentialRampToValueAtTime(700, AC.currentTime + 0.18); },
  land: () => tone(140, 0.1, 'sine', 0.12), pop: () => tone(660, 0.08, 'triangle', 0.12), door: () => { tone(220, 0.08, 'square', 0.1); tone(160, 0.12, 'square', 0.08, 0.08); },
  bump: () => tone(90, 0.2, 'sawtooth', 0.15), win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', 0.14, i * 0.1)),
  click: () => tone(880, 0.05, 'triangle', 0.08),
};
let carouselMusic = false;
const MEL = [523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 1047, 988, 784, 659, 587];
let mstep = 0;
function music() { if (!AC) return; const play = S.sound && state.play !== undefined; if (play) { tone(MEL[mstep % 16], 0.28, 'triangle', carouselMusic ? 0.09 : 0.035); if (carouselMusic) tone(MEL[mstep % 16] * 2, 0.2, 'sine', 0.05); if (mstep % 4 === 0) tone(MEL[mstep % 16] / 4, 0.5, 'sine', 0.05); } mstep++; setTimeout(music, 260); }


// ================= scene switching + attraction system =================
let WORLD = 'city', PARK = null, HOME = null, ACT = null, goalT = 0;
// ---- Mall of Arabia (LOLO_MALL_2026): an independent world, built on first visit ----
let MALL = null;
async function ensureMall() {
  if (MALL) return MALL;
  MALL = buildMall({ scene, toon, ctex, solids, circles, PL, sfx, toast, get S() { return S; }, save, updPills, renderer, PRESETS, cloneLook, animKid,
    makeAvatar: (L) => AV.makeAvatar(L), randomLook: (g) => AV.randomLook(g), getKid: () => kid, goCity,
    setPanel: (p) => { state.panel = p; }, isPlaying: () => state.play && !state.panel && !state.talk });
  try { await renderer.compileAsync(scene, camera); } catch (e) {}
  return MALL;
}
function goMall() { teleport('mall', MALL_OFF, 90, Math.PI, 'جاري تحميل مول العرب…'); setTimeout(() => toast('🛍️ أهلاً بيك في مول العرب!'), 1400); }
function ensureHome() { if (!HOME) HOME = buildHome({ THREE, scene, ctex, solids, sfx, toast, save, grad, openDecor }); return HOME; }
function enterHouse(h) {
  if (PL.mode !== 'walk') return; const mine = !!(S.house && S.house.id === h.id); ensureHome();
  HOME.enter(mine ? S.house : { in: { wall: h.id % 6, floor: h.id % 5, f: {} } }, mine, () => { teleport('city', h.x, h.z + h.dir * 7, h.dir > 0 ? 0 : Math.PI, 'خارجين من البيت…'); });
  teleport('home', HOME.SPAWN.x, HOME.SPAWN.z, HOME.SPAWN.yaw, mine ? 'داخلين بيتك…' : 'داخلين نتفرج…');
  setTimeout(() => toast(mine ? '🏠 أهلاً بيك في بيتك! قرّب من أي حاجة وغيّرها' : '🏡 ده شكل البيت من جوه — اشتريه عشان تغيّر الديكور'), 1300);
}
function openDecor() {
  if (!HOME || !HOME.editable) return; const st = HOME.state(), el = $('#hpBody'); $('#hpTitle').textContent = '🎨 ديكور البيت';
  el.innerHTML = `<div class="hsec">🎨 لون الحيطان</div><div class="sw">${HOME.WALLS.map((c, n) => `<button style="background:${c}" class="${(st.wall || 0) === n ? 'on' : ''}" data-dw="${n}"></button>`).join('')}</div>
  <div class="hsec">🧱 الأرضية</div><div class="hitems">${HOME.FLOORS.map((f, n) => `<button class="hit ${(st.floor || 0) === n ? 'own' : ''}" data-df="${n}">${f.name}</button>`).join('')}</div>
  ${HOME.SLOTS.map((sl) => `<div class="hsec">${sl.icon} ${sl.name}</div><div class="hitems">${sl.names.map((nm, n) => `<button class="hit ${HOME.val(sl.id) === n ? 'own' : ''}" data-ds="${sl.id}" data-dv="${n}">${nm}</button>`).join('')}</div>`).join('')}`;
  $$('[data-dw]').forEach((b) => (b.onclick = () => { HOME.setWall(+b.dataset.dw); openDecor(); }));
  $$('[data-df]').forEach((b) => (b.onclick = () => { HOME.setFloor(+b.dataset.df); openDecor(); }));
  $$('[data-ds]').forEach((b) => (b.onclick = () => { HOME.setSlot(b.dataset.ds, +b.dataset.dv); openDecor(); }));
  if (state.panel !== 'houseP') openPanel('houseP');
}
async function ensurePark() {
  if (PARK) return PARK;
  PARK = buildPark({ THREE, scene, toon, ctex, signTex, plane, bake, makeKid, solids, circles, PL, sfx, toast, S, save, updPills, platform, grad, inst, instModel, NATURE, getKid: () => kid, animKid, startAct, inAct: () => !!ACT, input: actInput, shake: (v) => (shake = v), music: (on) => (carouselMusic = on), miniGame, openPrizes, treat: () => {}, goCity });
  try { await renderer.compileAsync(scene, camera); } catch (e) {}
  return PARK;
}
function actInput() { return { gas: PED.gas || K.KeyW || K.ArrowUp || J.y > 0.35 ? 1 : 0, brake: PED.brake || K.KeyS || K.ArrowDown || J.y < -0.35 ? 1 : 0, steer: clamp(-J.x + ((K.KeyA || K.ArrowLeft) ? 1 : 0) - ((K.KeyD || K.ArrowRight) ? 1 : 0), -1, 1) }; }
function startAct(ctrl) {
  if (ACT || PL.mode !== 'walk') return; const res = ctrl.start() || {}; ACT = { ctrl, cam: res.cam, drive: res.drive }; kid.visible = true; PL.vy = 0;
  if (res.drive) { $('#ctl').classList.add('drive'); $('#pedals').classList.add('on'); }
}
function endAct(silent) { if (!ACT) return; const a = ACT; ACT = null; $('#ctl').classList.remove('drive'); $('#pedals').classList.remove('on'); a.ctrl.end(); PL.vy = 0; PL.ground = true; }
function teleport(world, x, z, yaw, label) {
  $('#fadeTx').textContent = label; $('#fade').classList.add('on');
  setTimeout(async () => { if (ACT) endAct(true); if (PL.mode === 'drive') exitCarForce(); if (world === 'park') await ensurePark(); if (world === 'home') ensureHome(); if (world === 'mall') await ensureMall(); if (MALL && WORLD === 'mall' && world !== 'mall') MALL.onLeave(); if (MALL && world === 'mall' && WORLD !== 'mall') MALL.onEnter(); WORLD = world; updGoal(); PL.x = x; PL.z = z; PL.y = 0.12; PL.vy = 0; PL.yaw = yaw; camYaw = yaw; kid.visible = true; updCam(0, true); setTimeout(() => $('#fade').classList.remove('on'), 250); }, 450);
}
function goPark() { teleport('park', PARK_OFF, 96, Math.PI, 'جاري تحميل مدينة الملاهي…'); setTimeout(() => toast('🎡 أهلاً بيك في مدينة الملاهي!'), 1400); }
function goCity() { teleport('city', 90, 2, 0, 'رجوع للمدينة…'); }
// arcade mini-game: tap the targets before the time runs out
function miniGame(kind, done) {
  const el = $('#mg'), area = $('#mgArea'), icons = ['⭐', '🎈', '🍭'][kind] || '⭐'; let score = 0, left = 20, timer = 0, spawnT = 0; area.innerHTML = ''; el.classList.add('on'); state.panel = 'mg';
  $('#mgScore').textContent = 0; $('#mgTime').textContent = left;
  const spawn = () => { const b = document.createElement('button'); b.className = 'mgT'; b.textContent = Math.random() < 0.15 ? '💎' : icons; b.style.left = 5 + Math.random() * 82 + '%'; b.style.top = 5 + Math.random() * 75 + '%'; b.onpointerdown = (e) => { e.preventDefault(); score += b.textContent === '💎' ? 3 : 1; $('#mgScore').textContent = score; sfx.coin(); b.remove(); }; area.appendChild(b); setTimeout(() => b.remove(), 1300); };
  const tick = () => { if (!el.classList.contains('on')) return; spawnT++; spawn(); if (spawnT % 2) spawn(); if (spawnT % 2 === 0) { left--; $('#mgTime').textContent = left; } if (left <= 0) { el.classList.remove('on'); state.panel = null; done(score); return; } timer = setTimeout(tick, 500); };
  tick();
}
// prize counter: trade tickets for things your character can wear
const PRIZES = [{ id: 'balloon', name: 'بالونة لولو', icon: '🎈', cost: 20 }, { id: 'crown', name: 'تاج دهبي', icon: '👑', cost: 40 }, { id: 'glasses', name: 'نضارة نجوم', icon: '🕶️', cost: 30 }, { id: 'wings', name: 'جناحات فراشة', icon: '🦋', cost: 60 }];
function openPrizes() { renderPrizes(); openPanel('prizes'); }
const PRIZE_SLOT = { crown: ['hat', 'crown'], glasses: ['glasses', 'star'], wings: ['bag', 'wings'] };
const prizeOn = (id) => PRIZE_SLOT[id] ? curLook()[PRIZE_SLOT[id][0]] === PRIZE_SLOT[id][1] : (S.equip || []).includes(id);
function prizeToggle(id, on) {
  if (PRIZE_SLOT[id]) { const [k, v] = PRIZE_SLOT[id], L = curLook(); L[k] = on ? v : 'none'; save(); buildPlayer(); return; }
  S.equip = (S.equip || []).filter((x) => x !== id); if (on) S.equip.push(id);
}
function renderPrizes() {
  const own = S.prizes || [], eq = PRIZES.filter((p) => prizeOn(p.id)).map((p) => p.id);
  $('#przList').innerHTML = `<div class="center" style="font-weight:900;margin-bottom:8px">عندك 🎟️ ${S.tickets || 0}</div><div class="hitems">${PRIZES.map((p) => `<button class="hit ${own.includes(p.id) ? 'own' : ''}" data-pz="${p.id}"><span>${p.icon}</span>${p.name}<small>${own.includes(p.id) ? (eq.includes(p.id) ? '✓ لابسها' : 'البسها') : p.cost + ' 🎟️'}</small></button>`).join('')}</div>`;
  $$('[data-pz]').forEach((b) => (b.onclick = () => { const p = PRIZES.find((x) => x.id === b.dataset.pz); S.prizes = S.prizes || []; S.equip = S.equip || [];
    if (!S.prizes.includes(p.id)) { if ((S.tickets || 0) < p.cost) { toast(`محتاج ${p.cost - (S.tickets || 0)} 🎟️ كمان — اركب الألعاب والعب في الأركيد`); return; } S.tickets -= p.cost; S.prizes.push(p.id); prizeToggle(p.id, true); sfx.win(); toast(`${p.icon} مبروك! ${p.name}`); }
    else prizeToggle(p.id, !prizeOn(p.id));
    save(); updPills(); applyEquip(); renderPrizes(); }));
}
let balloonObj = null;
function applyEquip() {
  if (!kid) return; const eq = S.equip || [], head = kid.P.head, body = kid.P.body;
  if (false) { const c = new THREE.Group(); c.name = 'eq_crown'; const band = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.16, 12, 1, true), toon('#ffd23f', { emissive: '#ffae00', emissiveIntensity: 0.3 })); c.add(band); for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; const sp = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 4), toon('#ffd23f')); sp.position.set(Math.cos(a) * 0.26, 0.16, Math.sin(a) * 0.26); c.add(sp); } c.position.y = 0.42; head.add(c); }
  if (false) { const g = new THREE.Group(); g.name = 'eq_glasses'; for (const s2 of [-1, 1]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 5), toon('#ff4fae')); l.rotation.x = Math.PI / 2; l.position.set(s2 * 0.12, 0.03, 0.34); g.add(l); } head.add(g); }
  if (false) { const w = new THREE.Group(); w.name = 'eq_wings'; for (const s2 of [-1, 1]) { const m = new THREE.Mesh(new THREE.CircleGeometry(0.35, 12), new THREE.MeshBasicMaterial({ color: s2 < 0 ? '#ff9fd0' : '#c7a6ff', transparent: true, opacity: 0.85, side: THREE.DoubleSide })); m.scale.set(1, 1.4, 1); m.position.set(s2 * 0.3, 0.35, -0.22); m.rotation.y = s2 * 0.6; w.add(m); } body.add(w); }
  if (balloonObj) { scene.remove(balloonObj); balloonObj = null; }
  if (eq.includes('balloon')) { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), toon('#3fb6ff', { emissive: '#1f7fff', emissiveIntensity: 0.2 })); b.scale.y = 1.2; b.position.y = 1.3; g.add(b); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.3, 4), toon('#ffffff')); st.position.y = 0.65; g.add(st); scene.add(g); balloonObj = g; }
}


// ================= wardrobe: build your own look (studio with a live 3D preview) =================
{ const eq = S.equip || []; for (const [id, k, v] of [['crown', 'hat', 'crown'], ['glasses', 'glasses', 'star'], ['wings', 'bag', 'wings']]) if (eq.includes(id)) { const L = curLook(); L[k] = v; S.equip = S.equip.filter((x) => x !== id); } }
const WTABS = [['body', '🧒', 'أنا'], ['hair', '💇', 'الشعر'], ['top', '👕', 'فوق'], ['bottom', '👖', 'تحت'], ['dress', '👗', 'فساتين'], ['shoes', '👟', 'جزم'], ['hat', '🧢', 'قبعات'], ['glasses', '👓', 'نضارات'], ['bag', '🎒', 'شنط']];
const WD = { on: false, tab: 'body', from: null, yaw: 0.45, av: null, scene: null, cam: null, drag: null, wave: 0 };
function unlocked(it) {
  const k = it.lock; if (!k) return true;
  if (k.prize) return (S.prizes || []).includes(k.prize);
  if (k.mi) return (S.mi || 0) >= k.mi;
  if (k.obby) return (S.obby || 0) >= k.obby;
  return false;
}
function wdInit() {
  if (WD.scene) return; const sc = new THREE.Scene();
  sc.background = ctex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5cc4ff'); gr.addColorStop(0.55, '#b98cff'); gr.addColorStop(1, '#ff8fd0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  sc.add(new THREE.HemisphereLight('#ffffff', '#c9a6ff', 1.7)); const d = new THREE.DirectionalLight('#fff4e0', 2.3); d.position.set(2, 4, 4); sc.add(d);
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.08, 0.24, 40), toon('#ffffff')); ped.position.y = -0.12; sc.add(ped);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.05, 8, 48), toon('#ffd23f', { emissive: '#ffb300', emissiveIntensity: 0.4 })); ring.rotation.x = Math.PI / 2; ring.position.y = -0.01; sc.add(ring);
  const sp = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 });
  WD.sparks = []; for (let i = 0; i < 14; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), sp); s.position.set(sr(-1.6, 1.6), sr(0.2, 2.6), sr(-1.2, -0.4)); sc.add(s); WD.sparks.push(s); }
  WD.scene = sc; WD.cam = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  const spin = $('#wspin');
  spin.addEventListener('pointerdown', (e) => { WD.drag = e.clientX; try { spin.setPointerCapture(e.pointerId); } catch (x) {} });
  spin.addEventListener('pointermove', (e) => { if (WD.drag === null) return; WD.yaw += (e.clientX - WD.drag) * 0.012; WD.drag = e.clientX; });
  const up = () => (WD.drag = null); spin.addEventListener('pointerup', up); spin.addEventListener('pointercancel', up);
}
function wdBuild() { if (WD.av) WD.scene.remove(WD.av); WD.av = AV.makeAvatar(curLook()); WD.scene.add(WD.av); WD.wave = 1.2; }
function wdRender(dt, now) {
  const cam = WD.cam, a = innerWidth / innerHeight, pw = $('#wpanel').getBoundingClientRect().width / innerWidth;
  cam.aspect = a; cam.updateProjectionMatrix();
  const dist = innerHeight < 520 ? 6.2 : 5.2, half = Math.tan((cam.fov * Math.PI) / 360) * dist, ndc = (1 - pw) - 1; // centre of the free area (left side)
  cam.position.set(-ndc * half * a, 1.12, dist); cam.lookAt(-ndc * half * a, 1.05, 0);
  const k = WD.av; if (k) {
    if (WD.drag === null) WD.yaw = angLerp(WD.yaw, 0.35 + Math.sin(now / 2200) * 0.35, dt * 0.8);
    k.rotation.y = WD.yaw; animKid(k, 0, dt, false);
    if (WD.wave > 0) { WD.wave -= dt; k.P.arms[1].rotation.z = 2.5 + Math.sin(now / 90) * 0.35; k.P.arms[1].rotation.x = 0; }
  }
  WD.sparks.forEach((s, n) => { s.rotation.y += dt * 2; s.position.y += Math.sin(now / 600 + n) * 0.002; });
  renderer.render(WD.scene, cam);
}
function openWard() {
  wdInit(); WD.from = state.play ? 'play' : 'choose'; WD.on = true;
  if (WD.from === 'play') { state.panel = 'ward'; $('#hud').classList.remove('on'); $('#ctl').classList.remove('on'); ['pause', 'settings', 'prizes'].forEach((k) => $('#' + k).classList.remove('on')); }
  else { $('#choose').classList.remove('on'); if (CS) CS.close(); }
  $('#ward').classList.add('on'); wdBuild(); renderWard();
}
function closeWard() {
  WD.on = false; $('#ward').classList.remove('on'); save(); buildPlayer();
  if (WD.from === 'play') { state.panel = null; $('#hud').classList.add('on'); $('#ctl').classList.add('on'); toast('✨ شكلك الجديد يجنّن!'); }
  else { if (CS) CS.dropThumb(S.char); openCharSel(true); }
}
function renderWard() {
  const L = curLook(); L.c = L.c || {};
  $('#wtabs').innerHTML = WTABS.map(([id, ic, n]) => `<button class="${WD.tab === id ? 'on' : ''}" data-wt="${id}"><b>${ic}</b>${n}</button>`).join('');
  const sw = (slot, list, cur) => `<div class="wsw">${list.map((c) => `<button style="background:${c}" class="${cur === c ? 'on' : ''}" data-wc="${slot}" data-v="${c}"></button>`).join('')}</div>`;
  const items = (slot) => `<div class="witems">${WARD[slot].map((it) => { const ok = unlocked(it); return `<button class="${L[slot] === it.id ? 'on' : ''} ${ok ? '' : 'lk'} ${it.lock ? 'rare' : ''}" data-ws="${slot}" data-v="${it.id}"><b>${ok ? it.i : '🔒'}</b>${it.n}${it.lock ? `<small>${ok ? '⭐ نادر' : it.lock.t}</small>` : ''}</button>`; }).join('')}</div>`;
  const T = WD.tab; let h = '';
  if (T === 'body') h = `<div class="wh">اسمي</div><button class="big3d nmBtn" data-a="name" style="font-size:16px;padding:6px 18px">✏️ ${myName()}</button><div class="wh">ولد ولا بنت؟</div><div class="wg"><button class="${L.g === 'boy' ? 'on' : ''}" data-wg="boy">👦 ولد</button><button class="${L.g === 'girl' ? 'on' : ''}" data-wg="girl">👧 بنت</button></div>
      <div class="wh">لون البشرة</div><div class="wsw big">${SKIN.map((c, n) => `<button style="background:${c}" class="${L.skin === n ? 'on' : ''}" data-wk="${n}"></button>`).join('')}</div>
      <div class="wh">الوش</div>${items('face')}`;
  else if (T === 'hair') h = `<div class="wh">التسريحة</div>${items('hair')}<div class="wh">${L.hair === 'hijab' ? 'لون الحجاب' : 'لون الشعر'}</div>${sw('hair', L.hair === 'hijab' ? PAL : HAIRC, L.c.hair)}`;
  else if (T === 'top') h = `${L.dress !== 'none' ? '<div class="wnote">👗 إنت لابس فستان — اختار "من غير" في الفساتين علشان تلبس دول</div>' : ''}<div class="wh">النوع</div>${items('top')}<div class="wh">اللون</div>${sw('top', PAL, L.c.top)}<div class="wh">رسمة على الصدر</div>${items('print')}`;
  else if (T === 'bottom') h = `${L.dress !== 'none' ? '<div class="wnote">👗 إنت لابس فستان — اختار "من غير" في الفساتين علشان تلبس دول</div>' : ''}<div class="wh">النوع</div>${items('bottom')}<div class="wh">اللون</div>${sw('bottom', PAL, L.c.bottom)}`;
  else h = `<div class="wh">${WTABS.find((t) => t[0] === T)[2]}</div>${items(T)}${L[T] && L[T] !== 'none' && !['crown', 'tiara', 'star', 'gold', 'wings'].includes(L[T]) ? `<div class="wh">اللون</div>${sw(T, PAL, L.c[T])}` : ''}`;
  $('#wbody').innerHTML = h; $('#wname').textContent = myName();
}
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-wt],[data-ws],[data-wc],[data-wg],[data-wk]'); if (!t || !WD.on) return;
  const L = curLook(); sfx.click();
  if (t.dataset.wt) { WD.tab = t.dataset.wt; renderWard(); $('#wbody').scrollTop = 0; return; }
  if (t.dataset.ws) {
    const slot = t.dataset.ws, it = WARD[slot].find((x) => x.id === t.dataset.v);
    if (!unlocked(it)) { toast(`🔒 ${it.n}: ${it.lock.t}`); return; }
    L[slot] = it.id; if (slot === 'top' || slot === 'bottom') L.dress = 'none';
    if (it.lock) { sfx.win(); toast(`⭐ ${it.n} — قطعة نادرة!`); }
  } else if (t.dataset.wc) L.c[t.dataset.wc] = t.dataset.v;
  else if (t.dataset.wk) L.skin = +t.dataset.wk;
  else if (t.dataset.wg && L.g !== t.dataset.wg) { L.g = t.dataset.wg; if (L.g === 'boy') { if (!['short', 'spiky', 'curly', 'side'].includes(L.hair)) L.hair = 'short'; L.dress = 'none'; if (['skirt', 'longskirt'].includes(L.bottom)) L.bottom = 'pants'; } else if (['short', 'spiky', 'side'].includes(L.hair)) L.hair = 'long'; }
  save(); wdBuild(); renderWard();
});

// ================= character selection screen (LOLO_CHARSEL_2026) =================
let CS = null;
function openCharSel(refresh) {
  if (!CS) CS = initCharSel({
    renderer, toon, ctex, AV, WARD, sfx,
    look: (i) => { if (!S.looks || typeof S.looks !== 'object') S.looks = {}; return S.looks[i] || cloneLook(PRESETS[i]); },
    name: (i) => cleanName(nicks()[i]) || CHARS[i].name,
    current: () => S.char, setCurrent: (i) => { S.char = i; save(); },
    soundOn: () => !!S.sound, toggleSound: () => { S.sound = !S.sound; save(); if (eng) eng.g.gain.value = 0; },
    openSettings: () => { $('#settings').classList.add('on'); renderSettings(); state.panel = 'settings'; },
    openName: () => openName(), openWard: () => openWard(),
    goHome: () => { CS.close(); showOnly('start'); },
    onChoose: () => { buildPlayer(); kid.position.set(PL.x, 0.12, PL.z); CS.close(); MapSelectionManager.open(); },
  });
  ['start', 'choose', 'maps', 'mapPrev', 'hud', 'ctl'].forEach((k) => $('#' + k).classList.remove('on'));
  if (refresh) CS.refresh();
  CS.open();
}

// ================= UI =================
const state = { play: false, talk: false, panel: null };
function updPills() { $('#coinN').textContent = S.coins.toLocaleString('en'); $('#gemN').textContent = S.gems; $('#tkN').textContent = S.tickets || 0; }
let toastT = 0; function toast(t) { const e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove('on'), 2400); }
function showOnly(id) { if (CS && CS.on && id !== 'csel') CS.close(); if (id !== 'hud') { const mh = document.getElementById('mallHud'); if (mh) mh.classList.remove('on'); } ['start', 'choose', 'maps', 'mapPrev', 'hud', 'ctl', 'missions', 'garage', 'bigmap', 'pause', 'settings', 'houseP', 'prizes', 'friends', 'vsres'].forEach((k) => $('#' + k).classList.toggle('on', k === id)); }
let prevPanel = null;
function openPanel(id) {
  if (id === 'missions') renderMissions(); if (id === 'garage') renderGarage(); if (id === 'bigmap') drawBig(); if (id === 'settings') renderSettings();
  prevPanel = state.panel; state.panel = id; $('#' + id).classList.add('on'); ['missions', 'garage', 'bigmap', 'pause', 'settings', 'houseP', 'prizes', 'friends', 'vsres'].forEach((k) => k !== id && $('#' + k).classList.remove('on'));
}
function closePanel() { if (state.panel) $('#' + state.panel).classList.remove('on'); state.panel = null; }
// ----- the kid's own name (first name only, letters only, checked again by the server) -----
const BAD = ['حمار', 'كلب', 'غبي', 'وسخ', 'زفت', 'خول', 'متناك', 'شرموط', 'عرص', 'منيك', 'كس', 'زب', 'طيز', 'نيك', 'خرا', 'fuck', 'shit', 'sex', 'dick', 'ass', 'bitch', 'porn', 'kos', 'zeb', 'sharmo'];
function cleanName(s) {
  const w = (String(s || '').trim().split(/\s+/)[0] || '').replace(/[^\u0621-\u064Aa-zA-Z]/g, '').slice(0, 12);
  if (w.length < 2) return ''; const low = w.toLowerCase(); if (BAD.some((b) => (b.length > 3 ? low.includes(b) : low === b))) return ''; return w;
}
function nicks() { if (!S.nicks || typeof S.nicks !== 'object') { S.nicks = {}; if (cleanName(S.nick)) S.nicks[S.char] = S.nick; } return S.nicks; }
function myName() { return cleanName(nicks()[S.char]) || CHARS[S.char].name; }
let appNames = null;
async function loadAppNames() { // names of the kids on this app account (if the app sent a token)
  if (appNames) return appNames; appNames = [];
  const tok = new URLSearchParams(location.search).get('token'); if (!tok) return appNames;
  const found = new Set(), walk = (o, d = 0) => { if (!o || d > 5) return; if (Array.isArray(o)) return o.forEach((x) => walk(x, d + 1)); if (typeof o !== 'object') return;
    for (const k of ['name', 'firstName', 'first_name', 'childName', 'child_name', 'nickname', 'username']) { const v = cleanName(o[k]); if (v) found.add(v); }
    for (const v of Object.values(o)) if (v && typeof v === 'object') walk(v, d + 1); };
  try { const r = await fetch('/api/users/childs', { headers: { 'x-auth': tok, Accept: 'application/json' } }); if (r.ok) walk(await r.json()); } catch (e) {}
  return (appNames = [...found].slice(0, 6));
}
function openName() {
  const inp = $('#nmIn'); inp.value = cleanName(nicks()[S.char]) || ''; $('#nmErr').textContent = ''; $('#nameP').classList.add('on');
  $('#nmApp').innerHTML = ''; loadAppNames().then((l) => { $('#nmApp').innerHTML = l.length ? `<div class="nmh">اسمك في التطبيق:</div>` + l.map((n) => `<button class="big3d v" data-nm="${n}">👤 ${n}</button>`).join('') : ''; });
  inp.onkeydown = (e) => { if (e.key === 'Enter') saveName(inp.value); };
  inp.oninput = () => ($('#nmErr').textContent = '');
  setTimeout(() => inp.focus(), 150);
}
function saveName(v) {
  const raw = String(v || '').trim(); if (!raw) { delete nicks()[S.char]; S.nick = ''; save(); $('#nameP').classList.remove('on'); renderChoose(); return; }
  const n = cleanName(raw); if (!n) { $('#nmErr').textContent = 'اكتب اسمك الأول بس، بحروف من غير أرقام أو رموز 🙂'; return; }
  nicks()[S.char] = n; S.nick = n; save(); $('#nameP').classList.remove('on'); renderChoose(); if (WD.on) renderWard(); toast(`👋 أهلاً يا ${n}!`); sfx.win();
}
document.addEventListener('click', (e) => { const b = e.target.closest('[data-nm]'); if (b) saveName(b.dataset.nm); });
function renderChoose() { if (CS && CS.on) CS.open(); $$('.chars .c').forEach((b) => { const on = +b.dataset.ch === S.char; b.classList.toggle('sel', on); if (on && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }); $('#charName').textContent = myName(); $('#nmBtn').textContent = cleanName(nicks()[S.char]) ? '✏️ غيّر الاسم' : '✏️ سمّي الشخصية'; }
const CARS_SHOP = [{ id: 'pink', name: 'البينك الرياضية', cost: 0 }, { id: 'yellow', name: 'الصفرا السريعة', cost: 300 }, { id: 'blue', name: 'الزرقا اللامعة', cost: 500 }, { id: 'orange', name: 'البرتقاني', cost: 800 }];
let gSel = S.car;
function renderGarage() {
  const c = CARS_SHOP.find((x) => x.id === gSel), own = S.owned.includes(gSel);
  $('#gHero').src = `assets/ui/car_${gSel}.webp`; $('#gInfo').textContent = c.name;
  $('#gRow').innerHTML = CARS_SHOP.map((x) => `<button class="${x.id === gSel ? 'on' : ''}" data-gc="${x.id}"><img src="assets/ui/car_${x.id}.webp" alt=""><span>${S.owned.includes(x.id) ? (S.car === x.id ? '✓ مستخدمة' : 'عندك') : x.cost + ' 🪙'}</span></button>`).join('');
  $('#gBtn').textContent = own ? (S.car === gSel ? '✓ دي عربيتك دلوقتي' : '🚗 استخدمها') : `اشتريها بـ ${c.cost} 🪙`;
  $$('[data-gc]').forEach((b) => (b.onclick = () => { gSel = b.dataset.gc; sfx.click(); renderGarage(); }));
}
$('#gBtn').onclick = () => {
  const c = CARS_SHOP.find((x) => x.id === gSel);
  if (!S.owned.includes(gSel)) { if (S.coins < c.cost) { toast(`محتاج ${c.cost - S.coins} 🪙 كمان — لِم عملات وخلّص مهام`); return; } S.coins -= c.cost; S.owned.push(gSel); sfx.win(); }
  S.car = gSel; save(); updPills(); CAR.mesh.bodyMat.color.set(CAR_COLORS[S.car]); renderGarage();
};
function renderSettings() { $('#sSound').textContent = S.sound ? '🔊 الصوت: شغال' : '🔇 الصوت: مقفول'; $('#sQual').textContent = S.q === 'high' ? '✨ الجرافيك: عالي' : '⚡ الجرافيك: خفيف (أسرع)'; }
// ================= map registry + selection manager =================
// MapData: mapId, ArabicName, EnglishName, Thumbnail, SceneName, IsUnlocked(), Description
const MAP_DATA = [
  { mapId: 1, ArabicName: 'جولة حرة', EnglishName: 'Free Roam', SceneName: 'city', Description: 'المدينة كلها مفتوحة: لف بالرجلين أو بالعربية، كمّل مهامك ولِم العملات والجواهر.', spawn: null, unlock: () => true },
  { mapId: 16, ArabicName: 'مول العرب', EnglishName: 'Mall of Arabia', SceneName: 'mall', Description: 'اكتشف مول العرب، وجهتك الضخمة للتسوق والترفيه والمغامرات! تجول بين المتاجر، تعرف على المنتجات، قابل البائعين، استمتع بالسينما والملاهي، واكتشف مدينة التلج الساحرة.', spawn: 'mall', unlock: () => true },
  { mapId: 2, ArabicName: 'مدينة الملاهي', EnglishName: 'Amusement Park', SceneName: 'park', Description: 'مدينة ملاهي كاملة: عجلة دوارة، قطار ملاهي، كاروسيل، عربيات تصادم، حديقة مائية بزحاليق، أركيد ومنطقة أكل. اكسب تذاكر 🎟️ ونجوم ⭐ واشتري جوايز!', spawn: 'park', unlock: () => seen('fair') || S.mi >= 6, hint: 'زور مدينة الملاهي في الجولة الحرة' },
  { mapId: 3, ArabicName: 'المدرسة', EnglishName: 'School', SceneName: 'city', Description: 'مدرسة لولو وأبلة نور مستنياك قدام الباب.', spawn: { x: 30, z: 2, yaw: 0 }, unlock: () => seen('school') || S.mi >= 6, hint: 'زور المدرسة في الجولة الحرة' },
  { mapId: 4, ArabicName: 'البيت', EnglishName: 'Home', SceneName: 'city', Description: 'بيتك وجنينتك: غيّر الألوان واشتري ألعاب للجنينة.', spawn: 'home', unlock: () => !!S.house, hint: 'اشتري بيت في الحي السكني' },
  { mapId: 5, ArabicName: 'الشارع', EnglishName: 'Street', SceneName: 'city', Description: 'ابدأ وانت سايق العربية في الشارع الكبير 🚗', spawn: 'street', unlock: () => !!S.drove, hint: 'اركب العربية البينك مرة' },
  { mapId: 6, ArabicName: 'الشاطئ', EnglishName: 'Beach', SceneName: 'city', Description: 'رملة ونخل وشماسي ومنارة، ودوّر على الصدف البينك 🐚', spawn: { x: 0, z: 172, yaw: 0 }, unlock: () => seen('beach'), hint: 'زور الشاطئ في الجولة الحرة' },
  { mapId: 7, ArabicName: 'عالم الثلج', EnglishName: 'Snow World', SceneName: null, Description: 'قلعة التلج والبطاريق… بنجهّزها!' },
  { mapId: 8, ArabicName: 'عالم الفضاء', EnglishName: 'Space World', SceneName: null, Description: 'صاروخ ومحطة فضاء ونجوم… قريبًا!' },
  { mapId: 9, ArabicName: 'عالم الديناصورات', EnglishName: 'Dinosaur World', SceneName: null, Description: 'ديناصورات طيبة وبركان… قريبًا!' },
  { mapId: 10, ArabicName: 'قصر الأميرات', EnglishName: 'Princess Castle', SceneName: null, Description: 'قصر وردي وقوس قزح… قريبًا!' },
  { mapId: 11, ArabicName: 'المزرعة', EnglishName: 'Farm', SceneName: null, Description: 'بقرة وفراخ وطاحونة… قريبًا!' },
  { mapId: 12, ArabicName: 'مول لولو', EnglishName: 'LOLO Mall', SceneName: 'city', Description: 'قدام مول لولو البنفسجي (جوه المول بيتجهّز).', spawn: { x: -64, z: -30, yaw: -Math.PI / 2 }, unlock: () => seen('mall') || S.mi >= 3, hint: 'زور مول لولو في الجولة الحرة' },
  { mapId: 13, ArabicName: 'المدينة المائية', EnglishName: 'Water Park', SceneName: null, Description: 'زحاليق مياه وحمامات سباحة… قريبًا!' },
  { mapId: 14, ArabicName: 'حلبة السباق', EnglishName: 'Racing Track', SceneName: 'lolo-drive', Description: 'سباقات حقيقية ضد عربيات تانية في لعبة لولو درايف 🏁', unlock: () => !!S.drove, hint: 'سوق العربية مرة في الجولة الحرة' },
  { mapId: 15, ArabicName: 'الغابة السحرية', EnglishName: 'Magic Forest', SceneName: null, Description: 'شجرة سحرية وكريستال… قريبًا!' },
].map((m) => Object.assign(m, { Thumbnail: `assets/maps/m${String(m.mapId).padStart(2, '0')}.webp`, IsUnlocked: () => !!m.SceneName && (!m.unlock || m.unlock()) }));
function seen(z) { return (S.seen || []).includes(z); }
function zoneOf(x, z) {
  if (z > 160) return 'beach';
  const b = onBlock(x, z); if (!b) return null; const t = blockType[b[0] + ',' + b[1]];
  return t === 'fair' || t === 'fair2' ? 'fair' : t === 'homes' ? 'homes' : t === 'mall' || t === 'school' || t === 'police' ? t : null;
}
const MapSelectionManager = {
  selected: null,
  status(m) { return !m.SceneName ? 'soon' : m.IsUnlocked() ? 'ok' : 'lock'; },
  render() {
    const known = S.mapsKnown || [];
    $('#mgrid').innerHTML = MAP_DATA.map((m, n) => {
      const st = this.status(m), isNew = st === 'ok' && m.mapId !== 1 && !known.includes(m.mapId);
      return `<button class="mcard ${st === 'ok' ? '' : st === 'soon' ? 'soon' : 'locked'} ${this.selected === m.mapId ? 'sel' : ''}" data-map="${m.mapId}" style="animation-delay:${n * 0.03}s">
        <img src="${m.Thumbnail}" alt="" loading="lazy">${st === 'lock' ? `<div class="lock"><b>🔒</b><span>${m.hint}</span></div>` : ''}${st === 'soon' ? '<span class="soonTag">قريبًا</span>' : ''}${isNew ? '<span class="newTag">جديد!</span>' : ''}
        <span class="nm">${m.ArabicName}</span></button>`;
    }).join('');
  },
  open() { state.play = false; closePanel(); if (PL.mode === 'drive') exitCarForce(); showOnly('maps'); $('#ctl').classList.remove('on'); this.render(); },
  select(id) {
    this.selected = id; const m = MAP_DATA.find((x) => x.mapId === id), st = this.status(m);
    $$('.mcard').forEach((c) => c.classList.toggle('sel', +c.dataset.map === id));
    $('#pImg').src = m.Thumbnail; $('#pName').textContent = `${m.mapId}. ${m.ArabicName}`; $('#pEn').textContent = m.EnglishName; $('#pDesc').textContent = m.Description;
    const ps = $('#pSt'); ps.className = 'pst ' + st; ps.textContent = st === 'ok' ? '✅ مفتوحة' : st === 'soon' ? '🚧 قريبًا' : '🔒 ' + m.hint;
    $('#pPlay').disabled = st !== 'ok'; $('#mapPrev').classList.add('on');
    if (st === 'ok') { S.mapsKnown = [...new Set([...(S.mapsKnown || []), id])]; save(); }
  },
  play(id = this.selected) {
    const m = MAP_DATA.find((x) => x.mapId === id); if (!m || this.status(m) !== 'ok') return false;
    $('#mapPrev').classList.remove('on'); $('#fadeTx').textContent = `جاري تحميل ${m.ArabicName}…`; $('#fade').classList.add('on');
    if (m.SceneName === 'lolo-drive') { setTimeout(() => (location.href = '../lolo-drive/'), 450); return true; }
    setTimeout(async () => {
      let sp = m.spawn;
      const prevW = WORLD;
      if (m.SceneName === 'mall') { await ensureMall(); sp = MALL.SPAWN; WORLD = 'mall'; if (prevW !== 'mall') MALL.onEnter(); } else if (m.SceneName === 'park') { await ensurePark(); sp = PARK.SPAWN; WORLD = 'park'; } else { if (WORLD !== 'city' || PL.x > 1000 || PL.x < -1000) { PL.x = 90; PL.z = 2; PL.yaw = 0; } WORLD = 'city'; }
      if (MALL && prevW === 'mall' && WORLD !== 'mall') MALL.onLeave();
      if (ACT) endAct(true);
      if (sp === 'home') { const h = myHouse(); sp = h ? { x: h.x + 2, z: h.z + h.dir * 9, yaw: h.dir > 0 ? Math.PI : 0 } : null; }
      if (sp === 'street') { CAR.x = 3.5; CAR.z = -100; CAR.yaw = 0; CAR.v = 0; syncCar(0); sp = { x: CAR.x - 2.5, z: CAR.z, yaw: 0 }; }
      if (sp) { PL.x = sp.x; PL.z = sp.z; PL.y = 0.12; PL.vy = 0; PL.yaw = sp.yaw; }
      begin(); if (m.spawn === 'street') enterCar();
      toast(`📍 ${m.ArabicName}`);
      setTimeout(() => $('#fade').classList.remove('on'), 250);
    }, 450);
    return true;
  },
};
function exitCarForce() { CAR.v = 0; PL.mode = 'walk'; kid.visible = true; $('#ctl').classList.remove('drive'); $('#pedals').classList.remove('on'); $('#speed').classList.remove('on'); }
let zoneT = 0;
function trackZones(dt) {
  if ((zoneT += dt) < 0.5) return; zoneT = 0;
  const z = zoneOf(PL.x, PL.z); if (!z || seen(z)) return;
  const before = MAP_DATA.filter((m) => m.IsUnlocked()).length;
  S.seen = [...(S.seen || []), z]; save();
  const after = MAP_DATA.filter((m) => m.IsUnlocked());
  if (after.length > before) { const nm = after.find((m) => !(S.mapsKnown || []).includes(m.mapId) && m.mapId !== 1); if (nm) toast(`🗺️ خريطة جديدة اتفتحت: ${nm.ArabicName}`); }
}

function begin() {
  buildPlayer(); state.play = true; showOnly('hud'); $('#ctl').classList.add('on'); updPills(); updGoal();
  PL.mode = 'walk'; kid.visible = true; $('#ctl').classList.remove('drive'); $('#pedals').classList.remove('on'); $('#speed').classList.remove('on');
  camYaw = PL.yaw; updCam(0, true);
  if (S.mi === 0) setTimeout(() => toast('👋 روح للنافورة وكلّم لولو'), 600);
  if (MIS[S.mi] && MIS[S.mi].id === 'balloons') spawnBalloons();
  if (MIS[S.mi] && MIS[S.mi].id === 'beach') spawnShells();
  applyHouse();
}
document.addEventListener('click', (e) => {
  const mc = e.target.closest('[data-map]'); if (mc) { audioStart(); sfx.click(); MapSelectionManager.select(+mc.dataset.map); return; }
  const ch = e.target.closest('[data-ch]'); if (ch) { S.char = +ch.dataset.ch; save(); renderChoose(); sfx.click(); return; }
  const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a; audioStart(); sfx.click();
  if (a === 'choose') openCharSel();
  else if (a === 'prevChar') { S.char = (S.char + CHARS.length - 1) % CHARS.length; save(); renderChoose(); }
  else if (a === 'nextChar') { S.char = (S.char + 1) % CHARS.length; save(); renderChoose(); }
  else if (a === 'begin') begin();
  else if (a === 'toMaps') MapSelectionManager.open();
  else if (a === 'closePrev') $('#mapPrev').classList.remove('on');
  else if (a === 'playMap') MapSelectionManager.play();
  else if (a === 'exit') { history.length > 1 ? history.back() : (location.href = '/'); }
  else if (a === 'settings') { if (!state.play) { $('#settings').classList.add('on'); renderSettings(); state.panel = 'settings'; } else openPanel('settings'); }
  else if (a === 'back') { closePanel(); if (state.play) openPanel('pause'); }
  else if (a === 'sound') { S.sound = !S.sound; save(); renderSettings(); if (eng) eng.g.gain.value = 0; }
  else if (a === 'quality') { S.q = S.q === 'high' ? 'low' : 'high'; save(); applyQuality(); renderSettings(); }
  else if (a === 'reset') { if (confirmReset()) { localStorage.removeItem(KEY); location.reload(); } }
  else if (a === 'pause' || a === 'missions' || a === 'map' || a === 'garage') openPanel(a === 'map' ? 'bigmap' : a);
  else if (a === 'home') goHome();
  else if (a === 'close') closePanel();
  else if (a === 'menu') { vsQuit(); closePanel(); state.play = false; if (PL.mode === 'drive') { PL.mode = 'walk'; kid.visible = true; } showOnly('start'); }
  else if (a === 'dlgNext') nextLine();
  else if (a === 'ward') openWard();
  else if (a === 'name') openName();
  else if (a === 'nmSave') saveName($('#nmIn').value);
  else if (a === 'nmReset') saveName('');
  else if (a === 'nmClose') $('#nameP').classList.remove('on');
  else if (a === 'friends') openFriends();
  else if (a === 'emo') $('#emo').classList.toggle('on');
  else if (a === 'vsQuit') vsQuit();
  else if (a === 'wDone') closeWard();
  else if (a === 'wRand') { const L = AV.randomLook(curLook().g); S.looks[S.char] = L; save(); wdBuild(); renderWard(); }
});
let resetArm = 0; function confirmReset() { if (performance.now() - resetArm < 3000) return true; resetArm = performance.now(); toast('اضغط تاني علشان تمسح التقدم كله'); return false; }


// adaptive quality: step down automatically on slow devices
const AQ = { t: 0, n: 0, lvl: 0, base: 1 };
function adapt(dt) {
  AQ.t += dt; AQ.n++; if (AQ.t < 3) return;
  const fps = AQ.n / AQ.t; AQ.t = 0; AQ.n = 0;
  if (fps < 40 && AQ.lvl < 4) {
    AQ.lvl++;
    if (AQ.lvl === 1) bloomOff = true;
    else if (AQ.lvl === 2) renderer.setPixelRatio(Math.max(0.75, renderer.getPixelRatio() * 0.8));
    else if (AQ.lvl === 3) { sun.shadow.mapSize.set(512, 512); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    else renderer.setPixelRatio(Math.max(0.6, renderer.getPixelRatio() * 0.8));
    resize(); console.info('quality step', AQ.lvl, Math.round(fps));
  }
}
let bloomOff = false;
const draw = () => { const fx = !!(S.q === 'high' && composer && !bloomOff); if (canvas.__fx !== fx) { canvas.__fx = fx; canvas.style.filter = fx ? '' : 'saturate(1.25) contrast(1.06)'; } return fx ? composer.render() : renderer.render(scene, camera); };
// ================= loop =================
let last = performance.now(), mapT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!ready) return;
  if (WD.on) { NET.tick(now); wdRender(dt, now); return; }
  if (CS && CS.on) { NET.tick(now); CS.render(dt, now); return; }
  if (MALL && MALL.viewOn) { NET.tick(now); MALL.renderView(dt, now); return; }
  waterTex.offset.x = now / 60000; waterTex.offset.y = now / 90000;
  lolo.position.y = 3.6 + Math.sin(now / 600) * 0.4; lolo.update(now / 1000); if (kid) lolo.rotation.y = angLerp(lolo.rotation.y, Math.atan2(kid.position.x - lolo.position.x, kid.position.z - lolo.position.z), 0.04); loloGlow.material.opacity = 0.25 + Math.sin(now / 600) * 0.1;
  if (window.__wheel) { const { fw, cabins } = window.__wheel; wheelA += dt * (RIDE.on ? 0.45 : 0.11); fw.rotation.z = wheelA; cabins.forEach((c) => (c.rotation.z = -fw.rotation.z)); }
  updPlats(dt, now); HOUSES.forEach((h) => { if (h.swingSeat) h.swingSeat.rotation.x = Math.sin(now / 700) * 0.5; });
  if (window.__boat) { const a = now / 40000; window.__boat.position.set(Math.cos(a) * 260, -0.5, Math.sin(a) * 260); window.__boat.rotation.y = -a; }
  if (window.__tl) { const ph = Math.floor(now / 3000) % 3; window.__tl.forEach((g) => g.forEach((m, n) => m.scale.setScalar(n === ph ? 1.3 : 0.6))); }
  NET.tick(now);
  if (!state.play) {
    const t = now / 14000; if (window.__dbg) { camera.position.set(0.1, 70, 30); camera.lookAt(0, 0, 30); } else { camera.position.set(Math.sin(t) * 150 - 30, 70, Math.cos(t) * 150); camera.lookAt(-10, 6, 0); }
    sun.position.set(60, 120, 40); sun.target.position.set(0, 0, 0); updNPC(dt, now); draw(); return;
  }
  if (!state.panel) {
    if (ACT) { if (!ACT.ctrl.update(dt)) endAct(); } else if (RIDE.on) updRide(dt); else if (PL.mode === 'walk') updWalk(dt); else updDrive(dt);
    if (WORLD === 'city') { updObby(dt); trackZones(dt); }
    updNPC(dt, now); updCollect(now); updMission(now);
    if (eng) { const sp = PL.mode === 'drive' ? Math.abs(CAR.v) : 0, t = AC.currentTime; eng.o.frequency.setTargetAtTime(45 + sp * 4.5, t, 0.05); eng.g.gain.setTargetAtTime(S.sound && PL.mode === 'drive' ? 0.05 : 0, t, 0.1); }
  } else if (eng) eng.g.gain.value = 0;
  if (MALL) { MALL.update(dt, now, WORLD === 'mall'); if (WORLD === 'mall' && (goalT += dt) > 1) { goalT = 0; updGoal(); } }
  if (PARK) { PARK.update(dt, now); if ((goalT += dt) > 1) { goalT = 0; if (WORLD === 'park') updGoal(); } }
  if (balloonObj && kid) { const rx = Math.cos(PL.yaw) * 0.35, rz = -Math.sin(PL.yaw) * 0.35; balloonObj.position.set(kid.position.x - rx, kid.position.y + 1.0 + Math.sin(now / 500) * 0.1, kid.position.z - rz); balloonObj.rotation.z = Math.sin(now / 700) * 0.1; }
  NET.update(dt); updVs(dt, now); updGuide();
  if (window.__sky) window.__sky.position.copy(camera.position);
  updCam(dt); adapt(dt);
  if ((mapT += dt) > 0.12) { mapT = 0; drawMini(); }
  draw();
}
applyQuality();
buildPlayer(); buildCar(); kid.position.set(PL.x, 0.12, PL.z); kid.rotation.y = PL.yaw;
updPills();
mini.addEventListener('click', () => state.play && openPanel('bigmap'));
$('#bm').addEventListener('click', (e) => { // tap a friend on the big map -> yellow arrow to him
  if (WORLD !== 'city') return; const c = $('#bm'), r = c.getBoundingClientRect(), s = c.width / 380, x = ((e.clientX - r.left) / r.width * c.width - c.width / 2) / s, z = ((e.clientY - r.top) / r.height * c.height - c.height / 2) / s;
  let best = null, bd = 18; for (const [id, o] of NET.others) { const d = Math.hypot(o.x - x, o.z - z); if (o.vis && d < bd) { bd = d; best = [id, o]; } }
  if (best) { GUIDE.id = best[0]; closePanel(); toast(`📍 امشي ورا السهم لحد ${best[1].name}`); }
});
requestAnimationFrame(frame);
let ready = false;
Promise.allSettled([
  loadCity().catch((e) => { console.warn('city kit failed, using simple city', e); simpleRoads.forEach((m) => (m.visible = true)); KLOTS.forEach((L) => L.fb()); }),
  loadNature().catch((e) => console.warn('nature kit failed', e)),
]).then(async () => {
  // compile every shader while the loading screen is still up, so the game never freezes on the first frames
  camera.position.set(-30, 70, 150); camera.lookAt(-10, 6, 0);
  try { await renderer.compileAsync(scene, camera); } catch (e) { try { renderer.compile(scene, camera); } catch (x) {} }
  draw(); ready = true; setTimeout(() => $('#load').classList.add('hide'), 150);
});
window.LOLO_WORLD = { get HOME() { return HOME; }, enterHouse, HOUSES, PL, get S() { return S; }, get PARK() { return PARK; }, get WORLD() { return WORLD; }, get ACT() { return ACT; }, goPark, goCity, startAct, endAct, MAP_DATA, MapSelectionManager, RIDE, OB, SH: SHELLS, census: () => { const c = {}; scene.traverse((o) => { if (!o.isMesh || !o.visible) return; let p = o, vis = true; while (p) { if (!p.visible) vis = false; p = p.parent; } if (!vis) return; const top = (() => { let q = o; while (q.parent && q.parent !== scene) q = q.parent; return q; })(); const k = (o.isInstancedMesh ? 'I:' : '') + (top === o ? 'direct:' + o.geometry.type + ':' + o.material.type : 'group:' + (top.name || top.type) + ':' + top.children.length); c[k] = (c[k] || 0) + 1; }); return JSON.stringify(Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 25)); }, prof: () => { renderer.info.autoReset = false; renderer.info.reset(); const t = performance.now(); renderer.render(scene, camera); const r = Object.assign({ ms: +(performance.now() - t).toFixed(1) }, renderer.info.render); renderer.info.autoReset = true; let meshes = 0, inst = 0, shadowCasters = 0; scene.traverse((o) => { if (o.isMesh) { meshes++; if (o.isInstancedMesh) inst++; if (o.castShadow && o.visible) shadowCasters++; } }); return Object.assign(r, { meshes, inst, shadowCasters, camBlock: camBlock.length, solids: solids.length, circles: circles.length }); }, dbgInst: () => { const out = []; scene.traverse((o) => { if (o.isInstancedMesh && o.material && o.material.name) { o.geometry.computeBoundingBox(); const m = new THREE.Matrix4(); o.getMatrixAt(0, m); const p = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(); m.decompose(p, q, sc); const bb = o.geometry.boundingBox; out.push([o.material.name, o.count, [bb.min.x, bb.min.y, bb.max.x, bb.max.y].map((v) => +v.toFixed(2)), [p.x, p.y, p.z, sc.x, sc.y, sc.z].map((v) => +v.toFixed(2)), o.visible, o.material.visible, o.material.opacity, o.material.transparent, o.material.alphaTest]); } }); return JSON.stringify(out); }, dbgLeaves: () => { const out = []; scene.traverse((o) => { if (o.isInstancedMesh && o.material && o.material.alphaTest) { const m = o.material; out.push([m.name, o.count, m.alphaTest, m.side, m.map && m.map.image && m.map.image.width, m.color && m.color.getHexString(), o.geometry.attributes.color ? 'vc' : '', o.geometry.attributes.position.count]); } }); return JSON.stringify(out); }, info: () => JSON.stringify(renderer.info.render), setCam: (y, p) => { camYaw = y; camPitch = p; lastDrag = performance.now() + 1e5; }, S, PL, CAR, MIS, begin, enterCar, exitCar, completeMission, get state() { return state; }, LAND };
window.__LW = { NET, PL, S, curLook, VS, GUIDE, get MALL() { return MALL; } };
