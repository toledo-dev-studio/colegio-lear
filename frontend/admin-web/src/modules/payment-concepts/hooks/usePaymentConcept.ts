import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getPaymentConceptByIdActionAsync } from "../actions/get-payment-concept-by-id.action";
import { createUpdatePaymentConceptActionAsync } from "../actions/create-update-payment-concept.action";
import { GET_PAGED_PAYMENT_CONCEPTS_QUERY_KEY, GET_PAYMENT_CONCEPT_QUERY_KEY, GET_PAYMENT_CONCEPTS_QUERY_KEY } from "../lib/queries-key";

export const usePaymentConcept = (id: string) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [GET_PAYMENT_CONCEPT_QUERY_KEY, { id }],
        queryFn: () => getPaymentConceptByIdActionAsync(id),
        retry: false,
        staleTime: 0
    });

    const mutation = useMutation({
        mutationFn: createUpdatePaymentConceptActionAsync,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [GET_PAYMENT_CONCEPTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_PAYMENT_CONCEPTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_PAYMENT_CONCEPT_QUERY_KEY] });

            queryClient.setQueryData([GET_PAYMENT_CONCEPT_QUERY_KEY, data.id], data);
        }
    });

    return {
        ...query,
        mutation
    };
}
