const { getEmail, callScript, b64url, clearCookie } = require('./_lib');
module.exports = async (req, res) => {
  const email = getEmail(req);
  if (!email) return res.status(401).json({ error: 'login' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const sub = req.body && req.body.subscription;
  if (!sub || !sub.endpoint) return res.status(400).json({ error: 'no subscription' });
  try {
    const d = req.body.remove ? await callScript({ api: 'unsubscribe', email, endpoint: b64url(sub.endpoint) })
                              : await callScript({ api: 'subscribe', email, sub: b64url(JSON.stringify(sub)) });
    if (d && d.error === 'forbidden') { res.setHeader('Set-Cookie', clearCookie); return res.status(401).json({ error: 'forbidden' }); }
    res.status(200).json(d);
  } catch (e) { res.status(502).json({ error: e.message }); }
};
