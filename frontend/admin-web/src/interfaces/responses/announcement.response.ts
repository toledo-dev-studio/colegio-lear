import type { AudienceType } from "../entites/announcement";
import type { AttachmentResponse } from "./attachment.response";

/**
 * Type: Response
 * Description: Represents an announcement with basic information.
 */
export interface AnnouncementResponse {
    /**
     * Announcement's unique identifier
     */
    id: string;
    /**
     * Announcement's name
     */
    name: string;
    /**
     * Announcement's description
     */
    description?: string;
    /**
     * Announcement's main audiences
     */
    audience: AudienceType[];
    /**
     * Announcement's content
     */
    content?: string;
    /**
     * Announcement's date to publish
     * ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
     */
    publishedAt: string;
    /**
     * Announcement's expiration date.
     * ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
     */
    expiresAt: string;
    /**
     * Announcement's is active flag
     */
    isActive: boolean;
    /**
     * Announcement's related attachments 
     */
    attachments: AttachmentResponse[];
}
