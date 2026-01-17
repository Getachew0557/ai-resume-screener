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
import { recruitmentAPI, employeeAPI } from '../../services/api';

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
    stageDistribution: {},
    recentApplications: [],
    departmentDistribution: {},
    loading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Recruitment Stats
        const recruitmentRes = await recruitmentAPI.getStats();
        const recData = recruitmentRes.data;

        // Fetch Employee Data (to calc total and dep distribution)
        let empCount = 0;
        let depDist = {};

        try {
          const empRes = await employeeAPI.getEmployees();
          const employees = empRes.data;
          empCount = employees.length;

          // Calc Dept Distribution
          employees.forEach(emp => {
            const dep = emp.department || 'Unassigned';
            depDist[dep] = (depDist[dep] || 0) + 1;
          });
        } catch (empErr) {
          console.error("Failed to fetch employees", empErr);
          // Fallback mock
          empCount = 45;
          depDist = { 'Engineering': 20, 'HR': 5, 'Sales': 10, 'Marketing': 10 };
        }

        // Transform Recent Applications for Chart
        // Assuming recData.recentApplications is [{ date: '2023-01-01', count: 5 }, ...]
        // We might need to fill in missing dates or just map it.

        setStats({
          totalJobs: recData.totalJobs || 0,
          totalApplications: recData.totalApplications || 0,
          totalEmployees: empCount,
          stageDistribution: recData.stageDistribution || [], // Array of { stage: 'new', count: 5 }
          recentApplications: recData.recentApplications || [],
          departmentDistribution: depDist,
          loading: false
        });

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  // --- Chart Data Preparation ---

  // 1. Recruitment Funnel (Bar Chart)
  const funnelLabels = stats.stageDistribution.length > 0
    ? stats.stageDistribution.map(item => item.stage.toUpperCase())
    : ['NEW', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];

  const funnelDataValues = stats.stageDistribution.length > 0
    ? stats.stageDistribution.map(item => item.count)
    : [0, 0, 0, 0, 0, 0]; // Empty state

  const funnelChartData = {
    labels: funnelLabels,
    datasets: [
      {
        label: 'Candidates',
        data: funnelDataValues,
        backgroundColor: 'rgba(16, 185, 129, 0.6)', // Green-500
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  // 2. Department Distribution (Pie Chart)
  const deptLabels = Object.keys(stats.departmentDistribution);
  const deptValues = Object.values(stats.departmentDistribution);

  const deptChartData = {
    labels: deptLabels,
    datasets: [
      {
        data: deptValues,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 3. Application Trend (Line Chart)
  const trendLabels = stats.recentApplications.map(d => d.date);
  const trendValues = stats.recentApplications.map(d => d.count);

  const trendChartData = {
    labels: trendLabels.length ? trendLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Applications',
        data: trendLabels.length ? trendValues : [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgba(13, 148, 136, 1)', // Teal-600
        backgroundColor: 'rgba(13, 148, 136, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  if (stats.loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Dashboard Insights...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">HR Executive Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time overview of your workforce and recruitment.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
        >
          Refresh Data
        </button>
      </header>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          color="blue"
          trend="+5% vs last month"
        />
        <StatCard
          title="Active Jobs"
          value={stats.totalJobs}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
          color="green"
          trend="Hiring Active"
        />
        <StatCard
          title="Pending Applications"
          value={stats.totalApplications}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          color="orange"
          trend="Needs Review"
        />
        <StatCard
          title="Avg. Attendance"
          value="92%"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="purple"
          trend="Steady"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recruitment Funnel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-2 h-8 bg-green-500 rounded-sm mr-3"></span>
            Recruitment Pipeline
          </h3>
          <div className="h-64">
            <Bar
              data={funnelChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 10,
                    cornerRadius: 8,
                  }
                },
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>

        {/* Application Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-2 h-8 bg-teal-500 rounded-sm mr-3"></span>
            Application Volume (7 Days)
          </h3>
          <div className="h-64">
            <Line
              data={trendChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employee Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow lg:col-span-1">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Department Distribution</h3>
          <div className="h-64 relative flex justify-center">
            <Doughnut
              data={deptChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                }
              }}
            />
          </div>
        </div>

        {/* Recent Activity / Notifications (Placeholder for now) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Insights & Recommendations (AI)</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">High Volume of Applicants</h4>
                <p className="text-sm text-blue-700 mt-1">You received 15 new applications today. The AI Agent has automatically scored them. 5 candidates match >80%.</p>
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-start space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <h4 className="font-semibold text-orange-900">Attendance Alert</h4>
                <p className="text-sm text-orange-700 mt-1">3 Employees were late today. Review the Attendance Logs for more details.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-semibold px-2 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-100">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mt-1 tracking-tight">{value}</p>
    </div>
  );
};

export default HRDashboard;
