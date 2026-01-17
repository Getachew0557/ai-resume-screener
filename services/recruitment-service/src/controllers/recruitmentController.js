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
const axios = require('axios');
const FormData = require('form-data');

// Application Controllers
exports.applyForJob = async (req, res) => {
    try {
        console.log("Received Application Request");
        console.log("Headers content-type:", req.headers['content-type']);
        console.log("Body keys:", Object.keys(req.body));
        if (req.file) {
            console.log("File received:", req.file.originalname, req.file.size, req.file.mimetype);
        } else {
            console.log("No file received");
        }

        const data = { ...req.body };
        // Sanitize empty strings
        Object.keys(data).forEach(key => {
            if (data[key] === '') data[key] = null;
        });

        // If file uploaded, get the buffer. In a real app we'd upload to S3 here.
        // For now, we'll store a placeholder URL or the actual file handling needs to be robust.
        // Since we are just forwarding to AI Agent, we don't necessarily need to store the file PERMANENTLY in recruitment-service if the AI agent stores it.
        // But let's assume Recruitment Service needs a record.

        if (req.file) {
            data.resume_url = `uploads/${req.file.originalname}`; // Placeholder for local/S3 path
        } else if (!data.resume_url) {
            return res.status(400).json({ message: 'Resume is required (File or Link)' });
        }

        const application = await Application.create(data);

        // Forward to AI Agent for screening
        // We do this asynchronously to not block the response, or we can await it.
        // Let's await it to give immediate feedback if AI service is down? No, fail soft.
        try {
            const aiAgentUrl = process.env.AI_AGENT_URL || 'http://localhost:5005';
            const formData = new FormData();

            // Get Job Description
            const job = await Job.findByPk(data.job_id);
            const jobDescription = job ? job.description : "Standard Job Requirements";

            formData.append('job_description', jobDescription);
            formData.append('name', data.full_name);
            formData.append('email', data.email);

            if (req.file) {
                // Attach file
                formData.append('resume', req.file.buffer, req.file.originalname);
            } else {
                // Attach Link
                formData.append('resume_url', data.resume_url);
            }

            console.log(`Forwarding application ${application.id} to AI Agent at ${aiAgentUrl}/submit`);

            // Send to AI Agent (Fire and Forget - don't await)
            axios.post(`${aiAgentUrl}/submit`, formData, {
                headers: {
                    ...formData.getHeaders()
                }
            }).then(() => {
                console.log(`[Recruitment] Successfully forwarded application ${application.id} to AI Agent`);
            }).catch(aiError => {
                console.error('[Recruitment] Failed to forward to AI Agent:', aiError.message);
            });

        } catch (setupError) {
            console.error('[Recruitment] Error setting up AI forwarding:', setupError.message);
        }

        res.status(201).json(application);
    } catch (error) {
        console.error('Application Error:', error);
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
