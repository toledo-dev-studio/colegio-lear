import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { AuthCredentials } from "../interfaces/auth-credentials";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { LoginResponse } from "@/interfaces/responses/login.response";

export const loginActionAsync = async (credentials: AuthCredentials): Promise<LoginResponse> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<LoginResponse>("/auth/login.json");
        return data;
    }

    const { data } = await api.post<LoginResponse>("/auth/login", credentials);

    return data;
}
