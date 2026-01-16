const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { auth, checkRole } = require('../middleware/authMiddleware');

router.get('/', auth, checkRole('admin', 'hr'), certificateController.getAllCertificates);
router.get('/my', auth, certificateController.getMyCertificates);
router.get('/:id', auth, certificateController.getCertificateById);
router.get('/:id/download', auth, certificateController.downloadCertificate);
router.get('/verify/:certificateId', certificateController.verifyCertificate);

module.exports = router;
