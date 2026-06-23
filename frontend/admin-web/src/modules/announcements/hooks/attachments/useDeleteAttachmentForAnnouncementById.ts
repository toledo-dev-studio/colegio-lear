import { useMutation } from "@tanstack/react-query";

import { deleteAttachmentForAnnouncementByIdActionAsync } from "../../actions/attachments/delete-attachment-for-announcement-by-id.action";

export const useDeleteAttachmentForAnnouncementById = () => {
    return useMutation({
        mutationFn: deleteAttachmentForAnnouncementByIdActionAsync,
    });
}
