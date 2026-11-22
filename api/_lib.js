const crypto = require('crypto');
const MAXAGE = 30 * 24 * 3600;   // stay signed in for 30 days

function sign(s) { return crypto.createHmac('sha256', process.env.COOKIE_SECRET || '').update(s).digest('hex'); }
function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
function b64url(s) { return Buffer.from(s).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function fromB64url(s) { return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(); }

function sessionCookie(email) {
  const p = b64url(JSON.stringify({ e: email, x: Math.floor(Date.now() / 1000) + MAXAGE }));
  return 'ud=' + p + '.' + sign(p) + '; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=' + MAXAGE;
}
const clearCookie = 'ud=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';

// returns the signed-in email, or null
function getEmail(req) {
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)ud=([A-Za-z0-9_\-]+)\.([a-f0-9]+)/);
  if (!m || !process.env.COOKIE_SECRET || !safeEqual(m[2], sign(m[1]))) return null;
  try { const o = JSON.parse(fromB64url(m[1])); return o.x > Date.now() / 1000 && o.e ? o.e : null; } catch (e) { return null; }
}
async function callScript(params) {
  const url = process.env.APPS_SCRIPT_URL + (process.env.APPS_SCRIPT_URL.includes('?') ? '&' : '?') +
    new URLSearchParams(Object.assign({ token: process.env.APPS_SCRIPT_TOKEN }, params)).toString();
  const r = await fetch(url, { redirect: 'follow' });
  const text = await r.text();
  try { return JSON.parse(text); } catch (e) { throw new Error('Apps Script did not return JSON (check the link and "Anyone" access)'); }
}
module.exports = { safeEqual, b64url, sessionCookie, clearCookie, getEmail, callScript };
