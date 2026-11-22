module.exports = (req, res) => res.status(200).json({ clientId: process.env.GOOGLE_CLIENT_ID || '' });
