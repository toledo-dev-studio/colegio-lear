import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { GET_PAYMENT_CONCEPTS_QUERY_KEY } from "../lib/queries-key";
import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getPaymentConceptsActionAsync } from "../actions/get-payment-concepts.action";

export const useExportPaymentConcepts = () => {

    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const amount = searchParams.get('amount')?.trim() || '';
    const allowForgiveness = stringToBooleanWithDefault(searchParams.get('allowForgiveness'));
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_PAYMENT_CONCEPTS_QUERY_KEY, { query, name, amount, allowForgiveness, status }],
        queryFn: () => getPaymentConceptsActionAsync({
            query,
            name,
            amount: isNaN(+amount) ? undefined : Number(amount),
            allowForgiveness,
            status
        }),
        enabled: false,
    });
}
