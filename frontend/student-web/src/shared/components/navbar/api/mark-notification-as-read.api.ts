import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";

interface Options {
    id: string;
    studentId: string;
}

export const markNotificationAsReadAsync = async ({ id, studentId }: Options): Promise<Options> => {
    await sleep();

    if (IS_MOCKABLE)
        return { id, studentId };

    await api.post(`/notifications/student/${studentId}/read`, {
        notificationId: id
    });

    return { id, studentId };
}