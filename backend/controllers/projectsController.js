const { query } = require('../config/database');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

const getAll = async (req, res) => {
  try {
    const adminMode = req.user !== undefined;
    const { page = 1, limit = 10, category, search, status, featured } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [];
    const params = [];
    let idx = 1;

    if (!adminMode) { conditions.push(`is_visible = TRUE`); }
    if (category)   { conditions.push(`category = $${idx++}`); params.push(category); }
    if (status)     { conditions.push(`status = $${idx++}`);   params.push(status); }
    if (featured === 'true') { conditions.push(`is_featured = TRUE`); }
    if (search)     {
      conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(`SELECT COUNT(*) FROM projects ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(parseInt(limit), offset);
    const dataResult = await query(
      `SELECT * FROM projects ${where} ORDER BY display_order ASC, created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    return res.json({
      success: true,
      data: dataResult.rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    logger.error('Projects getAll error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getOne = async (req, res) => {
  try {
    const result = await query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Project not found' });

    // Track view
    if (!req.user) {
      await query(
        "INSERT INTO analytics (event_type, page, project_id, ip_address) VALUES ('project_view', $1, $2, $3)",
        [`/projects/${req.params.id}`, req.params.id, req.ip]
      );
      await query('UPDATE projects SET view_count = view_count + 1 WHERE id = $1', [req.params.id]);
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const {
      name, category, description, technologies,
      github_url, live_url, is_featured, status, completion_date, display_order,
    } = req.body;

    const thumbnail = req.files?.thumbnail?.[0]
      ? `/uploads/projects/${req.files.thumbnail[0].filename}` : null;
    const screenshots = req.files?.screenshots
      ? req.files.screenshots.map((f) => `/uploads/projects/${f.filename}`) : [];

    const techs = Array.isArray(technologies)
      ? technologies
      : (technologies ? JSON.parse(technologies) : []);

    const result = await query(
      `INSERT INTO projects
        (name, category, description, technologies, github_url, live_url, thumbnail, screenshots, is_featured, status, completion_date, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [name, category || null, description || null, techs, github_url || null, live_url || null,
       thumbnail, screenshots, is_featured === 'true' || is_featured === true, status || 'completed',
       completion_date || null, display_order || 0]
    );

    return res.status(201).json({ success: true, data: result.rows[0], message: 'Project created' });
  } catch (err) {
    logger.error('Projects create error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const existing = await query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ success: false, message: 'Project not found' });

    const {
      name, category, description, technologies,
      github_url, live_url, is_featured, status, completion_date, display_order, is_visible,
    } = req.body;

    const thumbnail = req.files?.thumbnail?.[0]
      ? `/uploads/projects/${req.files.thumbnail[0].filename}` : existing.rows[0].thumbnail;
    const newScreenshots = req.files?.screenshots
      ? req.files.screenshots.map((f) => `/uploads/projects/${f.filename}`) : [];
    const screenshots = newScreenshots.length > 0
      ? newScreenshots : existing.rows[0].screenshots;

    const techs = technologies
      ? (Array.isArray(technologies) ? technologies : JSON.parse(technologies))
      : existing.rows[0].technologies;

    const result = await query(
      `UPDATE projects SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        description = COALESCE($3, description),
        technologies = $4,
        github_url = COALESCE($5, github_url),
        live_url = COALESCE($6, live_url),
        thumbnail = $7,
        screenshots = $8,
        is_featured = COALESCE($9, is_featured),
        status = COALESCE($10, status),
        completion_date = COALESCE($11, completion_date),
        display_order = COALESCE($12, display_order),
        is_visible = COALESCE($13, is_visible)
       WHERE id = $14 RETURNING *`,
      [name, category, description, techs, github_url, live_url, thumbnail, screenshots,
       is_featured !== undefined ? (is_featured === 'true' || is_featured === true) : null,
       status, completion_date, display_order,
       is_visible !== undefined ? (is_visible === 'true' || is_visible === true) : null,
       req.params.id]
    );

    return res.json({ success: true, data: result.rows[0], message: 'Project updated' });
  } catch (err) {
    logger.error('Projects update error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await query('DELETE FROM projects WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Project not found' });
    return res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, getOne, create, update, remove };
