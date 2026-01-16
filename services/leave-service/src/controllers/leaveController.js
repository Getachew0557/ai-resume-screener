import LeaveRequest from '../models/leave_request.js';
import LeaveBalance from '../models/leave_balance.js';
import axios from 'axios';


// Helper to calculate days between dates (inclusive)
const calculateDays = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

//import LeaveRequest from '../models/leave_request.js';
//import { calculateDays } from '../utils/dateUtils.js'; // ← create this helper if not exists

/**
 * @route   POST /api/leave-requests
 * @desc    Employee creates a new leave request
 * @access  Private (authenticated employee only)
 */

//import LeaveRequest from '../models/leave_request.js';
//import { calculateDays } from '../utils/dateUtils.js'; // your days calculator helper

/**
 * @route   POST /api/leave-requests
 * @desc    Create a new leave request (validates token via auth service)
 * @access  Private
 */
export const postLeaveRequest = async (req, res) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Validate token by calling auth service
    const authApiUrl = `${process.env.AUTH_SERVICE_URL}/validate`;

    const authResponse = await axios.post(authApiUrl, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 3. Extract user information from auth service response
    // Adjust the field names according to what your auth service actually returns
    const user = authResponse.data?.user || authResponse.data;
    console.log(user);

    if (!user || !user.id) {
      return res.status(401).json({ message: 'Invalid or expired token - user not found' });
    }

    const employee_id = user.id;

    // Optional: You can also validate role if needed
    // if (user.role !== 'employee') {
    //   return res.status(403).json({ message: 'Only employees can request leave' });
    // }

    // 4. Get request body
    const { leave_type, start_date, end_date } = req.body;

    // 5. Validation
    if (!leave_type || !start_date || !end_date) {
      return res.status(400).json({
        message: 'Missing required fields: leave_type, start_date, end_date',
      });
    }

    const validTypes = ['annual', 'sick', 'unpaid', 'maternity', 'other'];
    const normalizedType = leave_type.toLowerCase();
    if (!validTypes.includes(normalizedType)) {
      return res.status(400).json({
        message: `Invalid leave type. Allowed: ${validTypes.join(', ')}`,
      });
    }

    // 6. Calculate days
    const days_requested = calculateDays(start_date, end_date);
    if (days_requested <= 0) {
      return res.status(400).json({
        message: 'End date must be after or equal to start date',
      });
    }

    // 7. Create leave request
    const newRequest = await LeaveRequest.create({
      employee_id,
      leave_type: normalizedType,
      start_date,
      end_date,
      days_requested,
      status: 'pending',
      approver_id: null,
    });

    // 8. Success response
    return res.status(201).json({
      message: 'Leave request created successfully',
      data: {
        id: newRequest.id,
        employee_id: newRequest.employee_id,
        leave_type: newRequest.leave_type,
        start_date: newRequest.start_date,
        end_date: newRequest.end_date,
        days_requested: newRequest.days_requested,
        status: newRequest.status,
        created_at: newRequest.created_at,
      },
    });

  } catch (error) {
    console.error('Error in postLeaveRequest:', error);

    // Handle axios errors from auth service
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Authentication service error';

      if (status === 401 || status === 403) {
        return res.status(status).json({ message: 'Invalid or expired token' });
      }
      return res.status(status).json({ message });
    }

    // Database or other errors
    return res.status(500).json({
      message: 'Failed to create leave request',
      error: error.message,
    });
  }
};
/**
 * @route   GET /api/leave-balances
 * @desc    Get all employees with their current leave balances
 * @access  Private (HR/Admin only)
 */
