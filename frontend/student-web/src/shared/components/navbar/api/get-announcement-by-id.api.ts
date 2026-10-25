import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AnnouncementResponse } from "@/interfaces/responses/announcement.response";

interface Options {
    id: string;
}

export const getAnnouncementByIdAsync = async ({ id }: Options): Promise<AnnouncementResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<AnnouncementResponse>("/announcements/announcement.json");
        return data;
    }

    const { data } = await api.get<AnnouncementResponse>(`/announcements/${id}`);

    return data;
}
