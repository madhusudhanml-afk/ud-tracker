// Google sends the signed-in person's ID token here (redirect mode, works in installed apps too)
const { OAuth2Client } = require('google-auth-library');
const { safeEqual, sessionCookie, callScript } = require('./_lib');

module.exports = async (req, res) => {
  const b = req.body || {};
  const csrf = ((req.headers.cookie || '').match(/(?:^|;\s*)g_csrf_token=([^;]+)/) || [])[1];
  if (req.method !== 'POST' || !b.credential || !csrf || !safeEqual(csrf, b.g_csrf_token || '')) return res.redirect(302, '/?denied=error');
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: b.credential, audience: process.env.GOOGLE_CLIENT_ID });
    const p = ticket.getPayload(), email = String(p.email || '').toLowerCase();
    if (!email || !p.email_verified) return res.redirect(302, '/?denied=error');
    const r = await callScript({ api: 'checkuser', email });
    if (!r.allowed) return res.redirect(302, '/?denied=' + encodeURIComponent(email));
    res.setHeader('Set-Cookie', sessionCookie(email));
    res.redirect(302, '/');
  } catch (e) { res.redirect(302, '/?denied=error'); }
};
