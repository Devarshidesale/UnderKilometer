/**
 * src/api/axios.js
 * ─────────────────
 * Configured axios instance with:
 *  - withCredentials: true  (sends HttpOnly refresh cookie automatically)
 *  - Request interceptor:   attaches Bearer access token from AuthContext
 *  - Response interceptor:  on 401, silently refreshes token and retries the request
 *
 * Import this instance everywhere instead of raw `axios` to get auth for free.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // required for HttpOnly refresh token cookie
});

// ── Token store (injected by AuthContext after init) ──────────────────────────
let _getToken    = () => null;
let _setToken    = (_t) => {};
let _onLogout    = () => {};
let _isRefreshing = false;
let _failQueue    = [];

export function configureApiInterceptors({ getToken, setToken, onLogout }) {
  _getToken = getToken;
  _setToken = setToken;
  _onLogout = onLogout;
}

// ── Request interceptor — attach Bearer token ─────────────────────────────────
api.interceptors.request.use((config) => {
  const token = _getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — auto-refresh on 401 ───────────────────────────────
function processQueue(error, token = null) {
  _failQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  _failQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401s that haven't already been retried
    // and are not the refresh endpoint itself (to avoid infinite loops)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (_isRefreshing) {
        // Queue requests that arrive while a refresh is already in-flight
        return new Promise((resolve, reject) => {
          _failQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        // Use raw axios so the interceptor doesn't loop
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newToken = res.data.access_token;
        _setToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        _onLogout();
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
