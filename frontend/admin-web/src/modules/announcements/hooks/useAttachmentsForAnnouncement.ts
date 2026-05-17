import { useMutation } from "@tanstack/react-query";

import { uploadAttachmentsForAnnouncementActionAsync } from "../actions/attachments/upload-attachment-for-announcement.action";
import { deleteAttachmentForAnnouncementByIdActionAsync } from "../actions/attachments/delete-attachment-for-announcement-by-id.action";

export const useAttachmentsForAnnouncement = () => {

    const upload = useMutation({ mutationFn: uploadAttachmentsForAnnouncementActionAsync });
    const remove = useMutation({ mutationFn: deleteAttachmentForAnnouncementByIdActionAsync });

    const attachmentsMutation = {
        upload,
        remove
    }

    return {
        attachmentsMutation
    };
}

