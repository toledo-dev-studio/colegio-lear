import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    id: string;
    academicCycleId: string;
}

export const deleteAcademicCycleSchoolSubjectByIdActionAsync = async ({ id, academicCycleId }: Options): Promise<Options> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development")
        return { id, academicCycleId };

    await api.delete(`/academic-cycles/${academicCycleId}/school-subjects/${id}`);
    return { id, academicCycleId };
}
