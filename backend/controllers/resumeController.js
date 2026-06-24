const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * GET /api/resume  (public) — returns the active resume URL
 */
const getResume = async (req, res) => {
  try {
    const result = await query('SELECT * FROM resumes WHERE is_active = TRUE ORDER BY uploaded_at DESC LIMIT 1');
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'No resume available' });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/resume/download  (public) — track and redirect to file
 */
const downloadResume = async (req, res) => {
  try {
    const result = await query('SELECT * FROM resumes WHERE is_active = TRUE ORDER BY uploaded_at DESC LIMIT 1');
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'No resume available' });

    // Track download
    await query(
      "INSERT INTO analytics (event_type, page, ip_address) VALUES ('cv_download', '/resume/download', $1)",
      [req.ip]
    ).catch(() => {});

    const path = require('path');
    const filePath = path.join(__dirname, '..', result.rows[0].file_url);
    res.download(filePath, result.rows[0].file_name || 'resume.pdf');
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST /api/admin/resume  (protected)
 */
const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'PDF file required' });

    // Deactivate previous resumes
    await query('UPDATE resumes SET is_active = FALSE');

    const file_url = `/uploads/resumes/${req.file.filename}`;
    const result = await query(
      'INSERT INTO resumes (file_url, file_name, is_active) VALUES ($1,$2,TRUE) RETURNING *',
      [file_url, req.file.originalname]
    );

    return res.status(201).json({ success: true, data: result.rows[0], message: 'Resume uploaded' });
  } catch (err) {
    logger.error('Resume upload error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/admin/resumes  (protected) — list all
 */
const listResumes = async (req, res) => {
  try {
    const result = await query('SELECT * FROM resumes ORDER BY uploaded_at DESC');
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getResume, downloadResume, uploadResume, listResumes };
