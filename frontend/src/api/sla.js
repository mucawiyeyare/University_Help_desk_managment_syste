import api from './axios';

export const getSLAPoliciesApi = () => api.get('/sla');
export const getSLAPolicyApi = (id) => api.get(`/sla/${id}`);
export const createSLAPolicyApi = (data) => api.post('/sla', data);
export const updateSLAPolicyApi = (id, data) => api.put(`/sla/${id}`, data);
export const deleteSLAPolicyApi = (id) => api.delete(`/sla/${id}`);
