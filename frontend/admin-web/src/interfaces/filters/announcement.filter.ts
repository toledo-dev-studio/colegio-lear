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
     * Announcement's is active flag
     */
    isActive?: boolean;
}
