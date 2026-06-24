const { query } = require('../config/database');
const logger = require('../utils/logger');

const getAll = async (req, res) => {
  try {
    const adminMode = req.user !== undefined;
    const { category } = req.query;
    const conditions = adminMode ? [] : ['is_visible = TRUE'];
    const params = [];
    let idx = 1;

    if (category) { conditions.push(`category = $${idx++}`); params.push(category); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(`SELECT * FROM gallery ${where} ORDER BY display_order ASC, created_at DESC`, params);
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });
    const { title, category, description, display_order } = req.body;
    const isVideo = req.file.mimetype.startsWith('video/');
    const file_url = `/uploads/gallery/${req.file.filename}`;
    const result = await query(
      `INSERT INTO gallery (title, file_url, file_type, category, description, display_order)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title || null, file_url, isVideo ? 'video' : 'image', category || null, description || null, display_order || 0]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: 'Gallery item created' });
  } catch (err) {
    logger.error('Gallery create error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const { title, category, description, display_order, is_visible } = req.body;
    const result = await query(
      `UPDATE gallery SET
        title = COALESCE($1, title),
        category = COALESCE($2, category),
        description = COALESCE($3, description),
        display_order = COALESCE($4, display_order),
        is_visible = COALESCE($5, is_visible)
       WHERE id = $6 RETURNING *`,
      [title, category, description, display_order,
       is_visible !== undefined ? (is_visible === 'true' || is_visible === true) : null,
       req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    return res.json({ success: true, data: result.rows[0], message: 'Gallery item updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await query('DELETE FROM gallery WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    return res.json({ success: true, message: 'Gallery item deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, create, update, remove };
