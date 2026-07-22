import { create } from "zustand";

import { meActionAsync } from "../actions/me.action";
import { loginActionAsync } from "../actions/login.action";
import { logoutActionAsync } from "../actions/logout.action";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import type { AuthCredentials } from "../interfaces/auth-credentials";
import { resetPasswordActionAsync } from "../actions/reset-password.action";
import type { ModuleKey } from "@/lib/key-value-pairs/key-value-pair-modules";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import type { ResetPasswordRequest } from "@/interfaces/requests/reset-password.request";
import { requestResetPasswordActionAsync } from "../actions/request-reset-password.action";
import type { SecurityRolePermissionResponse } from "@/interfaces/responses/security-role-permission.response";

// Store types
type AuthStatus = "authenticated" | "not-authenticated" | "checking";
export type AuthState = {
    // Properties
    user: EmployeeResponse | null,
    authStatus: AuthStatus,
    permissions: SecurityRolePermissionResponse[],

    // Actions
    setUser: (user: EmployeeResponse) => void,
    clearSession: () => void,
    checkPermission: (moduleKey: ModuleKey, permission: "can-read" | "can-write" | "can-delete") => boolean,
    checkAuthStatus: () => Promise<boolean>,
    login: (credentials: AuthCredentials) => Promise<boolean>,
    logout: () => Promise<void>,
    requestResetPassword: ({ email }: { email: string }) => Promise<boolean>
    resetPassword: (credentials: ResetPasswordRequest) => Promise<boolean>
}

// Store functions
const checkPermission = (get: any, moduleKey: ModuleKey, permission: "can-read" | "can-write" | "can-delete"): boolean => {
    const permissions = get().permissions as SecurityRolePermissionResponse[];

    const modulePermission = permissions.find(
        x => x.moduleKey === moduleKey
    );

    if (!modulePermission)
        return false;

    switch (permission) {

        case "can-read":
            return modulePermission.canRead;

        case "can-write":
            return modulePermission.canWrite;

        case "can-delete":
            return modulePermission.canDelete;

        default:
            return false;
    }
};

const checkAuthStatus = async (set: any, get: any) => {
    const { showLoading, hideLoading } = useLoaderStore.getState();
    try {
        showLoading("Validando credenciales");
        const user = await meActionAsync();
        set({ user: { ...user }, authStatus: "authenticated", permissions: user.securityRole?.permissions ?? [] });
        return true;
    } catch (error) {
        console.warn(error);
        get().clearSession();
        return false;
    } finally {
        hideLoading();
    }
}

const login = async (set: any, get: any, credentials: AuthCredentials) => {
    try {
        const user = await loginActionAsync(credentials);
        set({ user: { ...user }, authStatus: "authenticated", permissions: user.securityRole?.permissions ?? [] });
        return true;
    } catch (error) {
        console.warn(error);
        get().clearSession();
        return false;
    }
};

const logout = async (get: any) => {
    try {
        await logoutActionAsync();
    } catch (error) {
        console.warn(error);
    } finally {
        get().clearSession();
    }
};

const requestResetPassword = async ({ email }: { email: string }) => {
    try {
        await requestResetPasswordActionAsync({ email });
        return true;
    } catch (error) {
        console.warn(error);
        return true;
    }
}

const resetPassword = async (credentials: ResetPasswordRequest) => {
    try {
        await resetPasswordActionAsync({ credentials });
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
        permissions: [],

        // Actions
        setUser: (user: EmployeeResponse) => set({ user: user }),
        clearSession: () => {
            set({
                user: null,
                authStatus: "not-authenticated",
                permissions: [],
            });
        },
        checkPermission: (moduleKey: ModuleKey, permission: "can-read" | "can-write" | "can-delete") => checkPermission(get, moduleKey, permission),
        checkAuthStatus: () => checkAuthStatus(set, get),
        login: (credentials: AuthCredentials) => login(set, get, credentials),
        logout: () => logout(get),
        requestResetPassword: requestResetPassword,
        resetPassword: resetPassword
    }
));
