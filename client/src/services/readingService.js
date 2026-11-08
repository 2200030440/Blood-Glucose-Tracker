import api from './api.js';

export const readingService = {
  createReading: (data) => api.post('/readings', data),
  getReadings: (params) => api.get('/readings', { params }),
  getReadingById: (id) => api.get(`/readings/${id}`),
  updateReading: (id, data) => api.put(`/readings/${id}`, data),
  deleteReading: (id) => api.delete(`/readings/${id}`),
};

export default readingService;
