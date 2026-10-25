import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import type { JobTitleTypeKey } from "@/lib/key-value-pairs/key-value-pair-types";
import { getPagedJobTitlesAsync } from "../api/get-paged-job-titles.api";
import { GET_PAGED_JOB_TITLES_QUERY_KEY } from "@/lib/queries-key/job-titles-queries-key";
import { isValidBooleanString, isValidValueWithDefault, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useGetPagedJobTitles = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 10);

    // Advanced query filters
    const name = isValidValueWithDefault(searchParams.get("name")?.trim(), undefined)
    const jobTitleType = isValidValueWithDefault(searchParams.get("job-title-type")?.trim() as JobTitleTypeKey, undefined);
    const isActive = isValidBooleanString(searchParams.get("is-active")) ? stringToBooleanWithDefault(searchParams.get("is-active")) : undefined;

    const queryResult = useQuery({
        queryKey: [GET_PAGED_JOB_TITLES_QUERY_KEY, { query, page, pageSize, name, jobTitleType, isActive, }],
        queryFn: () => getPagedJobTitlesAsync({
            query,
            page,
            pageSize,
            name,
            jobTitleType,
            isActive,
        }),
        staleTime: FIVE_MINUTES_STALE_TIME
    });

    return {
        ...queryResult,
        data: queryResult.data?.data ?? [],
        totalPages: queryResult.data?.totalPages ?? 0,
        currentPage: queryResult.data?.currentPage ?? 0,
        itemsCount: queryResult.data?.itemsCount ?? 0
    }
}
