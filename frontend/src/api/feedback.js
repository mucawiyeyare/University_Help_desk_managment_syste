import api from './axios';

export const getAllFeedbackApi = (params) => api.get('/feedback', { params });
export const getFeedbackStatsApi = () => api.get('/feedback/stats');
