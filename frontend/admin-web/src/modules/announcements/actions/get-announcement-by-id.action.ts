import { api } from "@/api/client";
import { sleep } from "@/lib/utils";
import type { Announcement } from "@/interfaces/entites/announcement";

export const getAnnouncementByIdActionAsync = async (id: string): Promise<Announcement> => {
    if (!id)
        throw new Error('Id del registro es requerido');

    if(id === "new") {
        return {
            id: "new",
            name: "",
            description: "",
            content: "",
            expiresAt: "",
            publishedAt: "",
            status: true,
        }
    }

    await sleep();

    // const { data } = await api.get<Announcement>(`/announcements/${id}.json`);

    const { data } = await api.get<Announcement[]>(`/announcements/announcements.json`);
        
        // DELETE THIS LOGIC
        const response = data.find(item => item.id === id);
        if (!response)
            throw new Error('No fue posible identificar el registro solicitado');
        // DELETE THIS LOGIC

    return {
        ...response
    };
}
