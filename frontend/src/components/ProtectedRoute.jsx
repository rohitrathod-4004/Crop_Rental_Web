import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Protects routes based on authentication and role
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @returns {React.ReactNode}
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
    // Get token and user from localStorage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    // Check if user is authenticated
    if (!token || !userStr) {
        // Not authenticated, redirect to login
        return <Navigate to="/login" replace />;
    }

    // Parse user data
    let user;
    try {
        user = JSON.parse(userStr);
    } catch (error) {
        // Invalid user data, clear and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }

    // Check if user role is allowed
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // User role not allowed, redirect to unauthorized page
        return <Navigate to="/unauthorized" replace />;
    }

    // User is authenticated and authorized
    return children;
}

export default ProtectedRoute;
