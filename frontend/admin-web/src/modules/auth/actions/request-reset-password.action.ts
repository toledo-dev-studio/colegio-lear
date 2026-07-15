import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    email: string;
}

export const requestResetPasswordActionAsync = async ({ email }: Options): Promise<void> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable")
        return;

    await api.post("/auth/request-reset-password", { email });

    return;
}
