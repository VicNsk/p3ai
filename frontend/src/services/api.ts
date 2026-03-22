import axios from 'axios';

// Создаём экземпляр axios с базовым URL
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор запросов: автоматически добавляем токен
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      // Добавляем заголовок Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор ответов: обрабатываем 401 (токен протух)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен невалиден — очищаем и перенаправляем на логин
      localStorage.removeItem('token');
      // Опционально: окно.location.href = '/login';
      console.warn('Auth token expired, please login again');
    }
    return Promise.reject(error);
  }
);
