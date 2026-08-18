import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AnnouncementRequest } from "@/interfaces/requests/announcement.request";
import type { AnnouncementResponse } from "@/interfaces/responses/announcement.response";

interface Options {
    id: string;
    announcementRequestLike: Partial<AnnouncementRequest>;
}

export const createUpdateAnnouncementAsync = async ({ id, announcementRequestLike }: Options): Promise<AnnouncementResponse> => {
    await sleep();

    const isCreating = id === "new";

    if (IS_MOCKABLE) {
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
