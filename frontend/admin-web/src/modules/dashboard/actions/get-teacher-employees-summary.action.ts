import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { TeacherEmployeeSummaryResponse } from "@/interfaces/responses/dashboard.response";

export const getTeacherEmployeesSummaryActionAsync = async (): Promise<TeacherEmployeeSummaryResponse> => {
    await sleep();

    let endpoint = "/dashboard/teacher-employees";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/dashboard/teacher-employees-summary.json";

    const { data } = await api.get<TeacherEmployeeSummaryResponse>(endpoint);

    return data;
}
