import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { GET_PAGED_SCHOLARSHIPS_QUERY_KEY } from "../lib/queries-key";
import { getPagedScholarshipsActionAsync } from "../actions/get-paged-scholarships.action";
import { stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const usePagedScholarships = () => {

    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));
    const discountPercentage = stringToNumberWithDefault(searchParams.get('discount-percentage'));

    return useQuery({
        queryKey: [GET_PAGED_SCHOLARSHIPS_QUERY_KEY, { query, page, pageSize, name, status, discountPercentage }],
        queryFn: () => getPagedScholarshipsActionAsync({
            query,
            page: isNaN(+page) ? 1 : Number(page),
            pageSize: isNaN(+pageSize) ? 1 : Number(pageSize),
            name,
            status,
            discountPercentage,
        }),
    });
}
