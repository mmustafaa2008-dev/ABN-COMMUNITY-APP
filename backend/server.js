/**
 * server.js — ABN Community Backend
 *
 * Stack:  Node.js · Express · Supabase (PostgreSQL) · JWT
 *         In-memory user store for auth (no native binary required)
 *
 * Run:    node server.js          (production)
 *         npx nodemon server.js   (development with auto-reload)
 */

'use strict';

require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');

// Warm up the in-memory user store + seed demo accounts before routes load.
// seedPromise resolves once bcrypt hashing of demo passwords is done.
const { seedPromise } = require('./db');

// Supabase clients (throws a clear error if env vars are missing)
const { supabaseAdmin } = require('./supabase');

const app = express();

// ── Rate limiting ──────────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes before trying again.' },
  skipSuccessfulRequests: true,
});

app.use(globalLimiter);

// ── Security & middleware ──────────────────────────────────────────────────

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Allow up to 10 MB JSON bodies so base64 images from the image picker work
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Routes ─────────────────────────────────────────────────────────────────

// Strict rate limit on auth mutation endpoints
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// Auth — JWT + bcrypt, in-memory user store (pure JS, no native binary)
app.use('/api/auth',      require('./routes/auth'));

// Directory & Jobs — Supabase-backed (profiles_directory + jobs_board tables)
app.use('/api/directory', require('./routes/directory'));
app.use('/api/jobsboard', require('./routes/jobsBoard'));

// Reviews — in-memory star ratings (userId + businessId + ratingScore + comment)
app.use('/api/reviews', require('./routes/reviews'));

// ── Health check ───────────────────────────────────────────────────────────

app.get('/api/health', async (_req, res) => {
  let supabaseStatus = 'unchecked';
  try {
    const { error } = await supabaseAdmin
      .from('profiles_directory')
      .select('id', { count: 'exact', head: true });
    supabaseStatus = error ? `error: ${error.message}` : 'connected';
  } catch (e) {
    supabaseStatus = `error: ${e.message}`;
  }

  res.json({
    status:    'ok',
    service:   'ABN Community API',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || 'development',
    supabase:  supabaseStatus,
  });
});

// ── API overview ───────────────────────────────────────────────────────────

app.get('/api', (_req, res) => {
  res.json({
    message: 'ABN Community Directory API',
    version: '2.0.0',
    storage: {
      auth:      'In-memory user store (4 demo accounts only)',
      directory: 'In-memory profiles (empty until added via forms)',
      jobs:      'In-memory jobs board (empty until added via forms)',
      reviews:   'In-memory reviews (userId, businessId, ratingScore, comment)',
    },
    endpoints: {
      auth:      '/api/auth      — POST /register  POST /login  GET /me  PUT /me',
      directory: '/api/directory — GET /  GET /mine  GET /:id  POST /  PUT /:id  DELETE /:id  PUT /:id/hiring',
      jobsboard: '/api/jobsboard — GET /  GET /mine  GET /:id  POST /  PUT /:id  DELETE /:id',
      reviews:   '/api/reviews   — GET /?businessId=  POST /',
      health:    '/api/health    — GET /',
    },
    demoAccounts: [
      'business@shiadirectory.com  / password123  (role: business)',
      'service@shiadirectory.com   / password123  (role: service_provider)',
      'manimuhammad000@gmail.com   / password123  (role: customer)',
      'admin@shiadirectory.com     / admin123     (role: admin)',
    ],
  });
});

// ── 404 handler ────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── Global error handler ───────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    console.error(`[ERROR] ${err.status || 500} — ${err.message}`);
  } else {
    console.error('[ERROR]', err.stack || err.message);
  }

  const status = typeof err.status === 'number' ? err.status : 500;
  res.status(status).json({
    error: isProd
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal server error',
    ...(isProd ? {} : { detail: err.code || undefined }),
  });
});

// ── Start ──────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '3001', 10);

// Wait for demo accounts to be hashed before accepting requests
seedPromise.then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀  ABN Community API  →  http://localhost:${PORT}/api`);
    console.log(`    Health check       →  http://localhost:${PORT}/api/health`);
    console.log(`    Environment        →  ${process.env.NODE_ENV || 'development'}\n`);
  });
});

module.exports = app;
