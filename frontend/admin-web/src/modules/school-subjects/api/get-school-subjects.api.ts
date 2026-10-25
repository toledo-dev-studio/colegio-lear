import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { SchoolSubjectFilter } from "@/interfaces/filters/school-subject.filter";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";

interface Options extends SchoolSubjectFilter {
    query?: string;
}


export const getSchoolSubjectsAsync = async ({ query, name, isActive, academicLevelId, educationLevelId }: Options): Promise<SchoolSubjectResponse[]> => {
    await sleep();

    let endpoint = "/school-subjects";

    if (IS_MOCKABLE)
        endpoint = "/school-subjects/school-subjects.json";

    const { data } = await api.get<SchoolSubjectResponse[]>(endpoint, {
        params: {
            q: query,
            name,
            isActive,
            academicLevelId,
            educationLevelId
        }
    });

    return data;
}