import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { GET_SCHOLARSHIPS_QUERY_KEY } from "../lib/queries-key";
import { getScholarshipsActionAsync } from "../actions/get-scholarships.action";
import { stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useExportScholarships = () => {

    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));
    const discountPercentage = stringToNumberWithDefault(searchParams.get('discount-percentage'));

    return useQuery({
        queryKey: [GET_SCHOLARSHIPS_QUERY_KEY, { query, name, status, discountPercentage }],
        queryFn: () => getScholarshipsActionAsync({
            query,
            name,
            status,
            discountPercentage
        }),
        enabled: false,
    });
}
