import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";

interface Options {
    announcementId: string;
    attachmentId: string;
}

export const deleteAttachmentForAnnouncementByIdAsync = async ({ announcementId, attachmentId }: Options): Promise<Options> => {
    await sleep();

    if (!announcementId)
        throw ("Announcement unique identifier can not be undefined");
    
    if (!attachmentId)
        throw ("Attachment unique identifier can not be undefined");

    if (IS_MOCKABLE)
        return { announcementId, attachmentId };

    await api.delete(`attachments/announcement/${announcementId}/${attachmentId}`);    
    
    return { announcementId, attachmentId };
}
