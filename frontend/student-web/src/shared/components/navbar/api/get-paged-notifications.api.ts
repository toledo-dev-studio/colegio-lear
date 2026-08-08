import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { NotificationResponse } from "@/interfaces/responses/notification.response";

interface Options {
    page: number;
    studentId: string;
}

export const getPagedNotificationsAsync = async ({ page, studentId }: Options): Promise<PagedResponse<NotificationResponse>> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<PagedResponse<NotificationResponse>>("/notifications/paged-notifications.json");
        return data;
    }

    const { data } = await api.get<PagedResponse<NotificationResponse>>(`/notifications/student/${studentId}`, {
        params: {
            page
        }
    });

    return data;
}