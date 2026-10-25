import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { StudentGradeResponse } from "@/interfaces/responses/student-grade.response";

interface Options {
    academicCycleSchoolGroupId: string;
    schoolSubjectId: string;
    academicCycleEnrollmentId: string;
    evaluationNumber: number;
    grade: number;
}

export const createUpdateSchoolSubjectGradeAsync = async ({ academicCycleSchoolGroupId, schoolSubjectId, academicCycleEnrollmentId, evaluationNumber, grade }: Options): Promise<StudentGradeResponse> => {
    await sleep();

    if (IS_MOCKABLE)
        return {
            id: generateTemporalId(),
            grade,
            evaluationNumber,
            schoolSubjectId,
            academicCycleEnrollmentId,
        };

    const { data } = await api.put<StudentGradeResponse>(`/me/school-groups/${academicCycleSchoolGroupId}/subjects/${schoolSubjectId}/grades`, {
        academicCycleEnrollmentId,
        evaluationNumber,
        grade,
    });

    return data;
}