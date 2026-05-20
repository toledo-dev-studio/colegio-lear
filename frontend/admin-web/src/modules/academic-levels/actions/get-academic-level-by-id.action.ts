import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const getAcademicLevelByIdAction = async (id?: string): Promise<AcademicLevel> => {
    await sleep();

    if (!id)
        throw new Error('El identificador del registro es requerido');

    if (id === 'new') {
        return {
            id: undefined,
            name: '',
            description: '',
            status: true
        } as unknown as AcademicLevel;
    }

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<AcademicLevel[]>("/academic-levels/academic-levels.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error('No se encontró el registro solicitado');
        return record;
    }

    const { data } = await api.get<AcademicLevel>(`/academic-levels/${id}`);

    return data;
}
