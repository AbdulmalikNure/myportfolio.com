const { query } = require('../config/database');
const logger = require('../utils/logger');

const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const getAll = async (req, res) => {
  try {
    const adminMode = req.user !== undefined;
    const { page = 1, limit = 10, category, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = adminMode ? [] : ['is_published = TRUE'];
    const params = [];
    let idx = 1;

    if (category) { conditions.push(`category = $${idx++}`); params.push(category); }
    if (search) {
      conditions.push(`(title ILIKE $${idx} OR excerpt ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await query(`SELECT COUNT(*) FROM blog_posts ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(parseInt(limit), offset);
    const dataRes = await query(
      `SELECT id,title,slug,cover_image,excerpt,tags,category,is_published,published_at,view_count,created_at
       FROM blog_posts ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    return res.json({
      success: true,
      data: dataRes.rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getOne = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isUUID = /^[0-9a-f-]{36}$/.test(idOrSlug);
    const result = await query(
      `SELECT * FROM blog_posts WHERE ${isUUID ? 'id' : 'slug'} = $1`,
      [idOrSlug]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!req.user && !result.rows[0].is_published)
      return res.status(404).json({ success: false, message: 'Post not found' });

    if (!req.user) {
      await query('UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1', [result.rows[0].id]);
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { title, content, excerpt, tags, category, is_published } = req.body;
    const cover_image = req.file ? `/uploads/blog/${req.file.filename}` : null;

    let slug = slugify(title);
    // Ensure unique slug
    const existing = await query('SELECT id FROM blog_posts WHERE slug LIKE $1', [`${slug}%`]);
    if (existing.rows.length > 0) slug = `${slug}-${Date.now()}`;

    const parsedTags = Array.isArray(tags) ? tags : (tags ? JSON.parse(tags) : []);
    const publish = is_published === 'true' || is_published === true;

    const result = await query(
      `INSERT INTO blog_posts (title, slug, cover_image, content, excerpt, tags, category, is_published, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [title, slug, cover_image, content || null, excerpt || null, parsedTags, category || null,
       publish, publish ? new Date() : null]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: 'Post created' });
  } catch (err) {
    logger.error('Blog create error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const { title, content, excerpt, tags, category, is_published } = req.body;
    const existing = await query('SELECT * FROM blog_posts WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ success: false, message: 'Post not found' });

    const cover_image = req.file ? `/uploads/blog/${req.file.filename}` : existing.rows[0].cover_image;
    const parsedTags = tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : existing.rows[0].tags;
    const publish = is_published !== undefined
      ? (is_published === 'true' || is_published === true) : existing.rows[0].is_published;
    const publishedAt = publish && !existing.rows[0].published_at ? new Date() : existing.rows[0].published_at;

    const result = await query(
      `UPDATE blog_posts SET
        title = COALESCE($1, title),
        cover_image = $2,
        content = COALESCE($3, content),
        excerpt = COALESCE($4, excerpt),
        tags = $5,
        category = COALESCE($6, category),
        is_published = $7,
        published_at = $8
       WHERE id = $9 RETURNING *`,
      [title, cover_image, content, excerpt, parsedTags, category, publish, publishedAt, req.params.id]
    );
    return res.json({ success: true, data: result.rows[0], message: 'Post updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Post not found' });
    return res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, getOne, create, update, remove };
