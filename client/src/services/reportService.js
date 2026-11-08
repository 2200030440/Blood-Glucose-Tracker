import api from './api.js';

export const reportService = {
  getDailyReport: (date) => api.get('/reports/daily', { params: { date } }),
  getMonthToDateReport: (date) => api.get('/reports/month-to-date', { params: { date } }),
  getMonthlyReport: (date) => api.get('/reports/monthly', { params: { date } }),
};

export default reportService;

