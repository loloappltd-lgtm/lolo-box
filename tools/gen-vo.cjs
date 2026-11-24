// Generate the game's Arabic voice-over with ElevenLabs (runs on the server).
// usage: XI_KEY=... node tools/gen-vo.cjs <lines.json> <voiceId> <outDir> [model]
// The API key is read from the XI_KEY environment variable only (never pass it as an argument or commit it).
// Existing mp3 files are skipped, so the script can be re-run safely; it rewrites <outDir>/index.json at the end.
const fs = require('fs'), path = require('path'), https = require('https');
const [linesFile, voice, outDir, model = 'eleven_multilingual_v2'] = process.argv.slice(2);
const KEY = (process.env.XI_KEY || '').trim();
if (!linesFile || !voice || !outDir) { console.log('usage: XI_KEY=... node tools/gen-vo.cjs <lines.json> <voiceId> <outDir>'); process.exit(1); }
if (!KEY) { console.log('XI_KEY is empty'); process.exit(1); }
if (!/^sk_/.test(KEY.trim())) { console.log('STOP: this is not the secret API key. The real key starts with sk_ (ElevenLabs > Developers > API Keys > Create key, copy it once when shown).'); process.exit(1); }
// must match js/vo.js exactly
const voClean = (text) => String(text).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu, '').replace(/\s+/g, ' ').trim();
const voHash = (text) => { const t = voClean(text); let h = 0x811c9dc5; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0') + t.length.toString(16); };

function tts(text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ text, model_id: model, voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true } });
    const req = https.request({ hostname: 'api.elevenlabs.io', path: `/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_64`, method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
      const chunks = []; res.on('data', (c) => chunks.push(c)); res.on('end', () => { const buf = Buffer.concat(chunks); if (res.statusCode === 200) resolve(buf); else { const e = new Error(`HTTP ${res.statusCode}: ${buf.toString('utf8').slice(0, 300)}`); e.status = res.statusCode; reject(e); } });
    });
    req.on('error', reject); req.setTimeout(60000, () => req.destroy(new Error('timeout'))); req.write(body); req.end();
  });
}
(async () => {
  const lines = [...new Set(JSON.parse(fs.readFileSync(linesFile, 'utf8')).map(voClean).filter(Boolean))];
  fs.mkdirSync(outDir, { recursive: true });
  const todo = lines.filter((t) => !fs.existsSync(path.join(outDir, voHash(t) + '.mp3')));
  const chars = todo.reduce((a, t) => a + t.length, 0);
  console.log(`lines: ${lines.length}, to generate: ${todo.length}, characters: ${chars}`);
  let done = 0, fail = 0;
  for (const t of todo) {
    let ok = false;
    for (let a = 0; a < 3 && !ok; a++) {
      try { const buf = await tts(t); fs.writeFileSync(path.join(outDir, voHash(t) + '.mp3'), buf); ok = true; }
      catch (e) { if (e.status === 401 || e.status === 402 || e.status === 403 || e.status === 422 || /authentication|quota|payment/i.test(e.message)) { console.log('STOP: ' + e.message); a = 9; fail = -1; break; } await new Promise((r) => setTimeout(r, 2000 * (a + 1))); if (a === 2) console.log('failed: ' + e.message); }
    }
    if (fail === -1) break;
    if (ok) done++; else fail++;
    if ((done + fail) % 10 === 0) console.log(`${done + Math.max(fail, 0)}/${todo.length}`);
  }
  const have = lines.map(voHash).filter((h) => fs.existsSync(path.join(outDir, h + '.mp3')));
  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(have));
  console.log(`VO DONE: ${have.length}/${lines.length} ready, new ${done}, failed ${Math.max(fail, 0)}`);
})();
