import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { SystemSummaryResponse } from "@/interfaces/responses/dashboard.response";

export const getSystemSummaryAsync = async (): Promise<SystemSummaryResponse> => {
    await sleep();

    let endpoint = "/dashboard/system";

    if (IS_MOCKABLE)
        endpoint = "/dashboard/system-summary.json";

    const { data } = await api.get<SystemSummaryResponse>(endpoint);

    return data;
}
