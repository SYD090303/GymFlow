import axios from 'axios';

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
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
