import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { AnnouncementFilter } from "@/interfaces/filters/announcement.filter";
import type { AnnouncementResponse } from "@/interfaces/responses/announcement.response";

interface Options extends AnnouncementFilter {
    query?: string;
    page?: number;
    pageSize?: number;
}

export const getPagedAnnouncementsAsync = async (props: Options): Promise<PagedResponse<AnnouncementResponse>> => {
    await sleep();

    const { query, page = 1, pageSize = 1, name, publishedAt, expiresAt, status } = props;

    let endpoint = "/announcements/paged";

    if (IS_MOCKABLE)
        endpoint = "/announcements/paged-announcements.json";

    const { data } = await api.get<PagedResponse<AnnouncementResponse>>(endpoint, {
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
