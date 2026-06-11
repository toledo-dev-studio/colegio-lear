import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentEnrollment } from "@/interfaces/entites/student-enrollment";

interface Options {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
}

export const getEnrollmentsForAcademicCycleActionAsync = async ({ academicCycleId, academicCycleSchoolGroupId }: Options): Promise<StudentEnrollment[]> => {
    await sleep();

    if (!academicCycleId)
        throw new Error("El identificador del registro es requerido");

    let endpoint = `/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/enrollments`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-cycles/enrollments/enrollments.json";

    // REMOVE
    endpoint = "http://localhost/api/academic-cycles/enrollments/enrollments.json";

    const { data } = await api.get<StudentEnrollment[]>(endpoint);

    return data;
}
