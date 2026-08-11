import { useQuery } from "@tanstack/react-query";

import { getAnnouncementByIdAsync } from "../api/get-announcement-by-id.api";
import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_ANNOUNCEMENT_QUERY_KEY } from "@/lib/queries-key/announcements-queries-key";

interface Options {
    id: string;
}

export const useGetAnnouncementById = ({ id }: Options) => {
    return useQuery({
        queryKey: [GET_ANNOUNCEMENT_QUERY_KEY, { id }],
        queryFn: () => getAnnouncementByIdAsync({ id }),
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}
