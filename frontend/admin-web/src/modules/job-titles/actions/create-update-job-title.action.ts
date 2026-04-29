import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { JobTitle } from "@/interfaces/entites/job-title.interface";

export const CreateUpdateJobTitleActionAsync = async (jobTitleLike: Partial<JobTitle>): Promise<JobTitle> => {
    await sleep();

    const { id } = jobTitleLike;

    const isCreating = id === "new";

    const { data } = await api<JobTitle>({
        url: isCreating ? '/job-titles' : `/job-titles/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: jobTitleLike
    });

    return {
        ...data,
    };
}
