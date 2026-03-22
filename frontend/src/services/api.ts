import axios from 'axios';

export const api = axios.create({
  baseURL: '/api', // Использует прокси Vite
  headers: {
    'Content-Type': 'application/json',
  },
});

// Автоматическое добавление токена из localStorage
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
