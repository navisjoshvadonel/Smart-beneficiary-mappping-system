const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const workflowController = require('../controllers/workflow.controller');

// Protect and authorize roles (Officers and Admins can verify, but Admins approve)
router.use(verifyToken);

router.get('/officer/pending', authorizeRoles('OFFICER', 'ADMIN'), workflowController.getPendingApplications);
router.put('/officer/verify/:id', authorizeRoles('OFFICER', 'ADMIN'), workflowController.verifyApplication);

// Admin-only application decisions
router.put('/admin/approve/:id', authorizeRoles('ADMIN'), workflowController.approveApplication);
router.put('/admin/reject/:id', authorizeRoles('ADMIN'), workflowController.rejectApplication);

module.exports = router;
