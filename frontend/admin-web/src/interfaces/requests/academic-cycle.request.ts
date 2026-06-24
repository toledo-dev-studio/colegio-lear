
import type { AcademicLevelRequest } from "./academic-level.request";
import type { EducationLevelRequest } from "./education-level.request";
import type { AcademicCycleStatusKey, AcademicPeriodTypeKey } from "@/lib/key-value-pairs/key-value-pair";

/**
 * Type: Request
 * Description: Represents an academic cycle within the school, containing details about the cycle's name, code, dates, type, status, and other relevant information.
 */
export interface AcademicCycleRequest {
    /**
    * Name of the academic cycle
    * Example: "2026 - 2027"
    */
    name: string;
    /**
     * Short code for the cycle
     * Example: "2026-A"
     */
    code: string;
    /**
     * Start date of the academic cycle as an ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
     */
    startDate: string;
    /**
     * End date of the academic cycle as an ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
     */
    endDate: string;
    /**
     * Type of the academic cycle 
     * Example: "annual", "semester", "trimester", etc.
     */
    periodType: AcademicPeriodTypeKey;
    /**
     * Current status of the academic cycle 
     * Example: "upcoming", "active", "completed", etc.
     */
    status: AcademicCycleStatusKey;
    /**
     * Indicates if enrollment is currently open
     */
    enrollmentOpen: boolean;
    /**
     * Timestamp when the record was created as an ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
     * Backend should set this field when creating a new record, frontend should not set this field when creating or updating a record
     */
    createdAt?: string;
    /**
     * Timestamp when the record was last updated as an ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
     * Backend should set this field when updating a record, frontend should not set this field when creating or updating a record
     */
    updatedAt?: string;
    /**
     * Additional observations or comments about the academic cycle
     */
    observations?: string;
    /**
     * Identifier of the associated academic level
     */
    academicLevelId: string;
    /**
     * Reference to the associated academic level
     */
    academicLevel?: AcademicLevelRequest;
    /**
     * Identifier of the associated education level
     */
    educationLevelId: string;
    /**
     * Reference to the associated education level
     */
    educationLevel?: EducationLevelRequest;
}
