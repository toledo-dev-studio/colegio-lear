import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentGradeResponse } from "@/interfaces/responses/student-grade.response";

interface Options {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
}

export const getStudentGradesActionAsync = async ({ academicCycleId, academicCycleEnrollmentId }: Options): Promise<StudentGradeResponse[]> => {
    await sleep();

    let endpoint = `/academic-cycles/${academicCycleId}/enrollments/${academicCycleEnrollmentId}/grades`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/students/student-grades/student-grades.json";

    // REMOVE
    endpoint = "http://localhost/api/students/student-grades/student-grades.json";

    const { data } = await api.get<StudentGradeResponse[]>(endpoint);
    
    return data;
}
