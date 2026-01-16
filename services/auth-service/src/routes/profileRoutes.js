const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/authMiddleware');

router.get('/me', auth, profileController.getProfile);
router.get('/:userId', auth, profileController.getProfile);
router.post('/', auth, profileController.createProfile);
router.put('/', auth, profileController.updateProfile);
router.delete('/', auth, profileController.deleteProfile);

module.exports = router;
