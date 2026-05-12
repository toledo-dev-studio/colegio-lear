import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_JOB_TITLES_QUERY_KEY } from "../lib/queries-key";
import { getJobTitlesActionAsync } from "../actions/get-job-titles.action";
import type { JobTitleTypes } from "@/interfaces/entites/job-title.interface";

export const useExportJobTitles = () => {

    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const jobTitleType = (searchParams.get('job-title-type')?.trim() as JobTitleTypes) || undefined;
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_JOB_TITLES_QUERY_KEY, { query, name, jobTitleType, status }],
        queryFn: () => getJobTitlesActionAsync({
            query,
            name,
            jobTitleType,
            status
        }),
        enabled: false,
    });
}
