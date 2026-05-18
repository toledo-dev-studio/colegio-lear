import axios from 'axios'

import { VITE_COLEGIO_LEAR_API_URL } from '@/lib/constants/environment.constants';

const baseURL = VITE_COLEGIO_LEAR_API_URL;

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
