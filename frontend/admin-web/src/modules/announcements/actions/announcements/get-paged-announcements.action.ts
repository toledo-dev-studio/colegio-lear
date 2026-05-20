import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Announcement } from "@/interfaces/entites/announcement";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    publishedAt?: string;
    expiresAt?: string;
    status?: boolean;
}

export const getPagedAnnouncementsActionAsync = async (props: Options): Promise<PagedResponse<Announcement>> => {
    await sleep();

    const { query, page = 1, pageSize = 1, name, publishedAt, expiresAt, status } = props;

    let endpoint = "/announcements/paged";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/announcements/paged-announcements.json";

    const { data } = await api.get<PagedResponse<Announcement>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            name,
            publishedAt,
            expiresAt,
            status,
        }
    });

    return {
        ...data
    };
}
