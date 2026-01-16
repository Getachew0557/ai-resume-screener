import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    LinearProgress,
    Alert,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    useTheme,
    useMediaQuery,
    Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { trainingAPI } from '../../services/api';
import QuizView from '../../components/training/QuizView';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const EmployeeCourses = () => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [tabValue, setTabValue] = useState(0);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Quiz Dialog State
    const [quizOpen, setQuizOpen] = useState(false);
    const [activeCourseId, setActiveCourseId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [coursesRes, enrollmentsRes, certificatesRes] = await Promise.all([
                trainingAPI.getCourses({ is_active: true }),
                trainingAPI.getMyEnrollments(),
                trainingAPI.getMyCertificates()
            ]);
            setCourses(coursesRes.data.courses || []);
            setEnrollments(enrollmentsRes.data.enrollments || []);
            setCertificates(certificatesRes.data.certificates || []);
            setError(null);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load courses data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleEnroll = async (courseId) => {
        setActionLoading(true);
        try {
            await trainingAPI.enrollCourse({ course_id: courseId });
            await fetchData();
            setTabValue(1);
        } catch (err) {
            console.error("Enrollment error:", err);
            alert("Failed to enroll. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleStartQuiz = (courseId) => {
        setActiveCourseId(courseId);
        setQuizOpen(true);
    };

    const handleQuizFinish = () => {
        setQuizOpen(false);
        setActiveCourseId(null);
        fetchData();
    };

    const handleCloseQuiz = () => {
        setQuizOpen(false);
        setActiveCourseId(null);
    };

    const handleDownloadCertificate = async (certificateId, fileName) => {
        try {
            const response = await trainingAPI.downloadCertificate(certificateId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'certificate.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("Download error:", err);
            alert("Failed to download certificate.");
        }
    };

    const isEnrolled = (courseId) => {
        return enrollments.some(e => e.course_id === courseId);
    };

    const CourseCard = ({ course, isEnrolled, enrollment, certificate }) => (
        <Card
            elevation={3}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 12
                },
                borderRadius: 4,
                overflow: 'hidden'
            }}
        >
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
                }}
            >
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <SchoolIcon fontSize="large" />
                </Avatar>
                <Chip
                    label={course.difficulty_level}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', textTransform: 'capitalize' }}
                />
            </Box>
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h6" component="div" gutterBottom fontWeight="bold">
                    {course.title}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={2} color="text.secondary">
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="body2">{course.duration_hours} Hours</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph sx={{
                    display: '-webkit-box',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 3
                }}>
                    {course.description}
                </Typography>

                {enrollment && (
                    <Box mt={2}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" fontWeight="bold">
                                {enrollment.status === 'completed' ? (enrollment.passed ? 'Completed' : 'Failed') : 'Progress'}
                            </Typography>
                            <Typography variant="caption">{enrollment.progress_percentage}%</Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={enrollment.progress_percentage || 0}
                            color={enrollment.passed ? "success" : "primary"}
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                    </Box>
                )}
            </CardContent>

            <CardActions sx={{ p: 3, pt: 0 }}>
                {!enrollment ? (
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={isEnrolled || actionLoading}
                        onClick={() => handleEnroll(course.id)}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                    >
                        {isEnrolled ? "Enrolled" : "Enroll Now"}
                    </Button>
                ) : (
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {!enrollment.passed && (
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                startIcon={<PlayCircleOutlineIcon />}
                                onClick={() => handleStartQuiz(enrollment.course_id)}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                            >
                                Take Exam
                            </Button>
                        )}

                        {enrollment.passed && certificate && (
                            <Button
                                variant="contained"
                                color="success"
                                fullWidth
                                size="large"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownloadCertificate(certificate.id, `${course.title}-Certificate.pdf`)}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                            >
                                Download Certificate
                            </Button>
                        )}

                        {enrollment.status === 'completed' && !enrollment.passed && (
                            <Button
                                variant="outlined"
                                color="error"
                                fullWidth
                                disabled
                                startIcon={<CloseIcon />}
                                sx={{ borderRadius: 2 }}
                            >
                                Not Passed
                            </Button>
                        )}
                    </Box>
                )}
            </CardActions>
        </Card>
    );

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>Learning Center</Typography>
                <Typography variant="body1" color="text.secondary">Expand your skills with our curated courses.</Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="course tabs">
                    <Tab label="Available Courses" sx={{ textTransform: 'none', fontSize: '1rem' }} />
                    <Tab label="My Learning" sx={{ textTransform: 'none', fontSize: '1rem' }} />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                    {courses.map(course => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
                            <CourseCard course={course} isEnrolled={isEnrolled(course.id)} />
                        </Grid>
                    ))}
                    {courses.length === 0 && (
                        <Grid item xs={12}><Typography textAlign="center" color="text.secondary" mt={4}>No courses available.</Typography></Grid>
                    )}
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                    {enrollments.map(enrollment => {
                        const course = enrollment.course || courses.find(c => c.id === enrollment.course_id) || {};
                        const certificate = certificates.find(c => c.course_id === enrollment.course_id);
                        return (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={enrollment.id}>
                                <CourseCard course={{ ...course, ...enrollment }} enrollment={enrollment} certificate={certificate} />
                            </Grid>
                        );
                    })}
                    {enrollments.length === 0 && (
                        <Grid item xs={12}><Typography textAlign="center" color="text.secondary" mt={4}>You haven't enrolled in any courses yet.</Typography></Grid>
                    )}
                </Grid>
            </TabPanel>

            {/* Quiz Dialog */}
            <Dialog
                fullScreen={fullScreen}
                open={quizOpen}
                onClose={handleCloseQuiz}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: fullScreen ? 0 : 3, height: fullScreen ? '100%' : 'auto', maxHeight: '90vh' }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                        Quiz Assessment
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseQuiz}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    {activeCourseId && (
                        <Box sx={{ p: 3 }}>
                            <QuizView
                                courseId={activeCourseId}
                                onFinish={handleQuizFinish}
                                onCancel={handleCloseQuiz}
                            />
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default EmployeeCourses;
