/**
 * routes/jobs.js
 *
 * GET  /api/jobs                — public: all active jobs where business hiring is ON
 * GET  /api/jobs/my             — auth: caller's own business jobs (all, incl. inactive)
 * GET  /api/jobs/:id            — public: single job detail
 * POST /api/jobs                — auth (business role only): create job
 * PUT  /api/jobs/:id            — auth: update own job
 * DELETE /api/jobs/:id          — auth: delete own job
 */

const express   = require('express');
const { db, today, mapJob } = require('../db');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

const VALID_CATEGORIES = ['IT', 'Graphic Designing', 'Developer', 'Chef', 'Maid', 'Others'];

// ── GET /api/jobs ─────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { category } = req.query;

  let sql = `
    SELECT j.* FROM jobs j
    INNER JOIN hiring_active h ON h.business_id = j.business_id
    WHERE j.is_active = 1 AND h.is_active = 1
  `;
  const params = [];

  if (category && VALID_CATEGORIES.includes(category)) {
    sql += ' AND j.category = ?';
    params.push(category);
  }

  sql += ' ORDER BY j.created_at DESC';

  res.json(db.prepare(sql).all(...params).map(mapJob));
});

// ── GET /api/jobs/my ──────────────────────────────────────────────────────
router.get('/my', authenticate, requireRole('business'), (req, res) => {
  const biz = db.prepare('SELECT id FROM businesses WHERE owner_id = ?').get(req.user.id);
  if (!biz) return res.status(404).json({ error: 'You do not have a business listing.' });

  const jobs = db.prepare(
    'SELECT * FROM jobs WHERE business_id = ? ORDER BY created_at DESC'
  ).all(biz.id).map(mapJob);

  res.json(jobs);
});

// ── GET /api/jobs/:id ─────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  res.json(mapJob(job));
});

// ── POST /api/jobs ────────────────────────────────────────────────────────
router.post('/', authenticate, requireRole('business'), (req, res, next) => {
  try {
    const {
      title, category, requirements = '',
      salaryMin, salaryMax, hiringEmail,
    } = req.body;

    if (!title)       return res.status(400).json({ error: 'title is required.' });
    if (!hiringEmail) return res.status(400).json({ error: 'hiringEmail is required.' });
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }
    const min = parseFloat(salaryMin);
    const max = parseFloat(salaryMax);
    if (isNaN(min) || isNaN(max) || min <= 0 || max < min) {
      return res.status(400).json({ error: 'salaryMin and salaryMax must be positive numbers (min ≤ max).' });
    }

    const biz = db.prepare('SELECT id, name, logo_url FROM businesses WHERE owner_id = ?').get(req.user.id);
    if (!biz) return res.status(404).json({ error: 'You must have a business listing before posting jobs.' });

    // Verify hiring is enabled for this business
    const hiring = db.prepare('SELECT is_active FROM hiring_active WHERE business_id = ?').get(biz.id);
    if (!hiring || !hiring.is_active) {
      return res.status(403).json({ error: 'Hiring is not active for your business. Enable it from the Account tab first.' });
    }

    const id = `job-${Date.now()}`;
    db.prepare(`
      INSERT INTO jobs (id, business_id, business_name, business_logo_url, title, category, requirements, salary_min, salary_max, hiring_email, posted_date, is_active)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,1)
    `).run(id, biz.id, biz.name, biz.logo_url, title, category, requirements, min, max, hiringEmail, today());

    res.status(201).json(mapJob(db.prepare('SELECT * FROM jobs WHERE id = ?').get(id)));
  } catch (err) { next(err); }
});

// ── PUT /api/jobs/:id ─────────────────────────────────────────────────────
router.put('/:id', authenticate, requireRole('business'), (req, res, next) => {
  try {
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found.' });

    const biz = db.prepare('SELECT id FROM businesses WHERE owner_id = ?').get(req.user.id);
    if (!biz || biz.id !== job.business_id) {
      return res.status(403).json({ error: 'You can only edit your own job postings.' });
    }

    const { title, category, requirements, salaryMin, salaryMax, hiringEmail } = req.body;

    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }
    const min = salaryMin !== undefined ? parseFloat(salaryMin) : null;
    const max = salaryMax !== undefined ? parseFloat(salaryMax) : null;
    if (min !== null && max !== null && (isNaN(min) || isNaN(max) || max < min)) {
      return res.status(400).json({ error: 'salaryMin must be ≤ salaryMax.' });
    }

    db.prepare(`
      UPDATE jobs SET
        title         = COALESCE(?, title),
        category      = COALESCE(?, category),
        requirements  = COALESCE(?, requirements),
        salary_min    = COALESCE(?, salary_min),
        salary_max    = COALESCE(?, salary_max),
        hiring_email  = COALESCE(?, hiring_email)
      WHERE id = ?
    `).run(
      title ?? null, category ?? null, requirements ?? null,
      min, max, hiringEmail ?? null,
      req.params.id,
    );

    res.json(mapJob(db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id)));
  } catch (err) { next(err); }
});

// ── DELETE /api/jobs/:id ──────────────────────────────────────────────────
router.delete('/:id', authenticate, requireRole('business'), (req, res, next) => {
  try {
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found.' });

    const biz = db.prepare('SELECT id FROM businesses WHERE owner_id = ?').get(req.user.id);
    if (!biz || biz.id !== job.business_id) {
      return res.status(403).json({ error: 'You can only delete your own job postings.' });
    }

    db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
