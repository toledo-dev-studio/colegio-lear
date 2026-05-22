import { useQuery } from "@tanstack/react-query"

import { GET_SCHOLARSHIP_QUERY_KEY } from "@/lib/queries-key/scholarships-queries-key";
import { getScholarshipByIdActionAsync } from "../actions/get-scholarships-by-id.action";

export const useGetByIdScholarship = (id?: string) => {
    return useQuery({
        queryKey: [GET_SCHOLARSHIP_QUERY_KEY, { id }],
        queryFn: () => getScholarshipByIdActionAsync(id),
        retry: false,
        staleTime: 0,
    });
}