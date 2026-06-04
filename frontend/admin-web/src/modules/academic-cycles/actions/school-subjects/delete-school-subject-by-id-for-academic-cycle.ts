import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    academicCycleId: string;
    academicCycleSchoolSubjectId: string;
}

export const deleteSchoolSubjectByIdForAcademicCycleActionAsync = async ({ academicCycleId, academicCycleSchoolSubjectId }: Options): Promise<Options> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development")
        return { academicCycleId, academicCycleSchoolSubjectId };

    await api.delete(`/academic-cycles/${academicCycleId}/school-subjects/${academicCycleSchoolSubjectId}}`);
    return { academicCycleId, academicCycleSchoolSubjectId };
}
