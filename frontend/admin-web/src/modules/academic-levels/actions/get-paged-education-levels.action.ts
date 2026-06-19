import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { EducationLevel } from "@/interfaces/entites/education-level";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { EducationLevelFilter } from "@/interfaces/filters/education-level.filter";

interface Options extends EducationLevelFilter {
    query?: string;
    page?: number;
    pageSize?: number;
    academicLevelId?: string;
    status?: boolean;
}

export const getPagedEducationLevelsActionAsync = async ({ query, page = 1, pageSize = 1, academicLevelId, status }: Options): Promise<PagedResponse<EducationLevel>> => {
    await sleep();

    let endpoint = "/academic-levels/education-levels/paged";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-levels/paged-academic-levels.json";

    const { data } = await api.get<PagedResponse<EducationLevel>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            academicLevelId,
            status,
        }
    });

    return {
        ...data
    };
}
