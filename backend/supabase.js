/**
 * supabase.js — Supabase clients via @supabase/server
 *
 * Prefers new API keys (SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY).
 * Falls back to legacy JWT keys (SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY).
 *
 *  supabaseAnon   — RLS-scoped public client
 *  supabaseAdmin  — bypasses RLS (backend routes only)
 */

require('dotenv').config();

const { createAdminClient, createContextClient } = require('@supabase/server/core');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;

const hasNewKeys =
  Boolean(process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEYS) &&
  Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEYS);

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error('Missing env var: SUPABASE_URL');
}
if (!SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing env var: SUPABASE_PUBLISHABLE_KEY (or legacy SUPABASE_ANON_KEY)',
  );
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing env var: SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY)',
  );
}

if (!hasNewKeys && SUPABASE_ANON_KEY === SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '\n⚠️  WARNING: anon and service keys are identical. Use separate publishable/secret keys.\n',
  );
}

const serverClientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};

let supabaseAnon;
let supabaseAdmin;

if (hasNewKeys) {
  supabaseAnon = createContextClient();
  supabaseAdmin = createAdminClient();
} else {
  supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, serverClientOptions);
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, serverClientOptions);
}

module.exports = {
  supabaseAnon,
  supabaseAdmin,
  hasNewSupabaseKeys: hasNewKeys,
};
