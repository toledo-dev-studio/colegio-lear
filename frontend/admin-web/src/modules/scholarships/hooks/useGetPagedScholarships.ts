import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { getPagedScholarshipsActionAsync } from "../actions/get-paged-scholarships.action";
import { GET_PAGED_SCHOLARSHIPS_QUERY_KEY } from "@/lib/queries-key/scholarships-queries-key";
import { isValidBooleanString, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useGetPagedScholarships = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || undefined;
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("pageSize"), 10);

    // Advanced query filters
    const name = searchParams.get("name")?.trim() || undefined;
    const status = isValidBooleanString(searchParams.get("status")) ? stringToBooleanWithDefault(searchParams.get("status")) : undefined;
    const discountPercentage = stringToNumberWithDefault(searchParams.get("discount-percentage"), undefined);

    const queryResult = useQuery({
        queryKey: [GET_PAGED_SCHOLARSHIPS_QUERY_KEY, { query, page, pageSize, name, status, discountPercentage }],
        queryFn: () => getPagedScholarshipsActionAsync({
            query,
            page,
            pageSize,
            name,
            status,
            discountPercentage: discountPercentage === 0 ? undefined : discountPercentage,
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
