import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const logoutActionAsync = async (): Promise<void> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable")
        return;

    await api.post("/auth/logout");

    return;
}
