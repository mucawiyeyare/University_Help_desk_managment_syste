import api from './axios';

export const getDashboardStatsApi = () => api.get('/reports/dashboard');
export const getTicketVolumeReportApi = (params) => api.get('/reports/volume', { params });
export const getTicketsByStatusApi = () => api.get('/reports/by-status');
export const getTicketsByPriorityApi = () => api.get('/reports/by-priority');
export const getTicketsByCategoryApi = () => api.get('/reports/by-category');
export const getAgentPerformanceApi = () => api.get('/reports/agent-performance');
export const getSLAReportApi = () => api.get('/reports/sla');
export const getSatisfactionReportApi = () => api.get('/reports/satisfaction');
export const getTicketAgingApi = () => api.get('/reports/aging');
