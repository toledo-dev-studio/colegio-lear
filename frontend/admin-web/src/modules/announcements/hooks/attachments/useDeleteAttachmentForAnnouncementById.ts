import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_ANNOUNCEMENT_QUERY_KEY } from "@/lib/queries-key/announcements-queries-key";
import type { AnnouncementResponse } from "@/interfaces/responses/announcement.response";
import { deleteAttachmentForAnnouncementByIdActionAsync } from "../../actions/attachments/delete-attachment-for-announcement-by-id.action";

export const useDeleteAttachmentForAnnouncementById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAttachmentForAnnouncementByIdActionAsync,
        onSuccess: ({ announcementId }) => {
            // Update query data to prevent refetch
            queryClient.setQueryData(
                [GET_ANNOUNCEMENT_QUERY_KEY, { id: announcementId }],
                (prev: AnnouncementResponse) => {
                    const currentAttachments = prev.attachments;
                    const attachment = currentAttachments.find(x => x.relatedRecordId === announcementId);
                    if (!attachment)
                        return { ...prev };
                    const updatedAttachments = currentAttachments.filter(x => x.id !== attachment.id);
                    return {
                        ...prev,
                        attachments: updatedAttachments
                    }
                }
            );
        }
    });
}
