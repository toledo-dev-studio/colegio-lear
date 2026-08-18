import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolSubjectResponse } from "@/interfaces/responses/academic-cycle-school-subject.response";

interface Options {
    query?: string;
    academicCycleId: string;
}

export const getAcademicCycleSchoolSubjectsAsync = async ({ query, academicCycleId }: Options): Promise<AcademicCycleSchoolSubjectResponse[]> => {
    await sleep();

    let endpoint = `/academic-cycles/${academicCycleId}/school-subjects`;

    if (IS_MOCKABLE)
        endpoint = "/academic-cycles/school-subjects/school-subjects.json";

    const { data } = await api.get<AcademicCycleSchoolSubjectResponse[]>(endpoint, {
        params: {
            q: query
        }
    });

    return data;
}
