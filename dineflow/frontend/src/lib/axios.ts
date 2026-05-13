import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Auto-attach token to every request
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('dineflow-store');
  if (raw) {
    const { state } = JSON.parse(raw);
    if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dineflow-store');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
