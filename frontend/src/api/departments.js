import api from './axios';

export const getDepartmentsApi = (params) => api.get('/departments', { params });
export const getDepartmentApi = (id) => api.get(`/departments/${id}`);
export const createDepartmentApi = (data) => api.post('/departments', data);
export const updateDepartmentApi = (id, data) => api.put(`/departments/${id}`, data);
export const deleteDepartmentApi = (id) => api.delete(`/departments/${id}`);
export const addAgentToDeptApi = (id, agentId) => api.post(`/departments/${id}/agents`, { agentId });
export const removeAgentFromDeptApi = (id, agentId) => api.delete(`/departments/${id}/agents`, { data: { agentId } });
