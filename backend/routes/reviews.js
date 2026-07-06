/**
 * routes/reviews.js
 *
 * GET  /api/reviews?businessId=   — list reviews for a business (public)
 * POST /api/reviews                — add a review (any authenticated user)
 */

const express = require('express');
const { db, today } = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

const mapReview = (r) => ({
  id:         r.id,
  businessId: r.business_id,
  userName:   r.user_name,
  rating:     r.rating,
  comment:    r.comment,
  date:       r.date,
});

// ── GET /api/reviews ──────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { businessId } = req.query;
  if (!businessId) return res.status(400).json({ error: 'businessId query param is required.' });

  const reviews = db.prepare(
    'SELECT * FROM reviews WHERE business_id = ? ORDER BY created_at DESC'
  ).all(businessId).map(mapReview);

  res.json(reviews);
});

// ── POST /api/reviews ─────────────────────────────────────────────────────
router.post('/', authenticate, (req, res, next) => {
  try {
    const { businessId, userName, rating, comment = '' } = req.body;
    if (!businessId) return res.status(400).json({ error: 'businessId is required.' });
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5.' });
    }

    const biz = db.prepare('SELECT id FROM businesses WHERE id = ?').get(businessId);
    if (!biz) return res.status(404).json({ error: 'Business not found.' });

    const id = `rev-${Date.now()}`;
    const name = userName || req.user.name || 'Anonymous';

    db.prepare(
      'INSERT INTO reviews (id, business_id, user_name, rating, comment, date) VALUES (?,?,?,?,?,?)'
    ).run(id, businessId, name, rating, comment, today());

    // Recalculate aggregate rating
    const stats = db.prepare(
      'SELECT COUNT(*) as cnt, AVG(rating) as avg FROM reviews WHERE business_id = ?'
    ).get(businessId);
    db.prepare(
      'UPDATE businesses SET rating = ?, reviews_count = ? WHERE id = ?'
    ).run(
      Math.round((stats.avg || 0) * 10) / 10,
      stats.cnt,
      businessId,
    );

    res.status(201).json(mapReview(db.prepare('SELECT * FROM reviews WHERE id = ?').get(id)));
  } catch (err) { next(err); }
});

module.exports = router;
