const express = require('express');
const router = express.Router();
const benefitController = require('../controllers/benefitController');

router.post('/', benefitController.createBenefit);
router.get('/', benefitController.getBenefits);
router.put('/:id', benefitController.updateBenefit);
router.delete('/:id', benefitController.deleteBenefit);

module.exports = router;