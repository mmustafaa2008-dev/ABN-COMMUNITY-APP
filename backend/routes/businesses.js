/**
 * routes/businesses.js
 *
 * GET    /api/businesses              — list all (with optional filters)
 * GET    /api/businesses/mine         — current user's own listing
 * GET    /api/businesses/:id          — single listing
 * POST   /api/businesses              — create (business / service_provider)
 * PUT    /api/businesses/:id          — update (owner or admin)
 * DELETE /api/businesses/:id          — delete (owner or admin)
 */

const express = require('express');
const { db, newId, today, mapBusiness } = require('../db');
const { authenticate, requireRole }     = require('../middleware/authMiddleware');

const router = express.Router();

// ── Image guard ───────────────────────────────────────────────────────────
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Validates a logoUrl / coverUrl value.
 * • If it is a base64 data-URI, reject anything larger than 2 MB.
 * • If it is a plain https URL, allow it through.
 * Returns an error string if invalid, or null if OK.
 */
function validateImageField(value, fieldName) {
  if (!value) return null; // empty / not provided — fine

  if (value.startsWith('data:')) {
    // data:[<mediatype>][;base64],<data>
    // The base64 payload starts after the first comma
    const commaIdx = value.indexOf(',');
    if (commaIdx === -1) {
      return `${fieldName}: invalid data-URI format.`;
    }
    // Check MIME type — only allow image types
    const header = value.slice(0, commaIdx);
    if (!header.startsWith('data:image/')) {
      return `${fieldName}: only image files are allowed (jpeg, png, webp, gif).`;
    }
    // Size check: base64 encodes ~4 chars per 3 bytes
    const base64Payload = value.slice(commaIdx + 1);
    const approximateBytes = Math.ceil((base64Payload.length * 3) / 4);
    if (approximateBytes > MAX_IMAGE_BYTES) {
      return `${fieldName}: image exceeds the 2 MB limit. Please compress or resize the image.`;
    }
  } else if (!value.startsWith('http://') && !value.startsWith('https://')) {
    return `${fieldName}: must be a valid https URL or a base64 data-URI.`;
  }

  return null; // passed
}

// ── GET /api/businesses ───────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { city, status, categoryId, search } = req.query;
  let sql = 'SELECT * FROM businesses WHERE 1=1';
  const params = [];

  if (city)       { sql += ' AND city = ?';       params.push(city); }
  if (status)     { sql += ' AND status = ?';     params.push(status); }
  if (categoryId) { sql += ' AND category_id = ?'; params.push(categoryId); }
  if (search)     { sql += ' AND (name LIKE ? OR description_en LIKE ? OR subcategory_en LIKE ?)';
                    const like = `%${search}%`;
                    params.push(like, like, like); }

  sql += ' ORDER BY is_verified DESC, rating DESC';

  res.json(db.prepare(sql).all(...params).map(mapBusiness));
});

// ── GET /api/businesses/mine ──────────────────────────────────────────────
router.get('/mine', authenticate, (req, res) => {
  const b = db.prepare('SELECT * FROM businesses WHERE owner_id = ?').get(req.user.id);
  if (!b) return res.status(404).json({ error: 'You do not have a business listing yet.' });
  res.json(mapBusiness(b));
});

// ── GET /api/businesses/:id ───────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const b = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id);
  if (!b) return res.status(404).json({ error: 'Business not found.' });
  res.json(mapBusiness(b));
});

