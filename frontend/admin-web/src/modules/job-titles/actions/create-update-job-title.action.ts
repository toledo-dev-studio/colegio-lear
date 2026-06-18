import { api } from "@/api/client";

import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { JobTitleRequest } from "@/interfaces/requests/job-title.request";
import type { JobTitleResponse } from "@/interfaces/responses/job-title.response";

interface Options {
    id: string;
    jobTitleRequestLike: Partial<JobTitleRequest>;
}

export const createUpdateJobTitleActionAsync = async ({ id, jobTitleRequestLike }: Options): Promise<JobTitleResponse> => {
    await sleep();

    const isCreating = id === "new";

    if (VITE_ENVIRONMENT === "mockable") {
        return {
            ...jobTitleRequestLike,
            id: isCreating ? generateTemporalId() : id,
        } as JobTitleResponse;
    }

    const { data } = await api<JobTitleResponse>({
        url: isCreating ? '/job-titles' : `/job-titles/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: jobTitleRequestLike
    });

    return {
        ...data,
    };
}
