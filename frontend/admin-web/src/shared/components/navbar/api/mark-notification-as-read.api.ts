import { api } from "@/api/client";

import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";

interface Options {
    id: string;
    employeeId: string;
}

export const markNotificationAsReadAsync = async ({ id, employeeId }: Options): Promise<Options> => {
    await sleep();

    if (IS_MOCKABLE)
        return { id, employeeId };

    await api.post(`/notifications/${id}/read`, {});

    return { id, employeeId };
}
