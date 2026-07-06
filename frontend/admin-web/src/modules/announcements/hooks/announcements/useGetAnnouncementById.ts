import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_ANNOUNCEMENT_QUERY_KEY } from "@/lib/queries-key/announcements-queries-key";
import type { AnnouncementResponse } from "@/interfaces/responses/announcement.response";
import { getAnnouncementByIdActionAsync } from "../../actions/announcements/get-announcement-by-id.action";

interface Options {
    id: string;
}

export const useGetAnnouncementById = ({ id }: Options) => {
    return useQuery({
        queryKey: [GET_ANNOUNCEMENT_QUERY_KEY, { id }],
        queryFn: () => {
            if (id === "new") {
                return {} as unknown as AnnouncementResponse;
            }
            return getAnnouncementByIdActionAsync({ id })
        },
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}
