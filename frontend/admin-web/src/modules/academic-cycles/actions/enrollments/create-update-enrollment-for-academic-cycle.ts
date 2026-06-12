import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolGroupEnrollment } from "@/interfaces/entites/academic-cycle-school-group-enrollment";

interface Options {
    enrollmentLike: Partial<AcademicCycleSchoolGroupEnrollment>
}

export const createUpdateEnrollmentForAcademicCycleActionAsync = async ({ enrollmentLike }: Options): Promise<AcademicCycleSchoolGroupEnrollment> => {
    await sleep();

    const { id, academicCycleId, academicCycleSchoolGroupId } = enrollmentLike;
    const isCreating = id === undefined;
    
    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        enrollmentLike.id = isCreating ? generateTemporalId() : id;
        return enrollmentLike as AcademicCycleSchoolGroupEnrollment;
    }

    const { data } = await api<AcademicCycleSchoolGroupEnrollment>({
        url: isCreating 
            ? `/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/enrollments` 
            : `/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/enrollments/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: { ...enrollmentLike }
    });

    return {
        ...data,
    };
}
