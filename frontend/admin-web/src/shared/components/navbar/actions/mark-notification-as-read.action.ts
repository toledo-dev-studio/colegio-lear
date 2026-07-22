import { api } from "@/api/client";

import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    id: string;
    employeeId: string;
}

export const markNotificationAsReadActionAsync = async ({ id, employeeId }: Options): Promise<Options> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable")
        return { id, employeeId };

    await api.post(`/notifications/${id}/read`, {});

    return { id, employeeId };
}
