'use strict';

/**
 * Storage mode for the ABN backend.
 *
 * STORAGE_MODE=supabase  → persist auth, directory, jobs, reviews in Supabase
 * STORAGE_MODE=memory  → volatile in-process stores (dev fallback only)
 *
 * Defaults to supabase when SUPABASE_URL + secret/service key are set.
 */

const hasSupabaseSecretKey = Boolean(
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const STORAGE_MODE = (process.env.STORAGE_MODE || '').toLowerCase() === 'memory'
  ? 'memory'
  : (process.env.SUPABASE_URL && hasSupabaseSecretKey)
    ? 'supabase'
    : 'memory';

const isSupabaseStorage = () => STORAGE_MODE === 'supabase';

const storageMeta = () => (isSupabaseStorage()
  ? {
      mode: 'supabase',
      auth: 'Supabase table app_users',
      directory: 'Supabase table profiles_directory',
      jobs: 'Supabase table jobs_board',
      reviews: 'Supabase table business_reviews',
    }
  : {
      mode: 'memory',
      auth: 'In-memory user store (demo accounts only)',
      directory: 'In-memory profiles (lost on restart)',
      jobs: 'In-memory jobs board (lost on restart)',
      reviews: 'In-memory reviews (lost on restart)',
    });

/** Ping Supabase on startup — throws if required tables are missing. */
async function verifySupabaseConnection(supabaseAdmin) {
  const required = [
    { table: 'profiles_directory', migration: '001_init_supabase.sql' },
    { table: 'jobs_board', migration: '001_init_supabase.sql' },
    { table: 'app_users', migration: '003_persistence_extras.sql' },
  ];
  const optional = [
    { table: 'business_reviews', migration: '003_persistence_extras.sql' },
  ];

  for (const { table, migration } of required) {
    const { error } = await supabaseAdmin.from(table).select('*').limit(1);
    if (error) {
      throw new Error(
        `Supabase table "${table}" is not reachable: ${error.message}. ` +
        `Run backend/migrations/${migration} in the Supabase SQL Editor.`,
      );
    }
  }

  for (const { table, migration } of optional) {
    const { error } = await supabaseAdmin.from(table).select('*').limit(1);
    if (error) {
      console.warn(
        `[storage] Optional table "${table}" missing — reviews will fail until you run ${migration}`,
      );
    }
  }

  return true;
}

module.exports = {
  STORAGE_MODE,
  isSupabaseStorage,
  storageMeta,
  verifySupabaseConnection,
};
