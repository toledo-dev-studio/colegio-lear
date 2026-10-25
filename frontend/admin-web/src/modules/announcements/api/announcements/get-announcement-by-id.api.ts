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
        const { data } = await api.get<AnnouncementResponse[]>("/announcements/announcements.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<AnnouncementResponse>(`/announcements/${id}`);

    return data;
}
