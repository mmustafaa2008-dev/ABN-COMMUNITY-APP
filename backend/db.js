/**
 * db.js — In-memory stores (pure JavaScript, zero native dependencies)
 *
 * • users             — 4 demo auth accounts (seeded at startup)
 * • reviews           — star ratings (empty until users submit)
 * • directoryProfiles — business/service listings (EMPTY — add via forms)
 * • jobsBoard         — job postings (EMPTY — add via forms)
 *
 * Supabase seed rows are wiped on every server start so old demo data
 * (Al-Kawthar Grocery, Deli Chef, etc.) cannot reappear.
 */

'use strict';

const bcrypt = require('bcryptjs');

// ---------------------------------------------------------------------------
// Stores
// ---------------------------------------------------------------------------
const users = new Map();
const reviews = [];

/** @type {Array<Record<string, unknown>>} — API-shaped directory profiles */
const directoryProfiles = [];

/** @type {Array<Record<string, unknown>>} — API-shaped job rows */
const jobsBoard = [];

// ---------------------------------------------------------------------------
// Demo auth accounts ONLY — no mock listings or jobs
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

const stableId = (role, email) =>
  `${role}-${email.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;

const newId = (prefix = '') =>
  `${prefix}${prefix ? '-' : ''}${Date.now()}${Math.floor(Math.random() * 1000)}`;

const today = () => new Date().toISOString().split('T')[0];

// ---------------------------------------------------------------------------
// Wipe any leftover Supabase seed/demo rows on startup
// ---------------------------------------------------------------------------
async function wipeSupabaseDemoData() {
  if (process.env.SKIP_SUPABASE_WIPE === 'true') return;

  try {
    const { supabaseAdmin } = require('./supabase');
    const { error: jobsErr } = await supabaseAdmin
      .from('jobs_board')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: dirErr } = await supabaseAdmin
      .from('profiles_directory')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (!jobsErr && !dirErr) {
      console.log('[db] Supabase demo listings & jobs wiped (clean slate).');
    } else if (jobsErr || dirErr) {
      console.warn('[db] Supabase wipe skipped:', jobsErr?.message || dirErr?.message);
    }
  } catch (e) {
    console.warn('[db] Supabase not configured — in-memory store only.');
  }
}

// ---------------------------------------------------------------------------
// Seed demo auth accounts only
// ---------------------------------------------------------------------------
const HASH_ROUNDS = 10;

async function seedDemoAccounts() {
  await wipeSupabaseDemoData();

  for (const d of DEMO_ACCOUNTS) {
    const key = d.email.toLowerCase();
    if (users.has(key)) continue;

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

  console.log(
    `[db] Ready — ${users.size} auth accounts | ` +
    `${directoryProfiles.length} listings | ${jobsBoard.length} jobs | ${reviews.length} reviews`
  );
}

const seedPromise = seedDemoAccounts().catch((err) =>
  console.error('[db] Seed error:', err.message)
);

module.exports = {
  users,
  reviews,
  directoryProfiles,
  jobsBoard,
  stableId,
  newId,
  today,
  seedPromise,
};
