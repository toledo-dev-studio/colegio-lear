import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { AcademicCycleSchoolGroupEnrollment } from "@/interfaces/entites/academic-cycle-school-group-enrollment";
import type { AcademicCycleSchoolGroupEnrollmentStatusKey } from "@/types/KeyValuePair";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    academicCycleId?: string;
    academicCycleSchoolGroupId?: string;
    academicCycleSchoolGroupEnrollmentStatus?: AcademicCycleSchoolGroupEnrollmentStatusKey
}

export const getPagedEnrollmentsForAcademicCycleActionAsync = async ({ query, page = 1, pageSize = 5, academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolGroupEnrollmentStatus }: Options): Promise<PagedResponse<AcademicCycleSchoolGroupEnrollment>> => {
    await sleep();

    if (!academicCycleId || !academicCycleSchoolGroupId)
        throw new Error("El identificador del registro es requerido");

    let endpoint = `/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/enrollments/paged`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-cycles/enrollments/enrollments.json";

    // REMOVE
    endpoint = "http://localhost/api/academic-cycles/enrollments/enrollments.json";

    const { data } = await api.get<PagedResponse<AcademicCycleSchoolGroupEnrollment>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            academicCycleSchoolGroupEnrollmentStatus
        }
    });

    return data;
}
