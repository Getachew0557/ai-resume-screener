import React from 'react';

const Dashboard = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">HR ERP Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-bold">Employees</h2>
                    <p className="text-gray-600">Total: 150</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-bold">Leave Requests</h2>
                    <p className="text-gray-600">Pending: 5</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-bold">Attendance</h2>
                    <p className="text-gray-600">Present Today: 142</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
