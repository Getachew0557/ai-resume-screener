const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validateController = require('../controllers/validateController');
const auth = require('../middleware/authMiddleware');

router.post('/register', auth, authController.register);
router.post('/login', authController.login);
router.post('/validate', validateController.validateToken);
router.get('/users', auth, authController.getUsers);
router.get('/stats', auth, authController.getStats);

module.exports = router;
