const { getEmail, callScript, clearCookie } = require('./_lib');
module.exports = async (req, res) => {
  const email = getEmail(req);
  if (!email) return res.status(401).json({ error: 'login' });
  const q = req.query || {}, p = { api: 'data', email };
  if (/^\d{4}-\d{2}-\d{2}$/.test(q.from || '') && /^\d{4}-\d{2}-\d{2}$/.test(q.to || '')) { p.from = q.from; p.to = q.to; }
  try {
    const d = await callScript(p);
    if (d && d.error === 'forbidden') { res.setHeader('Set-Cookie', clearCookie); return res.status(401).json({ error: 'forbidden' }); }
    if (d && d.error) return res.status(502).json({ error: d.error });
    res.status(200).json(d);
  } catch (e) { res.status(502).json({ error: e.message }); }
};
