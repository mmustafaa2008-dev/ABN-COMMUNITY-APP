/**
 * routes/hiring.js
 *
 * GET /api/hiring/:bizId    — get hiring-active state for a business (public)
 * PUT /api/hiring/:bizId    — toggle hiring on/off (owner only, business role)
 *
 * Toggling OFF also marks all jobs for that business as is_active = 0
 * so they instantly disappear from the public feed.
 */

const express   = require('express');
const { db }    = require('../db');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// ── GET /api/hiring/:bizId ────────────────────────────────────────────────
router.get('/:bizId', (req, res) => {
  const row = db.prepare('SELECT is_active FROM hiring_active WHERE business_id = ?').get(req.params.bizId);
  res.json({ businessId: req.params.bizId, isActive: row ? Boolean(row.is_active) : false });
});

// ── PUT /api/hiring/:bizId ────────────────────────────────────────────────
router.put('/:bizId', authenticate, requireRole('business'), (req, res, next) => {
  try {
    const biz = db.prepare('SELECT id FROM businesses WHERE id = ? AND owner_id = ?')
      .get(req.params.bizId, req.user.id);
    if (!biz) {
      return res.status(403).json({ error: 'You can only manage hiring for your own business.' });
    }

    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive (boolean) is required.' });
    }

    // Upsert the hiring flag
    db.prepare(`
      INSERT INTO hiring_active (business_id, is_active, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(business_id) DO UPDATE SET
        is_active  = excluded.is_active,
        updated_at = excluded.updated_at
    `).run(req.params.bizId, isActive ? 1 : 0);

    // Sync all jobs: active only when hiring is on
    db.prepare(
      'UPDATE jobs SET is_active = ? WHERE business_id = ?'
    ).run(isActive ? 1 : 0, req.params.bizId);

    res.json({ businessId: req.params.bizId, isActive });
  } catch (err) { next(err); }
});

module.exports = router;
