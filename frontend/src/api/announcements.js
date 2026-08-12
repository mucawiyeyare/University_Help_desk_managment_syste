import api from './axios';

export const getAnnouncementsApi = () => api.get('/announcements');
export const getAllAnnouncementsAdminApi = () => api.get('/announcements/all');
export const createAnnouncementApi = (data) => api.post('/announcements', data);
export const updateAnnouncementApi = (id, data) => api.put(`/announcements/${id}`, data);
export const deleteAnnouncementApi = (id) => api.delete(`/announcements/${id}`);
