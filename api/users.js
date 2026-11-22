// Lets admins see, add and remove the people who may open the app
const { getEmail, callScript, clearCookie } = require('./_lib');
module.exports = async (req, res) => {
  const email = getEmail(req);
  if (!email) return res.status(401).json({ error: 'login' });
  const b = req.body || {};
  try {
    const d = req.method === 'GET' ? await callScript({ api: 'listusers', email })
      : await callScript({ api: b.remove ? 'removeuser' : 'adduser', email, target: String(b.email || ''), admin: b.admin ? '1' : '0' });
    if (d && d.error === 'forbidden') { res.setHeader('Set-Cookie', clearCookie); return res.status(401).json({ error: 'forbidden' }); }
    if (d && d.error === 'not_admin') return res.status(403).json({ error: 'not_admin' });
    if (d && d.error) return res.status(400).json({ error: d.error });
    res.status(200).json(d);
  } catch (e) { res.status(502).json({ error: e.message }); }
};
