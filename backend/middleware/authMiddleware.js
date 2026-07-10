/**
 * authMiddleware.js
 *
 * authenticate  — verifies Bearer JWT (app or Supabase) and attaches req.user
 * requireRole   — role-based access control guard
 */

const jwt = require('jsonwebtoken');
const { verifyCredentials } = require('@supabase/server/core');
const { users } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

const hasSupabaseAuth =
  Boolean(process.env.SUPABASE_URL) &&
  Boolean(
    process.env.SUPABASE_JWKS_URL ||
    process.env.SUPABASE_JWKS ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

let supabaseAdmin = null;
try {
  if (hasSupabaseAuth) {
    supabaseAdmin = require('../supabase').supabaseAdmin;
  }
} catch {
  // Supabase optional — app JWT auth still works
}

const mapDbUser = (u) => ({
  id: u.id,
  email: u.email,
  role: u.role,
  name: u.name,
});

const applySupabaseUser = (req, authUser) => {
  const email = authUser.email?.toLowerCase().trim() ?? '';
  const dbUser = email ? users.get(email) : null;

  if (dbUser) {
    req.user = mapDbUser(dbUser);
    return;
  }

  const meta = authUser.user_metadata ?? authUser.userMetadata ?? {};
  const appMeta = authUser.app_metadata ?? authUser.appMetadata ?? {};
  req.user = {
    id: authUser.id ?? authUser.sub,
    email,
    role: appMeta.role || meta.role || 'customer',
    name: meta.name || email.split('@')[0] || 'User',
  };
};

/**
 * Extracts and verifies the Bearer token from the Authorization header.
 * Accepts Express-issued JWTs and Supabase access tokens when configured.
 * Attaches { id, email, role, name } to req.user on success.
 */
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Include a valid Bearer token.' });
  }

  const token = header.slice(7);

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    // fall through — try Supabase JWT
  }

  if (hasSupabaseAuth) {
    try {
      const { data: auth, error } = await verifyCredentials(
        { token, apikey: null },
        { auth: 'user' },
      );

      if (!error && auth?.userClaims) {
        applySupabaseUser(req, auth.userClaims);
        return next();
      }
    } catch {
      // fall through — legacy getUser path
    }

    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !data?.user) {
          throw error || new Error('Invalid Supabase token.');
        }
        applySupabaseUser(req, data.user);
        return next();
      } catch {
        // fall through
      }
    }
  }

  return res.status(401).json({ error: 'Invalid token. Please log in again.' });
};

/**
 * Usage: router.post('/admin-only', authenticate, requireRole('admin'), handler)
 *        router.post('/biz-route',  authenticate, requireRole('business', 'admin'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Access denied. This endpoint requires one of: ${roles.join(', ')}`,
    });
  }
  next();
};

module.exports = { authenticate, requireRole };
