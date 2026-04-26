import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { getJobTitlesActionAsync } from "../actions/get-job-titles.action";
import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_JOB_TITLES_QUERY_KEY } from "../lib/queries-key";

export const useExportJobTitles = () => {

    const [searchParams] = useSearchParams();

    const query = searchParams.get('query')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_JOB_TITLES_QUERY_KEY, { query }],
        queryFn: () => getJobTitlesActionAsync({
            query,
            status
        }),
        enabled: false,
    });
}
