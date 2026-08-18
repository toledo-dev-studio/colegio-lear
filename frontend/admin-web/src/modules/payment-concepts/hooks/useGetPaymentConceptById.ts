import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import type { PaymentConceptResponse } from "@/interfaces/responses/payment-concept.response";
import { getPaymentConceptByIdAsync } from "../api/get-payment-concept-by-id.api";
import { GET_PAYMENT_CONCEPT_QUERY_KEY } from "@/lib/queries-key/payment-concepts-queries-key";

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
            return getPaymentConceptByIdAsync({ id });
        },
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}
