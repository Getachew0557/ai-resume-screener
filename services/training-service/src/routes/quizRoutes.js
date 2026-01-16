const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { auth, checkRole } = require('../middleware/authMiddleware');

router.get('/health', (req, res) => res.json({ status: 'Quiz Routes Active' }));

// Question specific routes (Explicit paths)
router.put('/actions/update-question/:questionId', auth, checkRole('admin', 'hr'), quizController.updateQuestion);
router.delete('/actions/delete-question/:questionId', auth, checkRole('admin', 'hr'), quizController.deleteQuestion);
router.post('/:quizId/questions', auth, checkRole('admin', 'hr'), quizController.addQuestion);

// Quiz generic routes
router.get('/', auth, checkRole('admin', 'hr'), quizController.getAllQuizzes);
router.post('/', auth, checkRole('admin', 'hr'), quizController.createQuiz);
router.put('/:id', auth, checkRole('admin', 'hr'), quizController.updateQuiz);
router.delete('/:id', auth, checkRole('admin', 'hr'), quizController.deleteQuiz);

// User/Course routes
router.get('/course/:courseId', auth, quizController.getQuiz);
router.get('/:quizId/attempts/count', auth, quizController.getQuizAttemptsCount);
router.post('/:quizId/attempt', auth, quizController.submitQuizAttempt);
router.get('/attempts/my', auth, quizController.getMyAttempts);

module.exports = router;
