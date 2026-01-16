const Attendance = require('../models/attendanceModel.js');

const markAttendance = async (req, res) => {
  try {
    const { employee_id, clock_date, shift_start } = req.body;
    const existing = await Attendance.findOne({
      where: { employee_id, clock_date }
    });

    if (existing) {
      return res.status(409).json({
        message: 'Attendance already marked for this date'
      });
    }
const shiftStartTime = new Date(shift_start).toTimeString().split(' ')[0];
    const attendance = await Attendance.create({
      employee_id,
      clock_date,
      clock_in: new Date(),
      shift_start:shiftStartTime,
      status: 'present'
    });

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const clockOut = async (req, res) => {
  const { employee_id, clock_date, clock_out, status } = req.body;

  const attendance = await Attendance.findOne({
    where: { employee_id, clock_date }
  });

  if (!attendance) {
    return res.status(404).json({ message: "Attendance not found" });
  }

  attendance.clock_out = clock_out;
  attendance.status = status;
  await attendance.save();

  res.json({ message: "Clock out successful" });
};

const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;

    const records = await Attendance.findAll({
      where: { clock_date: date },
      order: [['clock_in', 'ASC']]
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const getAttendanceByEmployee = async (req, res) => {
  try {
    const { employee_id } = req.params;

    const records = await Attendance.findAll({
      where: { employee_id },
      order: [['clock_date', 'DESC']]
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const records = await Attendance.findAll({
      where: { clock_date: today },
    });

    const updatedRecords = await Promise.all(
      records.map(async (att) => {
        if (att.clock_in && !att.clock_out) {
          const clockInTime = new Date(att.clock_in);
          const workedHours = (new Date() - clockInTime) / 1000 / 60 / 60; // hours

          if (workedHours >= 8 && att.status !== "present") {
            att.status = "present";
            await att.save();
          } else if (workedHours < 8 && att.status !== "late") {
            att.status = "late";
            await att.save();
          }
        }
        return att;
      })
    );

    res.json(updatedRecords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.findAll({
      order: [['clock_date', 'DESC']]
    });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByPk(id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    await attendance.destroy(); // delete record
    res.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("Delete attendance error:", error);
    res.status(500).json({ error: error.message });
  }
};


 const getAttendanceFiltered = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const whereClause = {};
    if (employeeId) whereClause.employee_id = employeeId;
    if (startDate && endDate) {
      whereClause.clock_date = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if (startDate) {
      whereClause.clock_date = startDate;
    } else if (endDate) {
      whereClause.clock_date = endDate;
    }
    const records = await Attendance.findAll({
      where: whereClause,
      order: [["clock_date", "ASC"], ["clock_in", "ASC"]],
    });

    res.json(records);
  } catch (error) {
    console.error("Error fetching filtered attendance:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAttendanceFiltered,
  deleteAttendance,
  getAttendance,
  getTodayAttendance,
  markAttendance,
  clockOut,
  getAttendanceByDate,
  getAttendanceByEmployee
};

