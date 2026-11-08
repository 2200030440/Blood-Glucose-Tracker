import axios from 'axios';

// Use relative /api URL to support single-origin deployment in Railway & dev proxy
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    
    // Attach friendly message to the error object
    error.friendlyMessage = customMessage;
    return Promise.reject(error);
  }
);

export default api;
