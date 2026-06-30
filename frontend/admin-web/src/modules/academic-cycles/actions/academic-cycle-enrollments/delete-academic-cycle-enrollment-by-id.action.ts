import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    id: string;
    academicCycleSchoolGroupId: string;
    academicCycleId: string;
}

export const deleteAcademicCycleEnrollmentByIdActionAsync = async ({ id, academicCycleSchoolGroupId, academicCycleId }: Options): Promise<Options> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development")
        return { id, academicCycleSchoolGroupId, academicCycleId };

    await api.delete(`/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/enrollments/${id}`);
    return { id, academicCycleSchoolGroupId, academicCycleId };
}
