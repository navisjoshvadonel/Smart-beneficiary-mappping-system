const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const citizenController = require('../controllers/citizen.app.controller');
const eligibilityEngine = require('../engines/eligibility.engine');

// Shared endpoints that both Citizens and Officers/Admins might need
const adminSchemeController = require('../controllers/admin.scheme.controller');
router.get('/schemes', adminSchemeController.getAllSchemes);

// Protect Citizen specific routes
router.use(verifyToken, authorizeRoles('CITIZEN'));

// Core Features
router.post('/eligibility/check', eligibilityEngine.checkEligibility);
router.post('/citizen/apply', citizenController.applyForScheme);
router.get('/citizen/applications', citizenController.getCitizenApplications);

module.exports = router;
