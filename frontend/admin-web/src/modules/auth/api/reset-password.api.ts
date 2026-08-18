import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { ResetPasswordRequest } from "@/interfaces/requests/reset-password.request";

interface Options {
    credentials: ResetPasswordRequest
}

export const resetPasswordAsync = async ({ credentials }: Options): Promise<void> => {
    await sleep();

    if (IS_MOCKABLE)
        return;

    await api.post("/auth/reset-password", { ...credentials });

    return;
}
