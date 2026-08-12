import api from './axios';

export const loginApi = (data) => api.post('/auth/login', data);
export const registerApi = (data) => api.post('/auth/register', data);
export const logoutApi = () => api.post('/auth/logout');
export const getMeApi = () => api.get('/auth/me');
export const updateProfileApi = (data) => api.put('/auth/profile', data);
export const forgotPasswordApi = (email) => api.post('/auth/forgot-password', { email });
export const resetPasswordApi = (token, password) => api.put(`/auth/reset-password/${token}`, { password });
export const changePasswordApi = (data) => api.put('/auth/change-password', data);
