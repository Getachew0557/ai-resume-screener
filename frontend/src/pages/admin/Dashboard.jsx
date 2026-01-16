import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    Stack,
    CircularProgress,
    Alert,
    useTheme,
    alpha
} from '@mui/material';
import {
    People as PeopleIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    Assignment as AssignmentIcon,
    TrendingUp as TrendingUpIcon,
    GroupAdd as GroupAddIcon
} from '@mui/icons-material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { authAPI, recruitmentAPI, trainingAPI } from '../../services/api';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const MetricCard = ({ title, value, icon: Icon, color, trend }) => {
    const theme = useTheme();
    return (
        <Card elevation={0} sx={{
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.1)} 100%)`,
            position: 'relative',
            overflow: 'hidden'
        }}>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="overline" color="text.secondary" fontWeight="700">
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight="800" sx={{ my: 0.5 }}>
                            {value}
                        </Typography>
                        {trend && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <TrendingUpIcon sx={{ fontSize: '1rem', color: 'success.main' }} />
                                <Typography variant="caption" color="success.main" fontWeight="600">
                                    {trend}
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: color,
                        color: 'white',
                        boxShadow: `0 8px 16px ${alpha(color, 0.3)}`
                    }}>
                        <Icon />
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

const AdminDashboard = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        auth: null,
        recruitment: null,
        training: null
    });

    useEffect(() => {
        fetchAllStats();
    }, []);

    const fetchAllStats = async () => {
        setLoading(true);
        try {
            const [authRes, recruitmentRes, trainingRes] = await Promise.all([
                authAPI.getStats(),
                recruitmentAPI.getStats(),
                trainingAPI.getStats()
            ]);

            setStats({
                auth: authRes.data,
                recruitment: recruitmentRes.data,
                training: trainingRes.data
            });
            setError(null);
        } catch (err) {
            console.error("Dashboard error:", err);
            setError("Failed to fetch dashboard data. Please ensure all microservices are running.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress size={60} thickness={4} />
        </Box>
    );

    if (error) return (
        <Box p={4}><Alert severity="error">{error}</Alert></Box>
    );

    // Chart Data Preparation
    const roleDistData = {
        labels: stats.auth?.roleDistribution?.map(r => r.role.toUpperCase()) || [],
        datasets: [{
            data: stats.auth?.roleDistribution?.map(r => r.count) || [],
            backgroundColor: [
                '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'
            ],
            borderWidth: 0,
        }]
    };

    const registrationTrendData = {
        labels: stats.auth?.recentRegistrations?.map(r => r.date) || [],
        datasets: [{
            label: 'New Users',
            data: stats.auth?.recentRegistrations?.map(r => r.count) || [],
            fill: true,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
        }]
    };

    const applicationStageData = {
        labels: stats.recruitment?.stageDistribution?.map(s => s.stage) || [],
        datasets: [{
            label: 'Applications',
            data: stats.recruitment?.stageDistribution?.map(s => s.count) || [],
            backgroundColor: '#8b5cf6',
            borderRadius: 6
        }]
    };

    const enrollmentTrendData = {
        labels: stats.training?.recentEnrollments?.map(e => e.date) || [],
        datasets: [{
            label: 'Enrollments',
            data: stats.training?.recentEnrollments?.map(e => e.count) || [],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    return (
        <div className="p-4 md:p-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
                <Box>
                    <Typography variant="h4" fontWeight="800" color="text.primary" sx={{ fontSize: { xs: '1.5rem', md: '1.875rem' } }}>
                        Admin Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Real-time metrics from across the ERP system
                    </Typography>
                </Box>
                {/* Future actions/filters can go here */}
            </div>

            {/* Metrics Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Users"
                    value={stats.auth?.totalUsers || 0}
                    icon={PeopleIcon}
                    color="#3b82f6"
                    trend="+12% from last week"
                />
                <MetricCard
                    title="Active Jobs"
                    value={stats.recruitment?.totalJobs || 0}
                    icon={WorkIcon}
                    color="#8b5cf6"
                />
                <MetricCard
                    title="Available Courses"
                    value={stats.training?.totalCourses || 0}
                    icon={SchoolIcon}
                    color="#10b981"
                />
                <MetricCard
                    title="Total Applications"
                    value={stats.recruitment?.totalApplications || 0}
                    icon={AssignmentIcon}
                    color="#f59e0b"
                />
            </div>

            {/* Analytics Section - Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-2" elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>User Registration Trend</Typography>
                    <Box sx={{ height: 300 }}>
                        <Line data={registrationTrendData} options={{ maintainAspectRatio: false }} />
                    </Box>
                </Card>
                <Card elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Role Distribution</Typography>
                    <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                        <Doughnut data={roleDistData} options={{ maintainAspectRatio: false }} />
                    </Box>
                </Card>
            </div>

            {/* Analytics Section - Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Recruitment Funnel</Typography>
                    <Box sx={{ height: 300 }}>
                        <Bar data={applicationStageData} options={{ maintainAspectRatio: false }} />
                    </Box>
                </Card>
                <Card elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Training Enrollment Trend</Typography>
                    <Box sx={{ height: 300 }}>
                        <Line data={enrollmentTrendData} options={{ maintainAspectRatio: false }} />
                    </Box>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
