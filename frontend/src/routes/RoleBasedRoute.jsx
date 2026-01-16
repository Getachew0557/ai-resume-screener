import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentRole } from '../features/auth/authSlice';

const RoleBasedRoute = ({ children, allowedRoles }) => {
    const userRole = useSelector(selectCurrentRole);

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default RoleBasedRoute;
