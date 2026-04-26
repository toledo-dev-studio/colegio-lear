import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { JobTitle } from "@/interfaces/entites/job-title.interface";

interface Options {
    query?: string;
    status?: boolean
}

export const getJobTitlesActionAsync = async ({ query = '', status = true }: Options): Promise<JobTitle[]> => {
    await sleep();

    const { data } = await api.get<JobTitle[]>('/job-titles.json', {
        params: {
            q: query,
            status
        }
    });

    return data;
}
