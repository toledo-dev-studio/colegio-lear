import type { NotificationTypeKey } from "@/lib/key-value-pairs/key-value-pair-types";

/**
 * Type: Response
 * Description: Notification response interface
 */
export interface NotificationResponse {
    /**
     * Notification response unique identifier
     */
    id: string;
    /**
     * Title to show in notification
     */
    title: string;
    /**
     * Message or description about notification
     */
    message: string;
    /**
     * Notification type
     */
    type: NotificationTypeKey;
    /**
     * Identifier of the entity related to the notification.
     * For example:
     * - announcement -> Announcement ID
     * - message -> Message ID
     */
    relatedRecordId: string;
    /**
     * Content for an announcement notification
     */
    content: string;
    /**
     * Date and time when notification were created (ISO string)
     */
    createdAt: string;
    /**
     * Indicator if notification were readed for the user
     */
    read: boolean;
}
