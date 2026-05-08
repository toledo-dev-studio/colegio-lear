import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api';

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
});

// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token');
//     if (token)
//         config.headers.Authorization = `Bearer ${token}`;
//     return config;
// });

export { api };
