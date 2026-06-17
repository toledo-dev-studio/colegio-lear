import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { JobTitleTypes } from "@/interfaces/entites/job-title";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { JobTitleResponse } from "@/interfaces/responses/job-title.response";

interface Options {
    query?: string;
    name?: string;
    jobTitleType?: JobTitleTypes;
    isActive?: boolean;
}

export const getJobTitlesActionAsync = async ({ query = '', name, jobTitleType, isActive }: Options): Promise<JobTitleResponse[]> => {
    await sleep();

    let endpoint = "/job-titles";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/job-titles/job-titles.json";

    const { data } = await api.get<JobTitleResponse[]>(endpoint, {
        params: {
            q: query,
            name,
            jobTitleType,
            isActive
        }
    });

    return data;
}
