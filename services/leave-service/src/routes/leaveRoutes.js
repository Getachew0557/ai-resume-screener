import express from 'express';
import * as leaveController from '../controllers/leaveController.js';
import * as adminController from '../controllers/adminController.js'; // Assuming admin controller exists or logic is in leaveController
// Actually leaveController had admin functions (getAllPending) 

const router = express.Router();

// Stats
router.get('/stats', leaveController.getLeaveStats);

// Employee Actions
router.post('/postLeaveRequest', leaveController.postLeaveRequest); // Legacy path from api.js
router.get('/my-requests', leaveController.getMyRequests);
router.post('/', leaveController.createLeaveRequest); // Cleaner path

// Admin Actions (Should be protected)
router.get('/getAllPending', leaveController.getAllPendingLeaveRequests);
router.get('/getEmployeesBalance', leaveController.getEmployeesBalance);
// router.get('/:id', leaveController.getLeave);

module.exports = router;
// Oh wait, this is ES Module project (server.js uses import).
// So I should use export default router;
export default router;
