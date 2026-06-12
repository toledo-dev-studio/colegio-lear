import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
    academicCycleSchoolGroupEnrollmentId: string;
}

export const deleteEnrollmentByIdForAcademicCycleActionAsync = async ({ academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolGroupEnrollmentId }: Options): Promise<Options> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development")
        return { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolGroupEnrollmentId };

    await api.delete(`/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/enrollments/${academicCycleSchoolGroupEnrollmentId}`);
    return { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolGroupEnrollmentId };
}
