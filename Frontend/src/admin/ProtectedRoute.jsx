import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
  const loginTime = sessionStorage.getItem('adminLoginTime');
  
  // Check if session has expired (24 hours)
  if (loginTime) {
    const currentTime = Date.now();
    const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (currentTime - parseInt(loginTime) > sessionDuration) {
      sessionStorage.removeItem('adminAuthenticated');
      sessionStorage.removeItem('adminLoginTime');
      return <Navigate to="/admin/login" replace />;
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
