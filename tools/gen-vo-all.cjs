// Runs tools/gen-vo.cjs for every voice pack listed in tools/vo-plan.json (pack -> voice id), one after another.
// usage: XI_KEY=... node tools/gen-vo-all.cjs <voRoot>   (e.g. /home/backend/public/games/lolo-world/assets/vo)
const { spawnSync } = require('child_process'), path = require('path');
const root = process.argv[2]; if (!root) { console.log('usage: node tools/gen-vo-all.cjs <voRoot>'); process.exit(1); }
const plan = require('./vo-plan.json');
for (const p of plan) {
  console.log(`== ${p.pack} (${p.voice})`);
  const r = spawnSync(process.execPath, [path.join(__dirname, 'gen-vo.cjs'), path.join(__dirname, `vo-lines-${p.pack}.json`), p.voice, path.join(root, p.pack)], { stdio: 'inherit', env: process.env });
  if (r.status) { console.log('STOP at ' + p.pack); break; }
}
console.log('ALL DONE');
