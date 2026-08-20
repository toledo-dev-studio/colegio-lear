import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";

interface Options {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
}

export const getAcademicCycleEnrollmentsBySchoolGroupAsync = async ({ academicCycleId, academicCycleSchoolGroupId }: Options): Promise<AcademicCycleEnrollmentResponse[]> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<AcademicCycleEnrollmentResponse[]>("/academic-cycles/enrollments/enrollments.json");
        return data.filter(enrollment => enrollment.academicCycleSchoolGroupId === academicCycleSchoolGroupId && enrollment.status === "enrolled");
    }

    const { data } = await api.get<AcademicCycleEnrollmentResponse[]>(`/academic-cycles/${academicCycleId}/enrollments`, {
        params: {
            academicCycleSchoolGroupId,
            status: "enrolled"
        }
    });

    return data;
}