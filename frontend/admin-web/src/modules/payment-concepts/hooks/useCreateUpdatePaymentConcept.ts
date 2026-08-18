import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { PaymentConceptResponse } from "@/interfaces/responses/payment-concept.response";
import { createUpdatePaymentConceptAsync } from "../api/create-update-payment-concept.api";
import { GET_PAGED_PAYMENT_CONCEPTS_QUERY_KEY, GET_PAYMENT_CONCEPT_QUERY_KEY } from "@/lib/queries-key/payment-concepts-queries-key";

export const useCreateUpdatePaymentConcept = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdatePaymentConceptAsync,
        onSuccess: (response: PaymentConceptResponse) => {
            // Invalid cache for useQueries
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_PAYMENT_CONCEPTS_QUERY_KEY] });

            // Set data to query data for created/updated record
            queryClient.setQueryData([GET_PAYMENT_CONCEPT_QUERY_KEY, { id: response.id }], response);
        },
    });
}
