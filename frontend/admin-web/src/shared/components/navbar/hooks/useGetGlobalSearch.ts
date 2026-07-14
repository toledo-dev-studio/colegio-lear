import { useQuery } from "@tanstack/react-query";

import { getGlobalSearchActionAsync } from "../actions/get-global-search.action";
import { GET_GLOBAL_SEARCH } from "@/lib/queries-key/global-search-queries-key";
import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";

interface Options {
    query: string;
}

export const useGetGlobalSearch = ({ query }: Options) => {
    const queryResult = useQuery({
        queryKey: [GET_GLOBAL_SEARCH, { query }],
        queryFn: () => getGlobalSearchActionAsync({ query }),
        enabled: query.trim().length >= 5,
        staleTime: FIVE_MINUTES_STALE_TIME
    });

    return {
        ...queryResult,
        data: queryResult.data ?? []
    }
}
