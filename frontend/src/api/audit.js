import api from './axios';

export const getAuditLogsApi = (params) => api.get('/audit', { params });
