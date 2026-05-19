import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Scholarship } from "@/interfaces/entites/scholarship";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const getScholarshipByIdActionAsync = async (id?: string): Promise<Scholarship> => {
    await sleep();

    if (!id)
        throw new Error('El identificador del registro es requerido');

    if (id === 'new') {
        return {
            id: undefined,
            name: '',
            description: '',
            status: true
        } as unknown as Scholarship;
    }

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<Scholarship[]>(`/scholarships/scholarships.json`);
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error('No se encontró el registro solicitado');
        return record;
    }

    const { data } = await api.get<Scholarship>(`/scholarships/${id}`);
    return data;
}
