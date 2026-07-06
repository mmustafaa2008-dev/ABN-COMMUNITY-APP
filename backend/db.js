/**
 * db.js — In-memory user store (pure JavaScript, zero native dependencies)
 *
 * Replaces the old better-sqlite3 layer.  All live business / jobs data lives
 * in Supabase.  This module only manages the user accounts that the auth routes
 * need (register / login / me).
 *
 * Data resets on server restart — demo accounts are re-seeded automatically.
 */

'use strict';

const bcrypt = require('bcryptjs');

// ---------------------------------------------------------------------------
// User store:  Map<email (lowercase) → userRecord>
// ---------------------------------------------------------------------------
const users = new Map();

// ---------------------------------------------------------------------------
// Demo accounts — seeded once at startup so test logins work immediately
// ---------------------------------------------------------------------------
const DEMO_ACCOUNTS = [
  {
    email:    'business@shiadirectory.com',
    password: 'password123',
    role:     'business',
    name:     'Hassan Al-Kawthar',
    phone:    '+1 770 123 4567',
  },
  {
    email:    'service@shiadirectory.com',
    password: 'password123',
    role:     'service_provider',
    name:     'Noor Electricians (Demo)',
    phone:    '+1 780 987 6543',
  },
  {
    email:    'manimuhammad000@gmail.com',
    password: 'password123',
    role:     'customer',
    name:     'Mani Muhammad',
    phone:    '+1 770 111 2222',
  },
  {
    email:    'admin@shiadirectory.com',
    password: 'admin123',
    role:     'admin',
    name:     'Abu Murtadha (Admin)',
    phone:    '+1 780 000 0000',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a deterministic user id:  "business-hassanalkawthar..." */
const stableId = (role, email) =>
  `${role}-${email.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;

/** Unique time-based id with optional prefix */
const newId = (prefix = '') =>
  `${prefix}${prefix ? '-' : ''}${Date.now()}${Math.floor(Math.random() * 1000)}`;

/** Today as an ISO date string (YYYY-MM-DD) */
const today = () => new Date().toISOString().split('T')[0];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
const HASH_ROUNDS = 10; // 10 rounds is fast at startup and still secure enough

async function seedDemoAccounts() {
  for (const d of DEMO_ACCOUNTS) {
    const key = d.email.toLowerCase();
    if (users.has(key)) continue; // idempotent — safe to call multiple times

    const passwordHash = await bcrypt.hash(d.password, HASH_ROUNDS);
    users.set(key, {
      id:                stableId(d.role, key),
      email:             key,
      phone:             d.phone,
      name:              d.name,
      role:              d.role,
      passwordHash,
      preferredLanguage: 'en',
    });
  }
  console.log(`[db] In-memory store ready — ${users.size} accounts seeded.`);
}

// Kick off async seeding immediately (server.js awaits via the exported promise)
const seedPromise = seedDemoAccounts().catch((err) =>
  console.error('[db] Seed error:', err.message)
);

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = { users, stableId, newId, today, seedPromise };
