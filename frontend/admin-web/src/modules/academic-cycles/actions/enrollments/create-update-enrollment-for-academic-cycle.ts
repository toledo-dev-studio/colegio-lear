import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentEnrollment } from "@/interfaces/entites/student-enrollment";

interface Options {
    studentEnrollmentLike: Partial<StudentEnrollment>
}

export const createUpdateEnrollmentForAcademicCycleActionAsync = async ({ studentEnrollmentLike }: Options): Promise<StudentEnrollment> => {
    await sleep();

    const { id, academicCycleId, academicCycleSchoolGroupId } = studentEnrollmentLike;
    const isCreating = id === undefined;
    
    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        studentEnrollmentLike.id = isCreating ? generateTemporalId() : id;
        return studentEnrollmentLike as StudentEnrollment;
    }

    const { data } = await api<StudentEnrollment>({
        url: isCreating 
            ? `/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/enrollments` 
            : `/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/enrollments/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: { ...studentEnrollmentLike }
    });

    return {
        ...data,
    };
}
