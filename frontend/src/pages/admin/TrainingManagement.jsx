import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Download as DownloadIcon,
    Quiz as QuizIcon,
    CardMembership as CertificateIcon,
    School as CourseIcon,
    QuestionAnswer as QuestionIcon,
    List as ListIcon
} from '@mui/icons-material';
import { trainingAPI } from '../../services/api';

const TrainingManagement = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Course State
    const [courses, setCourses] = useState([]);
    const [coursePage, setCoursePage] = useState(0);
    const [courseRowsPerPage, setCourseRowsPerPage] = useState(10);
    const [totalCourses, setTotalCourses] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');

    // Quiz State
    const [quizzes, setQuizzes] = useState([]);
    const [quizPage, setQuizPage] = useState(0);

    // Certificate State
    const [certificates, setCertificates] = useState([]);
    const [certPage, setCertPage] = useState(0);
    const [certRowsPerPage, setCertRowsPerPage] = useState(10);
    const [totalCerts, setTotalCerts] = useState(0);

    // Modals
    const [openCourseModal, setOpenCourseModal] = useState(false);
    const [openQuizModal, setOpenQuizModal] = useState(false);
    const [openQuestionModal, setOpenQuestionModal] = useState(false);
    const [openQuestionsListModal, setOpenQuestionsListModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    const [courseFormData, setCourseFormData] = useState({
        title: '', description: '', duration_hours: 1, difficulty_level: 'beginner', passing_score: 70
    });

    const [quizFormData, setQuizFormData] = useState({
        course_id: '', title: '', description: '', time_limit_minutes: 30, max_attempts: 3
    });

    const [questionFormData, setQuestionFormData] = useState({
        question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', points: 1
    });

    useEffect(() => {
        if (activeTab === 0) fetchCourses();
        if (activeTab === 1) {
            fetchQuizzes();
            fetchCourses(); // needed for dropdown
        }
        if (activeTab === 2) fetchCertificates();
    }, [activeTab, coursePage, courseRowsPerPage, searchQuery, difficultyFilter, certPage, certRowsPerPage]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await trainingAPI.getCourses({
                page: coursePage + 1,
                limit: courseRowsPerPage,
                search: searchQuery,
                difficulty: difficultyFilter,
            });
            setCourses(response.data.courses);
            setTotalCourses(response.data.pagination.total);
        } catch (err) {
            setError('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await trainingAPI.getAllQuizzes();
            setQuizzes(response.data.quizzes);

            // If the questions list modal is open, update the selected quiz locally from the new data
            if (openQuestionsListModal && selectedQuiz) {
                const refreshed = response.data.quizzes.find(q => q.id === selectedQuiz.id);
                if (refreshed) setSelectedQuiz(refreshed);
            }
        } catch (err) {
            setError('Failed to fetch quizzes');
        } finally {
            setLoading(false);
        }
    };

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const response = await trainingAPI.getAllCertificates({
                page: certPage + 1,
                limit: certRowsPerPage,
            });
            setCertificates(response.data.certificates);
            setTotalCerts(response.data.pagination.total);
        } catch (err) {
            setError('Failed to fetch certificates');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async () => {
        try {
            await trainingAPI.createCourse(courseFormData);
            setSuccess('Course created successfully!');
            setOpenCourseModal(false);
            fetchCourses();
        } catch (err) { setError('Failed to create course'); }
    };

    const handleCreateQuiz = async () => {
        try {
            if (editMode) {
                await trainingAPI.updateQuiz(selectedQuiz.id, quizFormData);
                setSuccess('Quiz updated successfully!');
            } else {
                await trainingAPI.createQuiz(quizFormData);
                setSuccess('Quiz created successfully!');
            }
            setOpenQuizModal(false);
            setEditMode(false);
            fetchQuizzes();
        } catch (err) { setError('Failed to save quiz'); }
    };

    const handleDeleteQuiz = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;
        try {
            await trainingAPI.deleteQuiz(id);
            setSuccess('Quiz deleted successfully!');
            fetchQuizzes();
        } catch (err) { setError('Failed to delete quiz'); }
    };

    const handleSaveQuestion = async () => {
        try {
            if (editMode && selectedQuestion) {
                await trainingAPI.updateQuestion(selectedQuestion.id, questionFormData);
                setSuccess('Question updated successfully!');
            } else {
                await trainingAPI.addQuestion(selectedQuiz.id, questionFormData);
                setSuccess('Question added successfully!');
            }
            setOpenQuestionModal(false);
            setEditMode(false);
            fetchQuizzes();
        } catch (err) {
            console.error('Save question error:', err);
            setError('Failed to save question. Please try again.');
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        try {
            await trainingAPI.deleteQuestion(id);
            setSuccess('Question deleted successfully!');
            fetchQuizzes();
        } catch (err) { setError('Failed to delete question'); }
    };

    const handleDownloadCert = async (certId, certNumber) => {
        try {
            const response = await trainingAPI.downloadCertificate(certId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificate-${certNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) { setError('Failed to download certificate'); }
    };

    const renderCoursesTab = () => (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <TextField size="small" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} sx={{ flexGrow: 1 }} />
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
                    setEditMode(false);
                    setCourseFormData({ title: '', description: '', duration_hours: 1, difficulty_level: 'beginner', passing_score: 70 });
                    setOpenCourseModal(true);
                }} sx={{
                    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)'
                }}>New Course</Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f9fafb' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Difficulty</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Score %</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courses.map(course => (
                            <TableRow key={course.id} hover>
                                <TableCell className="font-medium">{course.title}</TableCell>
                                <TableCell><Chip label={course.difficulty_level} size="small" /></TableCell>
                                <TableCell>{course.duration_hours}h</TableCell>
                                <TableCell>{course.passing_score}%</TableCell>
                                <TableCell>
                                    <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination component="div" count={totalCourses} page={coursePage} onPageChange={(e, p) => setCoursePage(p)} rowsPerPage={courseRowsPerPage} onRowsPerPageChange={e => setCourseRowsPerPage(e.target.value)} />
            </TableContainer>
        </Box>
    );

    const renderQuizzesTab = () => (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" startIcon={<QuizIcon />} onClick={() => {
                    setEditMode(false);
                    setQuizFormData({ course_id: '', title: '', description: '', time_limit_minutes: 30, max_attempts: 3 });
                    setOpenQuizModal(true);
                }} sx={{
                    background: 'linear-gradient(to right, #10b981, #059669)'
                }}>Create Quiz</Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f9fafb' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Quiz</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Stats</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {quizzes.length === 0 ? (
                            <TableRow><TableCell colSpan={4} align="center">No quizzes found. Link one to a course!</TableCell></TableRow>
                        ) : quizzes.map(quiz => (
                            <TableRow key={quiz.id} hover>
                                <TableCell>
                                    <Typography variant="subtitle2">{quiz.title}</Typography>
                                    <Typography variant="caption" color="textSecondary">{quiz.description}</Typography>
                                </TableCell>
                                <TableCell>{quiz.course?.title}</TableCell>
                                <TableCell>
                                    <Chip
                                        icon={<QuestionIcon />}
                                        label={`${quiz.questions?.length || 0} Questions`}
                                        size="small"
                                        sx={{ mr: 1, cursor: 'pointer' }}
                                        onClick={() => { setSelectedQuiz(quiz); setOpenQuestionsListModal(true); }}
                                    />
                                    <Chip label={`${quiz.max_attempts} Attempts`} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>
                                    <IconButton color="primary" title="Manage Questions" onClick={() => { setSelectedQuiz(quiz); setOpenQuestionsListModal(true); }}>
                                        <ListIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" title="Edit Quiz" onClick={() => {
                                        setSelectedQuiz(quiz);
                                        setQuizFormData({
                                            course_id: quiz.course_id,
                                            title: quiz.title,
                                            description: quiz.description,
                                            time_limit_minutes: quiz.time_limit_minutes,
                                            max_attempts: quiz.max_attempts
                                        });
                                        setEditMode(true);
                                        setOpenQuizModal(true);
                                    }}><EditIcon fontSize="small" /></IconButton>
                                    <IconButton size="small" color="error" title="Delete Quiz" onClick={() => handleDeleteQuiz(quiz.id)}><DeleteIcon fontSize="small" /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    const renderCertificatesTab = () => (
        <Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>All Generated Certificates</Typography>
                <Typography variant="body2" color="textSecondary">Certificates are automatically generated for all employees who achieve the passing score.</Typography>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f9fafb' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Issued Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {certificates.map(cert => (
                            <TableRow key={cert.id} hover>
                                <TableCell>
                                    <Typography className="font-bold">{cert.user_name}</Typography>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>{cert.certificate_id}</Typography>
                                </TableCell>
                                <TableCell>{cert.course_title}</TableCell>
                                <TableCell>
                                    <Chip label={`${cert.score}%`} color={cert.score >= 90 ? 'success' : 'primary'} size="small" />
                                </TableCell>
                                <TableCell>{new Date(cert.issued_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={() => handleDownloadCert(cert.id, cert.certificate_id)}><DownloadIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination component="div" count={totalCerts} page={certPage} onPageChange={(e, p) => setCertPage(p)} rowsPerPage={certRowsPerPage} onRowsPerPageChange={e => setCertRowsPerPage(e.target.value)} />
            </TableContainer>
        </Box>
    );

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Training & Certification</h1>

            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
                <Tab icon={<CourseIcon />} label="Courses" iconPosition="start" />
                <Tab icon={<QuizIcon />} label="Quizzes" iconPosition="start" />
                <Tab icon={<CertificateIcon />} label="Certifications" iconPosition="start" />
            </Tabs>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {activeTab === 0 && renderCoursesTab()}
            {activeTab === 1 && renderQuizzesTab()}
            {activeTab === 2 && renderCertificatesTab()}

            {/* Course Modal */}
            <Dialog open={openCourseModal} onClose={() => setOpenCourseModal(false)} fullWidth>
                <DialogTitle>{editMode ? 'Edit Course' : 'Create Course'}</DialogTitle>
                <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Title" fullWidth value={courseFormData.title || ''} onChange={e => setCourseFormData({ ...courseFormData, title: e.target.value })} />
                    <TextField label="Description" fullWidth multiline rows={3} value={courseFormData.description || ''} onChange={e => setCourseFormData({ ...courseFormData, description: e.target.value })} />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField label="Hours" type="number" fullWidth value={courseFormData.duration_hours || 0} onChange={e => setCourseFormData({ ...courseFormData, duration_hours: parseInt(e.target.value) || 0 })} />
                        <TextField label="Passing Score %" type="number" fullWidth value={courseFormData.passing_score || 0} onChange={e => setCourseFormData({ ...courseFormData, passing_score: parseInt(e.target.value) || 0 })} />
                    </Box>
                    <TextField select label="Difficulty" fullWidth value={courseFormData.difficulty_level || 'beginner'} onChange={e => setCourseFormData({ ...courseFormData, difficulty_level: e.target.value })}>
                        <MenuItem value="beginner">Beginner</MenuItem>
                        <MenuItem value="intermediate">Intermediate</MenuItem>
                        <MenuItem value="advanced">Advanced</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCourseModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateCourse}>{editMode ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>

            {/* Quiz Modal */}
            <Dialog open={openQuizModal} onClose={() => setOpenQuizModal(false)} fullWidth>
                <DialogTitle>{editMode ? 'Edit Quiz' : 'Create New Quiz'}</DialogTitle>
                <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {!editMode && (
                        <TextField select label="Link to Course" fullWidth value={quizFormData.course_id || ''} onChange={e => setQuizFormData({ ...quizFormData, course_id: e.target.value })}>
                            {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
                        </TextField>
                    )}
                    <TextField label="Quiz Title" fullWidth value={quizFormData.title || ''} onChange={e => setQuizFormData({ ...quizFormData, title: e.target.value })} />
                    <TextField label="Description" fullWidth multiline rows={2} value={quizFormData.description || ''} onChange={e => setQuizFormData({ ...quizFormData, description: e.target.value })} />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField label="Time Limit (min)" type="number" fullWidth value={quizFormData.time_limit_minutes || 0} onChange={e => setQuizFormData({ ...quizFormData, time_limit_minutes: parseInt(e.target.value) || 0 })} />
                        <TextField label="Max Attempts" type="number" fullWidth value={quizFormData.max_attempts || 0} onChange={e => setQuizFormData({ ...quizFormData, max_attempts: parseInt(e.target.value) || 0 })} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenQuizModal(false)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleCreateQuiz}>{editMode ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>

            {/* Questions List Modal */}
            <Dialog open={openQuestionsListModal} onClose={() => setOpenQuestionsListModal(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Questions for: {selectedQuiz?.title}
                    <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={() => {
                        setEditMode(false);
                        setSelectedQuestion(null);
                        setQuestionFormData({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', points: 1 });
                        setOpenQuestionModal(true);
                    }}>Add Question</Button>
                </DialogTitle>
                <DialogContent dividers>
                    <List>
                        {selectedQuiz?.questions?.map((q, idx) => (
                            <ListItem key={q.id} divider sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">Q{idx + 1}: {q.question_text}</Typography>
                                    <Box>
                                        <IconButton size="small" color="primary" title="Edit Question" onClick={() => {
                                            setSelectedQuestion(q);
                                            setQuestionFormData({
                                                question_text: q.question_text || '',
                                                option_a: q.option_a || '',
                                                option_b: q.option_b || '',
                                                option_c: q.option_c || '',
                                                option_d: q.option_d || '',
                                                correct_answer: q.correct_answer || 'A',
                                                points: q.points || 1
                                            });
                                            setEditMode(true);
                                            setOpenQuestionModal(true);
                                        }}><EditIcon fontSize="small" /></IconButton>
                                        <IconButton size="small" color="error" title="Delete Question" onClick={() => handleDeleteQuestion(q.id)}><DeleteIcon fontSize="small" /></IconButton>
                                    </Box>
                                </Box>
                                <Typography variant="body2" color="textSecondary">A: {q.option_a} | B: {q.option_b} | C: {q.option_c} | D: {q.option_d}</Typography>
                                <Typography variant="caption" sx={{ mt: 0.5, color: '#10b981', fontWeight: 'bold' }}>Correct: {q.correct_answer} | Points: {q.points}</Typography>
                            </ListItem>
                        ))}
                        {(!selectedQuiz?.questions || selectedQuiz.questions.length === 0) && (
                            <Typography sx={{ py: 2, textAlign: 'center', color: '#64748b' }}>No questions yet</Typography>
                        )}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenQuestionsListModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Question Create/Edit Modal */}
            <Dialog open={openQuestionModal} onClose={() => setOpenQuestionModal(false)} fullWidth>
                <DialogTitle>{editMode ? 'Edit Question' : 'Add Question'}</DialogTitle>
                <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Question Text" fullWidth multiline rows={2} value={questionFormData.question_text || ''} onChange={e => setQuestionFormData({ ...questionFormData, question_text: e.target.value })} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextField label="Option A" fullWidth value={questionFormData.option_a || ''} onChange={e => setQuestionFormData({ ...questionFormData, option_a: e.target.value })} />
                        <TextField label="Option B" fullWidth value={questionFormData.option_b || ''} onChange={e => setQuestionFormData({ ...questionFormData, option_b: e.target.value })} />
                        <TextField label="Option C" fullWidth value={questionFormData.option_c || ''} onChange={e => setQuestionFormData({ ...questionFormData, option_c: e.target.value })} />
                        <TextField label="Option D" fullWidth value={questionFormData.option_d || ''} onChange={e => setQuestionFormData({ ...questionFormData, option_d: e.target.value })} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField select label="Correct Answer" fullWidth value={questionFormData.correct_answer || 'A'} onChange={e => setQuestionFormData({ ...questionFormData, correct_answer: e.target.value })}>
                            <MenuItem value="A">A</MenuItem><MenuItem value="B">B</MenuItem><MenuItem value="C">C</MenuItem><MenuItem value="D">D</MenuItem>
                        </TextField>
                        <TextField label="Points" type="number" fullWidth value={questionFormData.points || 1} onChange={e => setQuestionFormData({ ...questionFormData, points: parseInt(e.target.value) || 0 })} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenQuestionModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveQuestion}>{editMode ? 'Update' : 'Add'}</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default TrainingManagement;
