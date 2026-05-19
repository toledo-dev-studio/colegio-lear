import { useQuery } from "@tanstack/react-query";

import { SINGLE_RECORD_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { getPaymentConceptByIdActionAsync } from "../actions/get-payment-concept-by-id.action";
import { GET_PAYMENT_CONCEPT_QUERY_KEY } from "@/lib/queries-key/payment-concepts-queries-key";

export const useGetByIdPaymentConcept = (id?: string, enabledQuery: boolean = true, staleTime = SINGLE_RECORD_STALE_TIME) => {
    return useQuery({
        queryKey: [GET_PAYMENT_CONCEPT_QUERY_KEY, { id }],
        queryFn: () => getPaymentConceptByIdActionAsync(id),
        retry: false,
        staleTime: staleTime,
        enabled: enabledQuery
    });
}
