import type { StudentResponse } from "@/interfaces/responses/student.response";

/**
 * Interface to define context for single student record used in StudentLayout and his routes tabs.
 */
export interface StudentLayoutContext {
    /**
     * The record is a new record
     */
    isNew: boolean;
    /**
     * Student information or undefined if is new record
     */
    student: StudentResponse;
    /**
     * Student unique identifier or undefined if is a new record
     */
    studentId: string;
}
