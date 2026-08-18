import { useMutation } from "@tanstack/react-query";

import { uploadAttachmentForAnnouncementAsync } from "../../api/attachments/upload-attachment-for-announcement.api";

export const useUploadAttachmentForAnnouncement = () => {
    return useMutation({
        mutationFn: uploadAttachmentForAnnouncementAsync
    });
}
