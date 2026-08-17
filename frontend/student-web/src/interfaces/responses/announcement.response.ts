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
     * Announcement's content
     */
    content?: string;
}
