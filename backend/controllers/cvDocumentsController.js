const { query } = require('../config/database');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

const DOCUMENT_TYPES = ['design_1_cv', 'design_2_cv', 'complete_professional_portfolio'];

// ─── Public ──────────────────────────────────────────────────────────────────

/**
 * GET /api/cv-documents  (public)
 * Returns all active CV documents for the portfolio modal
 */
const getPublicDocuments = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, document_name, document_type, description, file_name, file_size, mime_type, view_count, download_count
       FROM cv_documents
       WHERE status = 'active'
       ORDER BY
         CASE document_type
           WHEN 'design_1_cv' THEN 1
           WHEN 'design_2_cv' THEN 2
           WHEN 'complete_professional_portfolio' THEN 3
         END`
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    logger.error('CV getPublicDocuments error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/cv-documents/:id/view  (public)
 * Stream the file to the browser for inline viewing (no download prompt)
 */
const viewDocument = async (req, res) => {
  try {
    // Try to find by ID first (UUID), then fall back to document_type
    let result = await query(
      "SELECT * FROM cv_documents WHERE (id = $1 OR document_type = $1) AND status = 'active'",
      [req.params.id]
    );
    
    const doc = result.rows[0];
    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found. Please upload CV documents through the admin panel first.' 
      });
    }

    // Track view
    await query(
      "INSERT INTO analytics (event_type, page, cv_document_id, ip_address, user_agent) VALUES ('cv_view', $1, $2, $3, $4)",
      [`/cv/${doc.document_type}`, doc.id, req.ip, req.headers['user-agent'] || null]
    ).catch(() => {});
    await query('UPDATE cv_documents SET view_count = view_count + 1 WHERE id = $1', [doc.id]).catch(() => {});

    const filePath = path.join(__dirname, '..', doc.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    res.setHeader('Content-Type', doc.mime_type || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    logger.error('CV viewDocument error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/cv-documents/:id/download  (public)
 * Force-download the document
 */
const downloadDocument = async (req, res) => {
  try {
    // Try to find by ID first (UUID), then fall back to document_type
    let result = await query(
      "SELECT * FROM cv_documents WHERE (id = $1 OR document_type = $1) AND status = 'active'",
      [req.params.id]
    );
    
    const doc = result.rows[0];
    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found. Please upload CV documents through the admin panel first.' 
      });
    }

    // Track download
    await query(
      "INSERT INTO analytics (event_type, page, cv_document_id, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)",
      [
        doc.document_type === 'complete_professional_portfolio' ? 'portfolio_download' : 'cv_download',
        `/cv/${doc.document_type}/download`,
        doc.id,
        req.ip,
        req.headers['user-agent'] || null,
      ]
    ).catch(() => {});
    await query('UPDATE cv_documents SET download_count = download_count + 1 WHERE id = $1', [doc.id]).catch(() => {});

    const filePath = path.join(__dirname, '..', doc.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    res.download(filePath, doc.file_name);
  } catch (err) {
    logger.error('CV downloadDocument error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/cv-documents  (protected)
 * Returns all documents including inactive ones
 */
const getAllDocuments = async (req, res) => {
  try {
    const result = await query(
      `SELECT cd.*, u.name as uploaded_by_name
       FROM cv_documents cd
       LEFT JOIN users u ON cd.uploaded_by = u.id
       ORDER BY
         CASE cd.document_type
           WHEN 'design_1_cv' THEN 1
           WHEN 'design_2_cv' THEN 2
           WHEN 'complete_professional_portfolio' THEN 3
         END, cd.created_at DESC`
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    logger.error('CV getAllDocuments error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST /api/admin/cv-documents  (protected)
 * Upload a new CV document. Deactivates previous document of same type.
 */
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const { document_type, document_name, description } = req.body;

    if (!DOCUMENT_TYPES.includes(document_type)) {
      return res.status(400).json({ success: false, message: `Invalid document_type. Must be one of: ${DOCUMENT_TYPES.join(', ')}` });
    }

    const defaultNames = {
      design_1_cv: 'Design 1 CV',
      design_2_cv: 'Design 2 CV',
      complete_professional_portfolio: 'Complete Professional Portfolio',
    };

    const file_path = `/uploads/cv_documents/${req.file.filename}`;
    const file_size = req.file.size;
    const mime_type = req.file.mimetype;
    const file_name = req.file.originalname;
    const name      = document_name || defaultNames[document_type];

    // Deactivate previous documents of same type
    await query(
      "UPDATE cv_documents SET status = 'inactive' WHERE document_type = $1 AND status = 'active'",
      [document_type]
    );

    const result = await query(
      `INSERT INTO cv_documents
         (document_name, document_type, description, file_name, file_path, file_size, mime_type, uploaded_by, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'active')
       RETURNING *`,
      [name, document_type, description || null, file_name, file_path, file_size, mime_type, req.user.id]
    );

    return res.status(201).json({ success: true, data: result.rows[0], message: 'Document uploaded successfully' });
  } catch (err) {
    logger.error('CV uploadDocument error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PUT /api/admin/cv-documents/:id  (protected)
 * Update metadata (name, description, status). Optionally replace file.
 */
const updateDocument = async (req, res) => {
  try {
    const existing = await query('SELECT * FROM cv_documents WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const { document_name, description, status } = req.body;

    // If activating this doc, deactivate others of same type
    if (status === 'active' && existing.rows[0].status !== 'active') {
      await query(
        "UPDATE cv_documents SET status = 'inactive' WHERE document_type = $1 AND status = 'active' AND id != $2",
        [existing.rows[0].document_type, req.params.id]
      );
    }

    let file_path  = existing.rows[0].file_path;
    let file_name  = existing.rows[0].file_name;
    let file_size  = existing.rows[0].file_size;
    let mime_type  = existing.rows[0].mime_type;

    if (req.file) {
      file_path = `/uploads/cv_documents/${req.file.filename}`;
      file_name = req.file.originalname;
      file_size = req.file.size;
      mime_type = req.file.mimetype;
    }

    const result = await query(
      `UPDATE cv_documents SET
         document_name = COALESCE($1, document_name),
         description   = COALESCE($2, description),
         status        = COALESCE($3, status),
         file_path     = $4,
         file_name     = $5,
         file_size     = $6,
         mime_type     = $7
       WHERE id = $8
       RETURNING *`,
      [document_name || null, description || null, status || null,
       file_path, file_name, file_size, mime_type, req.params.id]
    );

    return res.json({ success: true, data: result.rows[0], message: 'Document updated' });
  } catch (err) {
    logger.error('CV updateDocument error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * DELETE /api/admin/cv-documents/:id  (protected)
 */
const deleteDocument = async (req, res) => {
  try {
    const result = await query('DELETE FROM cv_documents WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Remove physical file
    const filePath = path.join(__dirname, '..', result.rows[0].file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    logger.error('CV deleteDocument error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/admin/cv-documents/:id/preview  (protected)
 * Stream file for admin preview
 */
const previewDocument = async (req, res) => {
  try {
    const result = await query('SELECT * FROM cv_documents WHERE id = $1', [req.params.id]);
    const doc = result.rows[0];
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const filePath = path.join(__dirname, '..', doc.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    res.setHeader('Content-Type', doc.mime_type || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    logger.error('CV previewDocument error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/admin/cv-documents/:id/download  (protected)
 */
const adminDownloadDocument = async (req, res) => {
  try {
    const result = await query('SELECT * FROM cv_documents WHERE id = $1', [req.params.id]);
    const doc = result.rows[0];
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const filePath = path.join(__dirname, '..', doc.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }
    res.download(filePath, doc.file_name);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getPublicDocuments,
  viewDocument,
  downloadDocument,
  getAllDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument,
  previewDocument,
  adminDownloadDocument,
};
