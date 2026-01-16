import React, { useEffect, useState } from "react";
import AttendanceFilter from "./AttendanceFilter";
import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:3004/api",
});
export default function AttendanceTable() {
  const [attendances, setAttendances] = useState([]);
  const [attendance, setAttendance] = useState();
  const [date, setDate] = useState("");
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get("http://localhost:3004/api/attendance");
        setAttendances(res.data);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
    };

    fetchAttendance();
  }, []);
  const fetchAttendanceByDate = async () => {
    if (!date) return;

    try {
      const res = await api.get(`/attendance`, {
        params: { date },
      });
      setAttendances(res.data);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };
  const fetchFilteredAttendance = async ({
    startDate,
    endDate,
    employeeId,
  }) => {
    try {
      const res = await api.get("/attendance/filter", {
        params: { startDate, endDate, employeeId },
      });
      setAttendances(res.data);
    } catch (err) {
      console.error("Error fetching filtered attendance:", err);
    }
  };

  useEffect(() => {
    fetchAttendanceByDate();
  }, [date, attendance]);
  const handleDelete = async (attendanceId) => {
    try {
      await api.delete(`/attendance/${attendanceId}`);
      alert("Attendance deleted successfully");
      setAttendance(null);
      fetchAttendanceByDate();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      alert("Failed to delete attendance.");
    }
  };

  return (
    <div className="overflow-x-auto space-y-4">
      <AttendanceFilter onFilter={fetchFilteredAttendance} />

      <div className="flex items-center space-x-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={fetchAttendanceByDate}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Search
        </button>
      </div>

      <table className="min-w-full border border-gray-200 shadow-md rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Employee
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Clock In
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Clock Out
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Date
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Status
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {attendances.map((att) => (
            <tr key={att.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{att.employee_id}</td>
              <td className="px-4 py-2">
                {att.clock_in
                  ? new Date(att.clock_in).toISOString().slice(0, 19)
                  : "-"}
              </td>
              <td className="px-4 py-2">
                {att.clock_out
                  ? new Date(att.clock_out).toISOString().slice(0, 19)
                  : "-"}
              </td>
              <td className="px-4 py-2">{att.clock_date}</td>
              <td className="px-4 py-2">
                {(() => {
                  if (!att.clock_in) return "-";
                  if (!att.clock_out) {
                    const clockInTime = new Date(att.clock_in);
                    const now = new Date();
                    const hoursWorked = (now - clockInTime) / (1000 * 60 * 60);
                    if (hoursWorked >= 8) return "Missed";
                    return att.status;
                  }
                  return att.status;
                })()}
              </td>

              <td className="px-4 py-2">
                <button
                  onClick={() => handleDelete(att.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

//{id: 1, employee_id: 101, clock_date: '2026-01-14', clock_in: '2026-01-14T10:03:37.000Z', clock_in: '2026-01-14T13:24:41.000Z', …}
