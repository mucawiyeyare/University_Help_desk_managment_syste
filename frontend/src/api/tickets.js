import api from './axios';

export const createTicketApi = (formData) =>
  api.post('/tickets', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getTicketsApi = (params) => api.get('/tickets', { params });
export const getTicketApi = (id) => api.get(`/tickets/${id}`);
export const updateTicketApi = (id, data) => api.put(`/tickets/${id}`, data);
export const deleteTicketApi = (id) => api.delete(`/tickets/${id}`);

export const addCommentApi = (id, formData) =>
  api.post(`/tickets/${id}/comments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getCommentsApi = (id) => api.get(`/tickets/${id}/comments`);
export const getHistoryApi = (id) => api.get(`/tickets/${id}/history`);
export const assignTicketApi = (id, data) => api.post(`/tickets/${id}/assign`, data);
export const escalateTicketApi = (id, data) => api.post(`/tickets/${id}/escalate`, data);
export const resolveTicketApi = (id, data) => api.post(`/tickets/${id}/resolve`, data);
export const closeTicketApi = (id) => api.post(`/tickets/${id}/close`);
export const reopenTicketApi = (id, reason) => api.post(`/tickets/${id}/reopen`, { reason });
export const submitFeedbackApi = (id, data) => api.post(`/tickets/${id}/feedback`, data);
