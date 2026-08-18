import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { StudentGradeResponse } from "@/interfaces/responses/student-grade.response";

interface Options {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
}

export const getStudentGradesAsync = async ({ academicCycleId, academicCycleEnrollmentId }: Options): Promise<StudentGradeResponse[]> => {
    await sleep();

    let endpoint = `/academic-cycles/${academicCycleId}/enrollments/${academicCycleEnrollmentId}/grades`;

    if (IS_MOCKABLE)
        endpoint = "/students/student-grades/student-grades.json";

    const { data } = await api.get<StudentGradeResponse[]>(endpoint);
    
    return data;
}
