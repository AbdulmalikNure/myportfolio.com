const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default

const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
const allowedPdfTypes   = ['application/pdf'];

const createStorage = (subdir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../uploads', subdir);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });

const imageFilter = (req, file, cb) => {
  if (allowedImageTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed (JPEG, PNG, WEBP, GIF)'), false);
};

const mediaFilter = (req, file, cb) => {
  if ([...allowedImageTypes, ...allowedVideoTypes].includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image or video files are allowed'), false);
};

const pdfFilter = (req, file, cb) => {
  if (allowedPdfTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF files are allowed'), false);
};

const uploadProfile     = multer({ storage: createStorage('profiles'),     fileFilter: imageFilter, limits: { fileSize: maxSize } });
const uploadProject     = multer({ storage: createStorage('projects'),     fileFilter: imageFilter, limits: { fileSize: maxSize } });
const uploadGallery     = multer({ storage: createStorage('gallery'),      fileFilter: mediaFilter, limits: { fileSize: maxSize } });
const uploadCertificate = multer({ storage: createStorage('certificates'), fileFilter: imageFilter, limits: { fileSize: maxSize } });
const uploadBlog        = multer({ storage: createStorage('blog'),         fileFilter: imageFilter, limits: { fileSize: maxSize } });
const uploadTestimonial = multer({ storage: createStorage('testimonials'), fileFilter: imageFilter, limits: { fileSize: maxSize } });
const uploadResume      = multer({ storage: createStorage('resumes'),      fileFilter: pdfFilter,   limits: { fileSize: maxSize } });

// Error handler for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File size exceeds the allowed limit' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

module.exports = {
  uploadProfile,
  uploadProject,
  uploadGallery,
  uploadCertificate,
  uploadBlog,
  uploadTestimonial,
  uploadResume,
  handleUploadError,
};
