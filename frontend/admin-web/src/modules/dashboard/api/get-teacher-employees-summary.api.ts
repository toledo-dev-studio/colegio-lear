import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { TeacherEmployeeSummaryResponse } from "@/interfaces/responses/dashboard.response";

export const getTeacherEmployeesSummaryAsync = async (): Promise<TeacherEmployeeSummaryResponse> => {
    await sleep();

    let endpoint = "/dashboard/teacher-employees";

    if (IS_MOCKABLE)
        endpoint = "/dashboard/teacher-employees-summary.json";

    const { data } = await api.get<TeacherEmployeeSummaryResponse>(endpoint);

    return data;
}
