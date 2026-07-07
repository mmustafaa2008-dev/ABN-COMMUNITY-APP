/**
 * routes/reviews.js — In-memory star ratings (no SQLite)
 *
 * GET  /api/reviews?businessId=  — list reviews for a business (public)
 * POST /api/reviews              — submit a review (authenticated)
 *
 * Stored fields: userId, businessId, ratingScore, comment (+ userName, date for display)
 */

'use strict';

const express = require('express');
const { reviews, newId, today } = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

const mapReview = (r) => ({
  id:         r.id,
  businessId: r.businessId,
  userId:     r.userId,
  userName:   r.userName,
  rating:     r.ratingScore,
  comment:    r.comment,
  date:       r.date,
});

const aggregateForBusiness = (businessId) => {
  const bizReviews = reviews.filter((r) => r.businessId === businessId);
  if (bizReviews.length === 0) return { avg: 0, count: 0 };
  const avg = bizReviews.reduce((s, r) => s + r.ratingScore, 0) / bizReviews.length;
  return { avg: Math.round(avg * 10) / 10, count: bizReviews.length };
};

// ── GET /api/reviews?businessId= ──────────────────────────────────────────
router.get('/', (req, res) => {
  const { businessId } = req.query;
  if (!businessId) {
    return res.status(400).json({ error: 'businessId query param is required.' });
  }

  const list = reviews
    .filter((r) => r.businessId === businessId)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .map(mapReview);

  res.json(list);
});

// ── POST /api/reviews ─────────────────────────────────────────────────────
router.post('/', authenticate, (req, res, next) => {
  try {
    const { businessId, rating, comment = '' } = req.body;

    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required.' });
    }

    const ratingScore = Number(rating);
    if (!Number.isInteger(ratingScore) || ratingScore < 1 || ratingScore > 5) {
      return res.status(400).json({ error: 'rating must be an integer between 1 and 5.' });
    }

    const userId = req.user.id;
    const existing = reviews.find(
      (r) => r.userId === userId && r.businessId === businessId,
    );
    if (existing) {
      return res.status(409).json({ error: 'You have already reviewed this listing.' });
    }

    const record = {
      id:          newId('rev'),
      userId,
      businessId,
      ratingScore,
      comment:     String(comment || '').trim(),
      userName:    req.user.name || req.user.email?.split('@')[0] || 'Community Member',
      date:        today(),
      createdAt:   new Date().toISOString(),
    };

    reviews.unshift(record);

    const stats = aggregateForBusiness(businessId);

    res.status(201).json({
      review: mapReview(record),
      aggregate: stats,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
