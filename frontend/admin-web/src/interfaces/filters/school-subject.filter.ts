import type { AcademicLevelFilter } from "./academic-level.filter";
import type { EducationLevelFilter } from "./education-level.filter";

/**
 * Type: Filter
 * Description: Represents a school subject within the school, containing details about the subject's name, description, status, and references to related academic and education levels.
 */
export interface SchoolSubjectFilter {
    /**
     * Name of the school subject
     */
    name?: string;
    /**
     * Indicates if the school subject is active
     */
    isActive?: boolean;
    /**
     * Unique identifier for the associated academic level
     */
    academicLevelId?: string;
    /**
     * Reference to the associated academic level
     */
    academicLevel?: Partial<AcademicLevelFilter>;
    /**
     * Unique identifier for the associated education level
     */
    educationLevelId?: string;
    /**
     * Reference to the associated education level
     */
    educationLevel?: Partial<EducationLevelFilter>;
}
