/**
 * routes/jobsBoard.js — Live jobs board backed by Supabase
 *
 * GET    /api/jobsboard             — public: all active jobs (optional ?category=)
 * GET    /api/jobsboard/mine        — auth (business_owner): your own jobs (all states)
 * GET    /api/jobsboard/:id         — public: single job detail
 * POST   /api/jobsboard             — auth (business_owner): post a new job
 * PUT    /api/jobsboard/:id         — auth (business_owner): edit own job
 * DELETE /api/jobsboard/:id         — auth (business_owner): delete own job
 */

const express = require('express');
const { supabaseAnon, supabaseAdmin } = require('../supabase');
const { authenticate, requireRole }   = require('../middleware/authMiddleware');

const router = express.Router();

const VALID_CATEGORIES = ['IT', 'Graphic Designing', 'Developer', 'Chef', 'Maid', 'Others'];

// ── Shape a Supabase row into a clean API response ────────────────────────
const mapJob = (row) => ({
  id:               row.id,
  businessId:       row.business_id,
  businessName:     row.business_name,
  businessLogoUrl:  row.business_logo_url,
  title:            row.title,
  category:         row.category,
  requirements:     row.requirements,
  salaryMin:        row.salary_min,
  salaryMax:        row.salary_max,
  hiringEmail:      row.hiring_email,
  isActive:         row.is_active,
  postedDate:       row.posted_date,
  createdAt:        row.created_at,
});

// ── GET /api/jobsboard ────────────────────────────────────────────────────
// Public feed: active jobs where the parent business also has hiring ON.
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;

    // Join to profiles_directory to ensure hiring_active = true on the business
    let query = supabaseAnon
      .from('jobs_board')
      .select(`
        *,
        profiles_directory!inner (
          hiring_active,
          is_active
        )
      `)
      .eq('is_active', true)
      .eq('profiles_directory.hiring_active', true)
      .eq('profiles_directory.is_active', true)
      .order('created_at', { ascending: false });

    if (category && VALID_CATEGORIES.includes(category)) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Strip the joined relation before sending to client
    res.json(data.map((row) => {
      // eslint-disable-next-line no-unused-vars
      const { profiles_directory: _pd, ...job } = row;
      return mapJob(job);
    }));
  } catch (err) { next(err); }
});

// ── GET /api/jobsboard/mine ───────────────────────────────────────────────
router.get('/mine', authenticate, requireRole('business'), async (req, res, next) => {
  try {
    // Find the caller's directory profile
    const { data: profile } = await supabaseAdmin
      .from('profiles_directory')
      .select('id')
      .eq('email', req.user.email)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'You do not have a directory profile yet.' });
    }

    const { data, error } = await supabaseAdmin
      .from('jobs_board')
      .select('*')
      .eq('business_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data.map(mapJob));
  } catch (err) { next(err); }
});

// ── GET /api/jobsboard/:id ────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAnon
      .from('jobs_board')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Job not found.' });
    }
    if (error) throw error;

    res.json(mapJob(data));
  } catch (err) { next(err); }
});

// ── POST /api/jobsboard ───────────────────────────────────────────────────
router.post('/', authenticate, requireRole('business'), async (req, res, next) => {
  try {
    const {
      title, category, requirements = '',
      salaryMin, salaryMax, hiringEmail,
    } = req.body;

    // Validation
    if (!title)       return res.status(400).json({ error: 'title is required.' });
    if (!hiringEmail) return res.status(400).json({ error: 'hiringEmail is required.' });
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
      });
    }
    const min = parseFloat(salaryMin);
    const max = parseFloat(salaryMax);
    if (isNaN(min) || isNaN(max) || min < 0 || max < min) {
      return res.status(400).json({
        error: 'salaryMin and salaryMax must be valid positive numbers (min ≤ max).',
      });
    }

    // Fetch caller's profile
    const { data: profile } = await supabaseAdmin
      .from('profiles_directory')
      .select('id, business_name, image_url, hiring_active')
      .eq('email', req.user.email)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'You must have a directory profile before posting jobs.' });
    }
    if (!profile.hiring_active) {
      return res.status(403).json({
        error: 'Hiring is not active on your profile. Enable it first from the Account tab.',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('jobs_board')
      .insert({
        business_id:        profile.id,
        business_name:      profile.business_name,
        business_logo_url:  profile.image_url,
        title,
        category,
        requirements,
        salary_min:   min,
        salary_max:   max,
        hiring_email: hiringEmail,
        is_active:    true,
        posted_date:  new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(mapJob(data));
  } catch (err) { next(err); }
});

// ── PUT /api/jobsboard/:id ────────────────────────────────────────────────
router.put('/:id', authenticate, requireRole('business'), async (req, res, next) => {
  try {
    // Fetch job and verify ownership
    const { data: job } = await supabaseAdmin
      .from('jobs_board')
      .select('id, business_id')
      .eq('id', req.params.id)
      .single();

    if (!job) return res.status(404).json({ error: 'Job not found.' });

    const { data: profile } = await supabaseAdmin
      .from('profiles_directory')
      .select('id')
      .eq('email', req.user.email)
      .single();

    if (!profile || profile.id !== job.business_id) {
      return res.status(403).json({ error: 'You can only edit your own job postings.' });
    }

    const { title, category, requirements, salaryMin, salaryMax, hiringEmail } = req.body;

    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
      });
    }

    const updates = {};
    if (title        !== undefined) updates.title        = title;
    if (category     !== undefined) updates.category     = category;
    if (requirements !== undefined) updates.requirements = requirements;
    if (hiringEmail  !== undefined) updates.hiring_email = hiringEmail;
    if (salaryMin    !== undefined) updates.salary_min   = parseFloat(salaryMin);
    if (salaryMax    !== undefined) updates.salary_max   = parseFloat(salaryMax);

    const { data, error } = await supabaseAdmin
      .from('jobs_board')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(mapJob(data));
  } catch (err) { next(err); }
});

// ── DELETE /api/jobsboard/:id ─────────────────────────────────────────────
router.delete('/:id', authenticate, requireRole('business'), async (req, res, next) => {
  try {
    const { data: job } = await supabaseAdmin
      .from('jobs_board')
      .select('id, business_id')
      .eq('id', req.params.id)
      .single();

    if (!job) return res.status(404).json({ error: 'Job not found.' });

    const { data: profile } = await supabaseAdmin
      .from('profiles_directory')
      .select('id')
      .eq('email', req.user.email)
      .single();

    if (!profile || profile.id !== job.business_id) {
      return res.status(403).json({ error: 'You can only delete your own job postings.' });
    }

    const { error } = await supabaseAdmin
      .from('jobs_board')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
