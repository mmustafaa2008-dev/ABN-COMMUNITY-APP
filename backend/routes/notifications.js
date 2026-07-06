/**
 * routes/notifications.js
 *
 * GET    /api/notifications           — list notifications for the caller's role
 * PUT    /api/notifications/read-all  — mark all as read for this role
 * POST   /api/notifications           — broadcast a notification (admin only)
 * DELETE /api/notifications           — clear read notifications for this role
 */

const express = require('express');
const { db, today } = require('../db');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticate);

const mapNotification = (n) => ({
  id:           n.id,
  title:        n.title,
  message:      n.message,
  date:         n.date,
  isRead:       Boolean(n.is_read),
  receiverRole: n.receiver_role,
});

// ── GET /api/notifications ────────────────────────────────────────────────
router.get('/', (req, res) => {
  const rows = db.prepare(
    "SELECT * FROM notifications WHERE receiver_role = ? OR receiver_role = 'all' ORDER BY created_at DESC"
  ).all(req.user.role);
  res.json(rows.map(mapNotification));
});

// ── PUT /api/notifications/read-all ──────────────────────────────────────
router.put('/read-all', (req, res, next) => {
  try {
    db.prepare(
      "UPDATE notifications SET is_read = 1 WHERE receiver_role = ? OR receiver_role = 'all'"
    ).run(req.user.role);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── POST /api/notifications ───────────────────────────────────────────────
router.post('/', requireRole('admin'), (req, res, next) => {
  try {
    const { title, message, receiverRole = 'all' } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'title and message are required.' });
    }

    const id = `notif-${Date.now()}`;
    db.prepare(
      'INSERT INTO notifications (id, title, message, date, receiver_role) VALUES (?,?,?,?,?)'
    ).run(id, title, message, today(), receiverRole);

    res.status(201).json(mapNotification(db.prepare('SELECT * FROM notifications WHERE id = ?').get(id)));
  } catch (err) { next(err); }
});

// ── DELETE /api/notifications ─────────────────────────────────────────────
router.delete('/', (req, res, next) => {
  try {
    db.prepare(
      "DELETE FROM notifications WHERE (receiver_role = ? OR receiver_role = 'all') AND is_read = 1"
    ).run(req.user.role);
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
