import type { AttachmentResponse } from "./attachment.response";
import type { AnnouncementsStatusKey, AudienceTypeKey } from "@/lib/key-value-pairs/key-value-pair-types";

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
    audience: AudienceTypeKey[];
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
     * Announcement status key
     */
    status: AnnouncementsStatusKey;
    /**
     * Announcement's related attachments 
     */
    attachments: AttachmentResponse[];
    /**
     * People count whos the campaing was assigned
     */
    recipientsCount: number;
    /**
     * People count whos already read the campaing
     */
    viewedCount: number;
    /**
     * Flag to indicate that a campaing was already published or updated with "in-progress" status
     */
    alreadyPublished: boolean;
}
