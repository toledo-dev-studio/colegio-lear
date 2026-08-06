import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AnnouncementFilter } from "@/interfaces/filters/announcement.filter";
import type { AnnouncementResponse } from "@/interfaces/responses/announcement.response";

interface Options extends AnnouncementFilter {
    query?: string;
}

export const getAnnouncementsActionAsync = async ({ query, name, publishedAt, expiresAt, status }: Options): Promise<AnnouncementResponse[]> => {
    await sleep();

    let endpoint = "/announcements";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/announcements/announcements.json";

    const { data } = await api.get<AnnouncementResponse[]>(endpoint, {
        params: {
            q: query,
            name,
            publishedAt,
            expiresAt,
            status
        }
    });

    return data;
}
