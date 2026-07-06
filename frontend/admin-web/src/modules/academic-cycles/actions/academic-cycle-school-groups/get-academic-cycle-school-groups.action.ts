import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolGroupResponse } from "@/interfaces/responses/academic-cycle-school-group.response";

interface Options {
    query?: string;
    academicCycleId: string;
}


export const getAcademicCycleSchoolGroupsActionAsync = async ({ query, academicCycleId }: Options): Promise<AcademicCycleSchoolGroupResponse[]> => {
    await sleep();

    let endpoint = `/academic-cycles/${academicCycleId}/school-groups`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-cycles/school-groups/school-groups.json";

    // REMOVE
    endpoint = "http://localhost/api/academic-cycles/school-groups/school-groups.json";

    const { data } = await api.get<AcademicCycleSchoolGroupResponse[]>(endpoint, {
        params: {
            q: query
        }
    });

    return data;
}
