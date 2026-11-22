// Called by Apps Script when new bookings arrive. Sends the push messages.
const webpush = require('web-push');
const { safeEqual } = require('./_lib');
module.exports = async (req, res) => {
  const b = req.body || {};
  if (req.method !== 'POST' || !process.env.NOTIFY_SECRET || !safeEqual(b.secret || '', process.env.NOTIFY_SECRET)) return res.status(401).json({ error: 'unauthorized' });
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@example.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  const subs = Array.isArray(b.subs) ? b.subs : [], items = Array.isArray(b.items) ? b.items : [];
  let sent = 0; const gone = [];
  await Promise.all(subs.map(async s => {
    for (const it of items) {
      try { await webpush.sendNotification(s, JSON.stringify({ title: it.title, body: it.body, tag: it.tag, url: '/' }), { TTL: 3600 }); sent++; }
      catch (e) { if (e.statusCode === 404 || e.statusCode === 410) { gone.push(s.endpoint); break; } }
    }
  }));
  res.status(200).json({ sent, gone });
};
