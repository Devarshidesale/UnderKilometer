/**
 * src/components/ProtectedRoute.jsx
 * ───────────────────────────────────
 * Guards routes that require authentication or a specific role.
 *
 * Usage
 * ─────
 *   // Requires login:
 *   <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
 *
 *   // Requires admin:
 *   <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // While checking session (refresh token check on mount) — show nothing
  if (isLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, preserve the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
