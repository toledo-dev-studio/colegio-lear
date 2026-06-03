import type { AcademicCycleStatusKey, AcademicPeriodTypeKey, KeyValuePair } from "@/types/KeyValuePair";
import type { AcademicLevel } from "./academic-level";
import type { EducationLevel } from "./education-level";

/**
 * ACADEMIC_PERIOD_TYPES defines the different types of academic periods that can be used to categorize academic cycles.
 * Each type has a key and a label for display purposes.
 */
export const ACADEMIC_CYCLE_PERIOD_TYPES: KeyValuePair<AcademicPeriodTypeKey>[] = [
    { key: "annual", label: "Anual" },
    { key: "semester", label: "Semestral" },
    { key: "four-month-period", label: "Cuatrimestral" },
    { key: "trimester", label: "Trimestral" },
    { key: "bimester", label: "Bimestral" },
    { key: "monthly", label: "Mensual" },
    { key: "intensive", label: "Intensivo" },
    { key: "special", label: "Especial" },
];

/**
 * ACADEMIC_CYCLE_STATUSES defines the possible statuses for an academic cycle, which can be used to track the current state of the cycle. 
 * Each status has a key and a label for display purposes.
 */
export const ACADEMIC_CYCLE_STATUSES: KeyValuePair<AcademicCycleStatusKey>[] = [
    { key: "upcoming", label: "Próximo" },
    { key: "active", label: "En curso" },
    { key: "completed", label: "Finalizado" },
    { key: "cancelled", label: "Cancelado" },
    { key: "archived", label: "Archivado" },
];

/**
 * Represents an academic cycle within the school, containing details about the cycle's name, code, dates, type, status, and other relevant information. 
 * This entity is central to organizing the school's academic calendar and managing enrollments, attendance, and other related processes.
 */
export interface AcademicCycle {
    /**
     * Required - Unique identifier for the academic cycle
     */
    id: string;
    /**
    * Required - Name of the academic cycle
    * Example: "2026 - 2027"
    */
    name: string;
    /**
     * Required - Short code for the cycle
     * Example: "2026-A"
     */
    code: string;
    /**
     * Required - Start date of the academic cycle as an ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
     */
    startDate: string;
    /**
     * Required - End date of the academic cycle as an ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
     */
    endDate: string;
    /**
     * Required - Type of the academic cycle 
     * Example: "annual", "semester", "trimester", etc.
     */
    type: AcademicPeriodTypeKey;
    /**
     * Required - Current status of the academic cycle 
     * Example: "upcoming", "active", "completed", etc.
     */
    status: AcademicCycleStatusKey;
    /**
     * Optional - Indicates if enrollment is currently open
     */
    enrollmentOpen?: boolean;
    /**
     * Optional - Additional notes or comments
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
     * Optional - Additional observations or comments about the academic cycle
     */
    observations?: string;
    /**
     * Required - Identifier of the associated academic level
     */
    academicLevelId: string;
    /**
     * Not set from frontend - Reference to the associated academic level
     */
    academicLevel?: AcademicLevel;

    /**
     * Required - Identifier of the associated education level
     */
    educationLevelId: string;
    /**
     * Not set from frontend - Reference to the associated education level
     */
    educationLevel?: EducationLevel;
}
