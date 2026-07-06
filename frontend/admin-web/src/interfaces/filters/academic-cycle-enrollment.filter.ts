import type { ScholarshipResponse } from "../responses/scholarship.response";
import type { AcademicCycleEnrollmentStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";
import type { AcademicCycleSchoolGroupResponse } from "../responses/academic-cycle-school-group.response";

/**
 * Type: Filter
 * Description: Represents the enrollment of a student in a specific academic cycle group, containing details about the enrollment status, related entities, and timestamps for record management.
 */
export interface AcademicCycleEnrollmentFilter {
    /**
     * Current status of the student group enrollment
     */
    status?: AcademicCycleEnrollmentStatusKey;
    /**
     * Identifier of the associated academic cycle
     */
    academicCycleId?: string;
    /**
     * Identifier of the associated academic cycle group
     */
    academicCycleSchoolGroupId?: string;
    /**
     * Reference to the associated academic cycle group
     */
    academicCycleSchoolGroup?: Partial<AcademicCycleSchoolGroupResponse>
    /**
     * Identifier of the scholarship associated with the student group enrollment, if applicable
     */
    scholarshipId?: string;
    /**
     * Reference to the scholarship associated with the student group enrollment, if applicable
     */
    scholarship?: Partial<ScholarshipResponse>
}
