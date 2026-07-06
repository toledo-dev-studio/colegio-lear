import { useMutation } from "@tanstack/react-query";

import { uploadAttachmentForAnnouncementActionAsync } from "../../actions/attachments/upload-attachment-for-announcement.action";

export const useUploadAttachmentForAnnouncement = () => {
    return useMutation({
        mutationFn: uploadAttachmentForAnnouncementActionAsync,
    });
}
