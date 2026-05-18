import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Announcement } from "@/interfaces/entites/announcement";

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
