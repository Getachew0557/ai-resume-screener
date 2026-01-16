export const ROLES = {
    ADMIN: 'admin',
    HR: 'hr',
    MANAGER: 'manager',
    EMPLOYEE: 'employee',
};

export const ROLE_ROUTES = {
    [ROLES.ADMIN]: '/admin',
    [ROLES.HR]: '/hr',
    [ROLES.MANAGER]: '/manager',
    [ROLES.EMPLOYEE]: '/employee',
};

export const NAVIGATION_CONFIG = {
    [ROLES.ADMIN]: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/admin/profile', label: 'My Profile', icon: 'profile' },
        { path: '/admin/users', label: 'User Management', icon: 'users' },
        { path: '/admin/departments', label: 'Departments', icon: 'departments' },
        { path: '/admin/structure_change', label: 'Structure Change', icon: 'structure_change' },

        { path: '/admin/job-categories', label: 'Job Categories', icon: 'job-categories' },
        { path: '/admin/training', label: 'Training Management', icon: 'courses' },
        { path: '/admin/settings', label: 'Settings', icon: 'settings' },
        { path: '/admin/reports', label: 'Reports', icon: 'reports' },
    ],
    [ROLES.HR]: [
        { path: '/hr/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/hr/profile', label: 'My Profile', icon: 'profile' },
        { path: '/hr/employees', label: 'Employees', icon: 'users' },
        { path: '/hr/training', label: 'Training Management', icon: 'courses' },
        { path: '/hr/recruitment', label: 'Recruitment', icon: 'recruitment' },
        { path: '/hr/leave', label: 'Leave Management', icon: 'leave' },
    ],
    [ROLES.MANAGER]: [
        { path: '/manager/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/manager/profile', label: 'My Profile', icon: 'profile' },
        { path: '/manager/team', label: 'My Team', icon: 'team' },
        { path: '/manager/approvals', label: 'Approvals', icon: 'approvals' },
        { path: '/manager/performance', label: 'Performance', icon: 'performance' },
    ],
    [ROLES.EMPLOYEE]: [
        { path: '/employee/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/employee/profile', label: 'My Profile', icon: 'profile' },
        { path: '/employee/leave', label: 'Leave Requests', icon: 'leave' },
        { path: '/employee/attendance', label: 'Attendance', icon: 'attendance' },
        { path: '/employee/courses', label: 'My Courses', icon: 'courses' },
    ],
};
