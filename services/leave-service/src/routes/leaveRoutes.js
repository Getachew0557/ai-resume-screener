import { getAllPendingLeaveRequests, createLeaveRequest, getMyRequests, getEmployeesBalance, postLeaveRequest } from '../controllers/leaveController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import express from 'express';

const router = express.Router();
router.use(authMiddleware);

router.post('/', createLeaveRequest);
router.get('/api/leave/getAllPending', getAllPendingLeaveRequests);
router.get('/api/leave/getEmployeesBalance', getEmployeesBalance);
router.post('/api/leave/postLeaveRequest', postLeaveRequest);

export default router;
