import { api } from "@/api/client";
import { sleep } from "@/lib/utils";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { JobTitle, JobTitleTypes } from "@/interfaces/entites/job-title.interface";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    jobTitleType?: JobTitleTypes;
    status?: boolean,
}

export const getPagedJobTitlesActionAsync = async ({ query = '', page = 1, pageSize = 1, name, jobTitleType, status, }: Options): Promise<PagedResponse<JobTitle>> => {
    await sleep();

    const { data } = await api.get<PagedResponse<JobTitle>>('/job-titles/paged-job-titles.json', {
        params: {
            q: query,
            page,
            pageSize,
            name,
            jobTitleType,
            status,
        }
    });

    return {
        ...data
    };
}
