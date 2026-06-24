const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

// All admin routes require authentication
router.use(authenticate, requireAdmin);

const adminCtrl       = require('../controllers/adminController');
const settingsCtrl    = require('../controllers/settingsController');
const messagesCtrl    = require('../controllers/messagesController');
const skillsCtrl      = require('../controllers/skillsController');
const servicesCtrl    = require('../controllers/servicesController');
const projectsCtrl    = require('../controllers/projectsController');
const educationCtrl   = require('../controllers/educationController');
const experienceCtrl  = require('../controllers/experienceController');
const certCtrl        = require('../controllers/certificatesController');
const galleryCtrl     = require('../controllers/galleryController');
const blogCtrl        = require('../controllers/blogController');
const testimonialsCtrl= require('../controllers/testimonialsController');
const socialCtrl      = require('../controllers/socialLinksController');
const resumeCtrl      = require('../controllers/resumeController');
const analyticsCtrl   = require('../controllers/analyticsController');
const { uploadProject } = require('../middleware/upload');
const { uploadGallery } = require('../middleware/upload');
const { uploadCertificate } = require('../middleware/upload');
const { uploadBlog } = require('../middleware/upload');
const { uploadTestimonial } = require('../middleware/upload');
const { uploadResume } = require('../middleware/upload');
const multer = require('multer');

// Dashboard
router.get('/dashboard', adminCtrl.getDashboard);

// Profile
router.put('/profile', uploadProfile.single('avatar'), adminCtrl.updateProfile);

// Settings
router.get('/settings',  settingsCtrl.getSettings);
router.put('/settings',  uploadProfile.fields([
  { name: 'site_logo', maxCount: 1 },
  { name: 'favicon',   maxCount: 1 },
  { name: 'hero_image',maxCount: 1 },
  { name: 'about_image',maxCount: 1 },
]), settingsCtrl.updateSettings);

// Messages
router.get('/messages',           messagesCtrl.getMessages);
router.get('/messages/:id',       messagesCtrl.getMessage);
router.patch('/messages/:id/read',messagesCtrl.markRead);
router.post('/messages/:id/reply',messagesCtrl.replyMessage);
router.delete('/messages/:id',    messagesCtrl.deleteMessage);

// Skills (admin view returns all including hidden)
router.get('/skills',         skillsCtrl.getAll);
router.post('/skills',        skillsCtrl.create);
router.put('/skills/:id',     skillsCtrl.update);
router.delete('/skills/:id',  skillsCtrl.remove);

// Services
router.get('/services',         servicesCtrl.getAll);
router.post('/services',        servicesCtrl.create);
router.put('/services/:id',     servicesCtrl.update);
router.delete('/services/:id',  servicesCtrl.remove);

// Projects
router.get('/projects',
  (req, res, next) => { req.user = req.user; next(); }, // ensure user set
  projectsCtrl.getAll
);
router.post('/projects',
  uploadProject.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'screenshots', maxCount: 10 }]),
  projectsCtrl.create
);
router.put('/projects/:id',
  uploadProject.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'screenshots', maxCount: 10 }]),
  projectsCtrl.update
);
router.delete('/projects/:id', projectsCtrl.remove);

// Education
router.get('/education',         educationCtrl.getAll);
router.post('/education',        educationCtrl.create);
router.put('/education/:id',     educationCtrl.update);
router.delete('/education/:id',  educationCtrl.remove);

// Experience
router.get('/experience',         experienceCtrl.getAll);
router.post('/experience',        experienceCtrl.create);
router.put('/experience/:id',     experienceCtrl.update);
router.delete('/experience/:id',  experienceCtrl.remove);

// Certificates
router.get('/certificates',         certCtrl.getAll);
router.post('/certificates',        uploadCertificate.single('image'), certCtrl.create);
router.put('/certificates/:id',     uploadCertificate.single('image'), certCtrl.update);
router.delete('/certificates/:id',  certCtrl.remove);

// Gallery
router.get('/gallery',        galleryCtrl.getAll);
router.post('/gallery',       uploadGallery.single('file'), galleryCtrl.create);
router.put('/gallery/:id',    galleryCtrl.update);
router.delete('/gallery/:id', galleryCtrl.remove);

// Blog
router.get('/blog',           blogCtrl.getAll);
router.get('/blog/:idOrSlug', blogCtrl.getOne);
router.post('/blog',          uploadBlog.single('cover_image'), blogCtrl.create);
router.put('/blog/:id',       uploadBlog.single('cover_image'), blogCtrl.update);
router.delete('/blog/:id',    blogCtrl.remove);

// Testimonials
router.get('/testimonials',         testimonialsCtrl.getAll);
router.post('/testimonials',        uploadTestimonial.single('photo'), testimonialsCtrl.create);
router.put('/testimonials/:id',     uploadTestimonial.single('photo'), testimonialsCtrl.update);
router.delete('/testimonials/:id',  testimonialsCtrl.remove);

// Social Links
router.get('/social-links',         socialCtrl.getAll);
router.post('/social-links',        socialCtrl.upsert);
router.delete('/social-links/:id',  socialCtrl.remove);

// Resume
router.get('/resumes',      resumeCtrl.listResumes);
router.post('/resume',      uploadResume.single('resume'), resumeCtrl.uploadResume);

// Analytics
router.get('/analytics', analyticsCtrl.getAnalytics);

module.exports = router;
