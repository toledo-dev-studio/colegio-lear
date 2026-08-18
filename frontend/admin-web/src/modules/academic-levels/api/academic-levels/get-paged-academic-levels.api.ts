import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { AcademicLevelFilter } from "@/interfaces/filters/academic-level.filter";
import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";

interface Options extends AcademicLevelFilter {
    query?: string;
    page?: number;
    pageSize?: number;
}

export const getPagedAcademicLevelsAsync = async ({ query, page = 1, pageSize = 1, name, isActive }: Options): Promise<PagedResponse<AcademicLevelResponse>> => {
    await sleep();

    let endpoint = "/academic-levels/paged";

    if (IS_MOCKABLE)
        endpoint = "/academic-levels/paged-academic-levels.json";

    const { data } = await api.get<PagedResponse<AcademicLevelResponse>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            name,
            isActive
        }
    });

    return {
        ...data
    };
}
