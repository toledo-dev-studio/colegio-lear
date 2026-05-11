import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { JobTitle } from "@/interfaces/entites/job-title.interface";

interface Options {
    query?: string;
    name?: string;
    status?: boolean
}

export const getJobTitlesActionAsync = async ({ query = '', name, status }: Options): Promise<JobTitle[]> => {
    await sleep();

    const { data } = await api.get<JobTitle[]>('/job-titles/job-titles.json', {
        params: {
            q: query,
            name,
            status
        }
    });

    return data;
}
