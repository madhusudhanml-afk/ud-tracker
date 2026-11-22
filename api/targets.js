// Admins save the Meta / Google ticket targets
const { getEmail, callScript, b64url } = require('./_lib');
module.exports = async (req, res) => {
  const email = getEmail(req);
  if (!email) return res.status(401).json({ error: 'login' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  try {
    const d = await callScript({ api: 'settargets', email, t: b64url(JSON.stringify((req.body && req.body.targets) || {})) });
    if (d && d.error === 'not_admin') return res.status(403).json({ error: 'not_admin' });
    if (d && d.error) return res.status(400).json({ error: d.error });
    res.status(200).json(d);
  } catch (e) { res.status(502).json({ error: e.message }); }
};
