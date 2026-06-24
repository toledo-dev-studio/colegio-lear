import { useQuery } from "@tanstack/react-query"

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import type { JobTitleResponse } from "@/interfaces/responses/job-title.response";
import { getJobTitleByIdActionAsync } from "../actions/get-job-title-by-id.action";
import { GET_JOB_TITLE_QUERY_KEY } from "@/lib/queries-key/job-titles-queries-key";

interface Options {
    id: string;
}

export const useGetByIdJobTitle = ({ id }: Options) => {
    return useQuery({
        queryKey: [GET_JOB_TITLE_QUERY_KEY, { id }],
        queryFn: () => {
            if (id === "new") {
                return {} as unknown as JobTitleResponse;
            }
            return getJobTitleByIdActionAsync({ id });
        },
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}
