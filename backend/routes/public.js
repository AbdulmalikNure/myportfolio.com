const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { contactLimiter } = require('../middleware/security');

const settingsCtrl    = require('../controllers/settingsController');
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
const messagesCtrl    = require('../controllers/messagesController');
const resumeCtrl      = require('../controllers/resumeController');
const analyticsCtrl   = require('../controllers/analyticsController');

// Settings (public site config)
router.get('/settings',       settingsCtrl.getSettings);

// Skills
router.get('/skills',         skillsCtrl.getAll);

// Services
router.get('/services',       servicesCtrl.getAll);

// Projects
router.get('/projects',       projectsCtrl.getAll);
router.get('/projects/:id',   projectsCtrl.getOne);

// Education
router.get('/education',      educationCtrl.getAll);

// Experience
router.get('/experience',     experienceCtrl.getAll);

// Certificates
router.get('/certificates',   certCtrl.getAll);

// Gallery
router.get('/gallery',        galleryCtrl.getAll);

// Blog
router.get('/blog',           blogCtrl.getAll);
router.get('/blog/:idOrSlug', blogCtrl.getOne);

// Testimonials
router.get('/testimonials',   testimonialsCtrl.getAll);

// Social Links
router.get('/social-links',   socialCtrl.getAll);

// Resume
router.get('/resume',          resumeCtrl.getResume);
router.get('/resume/download', resumeCtrl.downloadResume);

// Contact
router.post('/contact',
  contactLimiter,
  [
    body('full_name').trim().notEmpty().isLength({ max: 150 }).withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('message').trim().notEmpty().isLength({ max: 2000 }).withMessage('Message is required and must be under 2000 characters'),
    body('subject').optional().trim().isLength({ max: 300 }),
  ],
  validate,
  messagesCtrl.submitContact
);

// Analytics tracking
router.post('/analytics/track', analyticsCtrl.trackEvent);

// CV Documents (public)
const cvCtrl = require('../controllers/cvDocumentsController');
router.get('/cv-documents',                cvCtrl.getPublicDocuments);
router.get('/cv-documents/:id/view',       cvCtrl.viewDocument);
router.get('/cv-documents/:id/download',   cvCtrl.downloadDocument);

module.exports = router;
