import type { AttachmentResponse } from "./attachment.response";

/**
 * Type: Response
 * Description: Represents a support material (file) related to a school subject within a school group of the logged-in teacher.
 */
export interface SchoolSubjectMaterialResponse extends AttachmentResponse {
    /**
     * Identifier of the associated academic cycle school group
     */
    academicCycleSchoolGroupId: string;
    /**
     * Identifier of the associated school subject
     */
    schoolSubjectId: string;
}