/**
 * routes/directory.js — In-memory business directory (backed by db.js)
 *
 * GET  /api/directory              — public: list active profiles
 * GET  /api/directory/mine         — auth: caller's profile
 * GET  /api/directory/:id          — public: single profile
 * POST /api/directory              — auth: create profile
 * PUT  /api/directory/:id          — auth: update profile
 * DELETE /api/directory/:id        — auth: delete profile
 * PUT  /api/directory/:id/hiring   — auth (business): toggle hiring_active
 */

'use strict';

const express = require('express');
const { directoryProfiles, jobsBoard, newId, today } = require('../db');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

const mapProfile = (row) => ({ ...row });

const findProfile = (id) => directoryProfiles.find((p) => p.id === id);

const filterProfiles = ({ city, category, search, role }) =>
  directoryProfiles.filter((p) => {
    if (p.isActive === false) return false;
    if (city && !String(p.city || '').toLowerCase().includes(String(city).toLowerCase())) return false;
    if (category && !String(p.category || '').toLowerCase().includes(String(category).toLowerCase())) return false;
    if (role && p.role !== role) return false;
    if (search) {
      const q = String(search).toLowerCase();
      const hay = `${p.businessName} ${p.description} ${p.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

// ── GET /api/directory ────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { city, category, search, role } = req.query;
  const results = filterProfiles({ city, category, search, role })
    .sort((a, b) => {
      if (Boolean(b.isVerified) !== Boolean(a.isVerified)) return b.isVerified ? 1 : -1;
      return (b.rating || 0) - (a.rating || 0);
    });
  res.json(results.map(mapProfile));
});

// ── GET /api/directory/mine ───────────────────────────────────────────────
router.get('/mine', authenticate, (req, res) => {
  const profile = directoryProfiles.find((p) => p.email === req.user.email);
  if (!profile) return res.status(404).json({ error: 'You do not have a directory profile yet.' });
  res.json(mapProfile(profile));
});

// ── GET /api/directory/:id ────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const profile = findProfile(req.params.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found.' });
  res.json(mapProfile(profile));
});

// ── POST /api/directory ───────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  requireRole('business', 'service_provider', 'admin'),
  (req, res) => {
    const {
      businessName, category, description,
      imageUrl = '', coverUrl = '',
      address = '', area = '', city = '',
      phone = '', whatsapp = '', website = '',
      workingHours = '', membershipExpiry,
      subscriptionTier,
    } = req.body;

    if (!businessName) return res.status(400).json({ error: 'businessName is required.' });
    if (!category) return res.status(400).json({ error: 'category is required.' });

    if (directoryProfiles.some((p) => p.email === req.user.email)) {
      return res.status(409).json({ error: 'A directory profile already exists for your account.' });
    }

    const tier = subscriptionTier ?? (req.user.role === 'business' ? 50 : 30);
    const expiry = membershipExpiry ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const profile = {
      id:                 newId('dir'),
      email:              req.user.email,
      role:               req.user.role === 'business' ? 'business_owner' : req.user.role,
      businessName,
      category,
      subscriptionStatus: 'active',
      subscriptionTier:   tier,
      imageUrl,
      coverUrl,
      description:        description || '',
      address,
      area,
      city:               city || 'New York',
      phone,
      whatsapp,
      website,
      workingHours,
      hiringActive:       false,
      isVerified:         false,
      isActive:           true,
      rating:             0,
      reviewsCount:       0,
      membershipExpiry:   expiry,
      createdAt:          new Date().toISOString(),
    };

    directoryProfiles.push(profile);
    res.status(201).json(mapProfile(profile));
  },
);

// ── PUT /api/directory/:id ──────────────────────────────────────────────
router.put('/:id', authenticate, (req, res) => {
  const idx = directoryProfiles.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Profile not found.' });

  const existing = directoryProfiles[idx];
  if (existing.email !== req.user.email && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const {
    businessName, category, description,
    imageUrl, coverUrl,
    address, area, city,
    phone, whatsapp, website,
    workingHours, membershipExpiry,
    subscriptionStatus, isVerified,
  } = req.body;

  const updated = { ...existing };
  if (businessName       !== undefined) updated.businessName       = businessName;
  if (category           !== undefined) updated.category           = category;
  if (description        !== undefined) updated.description        = description;
  if (imageUrl           !== undefined) updated.imageUrl           = imageUrl;
  if (coverUrl           !== undefined) updated.coverUrl           = coverUrl;
  if (address            !== undefined) updated.address            = address;
  if (area               !== undefined) updated.area               = area;
  if (city               !== undefined) updated.city               = city;
  if (phone              !== undefined) updated.phone              = phone;
  if (whatsapp           !== undefined) updated.whatsapp           = whatsapp;
  if (website            !== undefined) updated.website            = website;
  if (workingHours       !== undefined) updated.workingHours       = workingHours;
  if (membershipExpiry   !== undefined) updated.membershipExpiry   = membershipExpiry;
  if (subscriptionStatus !== undefined) updated.subscriptionStatus = subscriptionStatus;
  if (isVerified         !== undefined) updated.isVerified         = isVerified;

  directoryProfiles[idx] = updated;
  res.json(mapProfile(updated));
});

// ── DELETE /api/directory/:id ─────────────────────────────────────────────
router.delete('/:id', authenticate, (req, res) => {
  const idx = directoryProfiles.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Profile not found.' });

  const existing = directoryProfiles[idx];
  if (existing.email !== req.user.email && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  directoryProfiles.splice(idx, 1);
  for (let i = jobsBoard.length - 1; i >= 0; i -= 1) {
    if (jobsBoard[i].businessId === req.params.id) jobsBoard.splice(i, 1);
  }
  res.status(204).end();
});

// ── PUT /api/directory/:id/hiring ─────────────────────────────────────────
router.put('/:id/hiring', authenticate, requireRole('business'), (req, res) => {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ error: 'isActive (boolean) is required.' });
  }

  const profile = findProfile(req.params.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found.' });
  if (profile.email !== req.user.email) return res.status(403).json({ error: 'Forbidden.' });

  profile.hiringActive = isActive;
  jobsBoard.forEach((job) => {
    if (job.businessId === req.params.id) job.isActive = isActive;
  });

  res.json({ businessId: req.params.id, hiringActive: isActive });
});

module.exports = router;
