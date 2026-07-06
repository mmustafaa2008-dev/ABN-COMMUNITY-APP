/**
 * routes/favorites.js
 *
 * GET    /api/favorites           — list the current user's favourited business IDs
 * POST   /api/favorites/:bizId    — add a business to favourites
 * DELETE /api/favorites/:bizId    — remove a business from favourites
 */

const express    = require('express');
const { db }     = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// All favorites routes require authentication
router.use(authenticate);

// ── GET /api/favorites ────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const rows = db.prepare(
    'SELECT business_id FROM favorites WHERE user_id = ?'
  ).all(req.user.id);
  res.json(rows.map((r) => r.business_id));
});

// ── POST /api/favorites/:bizId ────────────────────────────────────────────
router.post('/:bizId', (req, res, next) => {
  try {
    const biz = db.prepare('SELECT id FROM businesses WHERE id = ?').get(req.params.bizId);
    if (!biz) return res.status(404).json({ error: 'Business not found.' });

    db.prepare(
      'INSERT OR IGNORE INTO favorites (user_id, business_id) VALUES (?, ?)'
    ).run(req.user.id, req.params.bizId);

    res.status(201).json({ businessId: req.params.bizId });
  } catch (err) { next(err); }
});

// ── DELETE /api/favorites/:bizId ──────────────────────────────────────────
router.delete('/:bizId', (req, res, next) => {
  try {
    db.prepare(
      'DELETE FROM favorites WHERE user_id = ? AND business_id = ?'
    ).run(req.user.id, req.params.bizId);
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
