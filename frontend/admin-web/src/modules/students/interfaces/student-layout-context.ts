import type { Student } from "@/interfaces/entites/student";

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
    student: Student;
    /**
     * Student unique identifier or undefined if is a new record
     */
    studentId: string;
}
