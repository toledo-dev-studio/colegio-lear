import { useQuery } from "@tanstack/react-query";

import { GET_ANNOUNCEMENT_QUERY_KEY } from "@/lib/queries-key/announcements-queries-key";
import { getAnnouncementByIdActionAsync } from "../../actions/announcements/get-announcement-by-id.action";

export const useGetByIdAnnouncement = (id?: string) => {
    return useQuery({
        queryKey: [GET_ANNOUNCEMENT_QUERY_KEY, { id }],
        queryFn: () => getAnnouncementByIdActionAsync(id),
        retry: false,
        staleTime: 0,
    });
}
