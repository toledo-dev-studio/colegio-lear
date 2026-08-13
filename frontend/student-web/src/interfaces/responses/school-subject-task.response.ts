import type { AttachmentResponse } from "./attachment.response";

/**
 * Type: Response
 * Description: Represents a task (homework) assigned to a school subject within a specific academic cycle group. Tasks are independent per academic cycle group, so the full context (cycle, group and subject-of-the-cycle) is included.
 */
export interface SchoolSubjectTaskResponse {
    /**
     * Identifier of the task
     */
    id: string;
    /**
     * Identifier of the associated academic cycle
     */
    academicCycleId: string;
    /**
     * Identifier of the associated academic cycle school group
     */
    academicCycleSchoolGroupId: string;
    /**
     * Identifier of the associated academic cycle school subject (subject added to the cycle)
     */
    academicCycleSchoolSubjectId: string;
    /**
     * Task name
     */
    title: string;
    /**
     * Task description
     */
    description?: string;
    /**
     * Due date of the task, as an ISO date string
     */
    dueDate: string;
    /**
     * Creation date of the task, as an ISO date string (used for ordering: most recent first)
     */
    createdAt: string;
    /**
     * Support material files attached to the task (each attachment's relatedRecordId is the task id)
     */
    attachments: AttachmentResponse[];
}
