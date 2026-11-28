// LOLO_APPLE_FIX_2026: Apple sign-in on the app failed for returning users.
// Apple sends the user's email only the first time; later logins send just the id_token,
// and the server answered 400 "Missing data". This reads the email from the verified Apple token
// when the app does not send it, matches the email case-insensitively, and logs the reason for
// each failed Apple login (no emails or tokens in the log) so we can see what is left.
// Usage: node patch-apple.js /home/backend/routes/auth_apple.js
const fs = require('fs');
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8');
if (s.includes('LOLO_APPLE_FIX_2026')) { console.log('ALREADY'); process.exit(0); }
const i0 = s.indexOf("router.post('/login'");
if (i0 < 0) { console.log('NO LOGIN ROUTE'); process.exit(1); }
const i1 = s.indexOf('router.', i0 + 10);
let a = s.slice(i0, i1 < 0 ? s.length : i1);
const before = a;
const rep = (from, to) => { if (!a.includes(from)) { console.log('MISSING: ' + from.slice(0, 60)); process.exit(1); } a = a.replace(from, to); };
rep("if(!body.id_token || !body.email){", "if(!body.id_token){ /* LOLO_APPLE_FIX_2026 */ console.log('LOLO_APPLE_FAIL no_token');");
rep("const jwtClaims = jwt.verify(identityToken, applePublicKey, { algorithms: 'RS256' });",
  "const jwtClaims = jwt.verify(identityToken, applePublicKey, { algorithms: 'RS256' });\n            if (jwtClaims && jwtClaims.email && (!body.email || body.email !== jwtClaims.email)) { if (!body.email) body.email = jwtClaims.email; else body.email2 = jwtClaims.email; }\n            if (!body.email) console.log('LOLO_APPLE_FAIL no_email_in_token');");
rep('User.findOne({ "email": body.email })',
  'User.findOne({ "email": { $in: [body.email, String(body.email).trim().toLowerCase()].concat(body.email2 ? [body.email2, String(body.email2).toLowerCase()] : []) } })');
a = a.replace(/\}else\{\s*\n(\s*)res\.status\(400\)\.send\(\{"message": "email is not register before\."\}\);/, (m, sp) => m.replace('res.status', "console.log('LOLO_APPLE_FAIL not_registered');\n" + sp + 'res.status'));
rep('} catch (error) {', "} catch (error) { console.log('LOLO_APPLE_FAIL error', String(error && error.message).slice(0, 80));");
if (a === before) { console.log('NOTHING CHANGED'); process.exit(1); }
s = s.slice(0, i0) + a + (i1 < 0 ? '' : s.slice(i1));
fs.writeFileSync(f, s);
console.log('APPLE FIXED');