export const getEmployeesBalance = async (req, res) => {
  try {
    const authApiUrl = `${process.env.AUTH_SERVICE_URL}/users`; // adjust endpoint if needed

    const authResponse = await axios.get(authApiUrl, {
      params: { role: 'employee' }, // optional: filter only employees
      headers: {
        // If auth-service requires authorization
        Authorization: req.headers.authorization, // forward the token
        // or use a service-to-service token if needed
      },
    });

    const employees = authResponse.data; // assuming array of users
    if (!employees || employees.length === 0) {
      return res.status(200).json([]);
    }
    console.log(employees)

    //const currentYear = new Date().getFullYear();
    const employeeIds = employees.users.map(emp => emp.id);
    res.status(200).json(result);

    //const balances = await LeaveBalance.findAll({
    //  where: {
    //    employee_id: employeeIds,
    //    // year: currentYear,
    //  },
    //});
    //console.log(balances);

    // 4. Create lookup map for quick access
    //const balanceMap = new Map();
    //balances.forEach(balance => {
    //  if (!balanceMap.has(balance.employee_id)) {
    //    balanceMap.set(balance.employee_id, {});
    //  }
    //  balanceMap.get(balance.employee_id)[balance.leave_type] = balance.balance_days;
    //});

    //// 5. Combine employee data with their leave balances
    //const result = employees.map(employee => {
    //  const empBalances = balanceMap.get(employee.id) || {};

    //  return {
    //    employeeId: employee.id,
    //    firstName: employee.firstName || 'Unknown',
    //    lastName: employee.lastName || '',
    //    email: employee.email || 'N/A',
    //    // Add more fields if needed: department, position, etc.
    //    balances: {
    //      annual: empBalances['Annual'] || 0,
    //      sick: empBalances['Sick'] || 0,
    //      maternity: empBalances['Maternity'] || 0,
    //      paternity: empBalances['Paternity'] || 0,
    //      unpaid: empBalances['Unpaid'] || 0,
    //      // Add other leave types your system supports
    //    },
    //  };
    //});

    //res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching employees with balances:', error.message);

    if (error.response) {
      // Error from auth-service
      return res.status(error.response.status).json({
        message: 'Failed to fetch employee data from auth service',
        error: error.response.data,
      });
    }

    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const getAllPendingLeaveRequests = async (req, res) => {
  try {
    const pendingRequests = await LeaveRequest.findAll({
      where: {
        status: 'pending'
      },
      order: [['created_at', 'DESC']],
      attributes: [
        'id',
        'employee_id',
        'leave_type',
        'start_date',
        'end_date',
        'days_requested',
        'status',
        'created_at'
      ]
    });

    if (!pendingRequests || pendingRequests.length === 0) {
      return res.status(200).json([]);
    }

    // Map with dummy employee info (temporary solution)
    // const formattedRequests = pendingRequests.map(request => {
    //   const employee = dummyEmployeeData[request.employee_id] || {
    //     firstName: 'Unknown',
    //     lastName: 'Employee',
    //     email: 'unknown@company.et',
    //     address: 'N/A'
    //   };

    //   return {
    //     id: request.id,
    //     employeeId: request.employee_id,
    //     firstName: employee.firstName,
    //     lastName: employee.lastName,
    //     email: employee.email,
    //     address: employee.address,
    //     leaveType: request.leave_type,
    //     startDate: request.start_date.toISOString().split('T')[0],
    //     endDate: request.end_date.toISOString().split('T')[0],
    //     daysRequested: request.days_requested,
    //     status: request.status,
    //     createdAt: request.created_at
    //   };
    // });
    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error('Error in getAllPendingLeaveRequests:', error);
    res.status(500).json({
      message: 'Failed to fetch pending leave requests',
      error: error.message
    });
  }

};

export const createLeaveRequest = async (req, res) => {
  try {
    const { leave_type, start_date, end_date } = req.body;
    const employee_id = req.user.id; // From authMiddleware
    console.log(req.user);

    if (!leave_type || !start_date || !end_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const days_requested = calculateDays(start_date, end_date);

    // Check if balance exists and is sufficient
    const balance = await LeaveBalance.findOne({
      where: {
        employee_id,
        leave_type,
        year: new Date().getFullYear() // Assuming current year
      }
    });

    if (!balance) {
      return res.status(404).json({ message: `No leave balance found for type ${leave_type}` });
    }

    if (balance.balance_days < days_requested) {
      return res.status(400).json({ message: 'Insufficient leave balance' });
    }

    const newRequest = await LeaveRequest.create({
      employee_id,
      leave_type,
      start_date,
      end_date,
      days_requested,
      status: 'pending'
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const employee_id = req.user.id;
    const requests = await LeaveRequest.findAll({
      where: { employee_id },
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { leave_type, start_date, end_date } = req.body;
    const employee_id = req.user.id;

    const request = await LeaveRequest.findOne({ where: { id, employee_id } });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending' && request.status !== 'rejected') {
      return res.status(400).json({ message: 'Cannot update a request that is already processed (approved/cancelled)' });
    }

    // Recalculate days if dates change
    let days_requested = request.days_requested;
    if (start_date && end_date) {
      days_requested = calculateDays(start_date, end_date);
    }

    // Update fields
    if (leave_type) request.leave_type = leave_type;
    if (start_date) request.start_date = start_date;
    if (end_date) request.end_date = end_date;
    request.days_requested = days_requested;

    // If it was rejected, set back to pending for re-review
    if (request.status === 'rejected') {
      request.status = 'pending';
    }

    await request.save();
    res.json(request);

  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const cancelLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const employee_id = req.user.id;

    const request = await LeaveRequest.findOne({ where: { id, employee_id } });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status === 'approved') {
      // If approved, we should theoretically credit back the balance, but that logic depends on if the balance was deducted *on approval* or *on creation*. 
      // My plan says deduct on approval. So if we cancel an approved request, we must credit back.
      // BUT, admin features are next. Let's assume for now user can only cancel pending. 
      // If they cancel approved, it might need admin approval in a real large system, but for now lets allow it and refund.

      // However, keep it simple for now as requested: "canceling requested leave". 
      // Usually implies pending requests.
      // If I follow the plan: "Approve -> Deduct".
      // So validation logic in createRequest checked balance but didn't deduct? 
      // Actually, in `createRequest` I checked balance but didn't deduct. Deduct happens on approval.
      // So checking balance is 'tentative'.

      // Wait, if I cancel an approved request, I need to add back the balance.
      // For now, let's restrict cancellation to pending requests to be safe, or handle refund.
      // Let's implement refunding logic later in Admin or just restrict to pending for employee self-service.
      // Often employees can't just cancel approved leave without manager ack.
      // I will restrict to pending for now to avoid complexity unless user specifically requested "cancel approved".
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be cancelled. Contact HR for approved leaves.' });
    }

    request.status = 'cancelled';
    await request.save();

    res.json({ message: 'Request cancelled successfully' });

  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

