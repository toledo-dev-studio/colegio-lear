import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const deleteAnnouncementByIdActionAsync = async (id: string): Promise<string> => {
    await sleep();
    
    if (VITE_ENVIRONMENT === "mockable")
            return id;

    await api.delete(`/announcements/${id}`);
    return id;
}
