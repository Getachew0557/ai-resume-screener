const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/recruitmentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Job Routes
// Only HR and Admin can manage jobs. Listing jobs could be public or protected.
// Let's make viewing jobs public for candidates, but management protected.
router.get('/jobs', recruitmentController.getJobs);
router.get('/stats', authenticate, authorize('hr', 'admin'), recruitmentController.getStats);
router.get('/jobs/:id', recruitmentController.getJobById);

router.post('/jobs', authenticate, authorize('hr', 'admin'), recruitmentController.createJob);
router.put('/jobs/:id', authenticate, authorize('hr', 'admin'), recruitmentController.updateJob);
router.delete('/jobs/:id', authenticate, authorize('hr', 'admin'), recruitmentController.deleteJob);

// Application Routes
// Candidates can apply without login (public)
router.post('/applications', recruitmentController.applyForJob);

// Only HR and Admin can view and process applications
router.get('/applications', authenticate, authorize('hr', 'admin'), recruitmentController.getApplications);
router.get('/applications/:id', authenticate, authorize('hr', 'admin'), recruitmentController.getApplicationById);
router.patch('/applications/:id/stage', authenticate, authorize('hr', 'admin'), recruitmentController.updateApplicationStage);
router.post('/applications/schedule', authenticate, authorize('hr', 'admin'), recruitmentController.scheduleInterview);

module.exports = router;
