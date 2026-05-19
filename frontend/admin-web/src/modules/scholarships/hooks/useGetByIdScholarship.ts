import { useQuery } from "@tanstack/react-query"

import { SINGLE_RECORD_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_SCHOLARSHIP_QUERY_KEY } from "@/lib/queries-key/scholarships-queries-key";
import { getScholarshipByIdActionAsync } from "../actions/get-scholarships-by-id.action";

export const useGetByIdScholarship = (id?: string, enabledQuery: boolean = true, staleTime = SINGLE_RECORD_STALE_TIME) => {
    return useQuery({
        queryKey: [GET_SCHOLARSHIP_QUERY_KEY, { id }],
        queryFn: () => getScholarshipByIdActionAsync(id),
        retry: false,
        staleTime: staleTime,
        enabled: enabledQuery
    });
}