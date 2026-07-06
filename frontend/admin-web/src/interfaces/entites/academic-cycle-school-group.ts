import type { AcademicCycle } from "./academic-cycle";
import type { AcademicCycleSchoolGroupStatusKey, KeyValuePair } from "@/lib/key-value-pairs/key-value-pair";
import type { AcademicCycleGroupSchoolSubjectCalendar } from "./academic-cycle-group-school-subject-calendar";

/**
 * ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES defines the possible statuses for an academic cycle group, which can be used to track the current state of the group. 
 * Each status has a key and a label for display purposes.
 */
export const ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES: KeyValuePair<AcademicCycleSchoolGroupStatusKey>[] = [
    { key: "active", label: "En curso" },
    { key: "discharged", label: "Dado de baja" },
];

/**
 * Represents a group within an academic cycle, containing details about the group's name, status, description, and references to related entities such as the academic cycle, academic level, and education level.
 * This entity is used to organize students into specific groups for each academic cycle, allowing for better management of enrollments, attendance, and other related processes.
 * Each academic cycle group is associated with a specific academic cycle, academic level, and education level, providing a structured way to categorize and manage students within the school.
 */
export interface AcademicCycleSchoolGroup {
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
     * Optional - Description of the academic cycle group
     * Example: "Grupo de estudiantes del primer año"
     */
    description?: string;
    /**
     * Required - Current status of the academic cycle 
     * Example: "active", "discharged".
     */
    status: AcademicCycleSchoolGroupStatusKey;
    /**
     * Optional - Description of academic cycle group when status is "discharged".
     */
    dischargedDescription?: string;
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
    /**
     * Required - Calendar configuration for a specific group
     */
    calendars: AcademicCycleGroupSchoolSubjectCalendar[];
}
