import { useQuery } from "@tanstack/react-query"

import { SINGLE_RECORD_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { getJobTitleByIdActionAsync } from "../actions/get-job-title-by-id.action";
import { GET_JOB_TITLE_QUERY_KEY } from "@/lib/queries-key/job-titles-queries-key";

export const useGetByIdJobTitle = (id?: string, enabledQuery: boolean = true, staleTime = SINGLE_RECORD_STALE_TIME) => {
    return useQuery({
        queryKey: [GET_JOB_TITLE_QUERY_KEY, { id }],
        queryFn: () => getJobTitleByIdActionAsync(id),
        retry: false,
        staleTime: staleTime,
        enabled: enabledQuery
    });
}
