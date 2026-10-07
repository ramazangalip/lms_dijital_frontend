import axios from 'axios';

// API Base URL belirleme:
// 1. Ortam değişkeni (NEXT_PUBLIC_API_URL) tanımlıysa onu kullanır (.env.development, .env.production vb.)
// 2. Tarayıcı ortamında hostname localhost / 127.0.0.1 ise yerel backend'e, canlı domain ise canlı backend'e yönlendirir.
export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8000/api';
    }
    return 'https://api.yapayzekadesteklidijitalsinif.com.tr/api';
  }
  return 'http://127.0.0.1:8000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

// Axios Request Interceptor: Her istek gönderilmeden önce token ve baseURL ekler
api.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = getApiBaseUrl();
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Axios Response Interceptor: 401 Unauthorized durumunda temizleme ve loglama
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';
      if (!requestUrl.includes('/users/login') && !requestUrl.includes('/users/register')) {
        console.warn("Oturum süresi doldu veya yetkisiz istek (401).");
      }
    }
    return Promise.reject(error);
  }
);

export default api;