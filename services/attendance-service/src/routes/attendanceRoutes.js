const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController.js');

router.post('/clockin', attendanceController.markAttendance);
router.put('/clockout/:id', attendanceController.clockOut);
router.get('/date', attendanceController.getAttendanceByDate);
router.get('/today', attendanceController.getTodayAttendance);
router.get('/', attendanceController.getAttendance)

router.get('/employee/:employee_id', attendanceController.getAttendanceByEmployee);
router.delete("/:id", attendanceController.deleteAttendance);
router.get('/filter', attendanceController.getAttendanceFiltered);
module.exports = router;
