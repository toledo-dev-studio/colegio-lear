import type { AcademicCycle } from "@/interfaces/entites/academic-cycle";

/**
 * Interface to define context for single academic cycle record used in AcademicCycleLayout and his routes tabs.
 */
export interface AcademicCycleLayoutContext {
    /**
     * The record is a new record
     */
    isNew: boolean;
    /**
     * Can update academic cycle information
     */
    isLocked: boolean;
    /**
     * Academic cycle information or undefined if is new record
     */
    academicCycle?: AcademicCycle;
    /**
     * Academic cycle unique identifier or undefined if is a new record
     */
    academicCycleId: string;
}
