import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";

interface Options {
    id: string;
    academicCycleId: string;
}

export const getAcademicCycleEnrollmentByIdAsync = async ({ id, academicCycleId }: Options): Promise<AcademicCycleEnrollmentResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<AcademicCycleEnrollmentResponse[]>("/academic-cycles/enrollments/enrollments.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<AcademicCycleEnrollmentResponse>(`/academic-cycles/${academicCycleId}/enrollments/${id}`);

    return data;
}
