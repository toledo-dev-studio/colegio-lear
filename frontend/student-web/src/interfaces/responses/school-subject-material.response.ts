import type { AttachmentResponse } from "./attachment.response";

/**
 * Type: Response
 * Description: Represents a support material of a school subject within a specific academic cycle group. Each material holds a single attachment file, whose relatedRecordId is the material id.
 */
export interface SchoolSubjectMaterialResponse {
    /**
     * Identifier of the material
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
     * The material's attached file (its relatedRecordId is the material id)
     */
    attachment: AttachmentResponse;
}
