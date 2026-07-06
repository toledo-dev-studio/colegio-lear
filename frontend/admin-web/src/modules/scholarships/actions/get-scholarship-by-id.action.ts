import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { ScholarshipResponse } from "@/interfaces/responses/scholarship.response";

interface Options {
    id: string;
}

export const getScholarshipByIdActionAsync = async ({ id }: Options): Promise<ScholarshipResponse> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<ScholarshipResponse[]>(`/scholarships/scholarships.json`);
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error('No se encontró el registro solicitado');
        return record;
    }

    const { data } = await api.get<ScholarshipResponse>(`/scholarships/${id}`);
    
    return data;
}
