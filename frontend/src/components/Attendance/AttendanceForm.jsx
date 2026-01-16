import React, { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3004/api",
});

export default function AttendanceForm({ profile = { id: 10 } }) {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);

  const shiftStart = "08:00 AM";
  const shiftEnd = "04:00 PM";

  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const fetchTodayAttendance = async () => {
    try {
      const res = await api.get(`attendance/employee/${profile.id}`);
      if (res.data.length > 0) {
        setAttendance(res.data[0]);
      }
      console.log("Fetched attendance:", res.data);
    } catch (err) {
      console.error("Fetch attendance error:", err);
    }
  };
  useEffect(() => {
    fetchTodayAttendance();
  }, [profile]);

  const handleClockIn = async () => {
    if (loading || attendance?.clock_in) return;

    setLoading(true);
    try {
      const nowISO = new Date().toISOString();
      const today = getTodayDate();

      let status = "present";
      const now = new Date();
      if (now.getHours() > 8) status = "late";

      const payload = {
        employee_id: profile.id,
        clock_date: today,
        clock_in: nowISO,
        shift_start: `${today}T08:00:00Z`,
        status,
      };

      const res = await api.post("/attendance/clockin", payload);
      setAttendance(res.data);
      fetchTodayAttendance();
    } catch (err) {
      console.error("Clock-in error:", err.response?.data || err.message);
      alert("Failed to clock in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clock Out
  const handleClockOut = async () => {
    if (loading || !attendance?.clock_in || attendance?.clock_out) return;

    setLoading(true);
    try {
      const now = new Date();
      const nowISO = now.toISOString();

      const clockInTime = new Date(attendance.clock_in);
      const workedMilliseconds = now - clockInTime;
      const workedHours = workedMilliseconds / (1000 * 60 * 60); // convert ms to hours

      let updatedStatus = attendance.status;
      if (workedHours < 8) {
        updatedStatus = "late";
      }

      const payload = {
        employee_id: profile.id,
        clock_date: getTodayDate(),
        clock_out: nowISO,
        status: updatedStatus,
      };

      const res = await api.put(
        `/attendance/clockout/${attendance.id}`,
        payload
      );

      setAttendance((prev) => ({
        ...prev,
        clock_out: nowISO,
        status: updatedStatus,
      }));
    } catch (err) {
      console.error("Clock-out error:", err.response?.data || err.message);
      alert("Failed to clock out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full  mx-auto bg-white shadow-md rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-700">Attendance Form</h2>
      <div className="flex justify-between text-sm text-gray-600">
        <span>Shift Start: {shiftStart}</span>
        <span>Shift End: {shiftEnd}</span>
      </div>
      <div className="flex justify-between space-x-4">
        <button
          onClick={handleClockIn}
          disabled={loading || !!attendance?.clock_in}
          className={`flex-1 py-2 rounded ${
            attendance?.clock_in
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {attendance?.clock_in ? "Already Clocked In" : "Clock In"}
        </button>
        <button
          onClick={handleClockOut}
          disabled={loading || !attendance?.clock_in || !!attendance?.clock_out}
          className={`flex-1 py-2 rounded ${
            !attendance?.clock_in || attendance?.clock_out
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {attendance?.clock_out ? "Already Clocked Out" : "Clock Out"}
        </button>
      </div>
      <div className="text-center">
        <p className="text-gray-700">
          Clock In:{" "}
          {attendance?.clock_in
            ? new Date(attendance.clock_in).toLocaleTimeString()
            : "-"}
        </p>
        <p className="text-gray-700">
          Clock Out:{" "}
          {attendance?.clock_out
            ? new Date(attendance.clock_out).toLocaleTimeString()
            : "-"}
        </p>
        <p
          className={`font-semibold mt-2 ${
            attendance?.status === "present"
              ? "text-green-600"
              : attendance?.status === "late"
              ? "text-yellow-600"
              : attendance?.status === "half_day"
              ? "text-blue-600"
              : "text-red-600"
          }`}
        >
          Status: {attendance?.status || "-"}
        </p>
      </div>
    </div>
  );
}
