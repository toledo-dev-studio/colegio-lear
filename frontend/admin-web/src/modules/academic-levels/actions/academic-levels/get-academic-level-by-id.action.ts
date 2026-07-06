import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";

interface Options {
    id: string;
}

export const getAcademicLevelByIdActionAsync = async ({ id }: Options): Promise<AcademicLevelResponse> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<AcademicLevelResponse[]>("/academic-levels/academic-levels.json");
        const response = data.find(item => item.id === id);
        if (!response)
            throw new Error("No se encontró el registro solicitado");
        return response;
    }

    const { data } = await api.get<AcademicLevelResponse>(`/academic-levels/${id}`);

    return data;
}
