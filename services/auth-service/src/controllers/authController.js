const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthUser = require('../models/userModel');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

exports.register = async (req, res) => {
    try {
        const { email, password, role, first_name, last_name, phone } = req.body;
        const requestingUserRole = req.user.role;

        const allowedRoles = {
            admin: ['admin', 'hr', 'manager', 'employee'],
            hr: ['manager', 'employee'],
            manager: ['employee'],
            employee: []
        };

        if (!allowedRoles[requestingUserRole].includes(role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient privileges to create this role.' });
        }

        const existingUser = await AuthUser.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await AuthUser.create({
            email,
            password_hash,
            role,
            first_name,
            last_name,
            phone
        });

        res.status(201).json({
            message: 'User registered successfully',
            userId: newUser.id
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;


        const user = await AuthUser.findOne({ where: { email } });
        if (!user) {
            console.log(`Login failed: User not found for email ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            console.log(`Login failed: Password mismatch for user ${email}`);
            // console.log('Hash in DB:', user.password_hash); 
            // console.log('Provided:', password);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: 'Account is inactive' });
        }

        await user.update({ last_login: new Date() });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role = '' } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { first_name: { [Op.like]: `%${search}%` } },
                { last_name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        if (role) {
            whereClause.role = role;
        }

        const { count, rows } = await AuthUser.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password_hash'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            users: rows,
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
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await AuthUser.count();
        const activeUsers = await AuthUser.count({ where: { is_active: true } });

        const roleDistribution = await AuthUser.findAll({
            attributes: ['role', [sequelize.fn('COUNT', sequelize.col('role')), 'count']],
            group: ['role']
        });

        // New users in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentRegistrations = await AuthUser.findAll({
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
            totalUsers,
            activeUsers,
            roleDistribution,
            recentRegistrations
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
