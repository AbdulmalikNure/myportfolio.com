const { query } = require('../config/database');

const getAll = async (req, res) => {
  try {
    const adminMode = req.user !== undefined;
    const where = adminMode ? '' : 'WHERE is_visible = TRUE';
    const result = await query(`SELECT * FROM experience ${where} ORDER BY display_order ASC, start_date DESC`);
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { company, position, start_date, end_date, is_current, description, display_order } = req.body;
    const result = await query(
      `INSERT INTO experience (company, position, start_date, end_date, is_current, description, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [company, position, start_date || null, end_date || null,
       is_current === 'true' || is_current === true, description || null, display_order || 0]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: 'Experience entry created' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const { company, position, start_date, end_date, is_current, description, display_order, is_visible } = req.body;
    const result = await query(
      `UPDATE experience SET
        company = COALESCE($1, company),
        position = COALESCE($2, position),
        start_date = COALESCE($3, start_date),
        end_date = COALESCE($4, end_date),
        is_current = COALESCE($5, is_current),
        description = COALESCE($6, description),
        display_order = COALESCE($7, display_order),
        is_visible = COALESCE($8, is_visible)
       WHERE id = $9 RETURNING *`,
      [company, position, start_date, end_date,
       is_current !== undefined ? (is_current === 'true' || is_current === true) : null,
       description, display_order,
       is_visible !== undefined ? (is_visible === 'true' || is_visible === true) : null,
       req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Experience entry not found' });
    return res.json({ success: true, data: result.rows[0], message: 'Experience entry updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await query('DELETE FROM experience WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Experience entry not found' });
    return res.json({ success: true, message: 'Experience entry deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, create, update, remove };
