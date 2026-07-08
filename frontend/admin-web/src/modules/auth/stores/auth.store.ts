import { create } from "zustand";

import { meActionAsync } from "../actions/me.action";
import { loginActionAsync } from "../actions/login.action";
import { logoutActionAsync } from "../actions/logout.action";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import type { AuthCredentials } from "../interfaces/auth-credentials";
import type { ModuleKey } from "@/lib/key-value-pairs/key-value-pair-modules";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import type { SecurityRolePermissionResponse } from "@/interfaces/responses/security-role-permission.response";

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
}

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
        checkPermission: (moduleKey: ModuleKey, permission: "can-read" | "can-write" | "can-delete") => {
            const user = get().user;
            console.log(moduleKey, permission, user);
            return true;
        },
        checkAuthStatus: async () => {
            const { showLoading, hideLoading } = useLoaderStore.getState();
            try {
                showLoading("Validando credenciales");
                const user = await meActionAsync();
                set({ user: user, authStatus: "authenticated", permissions: user.securityRole?.permissions ?? [] });
                return true;
            } catch (error) {
                console.warn(error);
                get().clearSession();
                return false;
            } finally {
                hideLoading();
            }
        },
        login: async (credentials: AuthCredentials) => {
            try {
                const user = await loginActionAsync(credentials);
                set({ user: user, authStatus: "authenticated", permissions: user.securityRole?.permissions ?? [] });
                return true;
            } catch (error) {
                console.warn(error);
                get().clearSession();
                return false;
            }
        },
        logout: async () => {
            try {
                await logoutActionAsync();
            } catch (error) {
                console.warn(error);
            } finally {
                get().clearSession();
            }
        }
    }
));
