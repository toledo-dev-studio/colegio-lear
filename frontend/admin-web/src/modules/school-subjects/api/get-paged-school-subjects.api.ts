import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { SchoolSubjectFilter } from "@/interfaces/filters/school-subject.filter";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";

interface Options extends SchoolSubjectFilter {
    query?: string;
    page?: number;
    pageSize?: number;
}

export const getPagedSchoolSubjectsAsync = async ({ query, page = 1, pageSize = 1, name, isActive, academicLevelId, educationLevelId }: Options): Promise<PagedResponse<SchoolSubjectResponse>> => {
    await sleep();

    let endpoint = "/school-subjects/paged";

    if (IS_MOCKABLE)
        endpoint = "/school-subjects/paged-school-subjects.json";

    const { data } = await api.get<PagedResponse<SchoolSubjectResponse>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            name,
            isActive,
            academicLevelId,
            educationLevelId,
        }
    });

    return {
        ...data
    };
}
