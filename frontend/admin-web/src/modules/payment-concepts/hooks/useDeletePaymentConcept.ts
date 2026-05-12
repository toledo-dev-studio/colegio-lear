import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deletePaymentConceptByIdActionAsync } from "../actions/delete-payment-concept-by-id.action";
import { GET_PAGED_PAYMENT_CONCEPTS_QUERY_KEY, GET_PAYMENT_CONCEPTS_QUERY_KEY } from "../lib/queries-key";

export const useDeletePaymentConcept = () => {

    const queryClient = useQueryClient();

    return {
        mutationDeletePaymentConcept: useMutation({
            mutationFn: deletePaymentConceptByIdActionAsync,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [GET_PAYMENT_CONCEPTS_QUERY_KEY] });
                queryClient.invalidateQueries({ queryKey: [GET_PAGED_PAYMENT_CONCEPTS_QUERY_KEY] });

                queryClient.refetchQueries({ queryKey: [GET_PAGED_PAYMENT_CONCEPTS_QUERY_KEY] })
            },
        })
    }
}
