const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const adminSchemeController = require('../controllers/admin.scheme.controller');
const analyticsEngine = require('../engines/analytics.engine');
const gisEngine = require('../engines/gis.engine');

// Protect all admin routes
router.use(verifyToken, authorizeRoles('ADMIN'));

// Scheme Management
router.post('/scheme', adminSchemeController.createScheme);
router.put('/scheme/:id', adminSchemeController.updateScheme);
router.delete('/scheme/:id', adminSchemeController.deleteScheme);

// Engines
router.get('/analytics', analyticsEngine.getGlobalAnalytics);
router.get('/geo-data', gisEngine.getGeoData);

module.exports = router;
