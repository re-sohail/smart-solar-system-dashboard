import axios from 'axios';
import Cookies from 'js-cookie';
import { Navigate } from 'react-router-dom';

const baseURL = 'https://solar-system-backend.vercel.app/api';

const api = axios.create({
  baseURL: baseURL,
  timeout: 300000,
});

api.interceptors.request.use(
  config => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      Cookies.remove('token');

      Navigate('/auth/login');
    }

    return Promise.reject(error);
  },
);

export default api;
