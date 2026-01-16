const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

router.post('/', departmentController.createDepartment);


router.get('/', departmentController.getDepartments);


router.get('/:id/children', departmentController.getAllChildDepartments);


router.get('/:id/parents', departmentController.getAllParentDepartments);


router.put('/:id', departmentController.updateDepartment);


router.delete('/:id', departmentController.deleteDepartment);

router.get('/:id', departmentController.getDepartmentById);

module.exports = router;
