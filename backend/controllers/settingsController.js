const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * GET /api/settings  (public)
 */
const getSettings = async (req, res) => {
  try {
    const result = await query('SELECT * FROM settings LIMIT 1');
    return res.json({ success: true, data: result.rows[0] || {} });
  } catch (err) {
    logger.error('Get settings error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PUT /api/admin/settings  (protected)
 */
const updateSettings = async (req, res) => {
  try {
    const fields = [
      'site_name','footer_text','seo_title','seo_desc','meta_keywords',
      'hero_title','hero_subtitle','hero_desc','hero_cta_text','hero_professions',
      'about_bio','about_age','about_location','about_years_exp','about_projects_count',
      'cv_url','email','phone',
    ];

    // Build dynamic SET clause for only provided fields
    const updates = [];
    const values  = [];
    let idx = 1;

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${idx}`);
        values.push(req.body[field]);
        idx++;
      }
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.site_logo) {
        updates.push(`site_logo = $${idx}`);
        values.push(`/uploads/profiles/${req.files.site_logo[0].filename}`);
        idx++;
      }
      if (req.files.favicon) {
        updates.push(`favicon = $${idx}`);
        values.push(`/uploads/profiles/${req.files.favicon[0].filename}`);
        idx++;
      }
      if (req.files.hero_image) {
        updates.push(`hero_image = $${idx}`);
        values.push(`/uploads/profiles/${req.files.hero_image[0].filename}`);
        idx++;
      }
      if (req.files.about_image) {
        updates.push(`about_image = $${idx}`);
        values.push(`/uploads/profiles/${req.files.about_image[0].filename}`);
        idx++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const exists = await query('SELECT id FROM settings LIMIT 1');
    let result;

    if (exists.rows.length === 0) {
      result = await query(`INSERT INTO settings (${updates.map((u) => u.split(' = ')[0]).join(',')}) VALUES (${values.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`, values);
    } else {
      result = await query(`UPDATE settings SET ${updates.join(', ')}, updated_at = NOW() WHERE id = (SELECT id FROM settings LIMIT 1) RETURNING *`, values);
    }

    return res.json({ success: true, data: result.rows[0], message: 'Settings updated' });
  } catch (err) {
    logger.error('Update settings error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getSettings, updateSettings };
