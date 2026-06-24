

import type { AcademicLevelFilter } from "./academic-level.filter";
import type { EducationLevelFilter } from "./education-level.filter";
import type { AcademicCycleStatusKey, AcademicPeriodTypeKey } from "@/lib/key-value-pairs/key-value-pair";

/**
 * Type: Filter
 * Description: Represents an academic cycle within the school, containing details about the cycle's name, code, dates, type, status, and other relevant information.
 */
export interface AcademicCycleFilter {
    /**
    * Name of the academic cycle
    * Example: "2026 - 2027"
    */
    name?: string;
    /**
     * Short code for the cycle
     * Example: "2026-A"
     */
    code?: string;
    /**
     * Start date of the academic cycle as an ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
     */
    startDate?: string;
    /**
     * End date of the academic cycle as an ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
     */
    endDate?: string;
    /**
     * Type of the academic cycle 
     * Example: "annual", "semester", "trimester", etc.
     */
    periodType?: AcademicPeriodTypeKey;
    /**
     * Current status of the academic cycle 
     * Example: "upcoming", "active", "completed", etc.
     */
    status?: AcademicCycleStatusKey;
    /**
     * Indicates if enrollment is currently open
     */
    enrollmentOpen?: boolean;
    /**
     * Identifier of the associated academic level
     */
    academicLevelId?: string;
    /**
     * Reference to the associated academic level
     */
    academicLevel?: AcademicLevelFilter;
    /**
     * Identifier of the associated education level
     */
    educationLevelId?: string;
    /**
     * Reference to the associated education level
     */
    educationLevel?: EducationLevelFilter;
}
