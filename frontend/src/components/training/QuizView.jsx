import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Alert,
    CircularProgress,
    Paper,
    LinearProgress
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { trainingAPI } from '../../services/api';

const QuizView = ({ courseId, onFinish, onCancel }) => {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(null);
    const timerRef = useRef(null);

    // Attempts tracking
    const [attemptsInfo, setAttemptsInfo] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await trainingAPI.getQuiz(courseId);
                const quizData = response.data.quiz || response.data;
                setQuiz(quizData);

                // Fetch attempts info
                const attemptsResponse = await trainingAPI.getQuizAttemptsCount(quizData.id);
                setAttemptsInfo(attemptsResponse.data);

                // Initialize timer if exists
                if (quizData.time_limit_minutes) {
                    setTimeLeft(quizData.time_limit_minutes * 60);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching quiz:", err);
                setError("Failed to load quiz. Please try again.");
                setLoading(false);
            }
        };

        if (courseId) {
            fetchQuiz();
        }
    }, [courseId]);

    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0 && !result && !submitting) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(timerRef.current);
                        handleSubmit(true); // Auto submit
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft, result, submitting]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = async (autoSubmit = false) => {
        setSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            const payload = {
                answers: answers
            };

            const response = await trainingAPI.submitQuiz(quiz.id, payload);
            setResult(response.data);

            if (response.data.passed && onFinish) {
                // Determine logic for onFinish if needed
            }
        } catch (err) {
            console.error("Error submitting quiz:", err);
            setError("Failed to submit quiz. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!quiz) return <Alert severity="info">No quiz found for this course.</Alert>;

    // Check if max attempts reached
    if (attemptsInfo && !attemptsInfo.canAttempt) {
        return (
            <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>Maximum Attempts Reached</Typography>
                <Typography>
                    You have used all {attemptsInfo.maxAttempts} attempts for this quiz.
                    Please contact your instructor if you need additional attempts.
                </Typography>
                <Box mt={2}>
                    <Button variant="outlined" onClick={onCancel}>
                        Return to Courses
                    </Button>
                </Box>
            </Alert>
        );
    }

    if (result) {
        const attemptData = result.attempt || result;
        const score = attemptData.score;
        const passed = attemptData.passed;
        const correctAnswers = attemptData.correctAnswers;
        const totalQuestions = attemptData.totalQuestions;

        return (
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    {passed ? "Congratulations!" : "Quiz Completed"}
                </Typography>
                <Typography variant="h5" color={passed ? "success.main" : "error.main"} gutterBottom>
                    Score: {score}%
                </Typography>
                <Typography variant="body1" paragraph>
                    {passed
                        ? "You have passed the quiz. You can now download your certificate."
                        : "You did not meet the passing score. Please try again."}
                </Typography>

                <Box sx={{ mt: 3, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Result Details:</Typography>
                    <Typography>Correct Answers: {correctAnswers} / {totalQuestions}</Typography>
                </Box>

                <Box mt={3}>
                    <Button variant="contained" onClick={onFinish}>
                        Return to Courses
                    </Button>
                </Box>
            </Paper>
        );
    }

    const questions = quiz.questions || [];

    // Helper to extract options from the object structure
    const getOptions = (question) => {
        const options = [];
        if (question.option_a) options.push({ key: 'option_a', text: question.option_a });
        if (question.option_b) options.push({ key: 'option_b', text: question.option_b });
        if (question.option_c) options.push({ key: 'option_c', text: question.option_c });
        if (question.option_d) options.push({ key: 'option_d', text: question.option_d });
        return options;
    };

    return (
        <Box>
            {/* Header with Timer */}
            <Paper elevation={1} sx={{
                p: 2,
                mb: 3,
                position: 'sticky',
                top: 0,
                zIndex: 10,
                bgcolor: 'background.paper',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box>
                    <Typography variant="h6">{quiz.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {questions.length} Questions
                        {attemptsInfo && (
                            <> • Attempts: {attemptsInfo.attemptsCount}/{attemptsInfo.maxAttempts}
                                ({attemptsInfo.remainingAttempts} remaining)</>
                        )}
                    </Typography>
                </Box>

                {timeLeft !== null && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon color={timeLeft < 300 ? "error" : "action"} />
                        <Typography variant="h5" color={timeLeft < 300 ? "error.main" : "text.primary"} fontWeight="bold">
                            {formatTime(timeLeft)}
                        </Typography>
                    </Box>
                )}
            </Paper>

            <Box sx={{ mb: 4 }}>
                {questions.map((q, index) => (
                    <Card key={q.id} sx={{ mb: 3, borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', gap: 1 }}>
                                <Box component="span" sx={{ color: 'text.secondary' }}>{index + 1}.</Box>
                                {q.question_text}
                            </Typography>

                            <FormControl component="fieldset" sx={{ width: '100%', mt: 1 }}>
                                <RadioGroup
                                    name={`question-${q.id}`}
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                >
                                    {getOptions(q).map((opt) => (
                                        <FormControlLabel
                                            key={opt.key}
                                            value={opt.key}
                                            control={<Radio />}
                                            label={opt.text}
                                            sx={{
                                                mt: 1,
                                                mb: 1,
                                                p: 1,
                                                borderRadius: 1,
                                                '&:hover': { bgcolor: 'action.hover' },
                                                bgcolor: answers[q.id] === opt.key ? 'action.selected' : 'transparent',
                                                border: answers[q.id] === opt.key ? '1px solid' : '1px solid transparent',
                                                borderColor: 'primary.main'
                                            }}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Box mt={3} display="flex" gap={2} justifyContent="flex-end" pb={4}>
                <Button variant="outlined" onClick={onCancel} disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    size="large"
                >
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
            </Box>
        </Box>
    );
};

export default QuizView;
