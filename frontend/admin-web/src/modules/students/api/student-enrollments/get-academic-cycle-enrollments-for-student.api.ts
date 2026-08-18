import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";

interface Options {
    studentId: string;
}

export const getAcademicCycleEnrollmentsForStudentAsync = async ({ studentId }: Options): Promise<AcademicCycleEnrollmentResponse[]> => {
    await sleep();

    let endpoint = `/students/${studentId}/enrollments`;

    if (IS_MOCKABLE)
        endpoint = "/students/enrollments/enrollments.json";
    
    const { data } = await api.get<AcademicCycleEnrollmentResponse[]>(endpoint);
    
    return data;
}
