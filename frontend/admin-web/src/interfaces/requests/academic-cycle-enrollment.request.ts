
import type { StudentRequest } from "./student.request";
import type { ScholarshipRequest } from "./scholarship.request";
import type { AcademicCycleEnrollmentStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";

/**
 * Type: Request
 * Description: Represents the enrollment of a student in a specific academic cycle group, containing details about the enrollment status, related entities, and timestamps for record management.
 */
export interface AcademicCycleEnrollmentRequest {
    /**
     * Current status of the student group enrollment
     */
    status: AcademicCycleEnrollmentStatusKey;
    /**
     * Additional notes about the student group enrollment
     */
    observations?: string;
    /**
     * Notes about "dropped" status for a student.
     */
    droppedNotes?: string;
    /**
     * Identifier of the associated student
     */
    studentId: string;
    /**
     * Reference to the associated student
     */
    student?: StudentRequest;
    /**
     * Identifier of the associated academic cycle
     */
    academicCycleId: string;
    /**
     * Identifier of the associated academic cycle group
     */
    academicCycleSchoolGroupId: string;
    /**
     * Identifier of the scholarship associated with the student group enrollment, if applicable
     */
    scholarshipId?: string;
    /**
     * Reference to the scholarship associated with the student group enrollment, if applicable
     */
    scholarship?: ScholarshipRequest;
}
