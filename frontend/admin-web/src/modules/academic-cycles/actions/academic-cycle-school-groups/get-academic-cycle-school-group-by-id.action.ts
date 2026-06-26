import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolGroupResponse } from "@/interfaces/responses/academic-cycle-school-group.response";

interface Options {
    id: string;
    academicCycleId: string;
}

export const getAcademicCycleSchoolGroupByIdActionAsync = async ({ id, academicCycleId }: Options): Promise<AcademicCycleSchoolGroupResponse> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        const { data } = await api.get<AcademicCycleSchoolGroupResponse[]>("http://localhost/api/academic-cycles/school-groups/school-groups.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<AcademicCycleSchoolGroupResponse>(`/academic-cycles/${academicCycleId}/school-groups/${id}`);

    return data;
}
