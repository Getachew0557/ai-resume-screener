const express = require('express');
const router = express.Router();
const reportingController = require('../controllers/reportingController');

router.post('/login', reportingController.login);
router.post('/register', reportingController.register);

module.exports = router;
