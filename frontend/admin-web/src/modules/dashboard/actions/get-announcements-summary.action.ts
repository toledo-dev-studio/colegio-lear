import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AnnouncementSummaryResponse } from "@/interfaces/responses/dashboard.response";

export const getAnnouncementsSummaryActionAsync = async (): Promise<AnnouncementSummaryResponse> => {
    await sleep();

    let endpoint = "/dashboard/announcements";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/dashboard/announcement-summary.json";

    const { data } = await api.get<AnnouncementSummaryResponse>(endpoint);

    return data;
}
