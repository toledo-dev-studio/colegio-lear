import type { MyClassResponse } from "@/interfaces/responses/my-class.response";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";
import type { AcademicCycleSchoolGroupResponse } from "@/interfaces/responses/academic-cycle-school-group.response";

/**
 * Interface to define context for single class record used in MyClassLayout and his routes tabs.
 */
export interface MyClassLayoutContext {
    /**
     * Class (school group) information of the logged-in teacher
     */
    myClass: MyClassResponse;
    /**
     * Class unique identifier
     */
    myClassId: string;
    /**
     * Identifier of the associated academic cycle
     */
    academicCycleId?: string;
    /**
     * Reference to the associated academic cycle
     */
    academicCycle?: AcademicCycleResponse;
    /**
     * Reference to the associated academic cycle school group
     */
    schoolGroup?: AcademicCycleSchoolGroupResponse;
    /**
     * The logged in user has permission to write in a class record according a security role
     */
    loggedInUserCanWrite: boolean;
}