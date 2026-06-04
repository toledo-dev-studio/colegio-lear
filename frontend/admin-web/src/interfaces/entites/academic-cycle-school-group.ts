import type { AcademicCycle } from "./academic-cycle";
/**
 * Represents a group within an academic cycle, containing details about the group's name, status, description, and references to related entities such as the academic cycle, academic level, and education level.
 * This entity is used to organize students into specific groups for each academic cycle, allowing for better management of enrollments, attendance, and other related processes.
 * Each academic cycle group is associated with a specific academic cycle, academic level, and education level, providing a structured way to categorize and manage students within the school.
 */
export interface AcademicCycleGroup {
    /**
     * Required - Unique identifier for the academic cycle group
     */
    id: string;
    /**
     * Required - Name of the academic cycle group
     * Example: "Primero A (2026-2027)"
     */
    name: string;
    /**
     * Required - Indicates if the academic cycle group is active
     */
    status: boolean;
    /**
     * Optional - Description of the academic cycle group
     * Example: "Grupo de estudiantes del primer año"
     */
    description?: string;
    /**
     * Not set from frontend - Timestamp when the record was created as an ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
     * Backend should set this field when creating a new record, frontend should not set this field when creating or updating a record
     */
    createdAt?: string;
    /**
     * Not set from frontend - Timestamp when the record was last updated as an ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
     * Backend should set this field when updating a record, frontend should not set this field when creating or updating a record
     */
    updatedAt?: string;
    /**
     * Required - Identifier of the associated academic cycle
     */
    academicCycleId: string;
    /**
     * Not set from frontend - Reference to the associated academic cycle
     */
    academicCycle?: AcademicCycle;
}
