import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AuthRequest } from "@/interfaces/requests/auth.request";
import type { AuthResponse } from "@/interfaces/responses/auth.response";

export const loginAsync = async (credentials: AuthRequest): Promise<AuthResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<AuthResponse>("/auth/student/login.json");
        return data;
    }

    const { data } = await api.post<AuthResponse>("/auth/student/login", credentials);

    return data;
}
