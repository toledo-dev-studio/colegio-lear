import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { PaymentConcept } from "@/interfaces/entites/payment-concept";
import { getPagedPaymentConceptsActionAsync } from "../actions/get-paged-payment-concepts.action";

export const useSearchPaymentConcepts = () => {
    const [paymentConcepts, setPaymentConcepts] = useState<PaymentConcept[]>([])

    const mutation = useMutation({
        mutationFn: (query: string) => getPagedPaymentConceptsActionAsync({ query, page: 1, pageSize: 5, status: true }),
    });

    const searchAsync = async (query: string) => {
        mutation.mutateAsync(query, {
            onSuccess: (response: PagedResponse<PaymentConcept>) => {
                setPaymentConcepts(response.data);
            },
            onError: () => {
                setPaymentConcepts([]);
            }
        });
    }

    return {
        paymentConcepts,
        isPending: mutation.isPending,
        searchAsync,
        clearSearchResult: () => setPaymentConcepts([]),
    }
}
