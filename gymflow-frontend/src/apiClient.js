import axios from 'axios';
import { globalLoading } from './ui/globalLoading';

const apiClient = axios.create();

apiClient.interceptors.request.use(
  (config) => {
    // Guard for SSR/Node where localStorage isn't available
    let token = null;
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        token = window.localStorage.getItem('accessToken');
      }
    } catch (_) {
      // ignore
    }
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // signal global network activity
    try { globalLoading.inc(); } catch (_) {}
    return config;
  },
  (error) => {
    try { globalLoading.dec(); } catch (_) {}
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    try { globalLoading.dec(); } catch (_) {}
    return response;
  },
  (error) => {
    try { globalLoading.dec(); } catch (_) {}
    return Promise.reject(error);
  }
);

export default apiClient;
