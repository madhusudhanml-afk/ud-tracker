const { getEmail, callScript, clearCookie } = require('./_lib');
module.exports = async (req, res) => {
  const email = getEmail(req);
  if (!email) return res.status(401).json({ error: 'login' });
  try {
    const d = await callScript({ api: 'data', email });
    if (d && d.error === 'forbidden') { res.setHeader('Set-Cookie', clearCookie); return res.status(401).json({ error: 'forbidden' }); }
    if (d && d.error) return res.status(502).json({ error: d.error });
    res.status(200).json(d);
  } catch (e) { res.status(502).json({ error: e.message }); }
};
