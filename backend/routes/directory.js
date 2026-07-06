/**
 * routes/directory.js — Live business directory backed by Supabase
 *
 * GET  /api/directory              — public: list all active profiles
 * GET  /api/directory/:id          — public: single profile
 * POST /api/directory              — auth (business/service_provider): create profile
 * PUT  /api/directory/:id          — auth (owner): update profile
 * DELETE /api/directory/:id        — auth (owner or admin): delete profile
 * PUT  /api/directory/:id/hiring   — auth (business_owner): toggle hiring_active
 */

const express = require('express');
const { supabaseAnon, supabaseAdmin } = require('../supabase');
const { authenticate, requireRole }   = require('../middleware/authMiddleware');

const router = express.Router();

// ── Helper: shape a Supabase row into a clean API response ────────────────
const mapProfile = (row) => ({
  id:                 row.id,
  email:              row.email,
  role:               row.role,
  businessName:       row.business_name,
  category:           row.category,
  subscriptionStatus: row.subscription_status,
  subscriptionTier:   row.subscription_tier,
  imageUrl:           row.image_url,
  coverUrl:           row.cover_url,
  description:        row.description,
  address:            row.address,
  area:               row.area,
  city:               row.city,
  phone:              row.phone,
  whatsapp:           row.whatsapp,
  website:            row.website,
  workingHours:       row.working_hours,
  hiringActive:       row.hiring_active,
  isVerified:         row.is_verified,
  isActive:           row.is_active,
  rating:             row.rating,
  reviewsCount:       row.reviews_count,
  membershipExpiry:   row.membership_expiry,
  createdAt:          row.created_at,
});

// ── GET /api/directory ────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { city, category, search, role } = req.query;

    // Start with public anon client (honours RLS — only active=true rows)
    let query = supabaseAnon
      .from('profiles_directory')
      .select('*')
      .order('is_verified', { ascending: false })
      .order('rating', { ascending: false });

    if (city)     query = query.ilike('city', city);
    if (category) query = query.ilike('category', `%${category}%`);
    if (role)     query = query.eq('role', role);
    if (search) {
      query = query.or(
        `business_name.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data.map(mapProfile));
  } catch (err) { next(err); }
});

// ── GET /api/directory/mine ───────────────────────────────────────────────
router.get('/mine', authenticate, async (req, res, next) => {
  try {
    // Use admin client so it can see suspended/inactive profiles too
    const { data, error } = await supabaseAdmin
      .from('profiles_directory')
      .select('*')
      .eq('email', req.user.email)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'You do not have a directory profile yet.' });
    }
    if (error) throw error;

    res.json(mapProfile(data));
  } catch (err) { next(err); }
});

// ── GET /api/directory/:id ────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAnon
      .from('profiles_directory')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    if (error) throw error;

    res.json(mapProfile(data));
  } catch (err) { next(err); }
});

// ── POST /api/directory ───────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  requireRole('business', 'service_provider', 'admin'),
  async (req, res, next) => {
    try {
      const {
        businessName, category, description,
        imageUrl = '', coverUrl = '',
        address = '', area = '', city = '',
        phone = '', whatsapp = '', website = '',
        workingHours = '', membershipExpiry,
        subscriptionTier,
      } = req.body;

      if (!businessName) return res.status(400).json({ error: 'businessName is required.' });
      if (!category)     return res.status(400).json({ error: 'category is required.' });

      // Prevent duplicate profiles
      const { data: existing } = await supabaseAdmin
        .from('profiles_directory')
        .select('id')
        .eq('email', req.user.email)
        .maybeSingle();

      if (existing) {
        return res.status(409).json({ error: 'A directory profile already exists for your account.' });
      }

      const tier = subscriptionTier ??
        (req.user.role === 'business' ? 50 : 30);

      const expiry = membershipExpiry ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data, error } = await supabaseAdmin
        .from('profiles_directory')
        .insert({
          email:               req.user.email,
          role:                req.user.role === 'business' ? 'business_owner' : req.user.role,
          business_name:       businessName,
          category,
          subscription_status: 'active',
          subscription_tier:   tier,
          image_url:           imageUrl,
          cover_url:           coverUrl,
          description,
          address, area, city,
          phone, whatsapp, website,
          working_hours:       workingHours,
          membership_expiry:   expiry,
          is_verified:         false,
          is_active:           true,
        })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(mapProfile(data));
    } catch (err) { next(err); }
  }
);

// ── PUT /api/directory/:id ────────────────────────────────────────────────
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    // Verify ownership
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('profiles_directory')
      .select('id, email')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !existing) return res.status(404).json({ error: 'Profile not found.' });
    if (existing.email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const {
      businessName, category, description,
      imageUrl, coverUrl,
      address, area, city,
      phone, whatsapp, website,
      workingHours, membershipExpiry,
      subscriptionStatus, isVerified,
    } = req.body;

    // Build update object — only include defined fields
    const updates = {};
    if (businessName      !== undefined) updates.business_name       = businessName;
    if (category          !== undefined) updates.category             = category;
    if (description       !== undefined) updates.description          = description;
    if (imageUrl          !== undefined) updates.image_url            = imageUrl;
    if (coverUrl          !== undefined) updates.cover_url            = coverUrl;
    if (address           !== undefined) updates.address              = address;
    if (area              !== undefined) updates.area                 = area;
    if (city              !== undefined) updates.city                 = city;
    if (phone             !== undefined) updates.phone                = phone;
    if (whatsapp          !== undefined) updates.whatsapp             = whatsapp;
    if (website           !== undefined) updates.website              = website;
    if (workingHours      !== undefined) updates.working_hours        = workingHours;
    if (membershipExpiry  !== undefined) updates.membership_expiry    = membershipExpiry;
    if (subscriptionStatus!== undefined) updates.subscription_status  = subscriptionStatus;
    if (isVerified        !== undefined) updates.is_verified          = isVerified;

    const { data, error } = await supabaseAdmin
      .from('profiles_directory')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(mapProfile(data));
  } catch (err) { next(err); }
});

// ── DELETE /api/directory/:id ─────────────────────────────────────────────
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { data: existing } = await supabaseAdmin
      .from('profiles_directory')
      .select('id, email')
      .eq('id', req.params.id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Profile not found.' });
    if (existing.email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const { error } = await supabaseAdmin
      .from('profiles_directory')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).end();
  } catch (err) { next(err); }
});

// ── PUT /api/directory/:id/hiring ─────────────────────────────────────────
// Toggle hiring_active for a business; syncs all child jobs accordingly.
router.put('/:id/hiring', authenticate, requireRole('business'), async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive (boolean) is required.' });
    }

    // Confirm ownership
    const { data: profile } = await supabaseAdmin
      .from('profiles_directory')
      .select('id, email')
      .eq('id', req.params.id)
      .single();

    if (!profile) return res.status(404).json({ error: 'Profile not found.' });
    if (profile.email !== req.user.email) return res.status(403).json({ error: 'Forbidden.' });

    // Update hiring toggle on the profile
    await supabaseAdmin
      .from('profiles_directory')
      .update({ hiring_active: isActive })
      .eq('id', req.params.id);

    // Cascade: deactivate / reactivate all jobs for this business
    await supabaseAdmin
      .from('jobs_board')
      .update({ is_active: isActive })
      .eq('business_id', req.params.id);

    res.json({ businessId: req.params.id, hiringActive: isActive });
  } catch (err) { next(err); }
});

module.exports = router;
