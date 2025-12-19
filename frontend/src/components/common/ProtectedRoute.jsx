import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingOverlay from '../common/LoadingOverlay';
import ErrorPage from '../../pages/ErrorPage/ErrorPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (!isAuthenticated) {
    // Redirect to register page as per requirements, saving the location
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Return ErrorPage with 403 Forbidden
    return <ErrorPage code={403} />;
  }

  return children;
};

export default ProtectedRoute;
