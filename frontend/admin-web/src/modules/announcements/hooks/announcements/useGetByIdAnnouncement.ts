import { useQuery } from "@tanstack/react-query";

import { SINGLE_RECORD_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_ANNOUNCEMENT_QUERY_KEY } from "@/lib/queries-key/announcements-queries-key";
import { getAnnouncementByIdActionAsync } from "../../actions/announcements/get-announcement-by-id.action";

export const useGetByIdAnnouncement = (id?: string, enabledQuery: boolean = true, staleTime = SINGLE_RECORD_STALE_TIME) => {
    return useQuery({
        queryKey: [GET_ANNOUNCEMENT_QUERY_KEY, { id }],
        queryFn: () => getAnnouncementByIdActionAsync(id),
        retry: false,
        staleTime: staleTime,
        enabled: enabledQuery
    });
}
