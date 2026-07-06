import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AnnouncementResponse } from "@/interfaces/responses/announcement.response";
import { createUpdateAnnouncementActionAsync } from "../../actions/announcements/create-update-announcement.action";
import { GET_PAGED_ANNOUNCEMENTS_QUERY_KEY, GET_ANNOUNCEMENT_QUERY_KEY } from "@/lib/queries-key/announcements-queries-key";

export const useCreateUpdateAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateAnnouncementActionAsync,
        onSuccess: (response: AnnouncementResponse) => {
            // Invalid cache for useQueries
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_ANNOUNCEMENTS_QUERY_KEY] });

            // Set data to query data for created/updated record
            queryClient.setQueryData([GET_ANNOUNCEMENT_QUERY_KEY, { id: response.id }], response);
        }
    });
}
