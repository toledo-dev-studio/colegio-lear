import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_SCHOLARSHIPS_QUERY_KEY } from "../lib/queries-key";
import { getScholarshipsActionAsync } from "../actions/get-scholarships.action";

export const useExportScholarships = () => {

    const [searchParams] = useSearchParams();

    const query = searchParams.get('query')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_SCHOLARSHIPS_QUERY_KEY, { query, status }],
        queryFn: () => getScholarshipsActionAsync({
            query,
            status
        }),
        enabled: false,
    });
}
