import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { getJobTitlesActionAsync } from "../actions/get-job-titles.action";
import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_JOB_TITLES_QUERY_KEY } from "../lib/queries-key";

export const useExportJobTitles = () => {

    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_JOB_TITLES_QUERY_KEY, { query, name, status }],
        queryFn: () => getJobTitlesActionAsync({
            query,
            name,
            status
        }),
        enabled: false,
    });
}
