import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { NotificationResponse } from "@/interfaces/responses/notification.response";

interface Options {
    page: number;
    employeeId: string;
}

export const getPagedNotificationsAsync = async ({ page, employeeId }: Options): Promise<PagedResponse<NotificationResponse>> => {
    await sleep();

    let endpoint = `/notifications/admin/${employeeId}`;

    if (IS_MOCKABLE)
        endpoint = "/notifications/paged-notifications.json";

    const { data } = await api.get<PagedResponse<NotificationResponse>>(endpoint, {
        params: {
            page
        }
    });

    return {
        ...data
    };
}
