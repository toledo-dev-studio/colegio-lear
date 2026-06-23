import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAnnouncementByIdActionAsync } from "../../actions/announcements/delete-announcement-by-id.action";
import { GET_ANNOUNCEMENT_QUERY_KEY, GET_PAGED_ANNOUNCEMENTS_QUERY_KEY } from "@/lib/queries-key/announcements-queries-key";

export const useDeleteAnnouncementById = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAnnouncementByIdActionAsync,
        onSuccess: (id: string) => {
            // Remove query for single query
            queryClient.removeQueries({ queryKey: [GET_ANNOUNCEMENT_QUERY_KEY, { id: id }] });

            // Invalid cache for useQueries, on invalid queries refetch is auto
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_ANNOUNCEMENTS_QUERY_KEY] });
        },
    });
}
