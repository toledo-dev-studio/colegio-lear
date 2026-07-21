import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { SystemSummaryResponse } from "@/interfaces/responses/dashboard.response";

export const getSystemSummaryActionAsync = async (): Promise<SystemSummaryResponse> => {
    await sleep();

    let endpoint = "/dashboard/system";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/dashboard/system-summary.json";

    // REMOVE MOCKABLE
    endpoint = "http://localhost/api/dashboard/system-summary.json"

    const { data } = await api.get<SystemSummaryResponse>(endpoint);

    return data;
}
