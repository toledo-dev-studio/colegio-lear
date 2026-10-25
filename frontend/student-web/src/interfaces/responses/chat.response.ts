import type { EmployeeResponse } from "./employee.response";
import type { SchoolSubjectResponse } from "./school-subject.response";

/**
 * Type: Response
 * Description: Represents a chat conversation between a student and a teacher within a specific academic cycle enrollment, including the teacher, the school subject and the last message preview.
 */
export interface ChatResponse {
    /**
     * Identifier of the academic cycle enrollment that the conversation belongs to
     */
    enrollmentId: string;
    /**
     * Identifier of the associated teacher (employee)
     */
    teacherId: string;
    /**
     * Reference to the associated teacher (employee)
     */
    teacher: EmployeeResponse;
    /**
     * Reference to the associated school subject
     */
    schoolSubject: SchoolSubjectResponse;
    /**
     * Content preview of the last message sent in the conversation
     */
    lastMessage?: string;
    /**
     * ISO date string of the last message sent in the conversation
     */
    lastMessageAt?: string;
    /**
     * Number of unread messages in the conversation
     */
    unreadCount?: number;
}