import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { EducationLevelFilter } from "@/interfaces/filters/education-level.filter";
import type { EducationLevelResponse } from "@/interfaces/responses/education-level.response";

interface Options extends EducationLevelFilter {
    query?: string;
    page?: number;
    pageSize?: number;
}

export const getPagedEducationLevelsActionAsync = async ({ query, page = 1, pageSize = 1, academicLevelId, name, isActive }: Options): Promise<PagedResponse<EducationLevelResponse>> => {
    await sleep();

    let endpoint = "/academic-levels/education-levels/paged";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-levels/paged-academic-levels.json";

    const { data } = await api.get<PagedResponse<EducationLevelResponse>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            academicLevelId,
            name,
            isActive,
        }
    });

    return {
        ...data
    };
}
