import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_ANNOUNCEMENTS_QUERY_KEY, GET_PAGED_ANNOUNCEMENTS_QUERY_KEY } from "../lib/queries-key";
import { deleteAnnouncementByIdActionAsync } from "../actions/delete-announcement-concept-by-id.action";

export const useDeleteAnnouncement = () => {

    const queryClient = useQueryClient();

    return {
        mutationDeleteAnnouncement: useMutation({
            mutationFn: deleteAnnouncementByIdActionAsync,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [GET_ANNOUNCEMENTS_QUERY_KEY] });
                queryClient.invalidateQueries({ queryKey: [GET_PAGED_ANNOUNCEMENTS_QUERY_KEY] });

                queryClient.refetchQueries({ queryKey: [GET_PAGED_ANNOUNCEMENTS_QUERY_KEY] })
            },
        })
    }
}
