import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";

interface Options {
    email: string;
}

export const requestResetPasswordAsync = async ({ email }: Options): Promise<void> => {
    await sleep();

    if (IS_MOCKABLE)
        return;

    await api.post("/auth/student/request-reset-password", { email });

    return;
}