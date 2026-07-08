import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { JobTitleFilter } from "@/interfaces/filters/job-title.filter";
import type { JobTitleResponse } from "@/interfaces/responses/job-title.response";

interface Options extends JobTitleFilter {
    query?: string;
    page?: number;
    pageSize?: number;
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
