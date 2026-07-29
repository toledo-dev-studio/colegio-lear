import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { FinancialSummaryResponse } from "@/interfaces/responses/dashboard.response";

export const getFinancialSummaryActionAsync = async (): Promise<FinancialSummaryResponse> => {
    await sleep();

    let endpoint = "/dashboard/financial";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/dashboard/financial-summary.json";

    const { data } = await api.get<FinancialSummaryResponse>(endpoint);

    return data;
}
