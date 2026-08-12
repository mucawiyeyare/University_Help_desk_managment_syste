import api from './axios';

export const getArticlesApi = (params) => api.get('/knowledge', { params });
export const getArticleApi = (id) => api.get(`/knowledge/${id}`);
export const searchArticlesApi = (q) => api.get('/knowledge/search', { params: { q } });
export const suggestArticlesApi = (params) => api.get('/knowledge/suggest', { params });

export const getAllArticlesAdminApi = (params) => api.get('/knowledge/admin/all', { params });
export const createArticleApi = (data) => api.post('/knowledge', data);
export const updateArticleApi = (id, data) => api.put(`/knowledge/${id}`, data);
export const deleteArticleApi = (id) => api.delete(`/knowledge/${id}`);
