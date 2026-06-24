const { query } = require('../config/database');
const logger = require('../utils/logger');

const getAll = async (req, res) => {
  try {
    const adminMode = req.user !== undefined;
    const where = adminMode ? '' : 'WHERE is_visible = TRUE';
    const result = await query(`SELECT * FROM certificates ${where} ORDER BY display_order ASC, issue_date DESC`);
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getOne = async (req, res) => {
  try {
    const result = await query('SELECT * FROM certificates WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Certificate not found' });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { name, organization, issue_date, verification_url, display_order } = req.body;
    const image = req.file ? `/uploads/certificates/${req.file.filename}` : null;
    const result = await query(
      `INSERT INTO certificates (name, organization, issue_date, verification_url, image, display_order)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, organization || null, issue_date || null, verification_url || null, image, display_order || 0]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: 'Certificate created' });
  } catch (err) {
    logger.error('Certificates create error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const { name, organization, issue_date, verification_url, display_order, is_visible } = req.body;
    const existing = await query('SELECT * FROM certificates WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ success: false, message: 'Certificate not found' });
    const image = req.file ? `/uploads/certificates/${req.file.filename}` : existing.rows[0].image;
    const result = await query(
      `UPDATE certificates SET
        name = COALESCE($1, name),
        organization = COALESCE($2, organization),
        issue_date = COALESCE($3, issue_date),
        verification_url = COALESCE($4, verification_url),
        image = $5,
        display_order = COALESCE($6, display_order),
        is_visible = COALESCE($7, is_visible)
       WHERE id = $8 RETURNING *`,
      [name, organization, issue_date, verification_url, image, display_order,
       is_visible !== undefined ? (is_visible === 'true' || is_visible === true) : null,
       req.params.id]
    );
    return res.json({ success: true, data: result.rows[0], message: 'Certificate updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await query('DELETE FROM certificates WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Certificate not found' });
    return res.json({ success: true, message: 'Certificate deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, getOne, create, update, remove };
