/**
 * routes/categories.js
 *
 * GET    /api/categories        — list all categories (public)
 * POST   /api/categories        — create category (admin only)
 * DELETE /api/categories/:id    — delete category (admin only)
 */

const express = require('express');
const { db }  = require('../db');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

const mapCategory = (c) => ({
  id:       c.id,
  name:     { en: c.name_en, ar: c.name_ar },
  group:    c.group_name,
  iconName: c.icon_name,
});

// ── GET /api/categories ───────────────────────────────────────────────────
router.get('/', (_req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY group_name, name_en').all().map(mapCategory));
});

// ── POST /api/categories ──────────────────────────────────────────────────
router.post('/', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const { id, name, group, iconName } = req.body;
    if (!id || !name?.en || !group || !iconName) {
      return res.status(400).json({ error: 'id, name.en, group and iconName are required.' });
    }
    db.prepare(
      'INSERT INTO categories (id, name_en, name_ar, group_name, icon_name) VALUES (?,?,?,?,?)'
    ).run(id, name.en, name.ar || '', group, iconName);

    res.status(201).json(mapCategory(db.prepare('SELECT * FROM categories WHERE id = ?').get(id)));
  } catch (err) { next(err); }
});

// ── DELETE /api/categories/:id ────────────────────────────────────────────
router.delete('/:id', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const info = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Category not found.' });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
