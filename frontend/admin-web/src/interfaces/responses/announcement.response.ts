import type { AttachmentResponse } from "./attachment.response";
import type { AudienceTypeKey } from "@/lib/key-value-pairs/key-value-pair-types";

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
     * Announcement's is active flag
     */
    isActive: boolean;
    /**
     * Announcement's related attachments 
     */
    attachments: AttachmentResponse[];

    // TODO:
    peopleCount: number // conteo de personas a los que se les asigno la campaña (universo incial)
    rededPeopleCount: number // conteo de personas que leyeron la campaña
    percentage: number // Porcentaje de personas que vieron la campaña
}
