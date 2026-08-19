/**
 * Type: Request
 * Description: Represents the request payload to create or update a task assigned to a school subject within a school group.
 */
export interface SchoolSubjectTaskRequest {
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
}