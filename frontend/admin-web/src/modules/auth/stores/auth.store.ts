import { create } from "zustand";

import { loginActionAsync } from "../actions/login.action";
import { logoutActionAsync } from "../actions/logout.action";
import type { Employee } from "@/interfaces/entites/employee";
import type { AuthCredentials } from "../interfaces/auth-credentials";
import { meActionAsync } from "../actions/me.action";
import type { ModuleKeys } from "@/interfaces/components/modules";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import type { SecurityRolePermission } from "@/interfaces/entites/security-role-permission";

type AuthStatus = "authenticated" | "not-authenticated" | "checking";

type AuthState = {
    // Properties
    user: Employee | null,
    authStatus: AuthStatus,
    permissions: SecurityRolePermission[],

    // Actions
    checkPermission: (moduleKey: ModuleKeys, permission: "can-read" | "can-write" | "can-delete") => boolean,
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
        checkPermission: (moduleKey: ModuleKeys, permission: "can-read" | "can-write" | "can-delete") => {
            const user = get().user;
            console.log(moduleKey, permission, user);
            return true;
        },
        checkAuthStatus: async () => {
            const user = get().user;
            if (user) {
                set({ user: user, authStatus: "authenticated", permissions: user.securityRole?.permissions ?? [] });
                return true;
            }
            else
                set({ user: null, authStatus: "not-authenticated", permissions: [] });
            return false;

            const { showLoading, hideLoading } = useLoaderStore.getState();
            try {
                showLoading();
                const user = await meActionAsync();
                set({ user: user, authStatus: "authenticated", permissions: user.securityRole?.permissions ?? [] });
                return true;
            } catch (error) {
                console.warn(error);
                set({ user: null, authStatus: "not-authenticated", permissions: [] });
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
                set({ user: null, authStatus: "not-authenticated", permissions: [] });
                return false;
            }
        },
        logout: async () => {
            try {
                await logoutActionAsync();
            } catch (error) {
                console.warn(error);
            } finally {
                set({ user: null, authStatus: "not-authenticated", permissions: [] });
            }
        }
    }
));
