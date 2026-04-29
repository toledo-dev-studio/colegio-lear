import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_PAGED_SCHOLARSHIPS_QUERY_KEY } from "../lib/queries-key";
import { getPagedScholarshipsActionAsync } from "../actions/get-paged-scholarships.action";

export const usePagedScholarships = () => {

    const [searchParams] = useSearchParams();

    const query = searchParams.get('query')?.trim() || '';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_PAGED_SCHOLARSHIPS_QUERY_KEY, { query, status, page, pageSize }],
        queryFn: () => getPagedScholarshipsActionAsync({
            query,
            status,
            page: isNaN(+page) ? 1 : Number(page),
            pageSize: isNaN(+pageSize) ? 1 : Number(pageSize),
        }),
    });
}
