import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { getPagedJobTitlesActionAsync } from "../actions/get-paged-job-titles.action";
import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_PAGED_JOB_TITLES_QUERY_KEY } from "../lib/queries-key";

export const usePagedJobTitles = () => {

    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_PAGED_JOB_TITLES_QUERY_KEY, { query, page, pageSize, name, status, }],
        queryFn: () => getPagedJobTitlesActionAsync({
            query,
            page: isNaN(+page) ? 1 : Number(page),
            pageSize: isNaN(+pageSize) ? 1 : Number(pageSize),
            name, 
            status,
        }),
    });
}
