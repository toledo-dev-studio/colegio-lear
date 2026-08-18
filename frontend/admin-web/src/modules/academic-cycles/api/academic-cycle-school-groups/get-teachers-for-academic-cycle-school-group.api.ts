import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolGroupTeacherResponse } from "@/interfaces/responses/academic-cycle-school-group-teacher.response";

interface Options {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
}

export const getTeachersForAcademicCycleSchoolGroupAsync = async ({ academicCycleId, academicCycleSchoolGroupId }: Options): Promise<AcademicCycleSchoolGroupTeacherResponse[]> => {
    await sleep();

    let endpoint = `/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/teachers`;

    if (IS_MOCKABLE)
        endpoint = "/academic-cycles/school-groups/teachers.json";

    const { data } = await api.get<AcademicCycleSchoolGroupTeacherResponse[]>(endpoint);

    return data;
}
