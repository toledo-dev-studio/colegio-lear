import type { AudienceTypeKey } from "@/lib/key-value-pairs/key-value-pair-types";

/**
 * Type: Request
 * Description: Represents an announcement with basic information.
 */
export interface AnnouncementRequest {
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
     * Announcement's is active flag
     */
    isActive: boolean;
}
