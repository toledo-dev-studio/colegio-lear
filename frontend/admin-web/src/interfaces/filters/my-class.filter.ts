import type { AcademicCycleStatusKey, AcademicCycleSchoolGroupStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";

/**
 * Type: Filter
 * Description: Represents the filters available to search the classes assigned to the logged-in teacher.
 */
export interface MyClassFilter {
    /**
     * Name of the academic cycle school group
     */
    name?: string;
    /**
     * Current status of the academic cycle school group
     * Example: "active", "discharged".
     */
    status?: AcademicCycleSchoolGroupStatusKey;
    /**
     * Current status of the academic cycle
     * Example: "upcoming", "active", "completed", etc.
     */
    academicCycleStatus?: AcademicCycleStatusKey;
}