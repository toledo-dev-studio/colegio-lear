import { api } from "@/api/client";

import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
interface Options {
    id: string;
    employeeId: string;
}

export const markNotificationAsReadActionAsync = async ({ id, employeeId }: Options): Promise<Options> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development")
        return { id, employeeId };

    await api.post(`/notifications/employees/${employeeId}/${id}/read`, {});

    return { id, employeeId };
}
