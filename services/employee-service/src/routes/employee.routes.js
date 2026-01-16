import express from 'express';
import {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from '../controllers/employee.controller.js';

const router = express.Router();

// GET /api/employees → fetch all employees
router.get('/', getEmployees);

// GET /api/employees/:id → fetch employee by ID
router.get('/:id', getEmployeeById);

// POST /api/employees → create a new employee
router.post('/', createEmployee);

// PUT /api/employees/:id → update employee
router.put('/:id', updateEmployee);

// DELETE /api/employees/:id → delete employee
router.delete('/:id', deleteEmployee);

export default router;
