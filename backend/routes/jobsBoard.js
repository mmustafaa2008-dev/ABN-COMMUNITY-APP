/**
 * routes/jobsBoard.js — In-memory jobs board (backed by db.js)
 *
 * GET    /api/jobsboard             — public: active jobs
 * GET    /api/jobsboard/mine        — auth (business): own jobs
 * GET    /api/jobsboard/:id         — public: single job
 * POST   /api/jobsboard             — auth (business): create job
 * PUT    /api/jobsboard/:id         — auth (business): update job
 * DELETE /api/jobsboard/:id         — auth (business): delete job
 */

'use strict';

const express = require('express');
const { directoryProfiles, jobsBoard, newId, today } = require('../db');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

const VALID_CATEGORIES = ['IT', 'Graphic Designing', 'Developer', 'Chef', 'Maid', 'Others'];

const mapJob = (row) => ({ ...row });

const findJob = (id) => jobsBoard.find((j) => j.id === id);

const isBusinessHiring = (businessId) => {
  const profile = directoryProfiles.find((p) => p.id === businessId);
  return Boolean(profile?.hiringActive && profile?.isActive !== false);
};

// ── GET /api/jobsboard ────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { category } = req.query;

  let results = jobsBoard.filter(
    (j) => j.isActive && isBusinessHiring(j.businessId),
  );

  if (category && VALID_CATEGORIES.includes(category)) {
    results = results.filter((j) => j.category === category);
  }

  results.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  res.json(results.map(mapJob));
});

// ── GET /api/jobsboard/mine ───────────────────────────────────────────────
router.get('/mine', authenticate, requireRole('business'), (req, res) => {
  const profile = directoryProfiles.find((p) => p.email === req.user.email);
  if (!profile) {
    return res.status(404).json({ error: 'You do not have a directory profile yet.' });
  }

  const mine = jobsBoard
    .filter((j) => j.businessId === profile.id)
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

  res.json(mine.map(mapJob));
});

// ── GET /api/jobsboard/:id ────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const job = findJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  res.json(mapJob(job));
});

// ── POST /api/jobsboard ───────────────────────────────────────────────────
router.post('/', authenticate, requireRole('business'), (req, res) => {
  const {
    title, category, requirements = '',
    salaryMin, salaryMax, hiringEmail,
  } = req.body;

  if (!title) return res.status(400).json({ error: 'title is required.' });
  if (!hiringEmail) return res.status(400).json({ error: 'hiringEmail is required.' });
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }

  const min = parseFloat(salaryMin);
  const max = parseFloat(salaryMax);
  if (isNaN(min) || isNaN(max) || min < 0 || max < min) {
    return res.status(400).json({ error: 'salaryMin and salaryMax must be valid (min ≤ max).' });
  }

  const profile = directoryProfiles.find((p) => p.email === req.user.email);
  if (!profile) {
    return res.status(404).json({ error: 'You must have a directory profile before posting jobs.' });
  }
  if (!profile.hiringActive) {
    return res.status(403).json({
      error: 'Hiring is not active on your profile. Enable it first from the Account tab.',
    });
  }

  const job = {
    id:              newId('job'),
    businessId:      profile.id,
    businessName:    profile.businessName,
    businessLogoUrl: profile.imageUrl || '',
    title,
    category,
    requirements,
    salaryMin:       min,
    salaryMax:       max,
    hiringEmail,
    isActive:        true,
    postedDate:      today(),
    createdAt:       new Date().toISOString(),
  };

  jobsBoard.unshift(job);
  res.status(201).json(mapJob(job));
});

// ── PUT /api/jobsboard/:id ────────────────────────────────────────────────
router.put('/:id', authenticate, requireRole('business'), (req, res) => {
  const job = findJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });

  const profile = directoryProfiles.find((p) => p.email === req.user.email);
  if (!profile || profile.id !== job.businessId) {
    return res.status(403).json({ error: 'You can only edit your own job postings.' });
  }

  const { title, category, requirements, salaryMin, salaryMax, hiringEmail } = req.body;

  if (category && !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }

  if (title        !== undefined) job.title        = title;
  if (category     !== undefined) job.category     = category;
  if (requirements !== undefined) job.requirements = requirements;
  if (hiringEmail  !== undefined) job.hiringEmail  = hiringEmail;
  if (salaryMin    !== undefined) job.salaryMin      = parseFloat(salaryMin);
  if (salaryMax    !== undefined) job.salaryMax      = parseFloat(salaryMax);

  res.json(mapJob(job));
});

// ── DELETE /api/jobsboard/:id ─────────────────────────────────────────────
router.delete('/:id', authenticate, requireRole('business'), (req, res) => {
  const idx = jobsBoard.findIndex((j) => j.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Job not found.' });

  const job = jobsBoard[idx];
  const profile = directoryProfiles.find((p) => p.email === req.user.email);
  if (!profile || profile.id !== job.businessId) {
    return res.status(403).json({ error: 'You can only delete your own job postings.' });
  }

  jobsBoard.splice(idx, 1);
  res.status(204).end();
});

module.exports = router;
