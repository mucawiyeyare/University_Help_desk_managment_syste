import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isSessionCheck = error.config?.url?.includes('/auth/me');
    const isAuthPage = ['/login', '/register', '/forgot-password'].includes(window.location.pathname);

    // A 401 from the initial session check is expected when a visitor is not signed in.
    // Redirecting here caused the login page to reload endlessly and eventually rate-limit itself.
    if (error.response?.status === 401 && !isSessionCheck && !isAuthPage) {
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
