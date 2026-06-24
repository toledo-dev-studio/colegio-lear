import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";

/**
 * Interface to define context for single academic cycle record used in AcademicCycleLayout and his routes tabs.
 */
export interface AcademicCycleLayoutContext {
    /**
     * The record is a new record
     */
    isNew: boolean;
    /**
     * Academic cycle's status is not "upcomming"
     */
    isLocked: boolean;
    /**
     * Academic cycle has status "active"
     */
    isActive: boolean;
    /**
     * Academic cycle information or undefined if is new record
     */
    academicCycle?: AcademicCycleResponse;
    /**
     * Academic cycle unique identifier or undefined if is a new record
     */
    academicCycleId?: string;
}
