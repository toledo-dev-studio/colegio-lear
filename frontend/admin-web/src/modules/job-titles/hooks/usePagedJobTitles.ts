import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_PAGED_JOB_TITLES_QUERY_KEY } from "../lib/queries-key";
import type { JobTitleTypes } from "@/interfaces/entites/job-title.interface";
import { getPagedJobTitlesActionAsync } from "../actions/get-paged-job-titles.action";

export const usePagedJobTitles = () => {

    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const jobTitleType = (searchParams.get('job-title-type')?.trim() as JobTitleTypes) || undefined;
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_PAGED_JOB_TITLES_QUERY_KEY, { query, page, pageSize, name, jobTitleType, status, }],
        queryFn: () => getPagedJobTitlesActionAsync({
            query,
            page: isNaN(+page) ? 1 : Number(page),
            pageSize: isNaN(+pageSize) ? 1 : Number(pageSize),
            name, 
            jobTitleType,
            status,
        }),
    });
}
