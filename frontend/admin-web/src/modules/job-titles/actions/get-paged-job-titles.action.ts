import { api } from "@/api/client";
import type { JobTitle } from "@/interfaces/entites/job-title.interface";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { sleep } from "@/lib/utils";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    status?: boolean,
}

export const getPagedJobTitlesActionAsync = async ({ query = '', page = 1, pageSize = 1, name, status, }: Options): Promise<PagedResponse<JobTitle>> => {
    await sleep();

    const { data } = await api.get<PagedResponse<JobTitle>>('/job-titles/paged-job-titles.json', {
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
