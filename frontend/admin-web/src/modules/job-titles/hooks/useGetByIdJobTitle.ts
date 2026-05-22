import { useQuery } from "@tanstack/react-query"

import { getJobTitleByIdActionAsync } from "../actions/get-job-title-by-id.action";
import { GET_JOB_TITLE_QUERY_KEY } from "@/lib/queries-key/job-titles-queries-key";

export const useGetByIdJobTitle = (id?: string) => {
    return useQuery({
        queryKey: [GET_JOB_TITLE_QUERY_KEY, { id }],
        queryFn: () => getJobTitleByIdActionAsync(id),
        retry: false,
        staleTime: 0,
    });
}
