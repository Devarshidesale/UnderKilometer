/**
 * src/pages/AdminDashboard.jsx
 * ─────────────────────────────
 * Admin-only: view all users, toggle account active/inactive.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [toggling, setToggling] = useState(null); // uid being toggled

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/auth/admin/users');
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function toggleUser(uid) {
    setToggling(uid);
    try {
      const res = await api.post(`/auth/admin/users/${uid}/toggle-active`);
      setUsers((prev) =>
        prev.map((u) => (u.id === uid ? res.data.user : u))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to toggle user');
    } finally {
      setToggling(null);
    }
  }

  const stats = {
    total:   users.length,
    active:  users.filter((u) => u.is_active).length,
    admins:  users.filter((u) => u.role === 'admin').length,
  };

  return (
    <div className="admin-page">
      <div className="auth-orb auth-orb-1" style={{ top: '-10rem', right: '-8rem' }} />
      <div className="auth-orb auth-orb-2" style={{ bottom: '-10rem', left: '-8rem' }} />

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">UnderKilometer</div>
        <nav className="admin-nav">
          <button className="admin-nav-item admin-nav-active">👥 Users</button>
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-admin-info">
            <span className="admin-admin-name">@{user?.username}</span>
            <span className="badge-admin" style={{ fontSize: '11px', padding: '2px 8px' }}>Admin</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="profile-back-btn" onClick={() => navigate('/')}>Home</button>
            <button className="profile-logout-btn" onClick={async () => { await logout(); navigate('/'); }}>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <div className="admin-header">
          <h1 className="admin-title">User Management</h1>
          <button className="auth-btn" style={{ width: 'auto', padding: '8px 20px' }} onClick={fetchUsers}>
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-num">{stats.total}</span>
            <span className="admin-stat-label">Total Users</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-num" style={{ color: '#2ecc71' }}>{stats.active}</span>
            <span className="admin-stat-label">Active</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-num" style={{ color: '#f39c12' }}>{stats.admins}</span>
            <span className="admin-stat-label">Admins</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="auth-error" style={{ maxWidth: '100%', marginBottom: '1.5rem' }}>
            ⚠ {error}
          </div>
        )}

        {/* User table */}
        {loading ? (
          <div className="admin-loading">
            <div className="auth-spinner" />
            <span>Loading users…</span>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={!u.is_active ? 'admin-row-inactive' : ''}>
                    <td className="admin-td-muted">#{u.id}</td>
                    <td className="admin-td-name">@{u.username}</td>
                    <td className="admin-td-muted">{u.email}</td>
                    <td>
                      <span className={u.role === 'admin' ? 'badge-admin' : 'badge-user'}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status ${u.is_active ? 'admin-status-active' : 'admin-status-inactive'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="admin-td-muted">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="admin-td-muted">
                      {u.last_login ? new Date(u.last_login).toLocaleString('en-IN') : 'Never'}
                    </td>
                    <td>
                      {u.role !== 'admin' ? (
                        <button
                          className={`admin-toggle-btn ${u.is_active ? 'admin-toggle-deactivate' : 'admin-toggle-activate'}`}
                          onClick={() => toggleUser(u.id)}
                          disabled={toggling === u.id}
                        >
                          {toggling === u.id
                            ? '…'
                            : u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      ) : (
                        <span className="admin-td-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="admin-empty">No users found.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
