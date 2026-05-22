import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import type { Announcement } from "@/interfaces/entites/announcement";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const createUpdateAnnouncementActionAsync = async (announcementLike: Partial<Announcement>): Promise<Announcement> => {
    await sleep();

    const { id } = announcementLike;
    const isCreating = id === undefined;

    if (VITE_ENVIRONMENT === "mockable") {
        announcementLike.id = isCreating ? generateTemporalId() : id;
        return announcementLike as Announcement;
    }

    const { data } = await api<Announcement>({
        url: isCreating ? '/announcements' : `/announcements/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: announcementLike
    });

    return {
        ...data,
    };
}
