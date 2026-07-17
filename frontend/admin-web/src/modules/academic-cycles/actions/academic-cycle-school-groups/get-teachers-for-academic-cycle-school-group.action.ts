import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolGroupTeacherResponse } from "@/interfaces/responses/academic-cycle-school-group-teacher.response";

interface Options {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
}

export const getTeachersForAcademicCycleSchoolGroupActionAsync = async ({ academicCycleId, academicCycleSchoolGroupId }: Options): Promise<AcademicCycleSchoolGroupTeacherResponse[]> => {
    await sleep();

    let endpoint = `/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/teachers`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-cycles/school-groups/teachers.json";

    const { data } = await api.get<AcademicCycleSchoolGroupTeacherResponse[]>(endpoint);

    return data;
}
