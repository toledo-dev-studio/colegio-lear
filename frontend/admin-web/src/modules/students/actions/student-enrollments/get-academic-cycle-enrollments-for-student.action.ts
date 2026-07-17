import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";

interface Options {
    studentId: string;
}

export const getAcademicCycleEnrollmentsForStudentActionAsync = async ({ studentId }: Options): Promise<AcademicCycleEnrollmentResponse[]> => {
    await sleep();

    let endpoint = `/students/${studentId}/enrollments`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/students/enrollments/enrollments.json";
    
    const { data } = await api.get<AcademicCycleEnrollmentResponse[]>(endpoint);

    return data;
}
