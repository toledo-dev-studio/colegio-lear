import { useQuery } from "@tanstack/react-query";

import { GET_JOB_TITLES_FOR_EMPLOYEE_QUERY_KEY } from "../lib/queries-key";
import { getPagedJobTitlesActionAsync } from "@/modules/job-titles/actions/get-paged-job-titles.action";

export const useJobTitlesForEmployees = (query?: string) => {
    return useQuery({
        queryKey: [GET_JOB_TITLES_FOR_EMPLOYEE_QUERY_KEY, query],
        queryFn: () => getPagedJobTitlesActionAsync({ query, page: 1, pageSize: 5, status: true }),
        enabled: !!query
    });
}
