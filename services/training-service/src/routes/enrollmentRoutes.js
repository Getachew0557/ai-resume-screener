const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { auth } = require('../middleware/authMiddleware');

router.post('/', auth, enrollmentController.enrollCourse);
router.get('/my', auth, enrollmentController.getMyEnrollments);
router.get('/:courseId/progress', auth, enrollmentController.getCourseProgress);
router.post('/lessons/:lessonId/complete', auth, enrollmentController.markLessonComplete);

module.exports = router;
