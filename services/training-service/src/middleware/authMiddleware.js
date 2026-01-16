const axios = require('axios');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No authentication token provided' });
        }

        const response = await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth/validate`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data && response.data.valid) {
            req.user = response.data.user;
            next();
        } else {
            res.status(401).json({ message: 'Invalid authentication token' });
        }
    } catch (error) {
        console.error('Auth service validation error:', error.response?.data || error.message);
        res.status(401).json({ message: 'Authentication failed' });
    }
};

const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
        }

        next();
    };
};

module.exports = { auth, checkRole };
