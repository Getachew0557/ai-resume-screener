const Enrollment = require('../models/enrollmentModel');
const Course = require('../models/courseModel');
const Progress = require('../models/progressModel');
const Lesson = require('../models/lessonModel');

exports.enrollCourse = async (req, res) => {
    try {
        const { course_id } = req.body;
        const user_id = req.user.id;

        const course = await Course.findByPk(course_id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const existingEnrollment = await Enrollment.findOne({
            where: { user_id, course_id }
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        const enrollment = await Enrollment.create({
            user_id,
            course_id,
            status: 'in_progress'
        });

        res.status(201).json({ message: 'Enrolled successfully', enrollment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({
            where: { user_id: req.user.id },
            include: [{
                model: Course,
                as: 'course'
            }],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({ enrollments });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const user_id = req.user.id;

        const enrollment = await Enrollment.findOne({
            where: { user_id, course_id: courseId }
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Not enrolled in this course' });
        }

        const lessons = await Lesson.findAll({
            where: { course_id: courseId },
            order: [['order_index', 'ASC']]
        });

        const progress = await Progress.findAll({
            where: {
                user_id,
                lesson_id: lessons.map(l => l.id)
            }
        });

        const lessonsWithProgress = lessons.map(lesson => ({
            ...lesson.toJSON(),
            completed: progress.some(p => p.lesson_id === lesson.id && p.completed)
        }));

        res.status(200).json({
            enrollment,
            lessons: lessonsWithProgress,
            totalLessons: lessons.length,
            completedLessons: progress.filter(p => p.completed).length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.markLessonComplete = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const user_id = req.user.id;

        const lesson = await Lesson.findByPk(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const [progress, created] = await Progress.findOrCreate({
            where: { user_id, lesson_id: lessonId },
            defaults: { completed: true, completed_at: new Date() }
        });

        if (!created && !progress.completed) {
            await progress.update({ completed: true, completed_at: new Date() });
        }

        const totalLessons = await Lesson.count({ where: { course_id: lesson.course_id } });
        const completedLessons = await Progress.count({
            where: { user_id, completed: true },
            include: [{
                model: Lesson,
                as: 'lesson',
                where: { course_id: lesson.course_id }
            }]
        });

        const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

        await Enrollment.update(
            { progress_percentage: progressPercentage },
            { where: { user_id, course_id: lesson.course_id } }
        );

        res.status(200).json({ message: 'Lesson marked as complete', progress });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
