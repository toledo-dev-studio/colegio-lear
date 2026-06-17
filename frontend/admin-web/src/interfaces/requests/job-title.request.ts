import type { JobTitleTypes } from "../entites/job-title";

/**
 * Type: Request
 * Description: Represents a job title within the school, containing details about the title's name, description, type, and status. This entity is used to categorize employees based on their roles within the school, allowing for better organization and management of employee information and permissions.
 */
export interface JobTitleRequest {
    /**
     * Name of the job title
     * Example: "Profesor de matemáticas", "Secretaria"
     */
    name: string;
    /**
     * Description of the job title
     * Example: "Encargado de impartir clases de matemáticas", "Encargada de tareas administrativas"
     */
    description?: string;
    /**
     * Type of the job title, indicating whether it is a teaching position or an administrative staff position
     */
    jobTitleType: JobTitleTypes;
    /**
     * Indicates if the job title is active
     */
    isActive: boolean;
}
