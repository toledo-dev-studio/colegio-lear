import type { AcademicCycleResponse } from "./academic-cycle.response";
import type { AcademicCycleSchoolGroupStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";

/**
 * Type: Response
 * Description: Represents a class (school group) assigned to the logged-in teacher, containing the group's name, status and a reference to the academic cycle it belongs to.
 */
export interface MyClassResponse {
    /**
     * Unique identifier for the academic cycle school group
     */
    id: string;
    /**
     * Name of the academic cycle school group
     * Example: "Primero A (2026-2027)"
     */
    name: string;
    /**
     * Current status of the academic cycle school group
     * Example: "active", "discharged".
     */
    status: AcademicCycleSchoolGroupStatusKey;
    /**
     * Reference to the associated academic cycle
     */
    academicCycle?: AcademicCycleResponse;
}