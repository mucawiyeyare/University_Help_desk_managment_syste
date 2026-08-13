import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor – guards against redirect loops on 401
let _isRedirecting = false;
export const resetRedirectFlag = () => { _isRedirecting = false; };
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isSessionCheck = error.config?.url?.includes('/auth/me');
    const pathname = window.location.pathname;
    const isAuthPage = ['/login', '/register', '/forgot-password'].some((p) =>
      pathname === p || pathname.startsWith('/reset-password')
    );

    // A 401 from the initial session check is expected when a visitor is not signed in.
    // Guard against redirect loops: only redirect once, and never from auth pages.
    if (error.response?.status === 401 && !isSessionCheck && !isAuthPage && !_isRedirecting) {
      _isRedirecting = true;
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
