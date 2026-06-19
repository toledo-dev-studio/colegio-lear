import { useQuery } from "@tanstack/react-query";

import { GET_SCHOLARSHIP_QUERY_KEY } from "@/lib/queries-key/scholarships-queries-key";
import type { ScholarshipResponse } from "@/interfaces/responses/scholarship.response";
import { getScholarshipByIdActionAsync } from "../actions/get-scholarship-by-id.action";

interface Options {
    id: string;
}

export const useGetScholarshipById = ({ id }: Options) => {
    return useQuery({
        queryKey: [GET_SCHOLARSHIP_QUERY_KEY, { id }],
        queryFn: () => {
            if (id === "new") {
                return {} as unknown as ScholarshipResponse;
            }
            return getScholarshipByIdActionAsync({ id });
        },
        retry: false,
        staleTime: 0,
    });
}