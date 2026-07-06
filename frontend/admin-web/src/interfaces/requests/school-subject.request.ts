import type { AcademicLevelRequest } from "./academic-level.request";
import type { EducationLevelRequest } from "./education-level.request";

/**
 * Type: Request
 * Description: Represents a school subject within the school, containing details about the subject's name, description, status, and references to related academic and education levels.
 */
export interface SchoolSubjectRequest {
    /**
     * Name of the school subject
     */
    name: string;
    /**
     * Description of the school subject
     */
    description?: string;
    /**
     * Indicates if the school subject is active
     */
    isActive: boolean;
    /**
     * Unique identifier for the associated academic level
     */
    academicLevelId: string;
    /**
     * Reference to the associated academic level
     */
    academicLevel?: Partial<AcademicLevelRequest>;
    /**
     * Unique identifier for the associated education level
     */
    educationLevelId: string;
    /**
     * Reference to the associated education level
     */
    educationLevel?: Partial<EducationLevelRequest>;
}
