import type { SchoolSubjectRequest } from "./school-subject.request";

/**
 * Type: Request
 * Description: Represents the association between an academic cycle group and a school subject, containing details about the status of the association, observations, and references to related entities such as the academic cycle, academic cycle group, school subject, and teacher.
 * This entity is used to manage the subjects taught in each academic cycle group, allowing for better organization of the curriculum and assignment of teachers to specific subjects within each group.
 */
export interface AcademicCycleSchoolSubjectRequest {
    /**
     * Additional information about academic cycle school subject
     */
    observations?: string;
    /**
     * Identifier of the associated academic cycle
     */
    academicCycleId: string;
    /**
     * Identifier of the associated school subject
     */
    schoolSubjectId: string;
    /**
     * Reference to the associated school subject
     */
    schoolSubject?: SchoolSubjectRequest;
}
