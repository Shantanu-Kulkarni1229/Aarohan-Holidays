import { Navigate, useLocation } from 'react-router-dom';
import { isAdminLoggedIn } from '../utils/adminAuth';

// The real check happens on the server for every request; this just keeps logged-out visitors
// (or an expired session) on the login page instead of an empty admin shell.
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
