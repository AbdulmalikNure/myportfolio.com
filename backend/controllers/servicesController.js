const { query } = require('../config/database');
const logger = require('../utils/logger');

const getAll = async (req, res) => {
  try {
    const adminMode = req.user !== undefined;
    const where = adminMode ? '' : 'WHERE is_visible = TRUE';
    const result = await query(`SELECT * FROM services ${where} ORDER BY display_order ASC`);
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getOne = async (req, res) => {
  try {
    const result = await query('SELECT * FROM services WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Service not found' });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { title, description, icon, gradient, display_order } = req.body;
    const result = await query(
      `INSERT INTO services (title, description, icon, gradient, display_order)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [title, description, icon || null, gradient || null, display_order || 0]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: 'Service created' });
  } catch (err) {
    logger.error('Services create error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const { title, description, icon, gradient, display_order, is_visible } = req.body;
    const result = await query(
      `UPDATE services SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        icon = COALESCE($3, icon),
        gradient = COALESCE($4, gradient),
        display_order = COALESCE($5, display_order),
        is_visible = COALESCE($6, is_visible)
       WHERE id = $7 RETURNING *`,
      [title, description, icon, gradient, display_order, is_visible, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Service not found' });
    return res.json({ success: true, data: result.rows[0], message: 'Service updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await query('DELETE FROM services WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Service not found' });
    return res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, getOne, create, update, remove };
