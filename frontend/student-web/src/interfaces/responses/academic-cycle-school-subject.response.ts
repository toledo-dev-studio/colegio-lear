import type { SchoolSubjectResponse } from "./school-subject.response";

/**
 * Type: Response
 * Description: Represents a school subject associated to an academic cycle (the cycle's own subject catalog), including optional observations from the school about that subject within the cycle.
 */
export interface AcademicCycleSchoolSubjectResponse {
    /**
     * Identifier of the academic cycle school subject record
     */
    id: string;
    /**
     * Identifier of the associated academic cycle
     */
    academicCycleId: string;
    /**
     * Identifier of the associated school subject
     */
    schoolSubjectId: string;
    /**
     * Optional observations from the school about the subject within the cycle
     */
    observations?: string;
    /**
     * Reference to the associated school subject
     */
    schoolSubject?: SchoolSubjectResponse;
}
