import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicCycleEnrollmentFilter } from "@/interfaces/filters/academic-cycle-enrollment.filter";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";

interface Options extends AcademicCycleEnrollmentFilter {
    query?: string;
}

export const getAcademicCycleEnrollmentsAsync = async ({ query, academicCycleId, academicCycleSchoolGroupId, scholarshipId, status }: Options): Promise<AcademicCycleEnrollmentResponse[]> => {
    await sleep();

    let endpoint = `/academic-cycles/${academicCycleId}/enrollments`;

    if (IS_MOCKABLE)
        endpoint = "/academic-cycles/enrollments/enrollments.json";

    const { data } = await api.get<AcademicCycleEnrollmentResponse[]>(endpoint, {
        params: {
            q: query,
            status,
            academicCycleSchoolGroupId,
            scholarshipId
        }
    });

    return data;
}
