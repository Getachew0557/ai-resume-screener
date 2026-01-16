const { Job, Application } = require('../models');
const sequelize = require('../models').sequelize;
const { Op } = require('sequelize');
const calendarService = require('../services/calendarService');

// Job Controllers
exports.createJob = async (req, res) => {
    try {
        const data = { ...req.body };
        // Sanitize empty strings to null for optional fields
        Object.keys(data).forEach(key => {
            if (data[key] === '') data[key] = null;
        });
        const job = await Job.create(data);
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll({
            include: [{ model: Application, as: 'applications' }]
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id, {
            include: [{ model: Application, as: 'applications' }]
        });
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const data = { ...req.body };
        Object.keys(data).forEach(key => {
            if (data[key] === '') data[key] = null;
        });

        await job.update(data);
        res.json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        await job.destroy();
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Application Controllers
exports.applyForJob = async (req, res) => {
    try {
        const data = { ...req.body };
        Object.keys(data).forEach(key => {
            if (data[key] === '') data[key] = null;
        });
        const application = await Application.create(data);
        res.status(201).json(application);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getApplications = async (req, res) => {
    try {
        const applications = await Application.findAll({
            include: [{ model: Job, as: 'job' }]
        });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getApplicationById = async (req, res) => {
    try {
        const application = await Application.findByPk(req.params.id, {
            include: [{ model: Job, as: 'job' }]
        });
        if (!application) return res.status(404).json({ message: 'Application not found' });
        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateApplicationStage = async (req, res) => {
    try {
        const application = await Application.findByPk(req.params.id);
        if (!application) return res.status(404).json({ message: 'Application not found' });

        const { stage, hired_employee_id } = req.body;
        await application.update({ stage, hired_employee_id });

        res.json(application);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Placeholder for legacy register/login if they were intended for something else
// but based on the schema, recruitment doesn't have its own users, it uses auth_users.
exports.register = (req, res) => res.status(501).json({ message: 'Use Auth Service for registration' });
exports.login = (req, res) => res.status(501).json({ message: 'Use Auth Service for login' });
exports.getStats = async (req, res) => {
    try {
        const totalJobs = await Job.count({ where: { status: 'open' } });
        const totalApplications = await Application.count();

        const stageDistribution = await Application.findAll({
            attributes: ['stage', [sequelize.fn('COUNT', sequelize.col('stage')), 'count']],
            group: ['stage']
        });

        // Recent applications trend
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentApplications = await Application.findAll({
            where: {
                applied_date: { [Op.gte]: sevenDaysAgo }
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('applied_date')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: [sequelize.fn('DATE', sequelize.col('applied_date'))],
            order: [[sequelize.fn('DATE', sequelize.col('applied_date')), 'ASC']]
        });

        res.status(200).json({
            totalJobs,
            totalApplications,
            stageDistribution,
            recentApplications
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.scheduleInterview = async (req, res) => {
    try {
        const { applicationId, interviewTime, interviewerEmail } = req.body;

        const application = await Application.findByPk(applicationId, {
            include: [{ model: Job, as: 'job' }]
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const scheduledEvent = await calendarService.scheduleInterview({
            candidateEmail: application.email,
            candidateName: application.name,
            interviewerEmail: interviewerEmail || 'hr@company.com',
            startTime: new Date(interviewTime),
            location: 'Microsoft Teams / Zoom'
        });

        // Update application stage to 'interview'
        await application.update({ stage: 'interview' });

        res.status(200).json({
            message: 'Interview scheduled successfully',
            scheduledEvent
        });
    } catch (error) {
        res.status(500).json({ message: 'Scheduling failed', error: error.message });
    }
};
