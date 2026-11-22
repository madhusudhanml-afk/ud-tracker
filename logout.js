const { clearCookie } = require('./_lib');
module.exports = (req, res) => { res.setHeader('Set-Cookie', clearCookie); res.status(200).json({ ok: true }); };
