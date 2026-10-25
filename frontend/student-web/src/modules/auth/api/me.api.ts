import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AuthResponse } from "@/interfaces/responses/auth.response";

export const meAsync = async (): Promise<AuthResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<AuthResponse>("/auth/student/me.json");
        return data;
    }

    const { data } = await api.get<AuthResponse>("/auth/student/me");

    return data;
}