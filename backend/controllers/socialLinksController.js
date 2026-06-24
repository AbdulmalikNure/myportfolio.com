const { query } = require('../config/database');

const getAll = async (req, res) => {
  try {
    const adminMode = req.user !== undefined;
    const where = adminMode ? '' : 'WHERE is_visible = TRUE';
    const result = await query(`SELECT * FROM social_links ${where} ORDER BY display_order ASC`);
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const upsert = async (req, res) => {
  try {
    const { platform, url, icon, is_visible, display_order } = req.body;
    const result = await query(
      `INSERT INTO social_links (platform, url, icon, is_visible, display_order)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (platform) DO UPDATE SET
         url = EXCLUDED.url,
         icon = COALESCE(EXCLUDED.icon, social_links.icon),
         is_visible = COALESCE(EXCLUDED.is_visible, social_links.is_visible),
         display_order = COALESCE(EXCLUDED.display_order, social_links.display_order)
       RETURNING *`,
      [platform.toLowerCase(), url, icon || null,
       is_visible !== undefined ? (is_visible === 'true' || is_visible === true) : true,
       display_order || 0]
    );
    return res.json({ success: true, data: result.rows[0], message: 'Social link saved' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await query('DELETE FROM social_links WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Social link not found' });
    return res.json({ success: true, message: 'Social link deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, upsert, remove };
