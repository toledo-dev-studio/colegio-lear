import type { EducationLevelRequest } from "./education-level.request";

/**
 * Type: Request
 * Description: Represents an academic level within the school, containing details about the level's name, description, status, and references to related education levels.
 */
export interface AcademicLevelRequest {
    /**
     * Unique identifier for the academic level
     */
    id: string;
    /**
     * Name of the academic level
     */
    name: string;
    /**
     * Description of the academic level
     */
    description?: string;
    /**
     * Indicates if the academic level is active
     */
    isActive: boolean;
    /**
     * List of education levels associated with the academic level. Can be empty if there are no associated education levels.
     */
    educationLevels?: EducationLevelRequest[]
}
