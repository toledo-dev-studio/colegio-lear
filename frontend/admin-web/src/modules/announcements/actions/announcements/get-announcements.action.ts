import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Announcement } from "@/interfaces/entites/announcement";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    query?: string;
    name?: string;
    publishedAt?: string;
    expiresAt?: string;
    status?: boolean;
}

export const getAnnouncementsActionAsync = async ({ query, name, publishedAt, expiresAt, status }: Options): Promise<Announcement[]> => {
    await sleep();

    let endpoint = "/announcements";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/announcements/announcements.json";

    const { data } = await api.get<Announcement[]>('/announcements/announcements.json', {
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
