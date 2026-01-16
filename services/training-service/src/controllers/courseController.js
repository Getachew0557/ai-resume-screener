const Course = require('../models/courseModel');
const Lesson = require('../models/lessonModel');
const Enrollment = require('../models/enrollmentModel');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

exports.getCourses = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', difficulty = '' } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = { is_active: true };

        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        if (difficulty) {
            whereClause.difficulty_level = difficulty;
        }

        const { count, rows } = await Course.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            courses: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const lessons = await Lesson.findAll({
            where: { course_id: course.id },
            order: [['order_index', 'ASC']]
        });

        res.status(200).json({ course, lessons });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const { title, description, duration_hours, difficulty_level, passing_score } = req.body;

        const course = await Course.create({
            title,
            description,
            duration_hours,
            difficulty_level,
            passing_score,
            created_by: req.user.id
        });

        res.status(201).json({ message: 'Course created successfully', course });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        await course.update(req.body);
        res.status(200).json({ message: 'Course updated successfully', course });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        await course.update({ is_active: false });
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const totalCourses = await Course.count({ where: { is_active: true } });
        const totalEnrollments = await Enrollment.count();

        const enrollmentStatus = await Enrollment.findAll({
            attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
            group: ['status']
        });

        const difficultyDistribution = await Course.findAll({
            where: { is_active: true },
            attributes: ['difficulty_level', [sequelize.fn('COUNT', sequelize.col('difficulty_level')), 'count']],
            group: ['difficulty_level']
        });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentEnrollments = await Enrollment.findAll({
            where: {
                created_at: { [Op.gte]: sevenDaysAgo }
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
        });

        res.status(200).json({
            totalCourses,
            totalEnrollments,
            enrollmentStatus,
            difficultyDistribution,
            recentEnrollments
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
