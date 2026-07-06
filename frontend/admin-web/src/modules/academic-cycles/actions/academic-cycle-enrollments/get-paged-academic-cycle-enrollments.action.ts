import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { AcademicCycleEnrollmentFilter } from "@/interfaces/filters/academic-cycle-enrollment.filter";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";

interface Options extends AcademicCycleEnrollmentFilter {
    query?: string;
    page?: number;
    pageSize?: number;
}

export const getPagedAcademicCycleEnrollmentsActionAsync = async ({ query, page = 1, pageSize = 5, academicCycleId, academicCycleSchoolGroupId, scholarshipId, status }: Options): Promise<PagedResponse<AcademicCycleEnrollmentResponse>> => {
    await sleep();

    let endpoint = `/academic-cycles/${academicCycleId}/enrollments/paged`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-cycles/enrollments/paged-enrollments.json";

    // REMOVE
    endpoint = "http://localhost/api/academic-cycles/enrollments/paged-enrollments.json";

    const { data } = await api.get<PagedResponse<AcademicCycleEnrollmentResponse>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            status,
            academicCycleSchoolGroupId,
            scholarshipId
        }
    });

    return data;
}
