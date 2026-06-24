const { query } = require('../config/database');

const getAll = async (req, res) => {
  try {
    const adminMode = req.user !== undefined;
    const where = adminMode ? '' : 'WHERE is_visible = TRUE';
    const result = await query(`SELECT * FROM testimonials ${where} ORDER BY display_order ASC`);
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { name, position, company, rating, review, display_order } = req.body;
    const photo = req.file ? `/uploads/testimonials/${req.file.filename}` : null;
    const result = await query(
      `INSERT INTO testimonials (name, position, company, photo, rating, review, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, position || null, company || null, photo, rating || 5, review, display_order || 0]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: 'Testimonial created' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const { name, position, company, rating, review, display_order, is_visible } = req.body;
    const existing = await query('SELECT * FROM testimonials WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    const photo = req.file ? `/uploads/testimonials/${req.file.filename}` : existing.rows[0].photo;
    const result = await query(
      `UPDATE testimonials SET
        name = COALESCE($1, name),
        position = COALESCE($2, position),
        company = COALESCE($3, company),
        photo = $4,
        rating = COALESCE($5, rating),
        review = COALESCE($6, review),
        display_order = COALESCE($7, display_order),
        is_visible = COALESCE($8, is_visible)
       WHERE id = $9 RETURNING *`,
      [name, position, company, photo, rating, review, display_order,
       is_visible !== undefined ? (is_visible === 'true' || is_visible === true) : null,
       req.params.id]
    );
    return res.json({ success: true, data: result.rows[0], message: 'Testimonial updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await query('DELETE FROM testimonials WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    return res.json({ success: true, message: 'Testimonial deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, create, update, remove };
