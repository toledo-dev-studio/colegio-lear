import { create } from "zustand";

import { meAsync } from "../../../../modules/auth/api/me.api";
import { loginAsync } from "../../../../modules/auth/api/login.api";
import { logoutAsync } from "../../../../modules/auth/api/logout.api";
import type { AuthRequest } from "@/interfaces/requests/auth.request";
import type { AuthResponse } from "@/interfaces/responses/auth.response";
import { useLoaderStore } from "@/lib/zustand/stores/loader-store/LoaderStore";
import { resetPasswordAsync } from "../../../../modules/auth/api/reset-password.api";
import type { AuthResetPasswordRequest } from "@/interfaces/requests/auth-reset-password.request";
import { requestResetPasswordAsync } from "../../../../modules/auth/api/request-reset-password.api";

// Store types
type AuthStatus = "authenticated" | "not-authenticated" | "checking";
export type AuthState = {
    // Properties
    user: AuthResponse | null,
    authStatus: AuthStatus,

    // Actions
    setUser: (user: AuthResponse) => void,
    clearSession: () => void,
    checkAuthStatus: () => Promise<boolean>,
    login: (credentials: AuthRequest) => Promise<boolean>,
    logout: () => Promise<void>,
    requestResetPassword: ({ email }: { email: string }) => Promise<boolean>
    resetPassword: (credentials: AuthResetPasswordRequest) => Promise<boolean>
}

// Store functions
const checkAuthStatus = async (set: any, get: any) => {
    const { showLoading, hideLoading } = useLoaderStore.getState();
    try {
        showLoading("Validando credenciales");
        const user = await meAsync();
        set({ user: { ...user }, authStatus: "authenticated" });
        return true;
    } catch (error) {
        console.warn(error);
        get().clearSession();
        return false;
    } finally {
        hideLoading();
    }
}

const login = async (set: any, get: any, credentials: AuthRequest) => {
    try {
        const user = await loginAsync(credentials);
        set({ user: { ...user }, authStatus: "authenticated" });
        return true;
    } catch (error) {
        console.warn(error);
        get().clearSession();
        return false;
    }
};

const logout = async (get: any) => {
    try {
        await logoutAsync();
    } catch (error) {
        console.warn(error);
    } finally {
        get().clearSession();
    }
};

const requestResetPassword = async ({ email }: { email: string }) => {
    try {
        await requestResetPasswordAsync({ email });
        return true;
    } catch (error) {
        console.warn(error);
        return true;
    }
}

const resetPassword = async (credentials: AuthResetPasswordRequest) => {
    try {
        await resetPasswordAsync({ credentials });
        return true;
    } catch (error) {
        console.warn(error);
        return false;
    }
}

// Store implementation
export const useAuthStore = create<AuthState>()((set, get) => (
    {
        // Properties
        user: null,
        authStatus: "checking",

        // Actions
        setUser: (user: AuthResponse) => set({ user: user }),
        clearSession: () => {
            set({
                user: null,
                authStatus: "not-authenticated",
            });
        },
        checkAuthStatus: () => checkAuthStatus(set, get),
        login: (credentials: AuthRequest) => login(set, get, credentials),
        logout: () => logout(get),
        requestResetPassword: requestResetPassword,
        resetPassword: resetPassword
    }
));