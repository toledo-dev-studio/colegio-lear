import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
    enrollmentId: string;
}

export const deleteEnrollmentByIdForAcademicCycleActionAsync = async ({ academicCycleId, academicCycleSchoolGroupId, enrollmentId }: Options): Promise<Options> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development")
        return { academicCycleId, academicCycleSchoolGroupId, enrollmentId };

    await api.delete(`/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/enrollments/${enrollmentId}`);
    return { academicCycleId, academicCycleSchoolGroupId, enrollmentId };
}
