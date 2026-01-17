import React from 'react';
import AttendanceTable from "../../components/Attendance/AttendanceTable";

const AttendanceManagement = () => {
    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Attendance Management</h1>
                    <p className="text-gray-500 mt-1">Monitor and manage employee attendance records across the organization.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 mt-6">
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Attendance Log</h2>
                    <p className="text-sm text-gray-500">View detailed clock-in/out patterns and daily status.</p>
                </div>
                <AttendanceTable />
            </div>
        </div>
    );
};

export default AttendanceManagement;
