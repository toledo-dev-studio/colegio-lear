import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolSubject } from "@/interfaces/entites/academic-cycle-school-subject";

interface Options {
    academicCycleId: string;
}

export const getSchoolSubjectsForAcademicCycleActionAsync = async ({ academicCycleId }: Options): Promise<AcademicCycleSchoolSubject[]> => {
    await sleep();

    if (!academicCycleId)
        throw new Error("El identificador del registro es requerido");

    let endpoint = `/academic-cycles/${academicCycleId}/school-subjects`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-cycles/school-subjects/school-subjects.json";

    // REMOVE
    endpoint = "http://localhost/api/academic-cycles/school-subjects/school-subjects.json";

    const { data } = await api.get<AcademicCycleSchoolSubject[]>(endpoint);

    return data;
}
