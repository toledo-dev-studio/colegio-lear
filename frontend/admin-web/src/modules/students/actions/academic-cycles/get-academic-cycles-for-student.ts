import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolGroupEnrollment } from "@/interfaces/entites/academic-cycle-school-group-enrollment";

interface Options {
    studentId: string;
}

export const getAcademicCyclesForStudentActionAsync = async ({ studentId }: Options): Promise<AcademicCycleSchoolGroupEnrollment[]> => {
    await sleep();

    if (!studentId)
        throw new Error("El identificador del registro es requerido");

    let endpoint = `/students/${studentId}/academic-cycles`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/students/academic-cycles/academic-cycles.json";

    // REMOVE
    endpoint = "http://localhost/api/students/academic-cycles/academic-cycles.json";

    const { data } = await api.get<AcademicCycleSchoolGroupEnrollment[]>(endpoint);

    return data;
}
