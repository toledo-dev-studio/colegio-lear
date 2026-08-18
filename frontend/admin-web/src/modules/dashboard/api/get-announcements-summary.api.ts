import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AnnouncementSummaryResponse } from "@/interfaces/responses/dashboard.response";

export const getAnnouncementsSummaryAsync = async (): Promise<AnnouncementSummaryResponse> => {
    await sleep();

    let endpoint = "/dashboard/announcements";

    if (IS_MOCKABLE)
        endpoint = "/dashboard/announcement-summary.json";

    const { data } = await api.get<AnnouncementSummaryResponse>(endpoint);

    return data;
}
