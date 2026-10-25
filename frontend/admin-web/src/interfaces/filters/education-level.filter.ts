/**
 * Type: Filter
 * Description: Represents an education level within the school, containing details about the level's name, description, and reference to the associated academic level.
 */
export interface EducationLevelFilter {
    /**
     * Name of the education level
     */
    name?: string;
    /**
     * Indicates if the academic level is active
     */
    isActive?: boolean;
    /**
     * Unique identifier for the associated education level
     */
    academicLevelId?: string;
}
