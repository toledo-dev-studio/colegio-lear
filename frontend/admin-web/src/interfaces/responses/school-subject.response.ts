import type { AcademicLevelResponse } from "./academic-level.response";
import type { EducationLevelResponse } from "./education-level.response";

/**
 * Type: Response
 * Description: Represents a school subject within the school, containing details about the subject's name, description, status, and references to related academic and education levels.
 */
export interface SchoolSubjectResponse {
    /**
     * Unique identifier for the school subject
     */
    id: string;
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
    academicLevel?: Partial<AcademicLevelResponse>;
    /**
     * Unique identifier for the associated education level
     */
    educationLevelId: string;
    /**
     * Reference to the associated education level
     */
    educationLevel?: Partial<EducationLevelResponse>;
}
