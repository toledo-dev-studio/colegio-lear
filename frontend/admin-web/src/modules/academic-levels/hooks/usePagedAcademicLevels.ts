import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { GET_PAGED_ACADEMIC_LEVELS_QUERY_KEY } from "../../../lib/queries-key/academic-levels-queries-key";
import { getPagedAcademicLevelsActionAsync } from "../actions/get-paged-academic-levels.action";

export const usePagedAcademicLevels = () => {

    const [searchParams] = useSearchParams();

    // Main query params
    const query = searchParams.get('query')?.trim() || '';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';

    // Advanced query params
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_PAGED_ACADEMIC_LEVELS_QUERY_KEY, { query, page, pageSize, name, status }],
        queryFn: () => getPagedAcademicLevelsActionAsync({
            query,
            page: isNaN(+page) ? 1 : Number(page),
            pageSize: isNaN(+pageSize) ? 1 : Number(pageSize),
            name, 
            status,
        }),
    });
}
