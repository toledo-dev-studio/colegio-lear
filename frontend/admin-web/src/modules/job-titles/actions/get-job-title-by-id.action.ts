import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { JobTitle } from "@/interfaces/entites/job-title";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const getJobTitleByIdActionAsync = async (id?: string): Promise<JobTitle> => {
    await sleep();

    if (!id)
        throw new Error('Id del puesto es requerido');

    if (id === 'new') {
        return {
            id: undefined,
            name: '',
            description: '',
            status: true
        } as unknown as JobTitle;
    }

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<JobTitle[]>("/job-titles/job-titles.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error('No se encontró el registro solicitado');
        return record;
    }

    const { data } = await api.get<JobTitle>(`/job-titles/${id}`);

    return data;
}
