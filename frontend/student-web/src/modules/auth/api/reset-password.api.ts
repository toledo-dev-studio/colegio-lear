import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AuthResetPasswordRequest } from "@/interfaces/requests/auth-reset-password.request";

interface Options {
    credentials: AuthResetPasswordRequest
}

export const resetPasswordAsync = async ({ credentials }: Options): Promise<void> => {
    await sleep();

    if (IS_MOCKABLE)
        return;

    await api.post("/auth/student/reset-password", { ...credentials });

    return;
}