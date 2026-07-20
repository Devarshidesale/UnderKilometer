/**
 * src/pages/ProfilePage.jsx
 * ──────────────────────────
 * Authenticated user profile — shows info, allows password change.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]     = useState({ current_password: '', new_password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg]       = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setMsg('');
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (form.new_password !== form.confirm) {
      setErrors({ confirm: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      await api.post('/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setMsg('Password changed. You will be logged out.');
      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const fieldMap = {};
        for (const [k, v] of Object.entries(data.errors)) {
          fieldMap[k] = Array.isArray(v) ? v[0] : v;
        }
        setErrors(fieldMap);
      } else {
        setErrors({ current_password: data?.error || 'Error changing password' });
      }
    } finally {
      setLoading(false);
    }
  }

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="auth-card profile-card">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="profile-name">@{user?.username}</h1>
            <span className={`profile-role-badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
              {user?.role === 'admin' ? '⚙ Admin' : '👤 User'}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="profile-info-grid">
          <div className="profile-info-item">
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{user?.email}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Member since</span>
            <span className="profile-info-value">{joinedDate}</span>
          </div>
        </div>

        {/* Change password */}
        <div className="profile-section">
          <h2 className="profile-section-title">Change Password</h2>

          {msg && <div className="auth-success-msg">✓ {msg}</div>}

          <form onSubmit={handlePasswordChange} className="auth-form" noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="prof-current">Current Password</label>
              <input
                id="prof-current"
                className={`auth-input ${errors.current_password ? 'auth-input-error' : ''}`}
                type="password"
                name="current_password"
                value={form.current_password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              {errors.current_password && (
                <span className="auth-field-error">{errors.current_password}</span>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="prof-new">New Password</label>
              <input
                id="prof-new"
                className={`auth-input ${errors.new_password ? 'auth-input-error' : ''}`}
                type="password"
                name="new_password"
                value={form.new_password}
                onChange={handleChange}
                placeholder="Min 8 chars, 1 upper, 1 number, 1 symbol"
              />
              {errors.new_password && (
                <span className="auth-field-error">{errors.new_password}</span>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="prof-confirm">Confirm New Password</label>
              <input
                id="prof-confirm"
                className={`auth-input ${errors.confirm ? 'auth-input-error' : ''}`}
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Repeat new password"
              />
              {errors.confirm && (
                <span className="auth-field-error">{errors.confirm}</span>
              )}
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? <span className="auth-btn-spinner" /> : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          <button className="profile-back-btn" onClick={() => navigate('/')}>← Back to Home</button>
          <button className="profile-logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}
