import { api } from "@/api/client";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { sleep } from "@/lib/utils";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    name?: string,
    status?: boolean,
}

export const getPagedAcademicLevelsActionAsync = async ({ 
    query = '', 
    page = 1, 
    pageSize = 1,
    name,
    status,
}: Options): Promise<PagedResponse<AcademicLevel>> => {
    await sleep();

    const { data } = await api.get<PagedResponse<AcademicLevel>>('/academic-levels/paged-academic-levels.json', {
        params: {
            q: query,
            page,
            pageSize,
            name,
            status,
        }
    });

    return {
        ...data
    };
}
