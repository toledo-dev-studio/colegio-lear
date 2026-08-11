/**
 * Type: Response
 * Description: Represents an education level within the school, containing details about the level's name, description, and reference to the associated academic level.
 */
export interface EducationLevelResponse {
    /**
     * Unique identifier for the education level
     */
    id: string;
    /**
     * Name of the education level
     */
    name: string;
    /**
     * Description of the education level
     */
    description?: string;
    /**
     * Unique identifier for the associated academic level
     */
    academicLevelId: string;
}
