import axios from 'axios';

export const api = axios.create({
  baseURL: '/api', // Использует прокси Vite
  headers: {
    'Content-Type': 'application/json',
  },
});