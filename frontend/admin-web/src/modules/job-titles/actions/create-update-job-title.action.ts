import { api } from "@/api/client";

import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import type { JobTitle } from "@/interfaces/entites/job-title";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const CreateUpdateJobTitleActionAsync = async (jobTitleLike: Partial<JobTitle>): Promise<JobTitle> => {
    await sleep();

    const { id } = jobTitleLike;
    const isCreating = id === undefined;

    if (VITE_ENVIRONMENT === "mockable") {
        delete jobTitleLike.id;
        return {
            id: isCreating ? generateTemporalId() : id,
            ...jobTitleLike,
        } as JobTitle;
    }

    const { data } = await api<JobTitle>({
        url: isCreating ? '/job-titles' : `/job-titles/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: jobTitleLike
    });

    return {
        ...data,
    };
}
