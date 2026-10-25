import type { AttachmentResponse } from "./attachment.response";

/**
 * Type: Response
 * Description: Represents a task assigned to a school subject within a school group of the logged-in teacher.
 */
export interface SchoolSubjectTaskResponse {
    /**
     * Unique identifier of the task
     */
    id: string;
    /**
     * Title of the task
     */
    title: string;
    /**
     * Description of the task
     */
    description?: string;
    /**
     * Due date of the task (ISO string)
     */
    dueDate?: string;
    /**
     * Identifier of the associated academic cycle school group
     */
    academicCycleSchoolGroupId: string;
    /**
     * Identifier of the associated school subject
     */
    schoolSubjectId: string;
    /**
     * Task's related attachments
     */
    attachments?: AttachmentResponse[];
}