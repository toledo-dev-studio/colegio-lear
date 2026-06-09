import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolGroup } from "@/interfaces/entites/academic-cycle-school-group";

interface Options {
    academicCycleId: string;
}

export const getSchoolGroupsForAcademicCycleActionAsync = async ({ academicCycleId }: Options): Promise<AcademicCycleSchoolGroup[]> => {
    await sleep();

    if (!academicCycleId)
        throw new Error("El identificador del registro es requerido");

    let endpoint = `/academic-cycles/${academicCycleId}/school-groups`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-cycles/school-groups/school-groups.json";

    // REMOVE
    endpoint = "http://localhost/api/academic-cycles/school-groups/school-groups.json";

    const { data } = await api.get<AcademicCycleSchoolGroup[]>(endpoint);

    return data;
}
