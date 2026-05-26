import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { JobTitle, JobTitleTypes } from "@/interfaces/entites/job-title";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    jobTitleType?: JobTitleTypes;
    status?: boolean,
}

export const getPagedJobTitlesActionAsync = async ({ query, page = 1, pageSize = 1, name, jobTitleType, status, }: Options): Promise<PagedResponse<JobTitle>> => {
    await sleep();

    let endpoint = "/job-titles/paged";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/job-titles/paged-job-titles.json";

    const { data } = await api.get<PagedResponse<JobTitle>>(endpoint, {
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
