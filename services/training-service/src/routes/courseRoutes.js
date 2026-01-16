const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { auth, checkRole } = require('../middleware/authMiddleware');

router.get('/stats', auth, checkRole('admin', 'hr'), courseController.getStats);
router.get('/', auth, courseController.getCourses);
router.get('/:id', auth, courseController.getCourseById);
router.post('/', auth, checkRole('admin', 'hr'), courseController.createCourse);
router.put('/:id', auth, checkRole('admin', 'hr'), courseController.updateCourse);
router.delete('/:id', auth, checkRole('admin', 'hr'), courseController.deleteCourse);

module.exports = router;
