import api from './axios';

export const getNotificationsApi = () => api.get('/notifications');
export const markNotificationReadApi = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsReadApi = () => api.put('/notifications/read-all');
export const deleteNotificationApi = (id) => api.delete(`/notifications/${id}`);
