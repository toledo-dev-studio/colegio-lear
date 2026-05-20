import { create } from "zustand";

import { loginActionAsync } from "../actions/login.action";
import type { Employee } from "@/interfaces/entites/employee";
import type { AuthCredentials } from "../interfaces/auth-credentials";

type AuthStatus = "authenticated" | "not-authenticated" | "checking";

type AuthState = {
    // Properties
    user: Employee | null,
    authStatus: AuthStatus,

    // Actions
    login: (credentials: Partial<AuthCredentials>) => Promise<boolean>,
    logout: () => void,
}

export const useAuthStore = create<AuthState>()((set, get) => (
    {
        // Properties
        user: null,
        authStatus: "checking",

        // Actions
        login: async (credentials: Partial<AuthCredentials>) => {
            try {
                const user = await loginActionAsync(credentials);
                sessionStorage.setItem("colegio-learn-auth", JSON.stringify(user));
                set({ user: user, authStatus: "authenticated" });
                return true;
            } catch (error) {
                console.warn(error);
                set({ user: null, authStatus: "not-authenticated" });
                sessionStorage.removeItem("colegio-learn-auth");
                return false;
            }
        },
        logout: () => {
            set({ user: null, authStatus: "not-authenticated" });
            sessionStorage.removeItem("colegio-learn-auth");
            console.log("logout...");
        }
    }
));
