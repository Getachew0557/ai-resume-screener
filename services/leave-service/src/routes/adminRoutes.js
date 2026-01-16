import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getAllRequests, processRequest } from '../controllers/adminController.js';

const router = express.Router();

// protect all routes
router.use(authMiddleware);

// Middleware to check if user is admin (Assuming req.user.role exists from authMiddleware)
const adminCheck = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
};

router.use(adminCheck);

router.get('/requests', getAllRequests);
router.put('/requests/:id/process', processRequest);

export default router;
