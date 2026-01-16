const EmployeeDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Leave Balance</h3>
          <p className="text-3xl font-bold mt-2">12 days</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Attendance Rate</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">98%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Tasks</h3>
          <p className="text-3xl font-bold mt-2">3</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
