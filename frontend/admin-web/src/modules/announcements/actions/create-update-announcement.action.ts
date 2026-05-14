import { api } from "@/api/client";
import { sleep } from "@/lib/utils";
import type { Announcement } from "@/interfaces/entites/announcement";

export const createUpdateAnnouncementActionAsync = async (announcementLike: Partial<Announcement>): Promise<Announcement> => {
    await sleep(500);

    const { id } = announcementLike;

    const isCreating = id === "new";

    const { data } = await api<Announcement>({
        url: isCreating ? '/announcements' : `/announcements/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: announcementLike
    });

    return {
        ...data,
    };
}
