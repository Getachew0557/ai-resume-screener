import apiClient from '../utils/apiClient.js';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000/api/auth';
const EMPLOYEE_SERVICE_URL = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:3002/api/employees';

export const verifyToken = async (token) => {
    try {
        const response = await apiClient.post(`${AUTH_SERVICE_URL}/validate`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; // Expected { user: { id, role, ... }, valid: true }
    } catch (error) {
        console.error('Error verifying token:', error.response?.data || error.message);
        return null;
    }
};

export const getEmployee = async (employeeId, token) => {
    try {
        const response = await apiClient.get(`${EMPLOYEE_SERVICE_URL}/${employeeId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching employee:', error.response?.data || error.message);
        return null;
    }
};
