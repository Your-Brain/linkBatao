import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization Bearer token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auralink_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const getProxyImageUrl = (url) => {
  if (!url) return '';
  if (url.includes('/resources/proxy-image?url=')) {
    try {
      const parsed = new URL(url, 'http://dummy.local');
      const inner = parsed.searchParams.get('url');
      if (inner) url = inner;
    } catch (e) {}
  }
  const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
  return `${apiBase}/resources/proxy-image?url=${encodeURIComponent(url)}`;
};

export default API;