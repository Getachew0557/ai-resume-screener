const express = require('express');
const router = express.Router();
const benefitsController = require('../controllers/benefitsController');

router.post('/login', benefitsController.login);
router.post('/register', benefitsController.register);

module.exports = router;
