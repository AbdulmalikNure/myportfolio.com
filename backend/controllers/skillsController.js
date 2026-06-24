const { query } = require('../config/database');
const logger = require('../utils/logger');

const getAll = async (req, res) => {
  try {
    const adminMode = req.user !== undefined;
    const whereClause = adminMode ? '' : 'WHERE is_visible = TRUE';
    const result = await query(
      `SELECT * FROM skills ${whereClause} ORDER BY category, display_order ASC`
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    logger.error('Skills getAll error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getOne = async (req, res) => {
  try {
    const result = await query('SELECT * FROM skills WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Skill not found' });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { name, category, percentage, icon, color_from, color_to, display_order } = req.body;
    const result = await query(
      `INSERT INTO skills (name, category, percentage, icon, color_from, color_to, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, category || 'frontend', percentage || null, icon || null, color_from || null, color_to || null, display_order || 0]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: 'Skill created' });
  } catch (err) {
    logger.error('Skills create error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const { name, category, percentage, icon, color_from, color_to, display_order, is_visible } = req.body;
    const result = await query(
      `UPDATE skills SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        percentage = COALESCE($3, percentage),
        icon = COALESCE($4, icon),
        color_from = COALESCE($5, color_from),
        color_to = COALESCE($6, color_to),
        display_order = COALESCE($7, display_order),
        is_visible = COALESCE($8, is_visible)
       WHERE id = $9 RETURNING *`,
      [name, category, percentage, icon, color_from, color_to, display_order, is_visible, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Skill not found' });
    return res.json({ success: true, data: result.rows[0], message: 'Skill updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await query('DELETE FROM skills WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Skill not found' });
    return res.json({ success: true, message: 'Skill deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, getOne, create, update, remove };
