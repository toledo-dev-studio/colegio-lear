import axios from "axios"

import { useAuthStore } from "@/modules/auth/stores/auth.store";

import { VITE_API_URL } from "@/lib/constants/environment.constants";

const baseURL = VITE_API_URL;

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
});

// Interceptor for 401 response code (the cookie is removed automatically by backend)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear authentication state in Zustand store
            // Routes will redirect to login page because authStatus will be "not-authenticated"
            useAuthStore.getState().clearSession();
        }
        return Promise.reject(error);
    }
);

export { api };
