const Benefit = require('../models/benefitModel');
const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:3002';

// Create a new Benefit with Microservice User Validation
exports.createBenefit = async (req, res) => {
    try {
        const { benefitName, amount, employeeId } = req.body;

        // 1. Basic Validation
        if (!benefitName || !employeeId) {
            return res.status(400).json({ error: 'Benefit name and User ID are required' });
        }

        // 2. Verify User in Auth Microservice (Port 3000)
        try {
            const authHeader = req.headers.authorization; // Forward the JWT token
            const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/users`, {
                headers: { Authorization: authHeader }
            });

            const users = response.data;
            const userExists = users.find(u => Number(u.id) === Number(userId));

            if (!userExists) {
                return res.status(404).json({ error: 'User does not exist in Auth Service' });
            }
        } catch (apiErr) {
            return res.status(500).json({ error: 'Auth Service unreachable or Unauthorized' });
        }

        // 3. Create the Benefit
        const benefit = await Benefit.create({ benefitName, amount, userId });
        res.status(201).json(benefit);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all benefits
exports.getBenefits = async (req, res) => {
    try {
        const benefits = await Benefit.findAll();
        res.json(benefits);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Benefit
exports.updateBenefit = async (req, res) => {
    try {
        const { id } = req.params;
        const benefit = await Benefit.findByPk(id);
        if (!benefit) return res.status(404).json({ error: 'Benefit not found' });

        await benefit.update(req.body);
        res.json(benefit);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Benefit
exports.deleteBenefit = async (req, res) => {
    try {
        const benefit = await Benefit.findByPk(req.params.id);
        if (!benefit) return res.status(404).json({ error: 'Benefit not found' });

        await benefit.destroy();
        res.json({ message: 'Benefit deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};