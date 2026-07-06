/**
 * routes/auth.js
 *
 * POST /api/auth/register   — create a new account
 * POST /api/auth/login      — sign in, returns JWT
 * GET  /api/auth/me         — fetch current user (requires token)
 * PUT  /api/auth/me         — update name / phone / preferredLanguage
 *
 * Storage: in-memory Map (see db.js) — no native database driver required.
 * Demo accounts (business@, service@, admin@) are pre-seeded at startup.
 */

'use strict';

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { users, stableId } = require('../db');
const { authenticate }    = require('../middleware/authMiddleware');

const router         = express.Router();
const JWT_SECRET     = process.env.JWT_SECRET     || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const HASH_ROUNDS    = 12;

const VALID_ROLES = ['customer', 'business', 'service_provider', 'admin'];

/** Strip the password hash before sending a user object to the client */
const mapUser = (u) => ({
  id:                u.id,
  email:             u.email,
  phone:             u.phone,
  name:              u.name,
  role:              u.role,
  preferredLanguage: u.preferredLanguage,
});

// ── POST /api/auth/register ───────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { email, phone = '', name, role = 'customer', password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'email, name and password are required.' });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const key = email.toLowerCase().trim();
    if (users.has(key)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, HASH_ROUNDS);
    const id = stableId(role, key);

    const record = { id, email: key, phone, name, role, passwordHash, preferredLanguage: 'en' };
    users.set(key, record);

    const token = jwt.sign({ id, email: key, role, name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({ token, user: mapUser(record) });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const key  = email.toLowerCase().trim();
    const user = users.get(key);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    res.json({ token, user: mapUser(user) });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  const user = [...users.values()].find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(mapUser(user));
});

// ── PUT /api/auth/me ──────────────────────────────────────────────────────
router.put('/me', authenticate, (req, res) => {
  const user = [...users.values()].find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const { name, phone, preferredLanguage } = req.body;
  if (name)              user.name              = name;
  if (phone)             user.phone             = phone;
  if (preferredLanguage) user.preferredLanguage = preferredLanguage;

  res.json(mapUser(user));
});

module.exports = router;
