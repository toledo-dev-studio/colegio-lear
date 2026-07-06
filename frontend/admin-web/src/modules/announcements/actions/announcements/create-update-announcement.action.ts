import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AnnouncementRequest } from "@/interfaces/requests/announcement.request";
import type { AnnouncementResponse } from "@/interfaces/responses/announcement.response";

interface Options {
    id: string;
    announcementRequestLike: Partial<AnnouncementRequest>;
}

export const createUpdateAnnouncementActionAsync = async ({ id, announcementRequestLike }: Options): Promise<AnnouncementResponse> => {
    await sleep();

    const isCreating = id === "new";

    if (VITE_ENVIRONMENT === "mockable") {
        return {
            ...announcementRequestLike,
            id: isCreating ? generateTemporalId() : id,
        } as AnnouncementResponse;
    }

    const { data } = await api<AnnouncementResponse>({
        url: isCreating ? "/announcements" : `/announcements/${id}`,
        method: isCreating ? "POST" : "PATCH",
        data: announcementRequestLike
    });

    return {
        ...data,
    };
}
