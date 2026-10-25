import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";

interface Options {
    id: string;
}

export const getAcademicCycleByIdAsync = async ({ id }: Options): Promise<AcademicCycleResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<AcademicCycleResponse[]>("/academic-cycles/academic-cycles/academic-cycles.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<AcademicCycleResponse>(`/academic-cycles/${id}`);

    return data;
}
