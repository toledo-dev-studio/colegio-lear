import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    announcementId: string;
    attachmentId: string;
}

export const deleteAttachmentForAnnouncementByIdActionAsync = async ({ announcementId, attachmentId }: Options): Promise<void> => {
    await sleep();

    if (!announcementId)
        throw ("Announcement unique identifier can not be undefined");
    
    if (!attachmentId)
        throw ("Attachment unique identifier can not be undefined");

    if (VITE_ENVIRONMENT === "mockable")
        return;

    await api.delete(`attachments/announcement/${announcementId}/${attachmentId}`);    
    return;
}
