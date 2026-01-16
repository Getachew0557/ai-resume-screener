import LeaveRequest from '../models/leave_request.js';
import LeaveBalance from '../models/leave_balance.js';
import sequelize from '../config/db.js';

export const getAllRequests = async (req, res) => {
    try {
        // Ideally add filters (status, employee_id)
        const { status, employee_id } = req.query;
        const whereClause = {};
        if (status) whereClause.status = status;
        if (employee_id) whereClause.employee_id = employee_id;

        const requests = await LeaveRequest.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']]
        });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching all requests:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const processRequest = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { action } = req.body; // 'approve' or 'deny'
        const adminId = req.user.id;

        if (!['approve', 'deny'].includes(action)) {
            await t.rollback();
            return res.status(400).json({ message: "Action must be 'approve' or 'deny'" });
        }

        const request = await LeaveRequest.findOne({
            where: { id },
            lock: true,
            transaction: t
        });

        if (!request) {
            await t.rollback();
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            await t.rollback();
            return res.status(400).json({ message: `Request is already ${request.status}` });
        }

        if (action === 'deny') {
            request.status = 'rejected';
            request.approver_id = adminId;
            await request.save({ transaction: t });
            await t.commit();
            return res.json({ message: 'Request denied', request });
        }

        // Action is 'approve'
        // Double check balance (it might have changed since creation)
        const balance = await LeaveBalance.findOne({
            where: {
                employee_id: request.employee_id,
                leave_type: request.leave_type,
                year: new Date().getFullYear()
            },
            lock: true,
            transaction: t
        });

        if (!balance) {
            await t.rollback();
            return res.status(404).json({ message: 'Leave balance record not found' });
        }

        if (balance.balance_days < request.days_requested) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient leave balance to approve this request' });
        }

        // Deduct balance
        balance.balance_days = parseFloat(balance.balance_days) - parseFloat(request.days_requested);
        await balance.save({ transaction: t });

        request.status = 'approved';
        request.approver_id = adminId;
        await request.save({ transaction: t });

        await t.commit();
        res.json({ message: 'Request approved and balance deducted', request });

    } catch (error) {
        await t.rollback();
        console.error('Error processing request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
