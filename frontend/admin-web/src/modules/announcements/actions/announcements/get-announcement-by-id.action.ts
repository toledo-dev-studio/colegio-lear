import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Announcement } from "@/interfaces/entites/announcement";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import { generateTemporalId } from "@/lib/extensions/utils";

export const getAnnouncementByIdActionAsync = async (id?: string): Promise<Announcement> => {
    await sleep();

    if (!id)
        throw new Error("El identificador del registro es requerido");

    if (id === "new") {
        return {
            // Required generate a temporal id to upload files without announcement record created previously
            id: generateTemporalId(),
            name: "",
            description: "",
            content: "",
            expiresAt: "",
            publishedAt: "",
            audience: [],
            attachments: [],
            status: true,
        } as unknown as Announcement;
    }

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<Announcement[]>("/announcements/announcements.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<Announcement>(`/announcements/${id}`);

    return data;
}
