/**
 * src/pages/SignupPage.jsx
 * ─────────────────────────
 * Premium dark-themed signup page.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* Password strength logic */
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8)                       score++;
  if (/[A-Z]/.test(pw))                     score++;
  if (/[0-9]/.test(pw))                     score++;
  if (/[!@#$%^&*()\-_=+[\]{};:'",.<>/?]/.test(pw)) score++;
  return score; // 0–4
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71'];

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm]     = useState({ email: '', username: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [success, setSuccess]   = useState(false);

  const strength     = getStrength(form.password);
  const strengthPct  = (strength / 4) * 100;

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setApiError('');
  }

  function validate() {
    const errs = {};
    if (!form.email)    errs.email    = 'Email is required';
    if (!form.username) errs.username = 'Username is required';
    if (form.username && !/^[a-zA-Z0-9_]+$/.test(form.username))
      errs.username = 'Letters, numbers, underscores only';
    if (!form.password) errs.password = 'Password is required';
    if (strength < 3)   errs.password = 'Password is too weak';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      await signup({ email: form.email, username: form.username, password: form.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        // Marshmallow field errors
        const fieldMap = {};
        for (const [field, msgs] of Object.entries(data.errors)) {
          fieldMap[field] = Array.isArray(msgs) ? msgs[0] : msgs;
        }
        setErrors(fieldMap);
      } else {
        setApiError(data?.error || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-card auth-success-card">
          <div className="auth-success-icon">✓</div>
          <h2 className="auth-title">Account Created!</h2>
          <p className="auth-subtitle">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="auth-card">
        <div className="auth-brand">
          <Link to="/" className="auth-brand-link">UnderKilometer</Link>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Find your perfect accommodation</p>

        {apiError && (
          <div className="auth-error" role="alert">
            <span className="auth-error-icon">⚠</span> {apiError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-email">Email</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">✉</span>
              <input
                id="signup-email"
                className={`auth-input ${errors.email ? 'auth-input-error' : ''}`}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="auth-field-error">{errors.email}</span>}
          </div>

          {/* Username */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-username">Username</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">@</span>
              <input
                id="signup-username"
                className={`auth-input ${errors.username ? 'auth-input-error' : ''}`}
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="your_username"
                autoComplete="username"
              />
            </div>
            {errors.username && <span className="auth-field-error">{errors.username}</span>}
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                id="signup-password"
                className={`auth-input ${errors.password ? 'auth-input-error' : ''}`}
                type={showPw ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 8 chars, 1 upper, 1 number, 1 symbol"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>

            {/* Strength meter */}
            {form.password && (
              <div className="auth-strength-wrap">
                <div className="auth-strength-bar">
                  <div
                    className="auth-strength-fill"
                    style={{
                      width: `${strengthPct}%`,
                      backgroundColor: STRENGTH_COLORS[strength],
                    }}
                  />
                </div>
                <span className="auth-strength-label" style={{ color: STRENGTH_COLORS[strength] }}>
                  {STRENGTH_LABELS[strength]}
                </span>
              </div>
            )}
            {errors.password && <span className="auth-field-error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-confirm">Confirm Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                id="signup-confirm"
                className={`auth-input ${errors.confirm ? 'auth-input-error' : ''}`}
                type={showPw ? 'text' : 'password'}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Repeat password"
                autoComplete="new-password"
              />
            </div>
            {errors.confirm && <span className="auth-field-error">{errors.confirm}</span>}
          </div>

          <button
            id="signup-submit"
            className="auth-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? <span className="auth-btn-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
