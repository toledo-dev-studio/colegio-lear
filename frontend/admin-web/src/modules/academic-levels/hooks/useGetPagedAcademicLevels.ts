import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { getPagedAcademicLevelsActionAsync } from "../actions/get-paged-academic-levels.action";
import { stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";
import { GET_PAGED_ACADEMIC_LEVELS_QUERY_KEY } from "@/lib/queries-key/academic-levels-queries-key";

export const useGetPagedAcademicLevels = () => {
    const [searchParams] = useSearchParams();

    // Main query params
    const query = searchParams.get('query')?.trim() || '';
    const page = stringToNumberWithDefault(searchParams.get('page'), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get('pageSize'), 10);

    // Advanced query params
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_PAGED_ACADEMIC_LEVELS_QUERY_KEY, { query, page, pageSize, name, status }],
        queryFn: () => getPagedAcademicLevelsActionAsync({
            query,
            page,
            pageSize,
            name,
            status,
        }),
    });
}
