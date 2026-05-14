import { api } from "@/api/client";
import type { Announcement } from "@/interfaces/entites/announcement";

import { sleep } from "@/lib/utils";

interface Options {
    query?: string;
    name?: string;
    publishedAt?: string;
    expiresAt?: string;
    status?: boolean;
}

export const getAnnouncementsActionAsync = async (props: Options): Promise<Announcement[]> => {
    await sleep();

    const { query = '', name, publishedAt, expiresAt, status } = props;
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
