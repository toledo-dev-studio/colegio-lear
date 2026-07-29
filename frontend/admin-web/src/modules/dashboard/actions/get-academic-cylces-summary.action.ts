import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleSummaryResponse } from "@/interfaces/responses/dashboard.response";

export const getAcademicCyclesSummaryActionAsync = async(): Promise<AcademicCycleSummaryResponse> => {
    await sleep();

    let endpoint = "/dashboard/academic-cycles";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/dashboard/academic-cycles-summary.json";

    const { data } = await api.get<AcademicCycleSummaryResponse>(endpoint);

    return data;
}
