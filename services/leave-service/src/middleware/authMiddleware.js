import { verifyToken } from '../services/externalServices.js';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const verificationResult = await verifyToken(token);

        if (!verificationResult || !verificationResult.user) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        // Attach user info to request
        // verificationResult.user should contain { id, role, email, ... }
        req.user = verificationResult.user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Internal Server Error during authentication' });
    }
};

export default authMiddleware;
