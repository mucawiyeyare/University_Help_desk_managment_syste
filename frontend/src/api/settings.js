import api from './axios';

export const getSettingsApi = () => api.get('/settings');
export const getSettingApi = (key) => api.get(`/settings/${key}`);
export const updateSettingApi = (key, value) => api.put(`/settings/${key}`, { value });
export const getPublicSettingsApi = () => api.get('/settings/public');
