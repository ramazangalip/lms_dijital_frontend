import axios from 'axios';

// Backend adresini dinamik veya yerel olarak yönetiyoruz
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
});

// Axios Request Interceptor: Her istek gönderilmeden önce token ekler
api.interceptors.request.use((config) => {
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

// Axios Response Interceptor: 401 Unauthorized durumunda temizleme ve yönlendirme
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response && error.response.status === 401) {
      // Login veya register isteklerinde 401 olursa yönlendirme yapma
      const requestUrl = error.config?.url || '';
      if (!requestUrl.includes('/users/login') && !requestUrl.includes('/users/register')) {
        console.warn("Oturum süresi doldu veya yetkisiz istek (401), giriş sayfasına yönlendiriliyor...");
      }
    }
    return Promise.reject(error);
  }
);

export default api;