/**
 * src/context/AuthContext.jsx
 * ────────────────────────────
 * Global auth state.  Wrap the app with <AuthProvider> in main.jsx.
 *
 * Provides:
 *   user          — { id, email, username, role } | null
 *   accessToken   — stored in React state ONLY (never localStorage)
 *   isLoading     — true while we're checking existing session
 *   login(email, password)  → calls /api/auth/login
 *   signup(data)            → calls /api/auth/signup
 *   logout()                → calls /api/auth/logout, clears state
 */
import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { configureApiInterceptors } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading]     = useState(true);

  // Use a ref so the axios interceptor always gets the latest token
  const tokenRef = useRef(null);

  const updateToken = useCallback((token) => {
    tokenRef.current = token;
    setAccessToken(token);
  }, []);

  // ── Wire interceptors once on mount ──────────────────────────────────────
  useEffect(() => {
    configureApiInterceptors({
      getToken:  () => tokenRef.current,
      setToken:  updateToken,
      onLogout:  () => {
        setUser(null);
        updateToken(null);
      },
    });
  }, [updateToken]);

  // ── On app load: try to restore session via refresh token cookie ──────────
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        updateToken(res.data.access_token);

        // Fetch user profile with the new access token
        const meRes = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${res.data.access_token}` },
          withCredentials: true,
        });
        setUser(meRes.data);
      } catch {
        // No valid refresh token — user is logged out; that's fine
      } finally {
        setIsLoading(false);
      }
    })();
  }, [updateToken]);

  // ── Auth actions ──────────────────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    const res = await axios.post(
      '/api/auth/login',
      { email, password },
      { withCredentials: true }
    );
    updateToken(res.data.access_token);
    setUser(res.data.user);
    return res.data.user;
  }, [updateToken]);

  const signup = useCallback(async ({ email, username, password, adminSecret }) => {
    const headers = {};
    if (adminSecret) headers['X-Admin-Secret'] = adminSecret;

    const res = await axios.post(
      '/api/auth/signup',
      { email, username, password },
      { headers, withCredentials: true }
    );
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(
        '/api/auth/logout',
        {},
        {
          headers: { Authorization: `Bearer ${tokenRef.current}` },
          withCredentials: true,
        }
      );
    } catch {
      // Even if the server call fails, clear client state
    } finally {
      setUser(null);
      updateToken(null);
    }
  }, [updateToken]);

  const value = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook: use inside any component that needs auth state. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
