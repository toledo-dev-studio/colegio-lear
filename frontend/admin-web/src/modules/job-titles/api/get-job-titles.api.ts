import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { JobTitleFilter } from "@/interfaces/filters/job-title.filter";
import type { JobTitleResponse } from "@/interfaces/responses/job-title.response";

interface Options extends JobTitleFilter {
    query?: string;
    name?: string;
}

export const getJobTitlesAsync = async ({ query, name, jobTitleType, isActive }: Options): Promise<JobTitleResponse[]> => {
    await sleep();

    let endpoint = "/job-titles";

    if (IS_MOCKABLE)
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
