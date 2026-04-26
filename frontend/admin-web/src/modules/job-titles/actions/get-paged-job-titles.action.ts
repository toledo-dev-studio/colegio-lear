import { api } from "@/api/client";
import type { JobTitle } from "@/interfaces/entites/job-title.interface";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { sleep } from "@/lib/utils";

interface Options {
    query?: string;
    status?: boolean,
    page?: number;
    pageSize?: number;
}

export const getPagedJobTitlesActionAsync = async ({ query = '', status = true, page = 1, pageSize = 1 }: Options): Promise<PagedResponse<JobTitle>> => {
    await sleep();

    const { data } = await api.get<PagedResponse<JobTitle>>('/paged-job-titles.json', {
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
