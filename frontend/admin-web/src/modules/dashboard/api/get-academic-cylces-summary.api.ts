import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicCycleSummaryResponse } from "@/interfaces/responses/dashboard.response";

export const getAcademicCyclesSummaryAsync = async(): Promise<AcademicCycleSummaryResponse> => {
    await sleep();

    let endpoint = "/dashboard/academic-cycles";

    if (IS_MOCKABLE)
        endpoint = "/dashboard/academic-cycles-summary.json";

    const { data } = await api.get<AcademicCycleSummaryResponse>(endpoint);

    return data;
}
