import React, { useState } from 'react';

export default function AttendanceFilter({ onFilter }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const handleFilter = () => {
    // Pass filter values back to parent
    onFilter({ startDate, endDate, employeeId });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 space-y-4">
      <h2 className="text-lg font-bold text-gray-700">Filter Attendance</h2>

      {/* Start Date Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-600">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300"
        />
      </div>

      {/* End Date Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-600">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300"
        />
      </div>

      {/* Employee Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-600">Employee ID</label>
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="Enter employee ID"
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300"
        />
      </div>

      {/* Filter Button */}
      <button
        onClick={handleFilter}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Apply Filter
      </button>
    </div>
  );
}