import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { NotificationResponse } from "@/interfaces/responses/notification.response";

interface Options {
    page: number;
    employeeId: string;
}

export const getPagedNotificationsActionAsync = async ({ page, employeeId }: Options): Promise<PagedResponse<NotificationResponse>> => {
    await sleep();

    let endpoint = `/notifications/employees/${employeeId}`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/notifications/paged-notifications.json";
    
    // REMOVE
    endpoint = "http://localhost/api/notifications/paged-notifications.json";
    
    const { data } = await api.get<PagedResponse<NotificationResponse>>(endpoint, {
        params: {
            page,
            employeeId,
        }
    });

    return {
        ...data
    };
}
