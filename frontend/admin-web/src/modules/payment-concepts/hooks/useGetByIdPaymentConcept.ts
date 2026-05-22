import { useQuery } from "@tanstack/react-query";

import { getPaymentConceptByIdActionAsync } from "../actions/get-payment-concept-by-id.action";
import { GET_PAYMENT_CONCEPT_QUERY_KEY } from "@/lib/queries-key/payment-concepts-queries-key";

export const useGetByIdPaymentConcept = (id?: string) => {
    return useQuery({
        queryKey: [GET_PAYMENT_CONCEPT_QUERY_KEY, { id }],
        queryFn: () => getPaymentConceptByIdActionAsync(id),
        retry: false,
        staleTime: 0,
    });
}
