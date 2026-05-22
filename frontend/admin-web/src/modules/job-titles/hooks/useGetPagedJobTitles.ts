import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import type { JobTitleTypes } from "@/interfaces/entites/job-title.interface";
import { getPagedJobTitlesActionAsync } from "../actions/get-paged-job-titles.action";
import { GET_PAGED_JOB_TITLES_QUERY_KEY } from "@/lib/queries-key/job-titles-queries-key";
import { isValidBooleanString, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useGetPagedJobTitles = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || undefined;
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("pageSize"), 10);

    // Advanced query filters
    const name = searchParams.get("name")?.trim() || undefined;
    const jobTitleType = (searchParams.get("job-title-type")?.trim() as JobTitleTypes) || undefined;
    const status = isValidBooleanString(searchParams.get("status")) ? stringToBooleanWithDefault(searchParams.get("status")) : undefined;

    const queryResult = useQuery({
        queryKey: [GET_PAGED_JOB_TITLES_QUERY_KEY, { query, page, pageSize, name, jobTitleType, status, }],
        queryFn: () => getPagedJobTitlesActionAsync({
            query,
            page,
            pageSize,
            name,
            jobTitleType,
            status,
        }),
    });

    return {
        ...queryResult,
        data: queryResult.data?.data ?? [],
        totalPages: queryResult.data?.totalPages ?? 0,
        currentPage: queryResult.data?.currentPage ?? 0,
        itemsCount: queryResult.data?.itemsCount ?? 0
    }
}
