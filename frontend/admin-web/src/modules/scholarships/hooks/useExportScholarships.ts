import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/utils";
import { GET_SCHOLARSHIPS_QUERY_KEY } from "../lib/queries-key";
import { getScholarshipsActionAsync } from "../actions/get-scholarships.action";

export const useExportScholarships = () => {

    const [searchParams] = useSearchParams();

    const query = searchParams.get('query')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));
    const discountPercentage = stringToNumberWithDefault(searchParams.get('discount-percentage'));

    return useQuery({
        queryKey: [GET_SCHOLARSHIPS_QUERY_KEY, { query, status, discountPercentage }],
        queryFn: () => getScholarshipsActionAsync({
            query,
            status,
            discountPercentage
        }),
        enabled: false,
    });
}
