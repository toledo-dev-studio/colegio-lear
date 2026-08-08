import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";

export const logoutAsync = async (): Promise<void> => {
    await sleep();

    if (IS_MOCKABLE)
        return;

    await api.post("/auth/student/logout");

    return;
}