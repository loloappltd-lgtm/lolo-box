// LOLO BOX — recorded Arabic voice-over (ElevenLabs) with the device voice as a fallback.
// Each line is stored as assets/vo/<pack>/<hash>.mp3; assets/vo/<pack>/index.json lists the hashes that exist.
// The same hash function is used by tools/gen-vo.cjs on the server, so both sides agree on file names.
export function voClean(text) { return String(text).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu, '').replace(/\s+/g, ' ').trim(); }
export function voHash(text) { const t = voClean(text); let h = 0x811c9dc5; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0') + t.length.toString(16); }
const PACKS = {};
const audio = typeof Audio !== 'undefined' ? new Audio() : null;
export function voLoad(pack) { if (PACKS[pack]) return PACKS[pack].ready; const P = { set: null }; P.ready = fetch(`assets/vo/${pack}/index.json?t=${Math.floor(Date.now() / 3.6e6)}`).then((r) => (r.ok ? r.json() : [])).then((a) => { P.set = new Set(a); }).catch(() => { P.set = new Set(); }); PACKS[pack] = P; return P.ready; }
export function voHas(pack, text) { const P = PACKS[pack]; return !!(P && P.set && P.set.has(voHash(text))); }
export function voReady(pack) { const P = PACKS[pack]; return !!(P && P.set && P.set.size); }
export function voPlay(pack, text) { if (!audio || !voHas(pack, text)) return false; try { audio.pause(); audio.src = `assets/vo/${pack}/${voHash(text)}.mp3`; audio.currentTime = 0; const p = audio.play(); if (p && p.catch) p.catch(() => {}); return true; } catch (e) { return false; } }
export function voStop() { try { if (audio) audio.pause(); } catch (e) {} }
export function voPlaying() { return !!(audio && !audio.paused && !audio.ended); }
