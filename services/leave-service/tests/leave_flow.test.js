
import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock dependencies BEFORE importing routes/controllers
// Mock sequelize
const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
};

const mockSequelize = {
    transaction: jest.fn(() => mockTransaction),
    define: jest.fn(() => ({})), // for model definitions if they run
};

jest.unstable_mockModule('../src/config/db.js', () => ({
    default: mockSequelize,
}));

// Mock Models
const mockLeaveRequest = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
};

const mockLeaveBalance = {
    findOne: jest.fn(),
    save: jest.fn(),
};

jest.unstable_mockModule('../src/models/leave_request.js', () => ({
    default: mockLeaveRequest
}));

jest.unstable_mockModule('../src/models/leave_balance.js', () => ({
    default: mockLeaveBalance
}));

// Mock Auth Middleware
const mockUser = { id: 123, role: 'employee' };
jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
    default: (req, res, next) => {
        req.user = mockUser;
        next();
    }
}));

// Import Routes (dynamic import needed after mocking)
const { default: leaveRoutes } = await import('../src/routes/leaveRoutes.js');
const { default: adminRoutes } = await import('../src/routes/adminRoutes.js');

const app = express();
app.use(express.json());
app.use('/api/leave', leaveRoutes);
app.use('/api/admin', adminRoutes);

describe('Leave Request Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUser.role = 'employee';
        mockUser.id = 123;
    });

    test('POST /api/leave/ - Create Request (Success)', async () => {
        const payload = {
            leave_type: 'annual',
            start_date: '2026-06-01',
            end_date: '2026-06-05' // 5 days
        };

        // Mock Balance found and sufficient
        mockLeaveBalance.findOne.mockResolvedValue({
            balance_days: 10,
            save: jest.fn()
        });

        mockLeaveRequest.create.mockResolvedValue({
            id: 1,
            ...payload,
            days_requested: 5,
            status: 'pending'
        });

        const res = await request(app).post('/api/leave').send(payload);

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('pending');
        expect(mockLeaveBalance.findOne).toHaveBeenCalled();
        expect(mockLeaveRequest.create).toHaveBeenCalled();
    });

    test('POST /api/leave/ - Create Request (Insufficient Balance)', async () => {
        const payload = {
            leave_type: 'annual',
            start_date: '2026-06-01',
            end_date: '2026-06-20' // 20 days
        };

        // Mock Balance found but insufficient
        mockLeaveBalance.findOne.mockResolvedValue({
            balance_days: 10
        });

        const res = await request(app).post('/api/leave').send(payload);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Insufficient leave balance');
    });

    test('PUT /api/admin/requests/1/process - Approve Request (Success)', async () => {
        mockUser.role = 'admin';
        mockUser.id = 999;

        // Mock Request found
        const mockReqInstance = {
            id: 1,
            employee_id: 123,
            leave_type: 'annual',
            days_requested: 5,
            status: 'pending',
            save: jest.fn()
        };
        mockLeaveRequest.findOne.mockResolvedValue(mockReqInstance);

        // Mock Balance found
        const mockBalInstance = {
            balance_days: 10,
            save: jest.fn()
        };
        mockLeaveBalance.findOne.mockResolvedValue(mockBalInstance);

        const res = await request(app).put('/api/admin/requests/1/process').send({ action: 'approve' });

        expect(res.status).toBe(200);
        expect(mockReqInstance.status).toBe('approved');
        expect(mockReqInstance.approver_id).toBe(999);
        expect(mockBalInstance.balance_days).toBe(5); // 10 - 5
        expect(mockTransaction.commit).toHaveBeenCalled();
    });
});
