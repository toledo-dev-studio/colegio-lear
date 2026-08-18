import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { JobTitleResponse } from "@/interfaces/responses/job-title.response";

interface Options {
    id: string;
}

export const getJobTitleByIdAsync = async ({ id }: Options): Promise<JobTitleResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<JobTitleResponse[]>("/job-titles/job-titles.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<JobTitleResponse>(`/job-titles/${id}`);

    return data;
}
