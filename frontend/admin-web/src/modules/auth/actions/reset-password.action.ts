import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { ResetPasswordRequest } from "@/interfaces/requests/reset-password.request";

interface Options {
    credentials: ResetPasswordRequest
}

export const resetPasswordActionAsync = async ({ credentials }: Options): Promise<void> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development")
        return;

    await api.post("/auth/reset-password", { ...credentials });

    return;
}
