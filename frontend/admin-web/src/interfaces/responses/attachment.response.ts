/**
 * Type: Response
 * Description: Represents an attachment file information.
 */
export interface AttachmentResponse {
    /**
     * Attachment's unique identifier
     */
    id: string;
    /**
     * Attachment's generated url
     */
    url: string;
    /**
     * Attachment's name
     */
    name: string;
    /**
     * Attachment's extension
     */
    extension: string;
    /**
     * Attachment's related record unique identifer
     */
    relatedRecordId: string;
}
