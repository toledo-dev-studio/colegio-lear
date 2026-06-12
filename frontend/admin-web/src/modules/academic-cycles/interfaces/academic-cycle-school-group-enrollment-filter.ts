import type { AcademicCycleSchoolGroupEnrollmentStatusKey } from "@/types/KeyValuePair";

/**
 * Represents the filter interface for for academic cycle school group enrollments.
 */
export interface AcademicCycleSchoolGroupEnrollmentFilter {
    /**
     * Optional - Query filter for academic cycle school group enrollments
     */
    query?: string;
    /**
     * Optional - Current status of the student group enrollment
     */
    status?: AcademicCycleSchoolGroupEnrollmentStatusKey;
    /**
     * Required - Identifier of the associated academic cycle group
     */
    academicCycleSchoolGroupId: string;

}