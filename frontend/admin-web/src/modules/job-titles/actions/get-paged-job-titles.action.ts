import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { JobTitleTypes } from "@/interfaces/entites/job-title";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { JobTitleResponse } from "@/interfaces/responses/job-title.response";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    jobTitleType?: JobTitleTypes;
    isActive?: boolean,
}

export const getPagedJobTitlesActionAsync = async ({ query, page = 1, pageSize = 1, name, jobTitleType, isActive, }: Options): Promise<PagedResponse<JobTitleResponse>> => {
    await sleep();

    let endpoint = "/job-titles/paged";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/job-titles/paged-job-titles.json";

    const { data } = await api.get<PagedResponse<JobTitleResponse>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            name,
            jobTitleType,
            isActive,
        }
    });

    return {
        ...data
    };
}
