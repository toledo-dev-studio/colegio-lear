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

    if (IS_MOCKABLE) {
        const { data } = await api.get<AcademicCycleSchoolGroupTeacherResponse[]>("/grades/teachers.json");
        return data;
    }

    const { data } = await api.get<AcademicCycleSchoolGroupTeacherResponse[]>(`/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/teachers`);

    return data;
}
