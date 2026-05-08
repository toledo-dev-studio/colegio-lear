import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { getPagedAcademicLevelsActionAsync } from "../actions/get-paged-academic-levels.action";
import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_PAGED_ACADEMIC_LEVELS_QUERY_KEY } from "../lib/queries-key";

export const usePagedAcademicLevels = () => {

    const [searchParams] = useSearchParams();

    const query = searchParams.get('query')?.trim() || '';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_PAGED_ACADEMIC_LEVELS_QUERY_KEY, { query, page, pageSize }],
        queryFn: () => getPagedAcademicLevelsActionAsync({
            query,
            status,
            page: isNaN(+page) ? 1 : Number(page),
            pageSize: isNaN(+pageSize) ? 1 : Number(pageSize),
        }),
    });
}
