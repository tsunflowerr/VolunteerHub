import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * BƯỚC 13: Protected Route
 * Chỉ cho phép user đã login truy cập
 */

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default ProtectedRoute
