import { useQuery } from "@tanstack/react-query";

import { getPaymentConceptByIdActionAsync } from "../actions/get-payment-concept-by-id.action";
import { GET_PAYMENT_CONCEPT_QUERY_KEY } from "@/lib/queries-key/payment-concepts-queries-key";
import type { PaymentConceptResponse } from "@/interfaces/responses/payment-concept.response";

interface Options {
    id: string;
}

export const useGetPaymentConceptById = ({ id }: Options) => {
    return useQuery({
        queryKey: [GET_PAYMENT_CONCEPT_QUERY_KEY, { id }],
        queryFn: () => {
            if (id === "new") {
                return {} as unknown as PaymentConceptResponse;
            }
            return getPaymentConceptByIdActionAsync({ id });
        },
        retry: false,
        staleTime: 0,
    });
}
