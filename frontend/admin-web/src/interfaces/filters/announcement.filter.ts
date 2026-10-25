import type { AnnouncementsStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";

/**
 * Type: Filter
 * Description: Represents an announcement with basic information.
 */
export interface AnnouncementFilter {
    /**
     * Announcement's name
     */
    name?: string;
    /**
     * Announcement's date to publish
     * ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
     */
    publishedAt?: string;
    /**
     * Announcement's expiration date.
     * ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
     */
    expiresAt?: string;
    /**
     * Announcement status key
     */
    status?: AnnouncementsStatusKey;
}
