import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { FinancialSummaryResponse } from "@/interfaces/responses/dashboard.response";

export const getFinancialSummaryAsync = async (): Promise<FinancialSummaryResponse> => {
    await sleep();

    let endpoint = "/dashboard/financial";

    if (IS_MOCKABLE)
        endpoint = "/dashboard/financial-summary.json";

    const { data } = await api.get<FinancialSummaryResponse>(endpoint);

    return data;
}
