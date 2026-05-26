import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { JobTitle, JobTitleTypes } from "@/interfaces/entites/job-title";

interface Options {
    query?: string;
    name?: string;
    jobTitleType?: JobTitleTypes;
    status?: boolean
}

export const getJobTitlesActionAsync = async ({ query = '', name, jobTitleType, status }: Options): Promise<JobTitle[]> => {
    await sleep();

    let endpoint = "/job-titles";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/job-titles/job-titles.json";

    const { data } = await api.get<JobTitle[]>(endpoint, {
        params: {
            q: query,
            name,
            jobTitleType,
            status
        }
    });

    return data;
}
