import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deletePaymentConceptByIdActionAsync } from "../actions/delete-payment-concept-by-id.action";
import { GET_PAGED_PAYMENT_CONCEPTS_QUERY_KEY, GET_PAYMENT_CONCEPT_QUERY_KEY } from "@/lib/queries-key/payment-concepts-queries-key";

export const useDeletePaymentConcept = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePaymentConceptByIdActionAsync,
        onSuccess: (id: string) => {
            // Remove query for single query
            queryClient.removeQueries({ queryKey: [GET_PAYMENT_CONCEPT_QUERY_KEY, { id: id }] });

            // Invalid cache for useQueries, on invalid queries refetch is auto
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_PAYMENT_CONCEPTS_QUERY_KEY] });
        },
    });
}
