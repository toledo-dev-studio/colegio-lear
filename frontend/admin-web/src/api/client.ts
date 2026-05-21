import axios from 'axios'

import { VITE_COLEGIO_LEAR_API_URL } from '@/lib/constants/environment.constants';

const baseURL = VITE_COLEGIO_LEAR_API_URL;

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
});

// Interceptor for 401 response code (the cookie is removed automatically by backend)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login
            window.location.href = "/auth/login";
        }
        return Promise.reject(error);
    }
);

export { api };
