import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { getPagedPaymentConceptsActionAsync } from "../actions/get-paged-payment-concepts.action";
import { stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";
import { GET_PAGED_PAYMENT_CONCEPTS_QUERY_KEY } from "@/lib/queries-key/payment-concepts-queries-key";

export const useGetPagedPaymentConcepts = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const amount = searchParams.get('amount')?.trim() || '';
    const allowForgiveness = stringToBooleanWithDefault(searchParams.get('allowForgiveness'));
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_PAGED_PAYMENT_CONCEPTS_QUERY_KEY, { query, page, pageSize, name, amount, allowForgiveness, status, }],
        queryFn: () => getPagedPaymentConceptsActionAsync({
            query,
            page: stringToNumberWithDefault(page, 1),
            pageSize: stringToNumberWithDefault(pageSize, 1),
            name, 
            amount: stringToNumberWithDefault(amount, undefined), 
            allowForgiveness,
            status,
        }),
    });
}
