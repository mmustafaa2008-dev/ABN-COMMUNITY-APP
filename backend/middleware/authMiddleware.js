/**
 * authMiddleware.js
 *
 * authenticate  — verifies the Bearer JWT and attaches req.user
 * requireRole   — role-based access control guard
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * Extracts and verifies the Bearer token from the Authorization header.
 * Attaches { id, email, role, name } to req.user on success.
 */
const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Include a valid Bearer token.' });
  }

  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Token has expired. Please log in again.'
      : 'Invalid token. Please log in again.';
    return res.status(401).json({ error: message });
  }
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
