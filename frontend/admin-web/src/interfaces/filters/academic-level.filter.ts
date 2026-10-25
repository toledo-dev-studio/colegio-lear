/**
 * Type: Filter
 * Description: Represents an academic level within the school, containing details about the level's name, description, status, and references to related education levels.
 */
export interface AcademicLevelFilter {
    /**
     * Name of the academic level
     */
    name?: string;
    /**
     * Indicates if the academic level is active
     */
    isActive?: boolean;
}
