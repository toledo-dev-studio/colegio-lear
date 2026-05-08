import { api } from "@/api/client";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { sleep } from "@/lib/utils";

interface Options {
    query?: string;
    status?: boolean,
    page?: number;
    pageSize?: number;
}

export const getPagedAcademicLevelsActionAsync = async ({ query = '', status = true, page = 1, pageSize = 1 }: Options): Promise<PagedResponse<AcademicLevel>> => {
    await sleep();

    const { data } = await api.get<PagedResponse<AcademicLevel>>('/academic-levels/paged-academic-levels.json', {
        params: {
            q: query,
            status,
            page,
            pageSize,
        }
    });

    return {
        ...data
    };
}
