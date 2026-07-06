/**
 * routes/payments.js
 *
 * GET  /api/payments          — list payments for the caller's own business
 * POST /api/payments          — record a payment (owner or admin)
 *
 * In a real app the POST would be triggered by a payment gateway webhook.
 * Here it's a convenience endpoint for simulating/seeding payment records.
 */

const express = require('express');
const { db, today } = require('../db');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticate);

const mapPayment = (p) => ({
  id:         p.id,
  businessId: p.business_id,
  amount:     p.amount,
  date:       p.date,
  status:     p.status,
  refNo:      p.ref_no,
});

// ── GET /api/payments ─────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const biz = db.prepare('SELECT id FROM businesses WHERE owner_id = ?').get(req.user.id);
  if (!biz) return res.status(404).json({ error: 'No business listing found for your account.' });

  const payments = db.prepare(
    'SELECT * FROM payments WHERE business_id = ? ORDER BY date DESC'
  ).all(biz.id).map(mapPayment);

  res.json(payments);
});

// ── POST /api/payments ────────────────────────────────────────────────────
router.post('/', requireRole('business', 'service_provider', 'admin'), (req, res, next) => {
  try {
    const { businessId, amount, status = 'success', date } = req.body;

    if (!businessId || !amount) {
      return res.status(400).json({ error: 'businessId and amount are required.' });
    }

    const biz = db.prepare('SELECT id FROM businesses WHERE id = ?').get(businessId);
    if (!biz) return res.status(404).json({ error: 'Business not found.' });

    // Non-admin users can only add payments to their own business
    if (req.user.role !== 'admin') {
      const own = db.prepare('SELECT id FROM businesses WHERE id = ? AND owner_id = ?')
        .get(businessId, req.user.id);
      if (!own) return res.status(403).json({ error: 'Forbidden.' });
    }

    const id    = `pay-${Date.now()}`;
    const refNo = `REF-${Date.now().toString(36).toUpperCase()}`;

    db.prepare(
      'INSERT INTO payments (id, business_id, amount, date, status, ref_no) VALUES (?,?,?,?,?,?)'
    ).run(id, businessId, parseFloat(amount), date || today(), status, refNo);

    res.status(201).json(mapPayment(db.prepare('SELECT * FROM payments WHERE id = ?').get(id)));
  } catch (err) { next(err); }
});

module.exports = router;
