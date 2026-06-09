import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
}

export const deleteSchoolGroupByIdForAcademicCycleActionAsync = async ({ academicCycleId, academicCycleSchoolGroupId }: Options): Promise<Options> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development")
        return { academicCycleId, academicCycleSchoolGroupId };

    await api.delete(`/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}}`);
    return { academicCycleId, academicCycleSchoolGroupId };
}