// ── POST /api/businesses ──────────────────────────────────────────────────
router.post('/', authenticate, requireRole('business', 'service_provider', 'admin'), (req, res, next) => {
  try {
    const {
      name, logoUrl = '', coverUrl = '',
      description = {}, categoryId,
      subcategory = {}, address = '', city = '', area = '',
      phone = '', whatsapp = '', website = '',
      workingHours = {}, membershipExpiryDate,
    } = req.body;

    if (!name)       return res.status(400).json({ error: 'name is required.' });
    if (!categoryId) return res.status(400).json({ error: 'categoryId is required.' });

    // Validate images before anything hits the database
    const logoErr  = validateImageField(logoUrl,  'logoUrl');
    const coverErr = validateImageField(coverUrl, 'coverUrl');
    if (logoErr)  return res.status(400).json({ error: logoErr });
    if (coverErr) return res.status(400).json({ error: coverErr });

    const existing = db.prepare('SELECT id FROM businesses WHERE owner_id = ?').get(req.user.id);
    if (existing) {
      return res.status(409).json({ error: 'You already have a registered business listing.' });
    }

    const id = `biz-${Date.now()}`;
    const expiry = membershipExpiryDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO businesses
        (id, owner_id, name, logo_url, cover_url, description_en, description_ar,
         category_id, subcategory_en, subcategory_ar, address, city, area,
         phone, whatsapp, website, working_hours_en, working_hours_ar, membership_expiry_date)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      id, req.user.id, name, logoUrl, coverUrl,
      description.en || '', description.ar || '',
      categoryId,
      subcategory.en || '', subcategory.ar || '',
      address, city, area,
      phone, whatsapp, website,
      workingHours.en || '', workingHours.ar || '',
      expiry,
    );

    res.status(201).json(mapBusiness(db.prepare('SELECT * FROM businesses WHERE id = ?').get(id)));
  } catch (err) { next(err); }
});

// ── PUT /api/businesses/:id ───────────────────────────────────────────────
router.put('/:id', authenticate, (req, res, next) => {
  try {
    const biz = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id);
    if (!biz) return res.status(404).json({ error: 'Business not found.' });

    if (biz.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const {
      name, logoUrl, coverUrl,
      description, categoryId, subcategory,
      address, city, area,
      phone, whatsapp, website,
      workingHours, membershipExpiryDate,
      isVerified, status,
    } = req.body;

    // Validate any new images provided during an update
    const logoErr  = validateImageField(logoUrl,  'logoUrl');
    const coverErr = validateImageField(coverUrl, 'coverUrl');
    if (logoErr)  return res.status(400).json({ error: logoErr });
    if (coverErr) return res.status(400).json({ error: coverErr });

    db.prepare(`
      UPDATE businesses SET
        name                    = COALESCE(?, name),
        logo_url                = COALESCE(?, logo_url),
        cover_url               = COALESCE(?, cover_url),
        description_en          = COALESCE(?, description_en),
        description_ar          = COALESCE(?, description_ar),
        category_id             = COALESCE(?, category_id),
        subcategory_en          = COALESCE(?, subcategory_en),
        subcategory_ar          = COALESCE(?, subcategory_ar),
        address                 = COALESCE(?, address),
        city                    = COALESCE(?, city),
        area                    = COALESCE(?, area),
        phone                   = COALESCE(?, phone),
        whatsapp                = COALESCE(?, whatsapp),
        website                 = COALESCE(?, website),
        working_hours_en        = COALESCE(?, working_hours_en),
        working_hours_ar        = COALESCE(?, working_hours_ar),
        membership_expiry_date  = COALESCE(?, membership_expiry_date),
        is_verified             = COALESCE(?, is_verified),
        status                  = COALESCE(?, status)
      WHERE id = ?
    `).run(
      name       ?? null,
      logoUrl    ?? null,
      coverUrl   ?? null,
      description?.en ?? null,
      description?.ar ?? null,
      categoryId ?? null,
      subcategory?.en ?? null,
      subcategory?.ar ?? null,
      address ?? null, city ?? null, area ?? null,
      phone ?? null, whatsapp ?? null, website ?? null,
      workingHours?.en ?? null, workingHours?.ar ?? null,
      membershipExpiryDate ?? null,
      isVerified !== undefined ? (isVerified ? 1 : 0) : null,
      status ?? null,
      req.params.id,
    );

    res.json(mapBusiness(db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id)));
  } catch (err) { next(err); }
});

// ── DELETE /api/businesses/:id ────────────────────────────────────────────
router.delete('/:id', authenticate, (req, res, next) => {
  try {
    const biz = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id);
    if (!biz) return res.status(404).json({ error: 'Business not found.' });

    if (biz.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    db.prepare('DELETE FROM businesses WHERE id = ?').run(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
