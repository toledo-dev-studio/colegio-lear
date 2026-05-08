import { api } from "@/api/client";

import type { EducationLevel } from "@/interfaces/entites/education-level";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { sleep } from "@/lib/utils";

interface Options {
    query?: string;
    status?: boolean,
    page?: number;
    pageSize?: number;
    academicLevelId: string
}

export const getPagedEducationLevelsActionAsync = async ({ query = '', status = true, page = 1, pageSize = 1, academicLevelId }: Options): Promise<PagedResponse<EducationLevel>> => {
    await sleep();

    const { data } = await api.get<PagedResponse<EducationLevel>>('/academic-levels/paged-education-levels.json', {
        params: {
            q: query,
            status,
            page,
            pageSize,
            academicLevelId
        }
    });

    return {
        ...data
    };
}
