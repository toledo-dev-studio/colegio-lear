import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { StudentGradeResponse } from "@/interfaces/responses/student-grade.response";

interface Options {
    academicCycleSchoolGroupId: string;
    schoolSubjectId: string;
}

export const getSchoolSubjectGradesAsync = async ({ academicCycleSchoolGroupId, schoolSubjectId }: Options): Promise<StudentGradeResponse[]> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<StudentGradeResponse[]>("/my-classes/school-subject-grades.json");
        return data.filter(grade => grade.schoolSubjectId === schoolSubjectId);
    }

    const { data } = await api.get<StudentGradeResponse[]>(`/me/school-groups/${academicCycleSchoolGroupId}/subjects/${schoolSubjectId}/grades`);

    return data;
}