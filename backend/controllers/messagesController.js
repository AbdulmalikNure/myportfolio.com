const { query } = require('../config/database');
const { sendContactNotification, sendReplyEmail } = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * POST /api/contact  (public)
 */
const submitContact = async (req, res) => {
  try {
    const { full_name, email, phone, subject, message } = req.body;

    const result = await query(
      `INSERT INTO messages (full_name, email, phone, subject, message, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [full_name, email.toLowerCase().trim(), phone || null, subject || null, message, req.ip]
    );

    // Track analytics
    await query(
      "INSERT INTO analytics (event_type, page, ip_address) VALUES ('contact_submit', '/contact', $1)",
      [req.ip]
    ).catch(() => {});

    // Send email notification (non-blocking)
    sendContactNotification({ full_name, email, phone, subject, message }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully! I will get back to you soon.',
    });
  } catch (err) {
    logger.error('Submit contact error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

/**
 * GET /api/admin/messages  (protected)
 */
const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, is_read } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx} OR subject ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (is_read !== undefined) {
      conditions.push(`is_read = $${idx++}`);
      params.push(is_read === 'true');
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await query(`SELECT COUNT(*) FROM messages ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(parseInt(limit), offset);
    const dataRes = await query(
      `SELECT * FROM messages ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
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

/**
 * GET /api/admin/messages/:id
 */
const getMessage = async (req, res) => {
  try {
    const result = await query('SELECT * FROM messages WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Message not found' });
    // Mark as read
    await query('UPDATE messages SET is_read = TRUE WHERE id = $1', [req.params.id]);
    return res.json({ success: true, data: { ...result.rows[0], is_read: true } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PATCH /api/admin/messages/:id/read
 */
const markRead = async (req, res) => {
  try {
    await query('UPDATE messages SET is_read = TRUE WHERE id = $1', [req.params.id]);
    return res.json({ success: true, message: 'Message marked as read' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST /api/admin/messages/:id/reply
 */
const replyMessage = async (req, res) => {
  try {
    const { replyText } = req.body;
    const msgResult = await query('SELECT * FROM messages WHERE id = $1', [req.params.id]);
    const msg = msgResult.rows[0];
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });

    await sendReplyEmail({
      to: msg.email,
      name: msg.full_name,
      replyText,
      originalMessage: msg.message,
    });

    await query(
      'UPDATE messages SET is_replied = TRUE, replied_at = NOW() WHERE id = $1',
      [req.params.id]
    );

    return res.json({ success: true, message: 'Reply sent successfully' });
  } catch (err) {
    logger.error('Reply message error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Failed to send reply' });
  }
};

/**
 * DELETE /api/admin/messages/:id
 */
const deleteMessage = async (req, res) => {
  try {
    const result = await query('DELETE FROM messages WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Message not found' });
    return res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { submitContact, getMessages, getMessage, markRead, replyMessage, deleteMessage };
