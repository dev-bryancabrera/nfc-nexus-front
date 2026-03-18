import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const apiClient = axios.create({
  baseURL: 'https://nfc-nexus-back-production.up.railway.app/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(cfg => {
  const token = useAuthStore.getState().accessToken;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

apiClient.interceptors.response.use(
  r => r,
  async err => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        await useAuthStore.getState().refresh();
        err.config.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;
        return apiClient.request(err.config);
      } catch {
        useAuthStore.getState().clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);
