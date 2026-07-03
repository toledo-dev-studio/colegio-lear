import type { AcademicCycleSchoolGroupStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";
import type { AcademicCycleSchoolGroupCalendarResponse } from "./academic-cycle-school-group-calendar.response";

/**
 * Type: Response
 * Description: Represents a group within an academic cycle, containing details about the group's name, status, description, and references to related entities such as the academic cycle, academic level, and education level.
 * This entity is used to organize students into specific groups for each academic cycle, allowing for better management of enrollments, attendance, and other related processes.
 */
export interface AcademicCycleSchoolGroupResponse {
    /**
     * Unique identifier for the academic cycle group
     */
    id: string;
    /**
     * Name of the academic cycle group
     * Example: "Primero A (2026-2027)"
     */
    name: string;
    /**
     * Description of the academic cycle group
     * Example: "Grupo de estudiantes del primer año"
     */
    description?: string;
    /**
     * Current status of the academic cycle 
     * Example: "active", "discharged".
     */
    status: AcademicCycleSchoolGroupStatusKey;
    /**
     * Description of academic cycle group when status is "discharged".
     */
    dischargedDescription?: string;
    /**
     * Identifier of the associated academic cycle
     */
    academicCycleId: string;
    /**
     * Calendar configuration for a specific group
     */
    calendars?: AcademicCycleSchoolGroupCalendarResponse[];
}
