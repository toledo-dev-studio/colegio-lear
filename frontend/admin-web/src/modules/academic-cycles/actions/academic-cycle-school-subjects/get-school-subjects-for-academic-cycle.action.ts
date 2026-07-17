import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolSubjectResponse } from "@/interfaces/responses/academic-cycle-school-subject.response";

interface Options {
    query?: string;
    academicCycleId: string;
}

export const getAcademicCycleSchoolSubjectsActionAsync = async ({ query, academicCycleId }: Options): Promise<AcademicCycleSchoolSubjectResponse[]> => {
    await sleep();

    let endpoint = `/academic-cycles/${academicCycleId}/school-subjects`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-cycles/school-subjects/school-subjects.json";

    const { data } = await api.get<AcademicCycleSchoolSubjectResponse[]>(endpoint, {
        params: {
            q: query
        }
    });

    return data;
}
