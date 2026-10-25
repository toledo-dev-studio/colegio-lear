import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { PaymentConceptFilter } from "@/interfaces/filters/payment-concept.filter";
import type { PaymentConceptResponse } from "@/interfaces/responses/payment-concept.response";
import { getPagedPaymentConceptsAsync } from "../api/get-paged-payment-concepts.api";

interface Options extends PaymentConceptFilter {
    query?: string;
}

export const useSearchPaymentConcepts = () => {
    const [paymentConcepts, setPaymentConcepts] = useState<PaymentConceptResponse[]>([])

    const mutation = useMutation({
        mutationFn: (options: Options) => getPagedPaymentConceptsAsync({ ...options, page: 1, pageSize: 5 }),
    });

    const searchAsync = async (options: Options) => {
        mutation.mutateAsync(options, {
            onSuccess: (response: PagedResponse<PaymentConceptResponse>) => {
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
