import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function AdminProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
