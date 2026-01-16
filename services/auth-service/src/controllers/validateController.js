const jwt = require('jsonwebtoken');
const AuthUser = require('../models/userModel');

exports.validateToken = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ valid: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await AuthUser.findByPk(decoded.id, {
            attributes: ['id', 'email', 'role', 'first_name', 'last_name']
        });

        if (!user) {
            return res.status(401).json({ valid: false, message: 'User not found' });
        }

        res.status(200).json({
            valid: true,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(401).json({ valid: false, message: 'Invalid token' });
    }
};
