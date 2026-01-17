import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import { recruitmentAPI, employeeAPI, leaveAPI, attendanceAPI } from '../../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const HRDashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalEmployees: 0,
    stageDistribution: [],
    recentApplications: [],
    departmentDistribution: {},
    leaveStats: { pending: 0, approved: 0, rejected: 0 },
    attendanceStats: { present: 0, late: 0, half_day: 0 },
    loading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch All Data in Parallel
        const [recStatRes, empRes, leaveStatRes, attStatRes] = await Promise.allSettled([
          recruitmentAPI.getStats(),
          employeeAPI.getEmployees(),
          leaveAPI.getStats ? leaveAPI.getStats() : Promise.resolve({ data: { pending: 0, approved: 0, rejected: 0 } }),
          attendanceAPI.getStats ? attendanceAPI.getStats() : Promise.resolve({ data: { present: 0, late: 0, half_day: 0 } })
        ]);

        // 1. Recruitment Data
        let recData = { totalJobs: 0, totalApplications: 0, stageDistribution: [], recentApplications: [] };
        if (recStatRes.status === 'fulfilled') {
          recData = recStatRes.value.data;
        }

        // 2. Employee Data
        let empCount = 0;
        let depDist = {};
        if (empRes.status === 'fulfilled') {
          const employees = empRes.value.data;
          empCount = employees.length;
          employees.forEach(emp => {
            const dep = emp.department || 'Unassigned';
            depDist[dep] = (depDist[dep] || 0) + 1;
          });
        }

        // 3. Leave Stats
        const leaveData = leaveStatRes.status === 'fulfilled' ? leaveStatRes.value.data : { pending: 0, approved: 0, rejected: 0 };

        // 4. Attendance Stats
        const attData = attStatRes.status === 'fulfilled' ? attStatRes.value.data : { present: 0, late: 0, half_day: 0 };

        setStats({
          totalJobs: recData.totalJobs || 0,
          totalApplications: recData.totalApplications || 0,
          totalEmployees: empCount,
          stageDistribution: recData.stageDistribution || [],
          recentApplications: recData.recentApplications || [],
          departmentDistribution: depDist,
          leaveStats: leaveData,
          attendanceStats: attData,
          loading: false
        });

      } catch (error) {
        console.error("Critical dashboard error:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  // --- Chart Data Preparation ---

  // 1. Recruitment Funnel (Bar Chart)
  const funnelLabels = stats.stageDistribution.map(item => item.stage ? item.stage.toUpperCase() : 'UNKNOWN');
  const funnelDataValues = stats.stageDistribution.map(item => item.count);

  const funnelChartData = {
    labels: funnelLabels.length ? funnelLabels : ['NO DATA'],
    datasets: [{
      label: 'Candidates',
      data: funnelDataValues.length ? funnelDataValues : [0],
      backgroundColor: 'rgba(16, 185, 129, 0.6)',
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 1,
    }],
  };

  // 2. Department Distribution (Doughnut Chart)
  const deptLabels = Object.keys(stats.departmentDistribution);
  const deptValues = Object.values(stats.departmentDistribution);

  const deptChartData = {
    labels: deptLabels.length ? deptLabels : ['No Departments'],
    datasets: [{
      data: deptValues.length ? deptValues : [0],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
    }],
  };

  // 3. Application Trend (Line Chart)
  const trendLabels = stats.recentApplications.map(d => d.date);
  const trendValues = stats.recentApplications.map(d => d.count);

  const trendChartData = {
    labels: trendLabels.length ? trendLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Applications',
      data: trendLabels.length ? trendValues : [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#0D9488',
      backgroundColor: 'rgba(13, 148, 136, 0.2)',
      fill: true,
      tension: 0.4
    }],
  };

  // 4. Leave Requests (Pie Chart)
  const leaveChartData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [{
      data: [stats.leaveStats.pending, stats.leaveStats.approved, stats.leaveStats.rejected],
      backgroundColor: ['#F59E0B', '#10B981', '#EF4444'],
    }]
  };

  // 5. Today's Attendance (Pie/Doughnut)
  const attChartData = {
    labels: ['Present', 'Late', 'Half Day'],
    datasets: [{
      data: [stats.attendanceStats.present, stats.attendanceStats.late, stats.attendanceStats.half_day],
      backgroundColor: ['#10B981', '#F59E0B', '#6366F1'],
    }]
  };

  if (stats.loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Analytics...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Executive HR Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time enterprise metrics.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
        >
          Refresh
        </button>
      </header>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Employees" value={stats.totalEmployees} icon="👥" color="blue" />
        <StatCard title="Jobs Open" value={stats.totalJobs} icon="💼" color="green" />
        <StatCard title="Leave Pending" value={stats.leaveStats.pending} icon="⏳" color="orange" />
        <StatCard title="Present Today" value={stats.attendanceStats.present} icon="✅" color="teal" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* 1. Recruitment Funnel */}
        <ChartCard title="Recruitment Pipeline">
          <Bar data={funnelChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </ChartCard>

        {/* 2. Application Trend */}
        <ChartCard title="Application Volume (7 Days)">
          <Line data={trendChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </ChartCard>

        {/* 3. Leave Requests Distribution */}
        <ChartCard title="Leave Request Status">
          <div className="h-64 flex justify-center">
            <Pie data={leaveChartData} />
          </div>
        </ChartCard>

        {/* 4. Department Distribution */}
        <ChartCard title="Workforce by Department">
          <div className="h-64 flex justify-center">
            <Doughnut data={deptChartData} />
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* 5. Attendance Overview */}
        <ChartCard title="Today's Attendance Status">
          <div className="h-64 flex justify-center">
            <Pie data={attChartData} />
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
    teal: 'text-teal-600 bg-teal-50'
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-all">
      <div className={`p-4 rounded-xl ${colors[color]} text-2xl`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
};

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
    <h3 className="text-lg font-bold text-gray-800 mb-6 border-l-4 border-indigo-500 pl-3">{title}</h3>
    <div className="min-h-[250px]">{children}</div>
  </div>
);

export default HRDashboard;
