import api from './axios';

export const getCategoriesApi = (params) => api.get('/categories', { params });
export const getCategoryApi = (id) => api.get(`/categories/${id}`);
export const createCategoryApi = (data) => api.post('/categories', data);
export const updateCategoryApi = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategoryApi = (id) => api.delete(`/categories/${id}`);

export const getSubcategoriesApi = (params) => api.get('/categories/subcategories', { params });
export const createSubcategoryApi = (data) => api.post('/categories/subcategories', data);
export const updateSubcategoryApi = (id, data) => api.put(`/categories/subcategories/${id}`, data);
export const deleteSubcategoryApi = (id) => api.delete(`/categories/subcategories/${id}`);
