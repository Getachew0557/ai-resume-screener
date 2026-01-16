const express = require('express');
const router = express.Router();
const jobCategoryController = require('../controllers/jobCategoryController');

// const auth = require('../middleware/authMiddleware');

router.post('/', jobCategoryController.createJobCategory);
router.get('/', jobCategoryController.getJobCategories);
router.get('/:id', jobCategoryController.getJobCategoryById);
router.put('/:id', jobCategoryController.updateJobCategory);
router.delete('/:id', jobCategoryController.deleteJobCategory);

module.exports = router;
