import { api } from "@/api/client";
import { sleep } from "@/lib/utils";

interface Options {
    announcementId: string,
    attachmentId: string
}

export const deleteAttachmentForAnnouncementByIdActionAsync = async ({ announcementId, attachmentId }: Options): Promise<void> => {
    if (!announcementId)
        throw ("Announcement unique identifier can not be undefined");
    
    if (!attachmentId)
        throw ("Attachment unique identifier can not be undefined");

    await sleep();
    // TODO: Remove this comment when backend ready
    // await api.delete(`attachments/announcement/${announcementId}/${attachmentId}`);
    // TODO: Remove this comment when backend ready
    return;
}
