const Quiz = require('../models/quizModel');
const Question = require('../models/questionModel');
const QuizAttempt = require('../models/quizAttemptModel');
const Course = require('../models/courseModel');
const Certificate = require('../models/certificateModel');
const certificateGenerator = require('../utils/certificateGenerator');

exports.getQuiz = async (req, res) => {
    try {
        const { courseId } = req.params;

        const quiz = await Quiz.findOne({
            where: { course_id: courseId },
            include: [{
                model: Question,
                as: 'questions',
                attributes: ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'points']
            }]
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found for this course' });
        }

        res.status(200).json({ quiz });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.submitQuizAttempt = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body;
        const user_id = req.user.id;

        console.log(`[QuizSubmission] Received attempt for quiz ${quizId} from user ${user_id}`);
        console.log(`[QuizSubmission] Answers:`, JSON.stringify(answers));

        if (!answers) {
            console.error(`[QuizSubmission] Error: No answers provided in request body`);
            return res.status(400).json({ message: 'No answers provided' });
        }

        const quiz = await Quiz.findByPk(quizId, {
            include: [
                { model: Question, as: 'questions' },
                { model: Course, as: 'course' }
            ]
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const previousAttempts = await QuizAttempt.count({
            where: { user_id, quiz_id: quizId }
        });

        if (previousAttempts >= quiz.max_attempts) {
            return res.status(400).json({ message: 'Maximum attempts reached' });
        }

        let correctAnswers = 0;
        const totalQuestions = quiz.questions.length;

        // Helper to convert option_a format to A format
        const normalizeAnswer = (answer) => {
            if (!answer || typeof answer !== 'string') return null;
            // If answer is already in A/B/C/D format, return as is
            if (['A', 'B', 'C', 'D'].includes(answer.toUpperCase())) {
                return answer.toUpperCase();
            }
            // Convert option_a format to A format
            const match = answer.match(/option_([a-d])/i);
            if (match) {
                return match[1].toUpperCase();
            }
            return null;
        };

        if (quiz.questions && Array.isArray(quiz.questions)) {
            quiz.questions.forEach(question => {
                const userAnswer = normalizeAnswer(answers[question.id]);
                const correctAnswer = question.correct_answer;

                if (userAnswer === correctAnswer) {
                    correctAnswers++;
                }
            });
        }

        const score = Math.round((correctAnswers / totalQuestions) * 100);
        const passed = score >= quiz.course.passing_score;

        const attempt = await QuizAttempt.create({
            user_id,
            quiz_id: quizId,
            score,
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            answers,
            passed
        });

        if (passed) {
            const existingCertificate = await Certificate.findOne({
                where: { user_id, course_id: quiz.course_id }
            });

            if (!existingCertificate) {
                const pdfData = await certificateGenerator.generateCertificate({
                    userName: `${req.user.first_name || 'User'} ${req.user.last_name || ''}`.trim(),
                    courseTitle: quiz.course.title,
                    score,
                    issueDate: new Date()
                });

                await Certificate.create({
                    certificate_id: pdfData.certificateId,
                    user_id,
                    course_id: quiz.course_id,
                    quiz_attempt_id: attempt.id,
                    user_name: `${req.user.first_name || 'User'} ${req.user.last_name || ''}`.trim(),
                    course_title: quiz.course.title,
                    score,
                    pdf_path: pdfData.filePath
                });
            }

            // Update enrollment to completed and passed
            const Enrollment = require('../models/enrollmentModel');
            await Enrollment.update(
                {
                    status: 'completed',
                    completed_at: new Date(),
                    progress_percentage: 100,
                    passed: true
                },
                { where: { user_id, course_id: quiz.course_id } }
            );
        }

        res.status(201).json({
            message: passed ? 'Quiz passed! Certificate generated.' : 'Quiz completed.',
            attempt: {
                score,
                passed,
                correctAnswers,
                totalQuestions
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMyAttempts = async (req, res) => {
    try {
        const attempts = await QuizAttempt.findAll({
            where: { user_id: req.user.id },
            include: [{
                model: Quiz,
                as: 'quiz',
                include: [{ model: Course, as: 'course' }]
            }],
            order: [['attempted_at', 'DESC']]
        });

        res.status(200).json({ attempts });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getQuizAttemptsCount = async (req, res) => {
    try {
        const { quizId } = req.params;
        const user_id = req.user.id;

        const quiz = await Quiz.findByPk(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const attemptsCount = await QuizAttempt.count({
            where: { user_id, quiz_id: quizId }
        });

        const remainingAttempts = quiz.max_attempts - attemptsCount;

        res.status(200).json({
            attemptsCount,
            maxAttempts: quiz.max_attempts,
            remainingAttempts: Math.max(0, remainingAttempts),
            canAttempt: remainingAttempts > 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.findAll({
            include: [
                { model: Course, as: 'course' },
                { model: Question, as: 'questions' }
            ]
        });

        res.status(200).json({ quizzes });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createQuiz = async (req, res) => {
    try {
        const { course_id, title, description, time_limit_minutes, max_attempts } = req.body;

        const quiz = await Quiz.create({
            course_id,
            title,
            description,
            time_limit_minutes,
            max_attempts
        });

        res.status(201).json({ message: 'Quiz created successfully', quiz });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addQuestion = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { question_text, option_a, option_b, option_c, option_d, correct_answer, points } = req.body;

        const question = await Question.create({
            quiz_id: quizId,
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            points
        });

        res.status(201).json({ message: 'Question added successfully', question });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, time_limit_minutes, max_attempts } = req.body;

        const quiz = await Quiz.findByPk(id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        await quiz.update({ title, description, time_limit_minutes, max_attempts });
        res.status(200).json({ message: 'Quiz updated successfully', quiz });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findByPk(id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        await quiz.destroy();
        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { question_text, option_a, option_b, option_c, option_d, correct_answer, points } = req.body;

        const question = await Question.findByPk(questionId);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        await question.update({
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            points
        });

        res.status(200).json({ message: 'Question updated successfully', question });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const question = await Question.findByPk(questionId);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        await question.destroy();
        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



