import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentRole, selectIsAuthenticated } from '../features/auth/authSlice';
import { ROLE_ROUTES, ROLES } from '../utils/roleConfig';

import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';
import MainLayout from '../components/layout/MainLayout';

import Login from '../pages/common/Login';
import LandingPage from '../pages/common/LandingPage';
import JobBoard from '../pages/common/JobBoard';
import NotFound from '../pages/common/NotFound';
import Unauthorized from '../pages/common/Unauthorized';

import AdminDashboard from '../pages/admin/Dashboard';
import UserManagement from '../pages/admin/UserManagement';
import TrainingManagement from '../pages/admin/TrainingManagement';
import Settings from '../pages/admin/Settings';
import Reports from '../pages/admin/Reports';

import HRDashboard from '../pages/hr/Dashboard';
import Employees from '../pages/hr/Employees';
import Recruitment from '../pages/hr/Recruitment';
import LeaveManagement from '../pages/hr/LeaveManagement';

import ManagerDashboard from '../pages/manager/Dashboard';
import Team from '../pages/manager/Team';
import Approvals from '../pages/manager/Approvals';
import Performance from '../pages/manager/Performance';

import EmployeeDashboard from '../pages/employee/Dashboard';
import Profile from '../pages/common/Profile';
import LeaveRequest from '../pages/employee/LeaveRequest';
import Attendance from '../pages/employee/Attendance';
import EmployeeCourses from '../pages/employee/EmployeeCourses';
import DepartmentManagement from '../pages/organization/DepartmentManagement';
import JobCategoryManagement from '../pages/organization/JobCategoryManagement';
import ChangeStructureManagement from '../pages/organization/ChangeStructureManagement';



const AppRoutes = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const role = useSelector(selectCurrentRole);

    const getDefaultRoute = () => {
        if (!isAuthenticated) return '/login';
        return `${ROLE_ROUTES[role]}/dashboard`;
    };


    return (
        <Routes>



            <Route path="/login" element={<Login />} />
            <Route path="/jobs" element={<JobBoard />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/" element={<LandingPage />} />

            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/admin" element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]}><Navigate to="/admin/dashboard" /></RoleBasedRoute>} />
                <Route path="/admin/dashboard" element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboard /></RoleBasedRoute>} />
                <Route path="/admin/profile" element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]}><Profile /></RoleBasedRoute>} />
                <Route path="/admin/users" element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]}><UserManagement /></RoleBasedRoute>} />
                <Route path="/admin/training" element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]}><TrainingManagement /></RoleBasedRoute>} />
                <Route path="/admin/settings" element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]}><Settings /></RoleBasedRoute>} />
                <Route path="/admin/reports" element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]}><Reports /></RoleBasedRoute>} />

                <Route path="/hr" element={<RoleBasedRoute allowedRoles={[ROLES.HR]}><Navigate to="/hr/dashboard" /></RoleBasedRoute>} />
                <Route path="/hr/dashboard" element={<RoleBasedRoute allowedRoles={[ROLES.HR]}><HRDashboard /></RoleBasedRoute>} />
                <Route path="/hr/profile" element={<RoleBasedRoute allowedRoles={[ROLES.HR]}><Profile /></RoleBasedRoute>} />
                <Route path="/hr/employees" element={<RoleBasedRoute allowedRoles={[ROLES.HR]}><Employees /></RoleBasedRoute>} />
                <Route path="/hr/training" element={<RoleBasedRoute allowedRoles={[ROLES.HR]}><TrainingManagement /></RoleBasedRoute>} />
                <Route path="/hr/recruitment" element={<RoleBasedRoute allowedRoles={[ROLES.HR]}><Recruitment /></RoleBasedRoute>} />
                <Route path="/hr/leave" element={<RoleBasedRoute allowedRoles={[ROLES.HR]}><LeaveManagement /></RoleBasedRoute>} />

                <Route path="/manager" element={<RoleBasedRoute allowedRoles={[ROLES.MANAGER]}><Navigate to="/manager/dashboard" /></RoleBasedRoute>} />
                <Route path="/manager/dashboard" element={<RoleBasedRoute allowedRoles={[ROLES.MANAGER]}><ManagerDashboard /></RoleBasedRoute>} />
                <Route path="/manager/profile" element={<RoleBasedRoute allowedRoles={[ROLES.MANAGER]}><Profile /></RoleBasedRoute>} />
                <Route path="/manager/team" element={<RoleBasedRoute allowedRoles={[ROLES.MANAGER]}><Team /></RoleBasedRoute>} />
                <Route path="/manager/approvals" element={<RoleBasedRoute allowedRoles={[ROLES.MANAGER]}><Approvals /></RoleBasedRoute>} />
                <Route path="/manager/performance" element={<RoleBasedRoute allowedRoles={[ROLES.MANAGER]}><Performance /></RoleBasedRoute>} />

                <Route path="/employee" element={<RoleBasedRoute allowedRoles={[ROLES.EMPLOYEE]}><Navigate to="/employee/dashboard" /></RoleBasedRoute>} />
                <Route path="/employee/dashboard" element={<RoleBasedRoute allowedRoles={[ROLES.EMPLOYEE]}><EmployeeDashboard /></RoleBasedRoute>} />
                <Route path="/employee/profile" element={<RoleBasedRoute allowedRoles={[ROLES.EMPLOYEE]}><Profile /></RoleBasedRoute>} />
                <Route path="/employee/leave" element={<RoleBasedRoute allowedRoles={[ROLES.EMPLOYEE]}><LeaveRequest /></RoleBasedRoute>} />
                <Route path="/employee/attendance" element={<Attendance />} />
                <Route path="/employee/courses" element={<RoleBasedRoute allowedRoles={[ROLES.EMPLOYEE]}><EmployeeCourses /></RoleBasedRoute>} />



                {/* NEW ORGANIZATION ROUTES */}
                <Route path="/admin/structure_change" element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]}><ChangeStructureManagement /></RoleBasedRoute>} />

                <Route path="/admin/departments" element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]}><DepartmentManagement /></RoleBasedRoute>} />
                <Route path="/admin/job-categories" element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]}><JobCategoryManagement /></RoleBasedRoute>} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
