import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { AcademicCycleFilter } from "@/interfaces/filters/academic-cycle.filter";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";

interface Options extends AcademicCycleFilter {
    query?: string;
    page?: number;
    pageSize?: number;
}

export const getPagedAcademicCyclesActionAsync = async (options: Options): Promise<PagedResponse<AcademicCycleResponse>> => {
    await sleep();

    const { query, page = 1, pageSize = 1, name, code, startDate, endDate, periodType, status, enrollmentOpen, academicLevelId, educationLevelId } = options;


    let endpoint = "/academic-cycles/paged";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-cycles/paged-academic-cycles.json";

    // REMOVE
    endpoint = "http://localhost/api/academic-cycles/academic-cycles/paged-academic-cycles.json";

    const { data } = await api.get<PagedResponse<AcademicCycleResponse>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            name,
            code,
            startDate,
            endDate,
            periodType,
            status,
            enrollmentOpen,
            academicLevelId,
            educationLevelId
        }
    });

    return {
        ...data
    };
}
