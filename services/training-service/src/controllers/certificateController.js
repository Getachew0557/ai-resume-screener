const Certificate = require('../models/certificateModel');
const certificateGenerator = require('../utils/certificateGenerator');
const path = require('path');
const fs = require('fs');

exports.getMyCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.findAll({
            where: { user_id: req.user.id },
            order: [['issued_at', 'DESC']]
        });

        res.status(200).json({ certificates });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getCertificateById = async (req, res) => {
    try {
        const certificate = await Certificate.findByPk(req.params.id);

        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        if (certificate.user_id !== req.user.id && !['admin', 'hr'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.status(200).json({ certificate });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.downloadCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findByPk(req.params.id);

        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        if (certificate.user_id !== req.user.id && !['admin', 'hr'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const filePath = certificateGenerator.getCertificatePath(certificate.pdf_path);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Certificate file not found' });
        }

        res.download(filePath, `${certificate.certificate_id}.pdf`);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.verifyCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;

        const certificate = await Certificate.findOne({
            where: { certificate_id: certificateId }
        });

        if (!certificate) {
            return res.status(404).json({ valid: false, message: 'Certificate not found' });
        }

        res.status(200).json({
            valid: true,
            certificate: {
                certificate_id: certificate.certificate_id,
                user_name: certificate.user_name,
                course_title: certificate.course_title,
                score: certificate.score,
                issued_at: certificate.issued_at
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllCertificates = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Certificate.findAndCountAll({
            include: [{ model: Course, as: 'course' }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['issued_at', 'DESC']]
        });

        res.status(200).json({
            certificates: rows,
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

