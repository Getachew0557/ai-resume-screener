import axios from 'axios';

const API_BASE_URL = 'http://localhost';

const createServiceInstance = (serviceName) => {
    const ports = {
        auth: 3000,
        employee: 3002,
        recruitment: 3001,
        leave: 3003,
        attendance: 3004,
        organization: 3006,
        training: 3007,
        benefits: 3008,
    };

    const instance = axios.create({
        baseURL: `${API_BASE_URL}:${ports[serviceName]}/api`,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            // If data is FormData, let the browser set the Content-Type with boundary
            if (config.data instanceof FormData) {
                delete config.headers['Content-Type'];
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('role');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

const authService = createServiceInstance('auth');
const employeeService = createServiceInstance('employee');
const recruitmentService = createServiceInstance('recruitment');
const leaveService = createServiceInstance('leave');
const attendanceService = createServiceInstance('attendance');
const organizationService = createServiceInstance('organization');
const trainingService = createServiceInstance('training');
const benefitsService = createServiceInstance('benefits');

export const authAPI = {
    login: (credentials) => authService.post('auth/login', credentials),
    register: (userData) => authService.post('auth/register', userData),
    validateToken: () => authService.post('auth/validate'),
    getUsers: (params) => authService.get('auth/users', { params }),
    getStats: () => authService.get('auth/stats'),
    updateUser: (id, data) => authService.put(`auth/users/${id}`, data),
    deleteUser: (id) => authService.delete(`auth/users/${id}`),
};

export const profileAPI = {
    getProfile: (userId) => authService.get(userId ? `profile/${userId}` : 'profile/me'),
    createProfile: (profileData) => authService.post('profile', profileData),
    updateProfile: (profileData) => authService.put('profile', profileData),
    deleteProfile: () => authService.delete('profile'),
};

export const employeeAPI = {
    getEmployees: () => employeeService.get('employees'),
    getEmployee: (id) => employeeService.get(`employees/${id}`),
    createEmployee: (data) => employeeService.post('employees', data),
    updateEmployee: (id, data) => employeeService.put(`employees/${id}`, data),
    deleteEmployee: (id) => employeeService.delete(`employees/${id}`),

    // Positions
    getPositions: () => employeeService.get('positions'),
    createPosition: (data) => employeeService.post('positions', data),
    updatePosition: (id, data) => employeeService.put(`positions/${id}`, data),
    deletePosition: (id) => employeeService.delete(`positions/${id}`),
};

export const recruitmentAPI = {
    // Jobs
    getJobs: (params) => recruitmentService.get('recruitment/jobs', { params }),
    getJob: (id) => recruitmentService.get(`recruitment/jobs/${id}`),
    createJob: (data) => recruitmentService.post('recruitment/jobs', data),
    updateJob: (id, data) => recruitmentService.put(`recruitment/jobs/${id}`, data),
    deleteJob: (id) => recruitmentService.delete(`recruitment/jobs/${id}`),

    // Applications
    getApplications: (params) => recruitmentService.get('recruitment/applications', { params }),
    getApplication: (id) => recruitmentService.get(`recruitment/applications/${id}`),
    createApplication: (data, config) => recruitmentService.post('recruitment/applications', data, config),
    updateApplicationStage: (id, data) => recruitmentService.patch(`recruitment/applications/${id}/stage`, data),
    scheduleInterview: (data) => recruitmentService.post('recruitment/applications/schedule', data),
    getStats: () => recruitmentService.get('recruitment/stats'),
};

export const leaveAPI = {
    // http://localhost:3003/api/leave/postLeaveRequest
    postLeaveRequest: () => leaveService.post('leave/postLeaveRequest'),
    // http://localhost:3003/api/leave/my-requests
    getMyRequests: () => leaveService.get('leave/my-requests'),
    getLeaves: (params) => leaveService.get('leave/getAllPending', { params }),
    getLeaveBalances: () => leaveService.get('leave/getEmployeesBalance'),
    getMyLeaves: () => leaveService.get('leave/my'),
    getLeave: (id) => leaveService.get(`leave/${id}`),
    createLeave: (data) => leaveService.post('leave', data),
    approveLeave: (id) => leaveService.put(`leave/${id}/approve`),
    rejectLeave: (id) => leaveService.put(`leave/${id}/reject`),
};

export const attendanceAPI = {
    getAttendance: (params) => attendanceService.get('attendance', { params }),
    clockIn: (data) => attendanceService.post('attendance/clock-in', data),
    clockOut: (data) => attendanceService.post('attendance/clock-out', data),
};

export const organizationAPI = {

    getDepartments: () => organizationService.get('organization/departments'),
    createDepartment: (data) => organizationService.post('organization/departments', data),
    updateDepartment: (id, data) => organizationService.put(`organization/departments/${id}`, data),
    deleteDepartment: (id) => organizationService.delete(`organization/departments/${id}`),
};


export const jobCategoryAPI = {

    getJobCategories: () => organizationService.get('organization/job-categories'),
    getJobCategory: (id) => organizationService.get(`organization/job-categories/${id}`),
    createJobCategory: (data) => organizationService.post('organization/job-categories', data),
    updateJobCategory: (id, data) => organizationService.put(`organization/job-categories/${id}`, data),
    deleteJobCategory: (id) => organizationService.delete(`organization/job-categories/${id}`),
};

export const trainingAPI = {
    // Course actions
    getTrainings: (params) => trainingService.get('courses', { params }),
    getCourses: (params) => trainingService.get('courses', { params }),
    getCourse: (id) => trainingService.get(`courses/${id}`),
    createCourse: (data) => trainingService.post('courses', data),
    updateCourse: (id, data) => trainingService.put(`courses/${id}`, data),
    deleteCourse: (id) => trainingService.delete(`courses/${id}`),

    // Enrollment actions
    enrollCourse: (data) => trainingService.post('enrollments', data),
    getMyEnrollments: () => trainingService.get('enrollments/my'),
    getCourseProgress: (courseId) => trainingService.get(`enrollments/${courseId}/progress`),
    markLessonComplete: (lessonId) => trainingService.post(`enrollments/lessons/${lessonId}/complete`),

    // Quiz actions
    getAllQuizzes: () => trainingService.get('quizzes'),
    getQuiz: (courseId) => trainingService.get(`quizzes/course/${courseId}`),
    createQuiz: (data) => trainingService.post('quizzes', data),
    updateQuiz: (id, data) => trainingService.put(`quizzes/${id}`, data),
    deleteQuiz: (id) => trainingService.delete(`quizzes/${id}`),
    getQuizAttemptsCount: (quizId) => trainingService.get(`quizzes/${quizId}/attempts/count`),
    submitQuiz: (quizId, data) => trainingService.post(`quizzes/${quizId}/attempt`, data),
    getMyAttempts: () => trainingService.get('quizzes/attempts/my'),

    // Question actions
    addQuestion: (quizId, data) => trainingService.post(`quizzes/${quizId}/questions`, data),
    updateQuestion: (questionId, data) => trainingService.put(`quizzes/actions/update-question/${questionId}`, data),
    deleteQuestion: (questionId) => trainingService.delete(`quizzes/actions/delete-question/${questionId}`),

    // Certificate actions
    getAllCertificates: (params) => trainingService.get('certificates', { params }),
    getMyCertificates: () => trainingService.get('certificates/my'),
    downloadCertificate: (id) => trainingService.get(`certificates/${id}/download`, { responseType: 'blob' }),
    getStats: () => trainingService.get('courses/stats'),
};

export const benefitsAPI = {
    getBenefits: () => benefitsService.get('benefits'),
    getBenefit: (id) => benefitsService.get(`benefits/${id}`),
    enrollBenefit: (id, data) => benefitsService.post(`benefits/${id}/enroll`, data),
};

export default {
    auth: authService,
    employee: employeeService,
    recruitment: recruitmentService,
    leave: leaveService,
    attendance: attendanceService,
    organization: organizationService,
    training: trainingService,
    benefits: benefitsService,
};
