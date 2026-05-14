import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAnnouncementByIdActionAsync } from "../actions/get-announcement-by-id.action";
import { createUpdateAnnouncementActionAsync } from "../actions/create-update-announcement.action";
import { GET_PAGED_ANNOUNCEMENTS_QUERY_KEY, GET_ANNOUNCEMENT_QUERY_KEY, GET_ANNOUNCEMENTS_QUERY_KEY } from "../lib/queries-key";

export const useAnnouncement = (id: string) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [GET_ANNOUNCEMENT_QUERY_KEY, { id }],
        queryFn: () => getAnnouncementByIdActionAsync(id),
        retry: false,
        staleTime: 0
    });

    const mutation = useMutation({
        mutationFn: createUpdateAnnouncementActionAsync,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [GET_ANNOUNCEMENTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_ANNOUNCEMENTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_ANNOUNCEMENT_QUERY_KEY] });

            queryClient.setQueryData([GET_ANNOUNCEMENT_QUERY_KEY, data.id], data);
        }
    });

    return {
        ...query,
        mutation
    };
}
