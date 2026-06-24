import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";

interface Options {
    id: string;
}

export const getAcademicCycleByIdActionAsync = async ({ id }: Options): Promise<AcademicCycleResponse> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        const { data } = await api.get<AcademicCycleResponse[]>("http://localhost/api/academic-cycles/academic-cycles/academic-cycles.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<AcademicCycleResponse>(`/academic-cycles/${id}`);

    return data;
}
