import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Announcement } from "@/interfaces/entites/announcement";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const createUpdateAnnouncementActionAsync = async (announcementLike: Partial<Announcement>): Promise<Announcement> => {
    await sleep();

    const { id } = announcementLike;
    const isCreating = id?.startsWith("new_");

    if (VITE_ENVIRONMENT === "mockable") {
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
