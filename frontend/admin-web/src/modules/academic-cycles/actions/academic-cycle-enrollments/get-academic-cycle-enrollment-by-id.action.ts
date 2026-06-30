import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";

interface Options {
    id: string;
    academicCycleSchoolGroupId: string;
    academicCycleId: string;
}

export const getAcademicCycleEnrollmentByIdActionAsync = async ({ id, academicCycleSchoolGroupId, academicCycleId }: Options): Promise<AcademicCycleEnrollmentResponse> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        const { data } = await api.get<AcademicCycleEnrollmentResponse[]>("http://localhost/api/academic-cycles/academic-cycles/academic-cycles.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<AcademicCycleEnrollmentResponse>(`/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/enrollments/${id}`);

    return data;
}
