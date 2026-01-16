const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { auth } = require('../middleware/authMiddleware');

router.get('/', auth, skillController.getSkills);
router.get('/gaps/my', auth, skillController.getMySkillGaps);
router.get('/recommendations', auth, skillController.getRecommendedCourses);

module.exports = router;
