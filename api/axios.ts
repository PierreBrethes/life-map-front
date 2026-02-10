import axios from 'axios';

const apiAuth = import.meta.env.VITE_API_AUTH || '';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    ...(apiAuth ? { 'Authorization': `Basic ${apiAuth}` } : {}),
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data?.detail || error.message);
    return Promise.reject(error);
  }
);

export default api;
