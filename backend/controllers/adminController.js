const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

/**
 * GET /api/admin/dashboard
 * Returns overview stats and recent activity
 */
const getDashboard = async (req, res) => {
  try {
    const [
      visitors,
      projects,
      skills,
      messages,
      certificates,
      gallery,
      blogPosts,
      recentMessages,
      recentProjects,
    ] = await Promise.all([
      query("SELECT COUNT(*) FROM analytics WHERE event_type = 'page_view'"),
      query('SELECT COUNT(*) FROM projects WHERE is_visible = TRUE'),
      query('SELECT COUNT(*) FROM skills WHERE is_visible = TRUE'),
      query('SELECT COUNT(*) FROM messages'),
      query('SELECT COUNT(*) FROM certificates WHERE is_visible = TRUE'),
      query('SELECT COUNT(*) FROM gallery WHERE is_visible = TRUE'),
      query('SELECT COUNT(*) FROM blog_posts WHERE is_published = TRUE'),
      query('SELECT id, full_name, email, subject, is_read, created_at FROM messages ORDER BY created_at DESC LIMIT 5'),
      query('SELECT id, name, category, thumbnail, created_at FROM projects ORDER BY created_at DESC LIMIT 5'),
    ]);

    // Daily and monthly visitor stats
    const dailyVisitors = await query(
      "SELECT DATE(created_at) as date, COUNT(*) as count FROM analytics WHERE event_type = 'page_view' AND created_at >= NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date ASC"
    );

    return res.json({
      success: true,
      data: {
        stats: {
          totalVisitors:    parseInt(visitors.rows[0].count),
          totalProjects:    parseInt(projects.rows[0].count),
          totalSkills:      parseInt(skills.rows[0].count),
          totalMessages:    parseInt(messages.rows[0].count),
          totalCertificates:parseInt(certificates.rows[0].count),
          totalGallery:     parseInt(gallery.rows[0].count),
          totalBlogPosts:   parseInt(blogPosts.rows[0].count),
        },
        recentMessages: recentMessages.rows,
        recentProjects:  recentProjects.rows,
        dailyVisitors:   dailyVisitors.rows,
      },
    });
  } catch (err) {
    logger.error('Dashboard error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PUT /api/admin/profile
 * Update admin profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const avatar = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;

    // Check email uniqueness
    if (email) {
      const existing = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase(), req.user.id]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
    }

    let updateQuery = 'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email)';
    const params = [name || null, email ? email.toLowerCase() : null];

    if (avatar) {
      updateQuery += `, avatar = $${params.length + 1}`;
      params.push(avatar);
    }

    updateQuery += ` WHERE id = $${params.length + 1} RETURNING id, name, email, role, avatar`;
    params.push(req.user.id);

    const result = await query(updateQuery, params);
    return res.json({ success: true, data: result.rows[0], message: 'Profile updated' });
  } catch (err) {
    logger.error('Update profile error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getDashboard, updateProfile };
